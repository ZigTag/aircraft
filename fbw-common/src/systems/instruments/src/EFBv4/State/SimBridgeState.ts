import { ConsumerSubject, EventBus, Subscribable } from '@microsoft/msfs-sdk';
import { SimbridgeStateEvents } from '@shared/simbridge/components/SimBridgeStatePublisher';
import { SimBridgeClientState } from '@shared/simbridge';

export class SimBridgeState {
  constructor(private readonly bus: EventBus) {}

  private readonly _simBridgeConnected = ConsumerSubject.create(
    this.bus.getSubscriber<SimbridgeStateEvents>().on('simbridge.available'),
    false,
  );
  public readonly simBridgeConnected: Subscribable<boolean> = this._simBridgeConnected;

  private readonly _simBridgeState = ConsumerSubject.create(
    this.bus.getSubscriber<SimbridgeStateEvents>().on('simbridge.state'),
    SimBridgeClientState.OFFLINE,
  );
  public readonly simBridgeState: Subscribable<SimBridgeClientState> = this._simBridgeState;
}
