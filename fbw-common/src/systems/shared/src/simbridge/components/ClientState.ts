// Copyright (c) 2022 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable no-console */
import { EventBus } from '@microsoft/msfs-sdk';
import { SimbridgeStateEvents } from './SimBridgeStatePublisher';

/**
 * SimBridgeState is one of:
 * - OFF: SimBridge is deactivated in the EFB
 * - OFFLINE: SimBridge is activated in the EFB, but the connection to the SimBridge server could not be established
 * - CONNECTING: SimBridge is activated in the EFB, and the connection to the SimBridge server is being established
 * - CONNECTED: SimBridge is activated in the EFB and the connection to the SimBridge server is established
 */
export const enum SimBridgeClientState {
  OFF = 'OFF',
  OFFLINE = 'OFFLINE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
}

/**
 * This class is a singleton that is used to manage the state of the client connection to the
 * SimBridge server. The aim is to prevent simbridge-client services to constantly try to connect
 * to the server when it is not available and therefore creating unnecessary log entries and load.
 */
export class ClientState {
  // The singleton instance
  private static instance: ClientState;

  // flag to indicate if the client is available
  private available: boolean = false;

  // Indicates the state of the client connection to the SimBridge server
  private simBridgeState: SimBridgeClientState = SimBridgeClientState.OFF;

  private constructor(bus?: EventBus) {
    // TODO we should really not do that. Ideally, make ClientState an instance class people construct with their own bus
    const sub = (bus ?? new EventBus()).getSubscriber<SimbridgeStateEvents>();

    sub.on('simbridge.available').handle((value) => (this.available = value));
    sub.on('simbridge.state').handle((value) => (this.simBridgeState = value));
  }

  /**
   * The singleton instance getter
   */
  public static getInstance(bus?: EventBus): ClientState {
    if (!ClientState.instance) {
      ClientState.instance = new ClientState(bus);
    }
    return ClientState.instance;
  }

  /**
   * Returns true if the client is available, false otherwise.
   * Availability is checked every 5 seconds.
   *
   * @deprecated use getSimBridgeClientState() or isConnected() instead
   */
  public isAvailable(): boolean {
    return this.available;
  }

  /**
   * Returns the current state of the client connection to the SimBridge server.
   * This returns a cached value that is updated every 5 seconds and does not perform
   * a health check to the server.
   *
   * @returns {SimBridgeClientState}
   */
  public getSimBridgeClientState(): SimBridgeClientState {
    return this.simBridgeState;
  }

  /**
   * Returns true if the SimBridgeClientState is CONNECTED
   */
  public isConnected(): boolean {
    return this.simBridgeState === SimBridgeClientState.CONNECTED;
  }
}
