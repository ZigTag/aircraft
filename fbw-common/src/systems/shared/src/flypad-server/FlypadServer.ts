import { EventBus, Metar as MsfsMetar, SimbriefClient } from '@microsoft/msfs-sdk';
import { Metar as FbwApiMetar, MetarResponse as FbwApiMetarResponse } from '@flybywiresim/api-client';

import { FlypadClientEvents, FlypadServerEvents } from './FlypadEvents';
import { MetarParserType } from '../../../instruments/src';
import { parseMetar } from '../parseMetar';
import { FailuresOrchestrator } from '../failures';
import { FailuresOrchestratorState } from '../failures/failures-orchestrator';

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
    this.eventSub.on('fpc_GetSimbriefOfp').handle(() => this.handleGetSimbriefOfp());
    this.eventSub.on('fpc_ActivateFailure').handle((id) => this.handleActivateFailure(id));
    this.eventSub.on('fpc_DeactivateFailure').handle((id) => this.handleDeactivateFailure(id));

    this.failureOrchestrator.stateEvent.on((_sender, state) => this.sendFailuresState(state));
  }

  private handleHelloWorld(): void {
    this.sendFailureList();
  }

  private async handleGetMetar(icao: string): Promise<void> {
    const source: string = 'MSFS';

    let metar: MetarParserType;
    switch (source) {
      default:
      case 'MSFS': {
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
      case 'API': {
        let fbwApiMetar: FbwApiMetarResponse;

        // Catch parsing error separately
        try {
          fbwApiMetar = await FbwApiMetar.get(icao, 'vatsim');
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

  private async handleGetSimbriefOfp(): Promise<void> {
    const pilotID = await SimbriefClient.getSimbriefUserIDFromUsername('benjozork');
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
