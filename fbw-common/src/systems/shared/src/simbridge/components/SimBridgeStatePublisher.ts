import { Health, SimBridgeClientState } from '@flybywiresim/fbw-sdk';
import { EventBus, UserSettingManager } from '@microsoft/msfs-sdk';
import { FbwUserSettingsDefs, SimBridgeMode } from '../../../../instruments/src/EFBv4/FbwUserSettings';

export interface SimbridgeStateEvents {
  /** Whether SimBridge is available */
  'simbridge.available': boolean;

  /** The SimBridge state */
  'simbridge.state': SimBridgeClientState;
}
export class SimBridgeStatePublisher {
  private readonly publisher = this.bus.getPublisher<SimbridgeStateEvents>();

  // flag to indicate if the client is available
  private available: boolean = false;

  // SimBridge Connect setting
  private simBridgeEnabledSetting = SimBridgeMode.AutoOn;

  // counter for failed connection attempts
  private connectionAttemptCounter: number = 0;

  // how many times to attempt to connect to the server before giving up
  private maxSimBridgeConnectionAttempts: number = 60;

  // Indicates the state of the client connection to the SimBridge server
  private simBridgeState: SimBridgeClientState = SimBridgeClientState.OFF;

  constructor(
    private readonly bus: EventBus,
    private readonly fbwSettingsManager: UserSettingManager<FbwUserSettingsDefs>,
  ) {
    this.initialize();
  }

  private initialize() {
    // Subscribe to the SimBridge Enabled setting to be notified when it changes. Otherwise, we would
    // only be able to check each check interval (5sec)
    this.fbwSettingsManager.getSetting('fbwSimBridgeEnabled').sub((value) => {
      // console.log(`[SimBridge-Client] SimBridge Enabled setting changed to: ${value}`);
      this.simBridgeEnabledSetting = value;
      this.connectionAttemptCounter = 0;
      this.checkServerAvailability();
    });

    // Subscribe to the SimBridge Remote setting so we can instantly re-establish connection
    // when we change this
    this.fbwSettingsManager.getSetting('fbwSimbridgeRemote').sub(() => {
      this.connectionAttemptCounter = 0;
      this.checkServerAvailability();
    });

    // reset the setting if not permanent off
    if (this.simBridgeEnabledSetting !== SimBridgeMode.PermOff) {
      this.fbwSettingsManager.getSetting('fbwSimBridgeEnabled').set(SimBridgeMode.AutoOn);
    }

    // Try to connect websocket if enabled in EFB and no connection established
    setInterval(() => {
      this.checkServerAvailability();
    }, 5_000);
  }

  /**
   * Checks if the SimBridge server is available (via health check service) and updates the state accordingly
   * @private
   */
  private checkServerAvailability() {
    // Check the SimBridge Enabled setting (set in the flyPad EFB)
    // If the setting is not AUTO ON, then the client is not available
    if (this.simBridgeEnabledSetting !== SimBridgeMode.AutoOn) {
      this.connectionAttemptCounter = 0;
      this.available = false;

      this.setSimBridgeState();
      this.publish();
      return;
    }

    // After 60 failed connection attempts, give up and set the SimBridge Enabled setting to AUTO OFF to
    // prevent the client from trying to connect to the server again. The user can reset the setting to AUTO ON
    // in the flyPad EFB to try again.
    if (this.connectionAttemptCounter++ >= this.maxSimBridgeConnectionAttempts) {
      this.fbwSettingsManager.getSetting('fbwSimBridgeEnabled').set(SimBridgeMode.AutoOff);
      this.connectionAttemptCounter = 0;
    } else {
      // try to connect to the server
      Health.getHealth()
        .then((result) => {
          if (result) {
            if (!this.available) {
              // only log once when SimBridge becomes available
              console.log('[SimBridge-Client] SimBridge available.');
            }
            this.available = true;
            this.connectionAttemptCounter = 0;

            this.setSimBridgeState();
            this.publish();
          } else {
            this.available = false;
            console.log(`[SimBridge-Client] SimBridge is not available. Connection attempt counter:
                                    ${this.connectionAttemptCounter} of ${this.maxSimBridgeConnectionAttempts}`);

            this.setSimBridgeState();
            this.publish();
          }
        })
        .catch(() => {
          this.available = false;
          console.log(`[SimBridge-Client] SimBridge is not available. Connection attempt counter:
                            ${this.connectionAttemptCounter} of ${this.maxSimBridgeConnectionAttempts}`);

          this.setSimBridgeState();
          this.publish();
        });
    }

    this.setSimBridgeState();
    this.publish();
  }

  private publish() {
    this.publisher.pub('simbridge.state', this.simBridgeState, true);
    this.publisher.pub('simbridge.available', this.available, true);
  }

  /**
   * Sets the SimBridgeClientState based on the SimBridge Enabled setting and the availability of the server
   *
   * @private
   */
  private setSimBridgeState() {
    if (this.available) {
      this.simBridgeState = SimBridgeClientState.CONNECTED;
      return;
    }
    switch (this.simBridgeEnabledSetting) {
      case SimBridgeMode.AutoOn:
        this.simBridgeState = SimBridgeClientState.CONNECTING;
        break;
      case SimBridgeMode.AutoOff:
        this.simBridgeState = SimBridgeClientState.OFFLINE;
        break;
      default:
        this.simBridgeState = SimBridgeClientState.OFF;
    }
  }
}
