import { EventBus, Metar as MsfsMetar, SimbriefClient } from '@microsoft/msfs-sdk';
import { Metar as FbwApiMetar, MetarResponse as FbwApiMetarResponse } from '@flybywiresim/api-client';

import { FlypadClientEvents, FlypadServerEvents } from './FlypadEvents';
import { MetarParserType } from '../../../instruments/src';
import { parseMetar } from '../parseMetar';
import { FailuresOrchestrator } from '../failures';
import { FailuresOrchestratorState } from '../failures/failures-orchestrator';
import { Runway } from '../../../instruments/src/EFB/Performance/Data/Runways';
import { RunwayDesignatorChar } from '../navdata';
import { MetarSource } from '../../../instruments/src/EFBv4/FbwUserSettings';
import { ConfigWeatherMap } from '../config';

export class FlypadServer {
  private readonly eventSub = this.bus.getSubscriber<FlypadClientEvents>();

  private readonly eventPub = this.bus.getPublisher<FlypadServerEvents>();

  constructor(
    private readonly bus: EventBus,
    private readonly failureOrchestrator: FailuresOrchestrator,
  ) {
    RegisterViewListener('JS_LISTENER_FACILITY', () => {
      this.eventPub.pub('fps_Initialized', undefined, true);
    });

    // TODO Need to forward any errors thrown to the clients
    this.eventSub.on('fpc_HelloWorld').handle(() => this.handleHelloWorld());
    this.eventSub.on('fpc_GetMetar').handle((icao) => this.handleGetMetar(icao));
    this.eventSub.on('fpc_GetMagvar').handle((icao) => this.handleGetMagvar(icao));
    this.eventSub.on('fpc_GetAirportRunways').handle((icao) => this.handleGetAirportRunways(icao));
    this.eventSub.on('fpc_GetSimbriefOfp').handle((username) => this.handleGetSimbriefOfp(username));
    this.eventSub.on('fpc_ActivateFailure').handle((id) => this.handleActivateFailure(id));
    this.eventSub.on('fpc_DeactivateFailure').handle((id) => this.handleDeactivateFailure(id));

    this.failureOrchestrator.stateEvent.on((_sender, state) => this.sendFailuresState(state));
  }

  private handleHelloWorld(): void {
    this.sendFailureList();
  }

  private async handleGetMetar({ icao, source }: { icao: string; source: MetarSource }): Promise<void> {
    let metar: MetarParserType;
    switch (source) {
      case MetarSource.MSFS: {
        let msfsMetar: MsfsMetar;

        // Catch parsing error separately
        try {
          msfsMetar = await Coherent.call('GET_METAR_BY_IDENT', icao);
          if (msfsMetar.icao !== icao.toUpperCase()) {
            throw new Error('No METAR available');
          }
        } catch (err) {
          console.log(`Error while retrieving Metar: ${err}`);
        }

        try {
          metar = parseMetar(msfsMetar.metarString);
        } catch (err) {
          console.log(`Error while parsing Metar ("${msfsMetar.metarString}"): ${err}`);
        }

        break;
      }
      default: {
        let fbwApiMetar: FbwApiMetarResponse;

        // Catch parsing error separately
        try {
          fbwApiMetar = await FbwApiMetar.get(icao, ConfigWeatherMap[source]);
          if (fbwApiMetar.icao !== icao.toUpperCase()) {
            throw new Error('No METAR available');
          }
        } catch (err) {
          console.log(`Error while retrieving Metar: ${err}`);
        }

        try {
          metar = parseMetar(fbwApiMetar.metar);
        } catch (err) {
          console.log(`Error while parsing Metar ("${fbwApiMetar.metar}"): ${err}`);
        }

        break;
      }
    }

    this.eventPub.pub('fps_SendMetar', metar, true);
  }

  private async handleGetMagvar(icao: string): Promise<void> {
    const airport = await this.getAirport(icao);

    this.eventPub.pub('fps_SendMagvar', Facilities.getMagVar(airport.lat, airport.lon), true);
  }

  private getAirport(icao: string): Promise<RawAirport> {
    return new Promise<RawAirport>((resolve, reject) => {
      if (icao.length !== 4) {
        reject();
      }

      const handler = Coherent.on('SendAirport', (data: RawAirport) => {
        handler.clear();
        const ident = data.icao.substring(7, 11);
        if (ident === icao.toUpperCase()) {
          resolve(data);
        } else {
          reject();
        }
      });

      Coherent.call('LOAD_AIRPORT', `A      ${icao.toUpperCase()}`).then((ret: boolean) => {
        if (!ret) {
          handler.clear();
          reject();
        }
      });
    });
  }

  private mapRunwayDesignator(designatorChar: RunwayDesignatorChar) {
    switch (designatorChar) {
      case RunwayDesignatorChar.A:
        return 'A';
      case RunwayDesignatorChar.B:
        return 'B';
      case RunwayDesignatorChar.C:
        return 'C';
      case RunwayDesignatorChar.L:
        return 'L';
      case RunwayDesignatorChar.R:
        return 'R';
      case RunwayDesignatorChar.W:
        return 'W';
      default:
        return '';
    }
  }

  private async handleGetAirportRunways(icao: string): Promise<void> {
    const airport = await this.getAirport(icao);

    const runways: Runway[] = [];

    const magVar = Facilities.getMagVar(airport.lat, airport.lon);

    for (const rawRunway of airport.runways) {
      for (const [i, number] of rawRunway.designation.split('-').entries()) {
        const runwayDesignator = i === 0 ? rawRunway.designatorCharPrimary : rawRunway.designatorCharSecondary;
        const ident = `${number.padStart(2, '0')}${this.mapRunwayDesignator(runwayDesignator)}`;
        const bearing = i === 0 ? rawRunway.direction : (rawRunway.direction + 180) % 360;
        const magneticBearing = (720 + bearing - magVar) % 360;
        const gradient =
          ((i === 0 ? 1 : -1) *
            Math.asin(
              (rawRunway.primaryElevation - rawRunway.secondaryElevation) /
                (rawRunway.length - rawRunway.primaryThresholdLength - rawRunway.secondaryThresholdLength),
            ) *
            180) /
          Math.PI;
        runways.push({
          airportIdent: icao,
          ident,
          bearing,
          magneticBearing,
          gradient,
          length: rawRunway.length,
          elevation: rawRunway.elevation / 0.3048,
        });
      }
    }

    this.eventPub.pub('fps_SendAirportRunways', runways, true);
  }

  private async handleGetSimbriefOfp(username: string): Promise<void> {
    const pilotID = await SimbriefClient.getSimbriefUserIDFromUsername(username);
    const ofp = await SimbriefClient.getOfp(pilotID);

    this.eventPub.pub('fps_SendSimbriefOfp', ofp, true);
  }

  private handleActivateFailure(failureID: number): void {
    this.failureOrchestrator.activate(failureID);
  }

  private handleDeactivateFailure(failureID: number): void {
    this.failureOrchestrator.deactivate(failureID);
  }

  private sendFailureList(): void {
    this.eventPub.pub('fps_SendFailuresList', this.failureOrchestrator.getAllFailures(), true);
  }

  private sendFailuresState(state: FailuresOrchestratorState): void {
    this.eventPub.pub('fps_SendFailuresState', state, true);
  }
}
