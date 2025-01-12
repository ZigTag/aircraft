import { EventBus, SubEvent, Subject, Wait } from '@microsoft/msfs-sdk';

import { FlypadClientEvents, FlypadServerEvents } from './FlypadEvents';
import { MetarParserType } from '../../../instruments/src/metarTypes';
import { Failure } from '../failures';
import { FailuresOrchestratorState } from '../failures/failures-orchestrator';
import { Runway } from '../../../instruments/src/EFB/Performance/Data/Runways';
import { MetarSource } from '../../../instruments/src/EFBv4/FbwUserSettings';

export class FlypadClient {
  private readonly eventSub = this.bus.getSubscriber<FlypadServerEvents>();

  private readonly eventPub = this.bus.getPublisher<FlypadClientEvents>();

  public readonly initialized = new SubEvent<FlypadClient, void>();

  public readonly failuresList = Subject.create<readonly Readonly<Failure>[]>([]);

  public readonly failuresState = Subject.create<FailuresOrchestratorState>({ active: [], changing: [] });

  constructor(private readonly bus: EventBus) {
    this.eventSub.on('fps_Initialized').handle(() => this.initialized.notify(this));

    this.eventSub.on('fps_SendFailuresList').handle((list) => this.failuresList.set(list));
    this.eventSub.on('fps_SendFailuresState').handle((list) => this.failuresState.set(list));
  }

  public sendHelloWorld(): void {
    this.sendMessage('fpc_HelloWorld', undefined);
  }

  public async getMagvar(icao: string): Promise<number> {
    if (icao.length !== 4) {
      throw new Error('Invalid ICAO: must be 4 characters in length');
    }

    this.sendMessage('fpc_GetMagvar', icao);

    return this.waitForMessage('fps_SendMagvar');
  }

  public async getMetar(icao: string, source: MetarSource): Promise<MetarParserType> {
    if (icao.length !== 4) {
      throw new Error('Invalid ICAO: must be 4 characters in length');
    }

    this.sendMessage('fpc_GetMetar', { icao, source });

    return this.waitForMessage('fps_SendMetar');
  }

  public async getAirportRunways(icao: string): Promise<Runway[]> {
    if (icao.length !== 4) {
      throw new Error('Invalid ICAO: must be 4 characters in length');
    }

    this.sendMessage('fpc_GetAirportRunways', icao);

    return this.waitForMessage('fps_SendAirportRunways');
  }

  public async getSimbriefOfp(username: string): Promise<FlypadServerEvents['fps_SendSimbriefOfp']> {
    this.sendMessage('fpc_GetSimbriefOfp', username);

    return this.waitForMessage('fps_SendSimbriefOfp');
  }

  public activateFailure(failure: Failure): void {
    this.sendMessage('fpc_ActivateFailure', failure.identifier);
  }

  public deactivateFailure(failure: Failure): void {
    this.sendMessage('fpc_DeactivateFailure', failure.identifier);
  }

  private sendMessage<k extends keyof FlypadClientEvents & string>(key: k, value: FlypadClientEvents[k]): void {
    this.eventPub.pub(key, value, true);
  }

  private async waitForMessage<k extends keyof FlypadServerEvents & string>(key: k): Promise<FlypadServerEvents[k]> {
    const response = await Wait.awaitConsumer(this.eventSub.on(key));

    return response;
  }
}
