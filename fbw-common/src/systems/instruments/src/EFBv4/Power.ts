import { EventSubscriber, MappedSubject, MathUtils, Subject, Subscribable, UserSetting } from '@microsoft/msfs-sdk';
import { ModalKind, showModal } from 'instruments/src/EFBv4/Components/Modal';
import { EFBSimvars } from 'instruments/src/EFBv4/EFBSimvarPublisher';

const BATTERY_DURATION_CHARGE_MIN = 180;
const BATTERY_DURATION_DISCHARGE_MIN = 540;

class Battery {
  private charge: number;
  private lastChangeTimestamp: number;

  constructor(initialCharge: number, lastChangeTimestamp: number) {
    this.charge = initialCharge;
    this.lastChangeTimestamp = lastChangeTimestamp;
  }

  update(absoluteTime: number, powerBeingSupplied: boolean): number {
    const deltaTs = Math.max(absoluteTime - this.lastChangeTimestamp, 0);
    const batteryDurationSec = powerBeingSupplied
      ? BATTERY_DURATION_CHARGE_MIN * 60
      : -BATTERY_DURATION_DISCHARGE_MIN * 60;

    const deltaCharge = (100 * deltaTs) / batteryDurationSec;
    const newCharge = MathUtils.clamp(this.charge + deltaCharge, 0, 100);

    // FIXME for purposes of encapsulation, this very likely shouldn't be here but ill let it slide 😏😏😎
    if (this.charge > 20 && newCharge <= 20) {
      showModal({
        kind: ModalKind.Alert,
        title: 'Battery Low',
        bodyText: 'The battery is getting very low. Please charge the battery soon.',
      });
    }

    this.charge = newCharge;
    this.lastChangeTimestamp = absoluteTime;

    return newCharge;
  }

  /** This method updates the battery's last recorded change timestamp so that large depletions do not happen when power is suddenly restored after being shut off for prolonged periods of time */
  onChargeStopStart(absoluteTime: number) {
    this.lastChangeTimestamp = absoluteTime;
  }
}

export enum PowerStates {
  SHUTOFF,
  SHUTDOWN,
  STANDBY,
  LOADING,
  LOADED,
  EMPTY,
}

export class PowerManager {
  private battery: Battery;

  private isBatteryChargeDischargeBeingSimulated: Subscribable<boolean>;

  private powerState: Subject<PowerStates>;
  private isCharging: Subject<boolean>;
  private charge: Subject<number>;

  constructor(efbSimvarSubscriber: EventSubscriber<EFBSimvars>, batteryLifeEnabled: UserSetting<boolean>) {
    this.isCharging = Subject.create(SimVar.GetSimVarValue('L:A32NX_ELEC_DC_2_BUS_IS_POWERED', 'bool'));

    this.battery = new Battery(100, SimVar.GetSimVarValue('E:ABSOLUTE TIME', 'seconds'));
    this.powerState = Subject.create(PowerStates.SHUTOFF as PowerStates);
    this.charge = Subject.create(100);

    efbSimvarSubscriber.on('dc2BusIsPowered').handle((isPowered) => {
      this.isCharging.set(isPowered);
      this.battery.onChargeStopStart(SimVar.GetSimVarValue('E:ABSOLUTE TIME', 'seconds'));
    });
    efbSimvarSubscriber.on('absoluteTime').handle((time) => {
      this.updateCharge(time);
    });

    this.isBatteryChargeDischargeBeingSimulated = MappedSubject.create(
      ([batteryLifeEnabled, powerState]) => {
        return powerState === PowerStates.LOADED && batteryLifeEnabled;
      },
      batteryLifeEnabled,
      this.powerState,
    );

    this.isBatteryChargeDischargeBeingSimulated.sub(() =>
      this.battery.onChargeStopStart(SimVar.GetSimVarValue('E:ABSOLUTE TIME', 'seconds')),
    );
  }

  get power(): Subscribable<PowerStates> {
    return this.powerState;
  }

  get isBatteryCharging(): Subscribable<boolean> {
    return this.isCharging;
  }

  get batteryCharge(): Subscribable<number> {
    return this.charge;
  }

  updateCharge(absoluteTime: number) {
    if (!this.isBatteryChargeDischargeBeingSimulated.get()) return;

    const newCharge = this.battery.update(absoluteTime, this.isCharging.get());
    this.charge.set(newCharge);

    if (newCharge <= 0) {
      this.powerState.set(PowerStates.EMPTY);
    }

    if (newCharge > 2 && this.powerState.get() === PowerStates.EMPTY) {
      this.offToLoaded();
    }
  }

  offToLoaded() {
    const shouldWait = this.powerState.get() === PowerStates.SHUTOFF || this.powerState.get() === PowerStates.EMPTY;
    this.powerState.set(PowerStates.LOADING);

    if (shouldWait) {
      setTimeout(() => {
        this.powerState.set(PowerStates.LOADED);
      }, 2500);
    } else {
      this.powerState.set(PowerStates.LOADED);
    }
  }

  handlePowerButtonPress() {
    if (this.powerState.get() === PowerStates.STANDBY) {
      this.offToLoaded();
    } else {
      // TODO Get history to work
      //   history.push('/');
      this.powerState.set(PowerStates.STANDBY);
    }
  }
}
