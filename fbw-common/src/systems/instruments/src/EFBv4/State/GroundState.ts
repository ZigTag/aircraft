import { ConsumerSubject, MappedSubject, Subject, Subscribable } from '@microsoft/msfs-sdk';
import { ServiceButtonState, ServiceButtonType } from '../Pages/Ground/Pages/Services';
import { EFBSimvars } from '../EFBSimvarPublisher';
import { EFB_EVENT_BUS } from '../EfbV4FsInstrument';

export class GroundState {
  constructor(private readonly bus: typeof EFB_EVENT_BUS) {}

  // SimVar Consumer
  private readonly _cabinLeftDoorOpen = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('cabinLeftDoorOpen'),
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:0', 'Percent over 100'),
  );
  private readonly _cabinRightDoorOpen = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('cabinRightDoorOpen'),
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:1', 'Percent over 100'),
  );
  private readonly _aftLeftDoorOpen = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('aftLeftDoorOpen'),
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:2', 'Percent over 100'),
  );
  private readonly _aftRightDoorOpen = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('aftRightDoorOpen'),
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:3', 'Percent over 100'),
  );
  private readonly _cargoDoorOpen = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('cargoDoorOpen'),
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:5', 'Percent over 100'),
  );

  public readonly cabinLeftStatus: Subscribable<boolean> = this._cabinLeftDoorOpen.map((val) => val >= 1.0);
  public readonly cabinRightStatus: Subscribable<boolean> = this._cabinRightDoorOpen.map((val) => val >= 1.0);
  public readonly aftLeftStatus: Subscribable<boolean> = this._aftLeftDoorOpen.map((val) => val >= 1.0);
  public readonly aftRightStatus: Subscribable<boolean> = this._aftRightDoorOpen.map((val) => val >= 1.0);

  private readonly _boardingDoor1ButtonState = Subject.create(
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:0', 'Percent over 100') === 1.0
      ? ServiceButtonState.ACTIVE
      : ServiceButtonState.INACTIVE,
  );
  private readonly _boardingDoor2ButtonState = Subject.create(
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:1', 'Percent over 100') === 1.0
      ? ServiceButtonState.ACTIVE
      : ServiceButtonState.INACTIVE,
  );
  private readonly _boardingDoor3ButtonState = Subject.create(
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:2', 'Percent over 100') === 1.0
      ? ServiceButtonState.ACTIVE
      : ServiceButtonState.INACTIVE,
  );
  private readonly _boardingDoor4ButtonState = Subject.create(
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:3', 'Percent over 100') === 1.0
      ? ServiceButtonState.ACTIVE
      : ServiceButtonState.INACTIVE,
  );
  private readonly _jetwayButtonState = Subject.create(ServiceButtonState.INACTIVE);
  private readonly _fuelTruckButtonState = Subject.create(ServiceButtonState.INACTIVE);
  private readonly _asuButtonState = Subject.create(
    SimVar.GetSimVarValue('L:A32NX_ASU_TURNED_ON', 'Bool') === 1.0
      ? ServiceButtonState.ACTIVE
      : ServiceButtonState.INACTIVE,
  );

  private readonly _cargoDoor1ButtonState = Subject.create(
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:5', 'Percent over 100') === 1.0
      ? ServiceButtonState.ACTIVE
      : ServiceButtonState.INACTIVE,
  );
  private readonly _gpuButtonState = Subject.create(ServiceButtonState.INACTIVE);
  private readonly _baggageButtonState = Subject.create(ServiceButtonState.INACTIVE);

  private readonly _cateringButtonState = Subject.create(ServiceButtonState.INACTIVE);

  public readonly boardingDoor1ButtonState: Subscribable<ServiceButtonState> = this._boardingDoor1ButtonState;
  public readonly boardingDoor2ButtonState: Subscribable<ServiceButtonState> = this._boardingDoor2ButtonState;
  public readonly boardingDoor3ButtonState: Subscribable<ServiceButtonState> = this._boardingDoor3ButtonState;
  public readonly boardingDoor4ButtonState: Subscribable<ServiceButtonState> = this._boardingDoor4ButtonState;
  public readonly jetwayButtonState: Subscribable<ServiceButtonState> = this._jetwayButtonState;
  public readonly fuelTruckButtonState: Subscribable<ServiceButtonState> = this._fuelTruckButtonState;
  public readonly asuButtonState: Subscribable<ServiceButtonState> = this._asuButtonState;

  public readonly cargoDoor1ButtonState: Subscribable<ServiceButtonState> = this._cargoDoor1ButtonState;
  public readonly gpuButtonState: Subscribable<ServiceButtonState> = this._gpuButtonState;
  public readonly baggageButtonState: Subscribable<ServiceButtonState> = this._baggageButtonState;

  public readonly cateringButtonState: Subscribable<ServiceButtonState> = this._cateringButtonState;

  private toggleCabinLeftDoor = () => SimVar.SetSimVarValue('K:TOGGLE_AIRCRAFT_EXIT', 'enum', 1);
  private toggleCabinRightDoor = () => SimVar.SetSimVarValue('K:TOGGLE_AIRCRAFT_EXIT', 'enum', 2);
  private toggleJetBridgeAndStairs = () => {
    SimVar.SetSimVarValue('K:TOGGLE_JETWAY', 'bool', false);
    SimVar.SetSimVarValue('K:TOGGLE_RAMPTRUCK', 'bool', false);
  };
  private toggleCargoDoor = () => SimVar.SetSimVarValue('K:TOGGLE_AIRCRAFT_EXIT', 'enum', 6);
  private toggleBaggageTruck = () => SimVar.SetSimVarValue('K:REQUEST_LUGGAGE', 'bool', true);
  private toggleAftLeftDoor = () => SimVar.SetSimVarValue('K:TOGGLE_AIRCRAFT_EXIT', 'enum', 3);
  private toggleAftRightDoor = () => SimVar.SetSimVarValue('K:TOGGLE_AIRCRAFT_EXIT', 'enum', 4);
  private toggleCateringTruck = () => SimVar.SetSimVarValue('K:REQUEST_CATERING', 'bool', true);
  private toggleFuelTruck = () => SimVar.SetSimVarValue('K:REQUEST_FUEL_KEY', 'bool', true);
  private toggleGpu = () => SimVar.SetSimVarValue('K:REQUEST_POWER_SUPPLY', 'bool', true);

  private newDoorState(buttonState: ServiceButtonState): ServiceButtonState {
    switch (buttonState) {
      case ServiceButtonState.INACTIVE:
        return ServiceButtonState.CALLED;
      case ServiceButtonState.CALLED:
      case ServiceButtonState.ACTIVE:
        return ServiceButtonState.RELEASED;
      case ServiceButtonState.RELEASED:
        return ServiceButtonState.CALLED;
      default:
        return buttonState;
    }
  }

  public handleButton(id: ServiceButtonType) {
    switch (id) {
      case ServiceButtonType.CabinLeftDoor:
        // I know this looks absolutely insane, it's because it doesn't like when 'this' gets thrown around,
        // so it has to be executed right here, right now.
        this._boardingDoor1ButtonState.set(this.newDoorState(this.boardingDoor1ButtonState.get()));
        this.toggleCabinLeftDoor();
        break;
      case ServiceButtonType.CabinRightDoor:
        this._boardingDoor2ButtonState.set(this.newDoorState(this.boardingDoor2ButtonState.get()));
        this.toggleCabinRightDoor();
        break;
      case ServiceButtonType.AftLeftDoor:
        this._boardingDoor3ButtonState.set(this.newDoorState(this.boardingDoor3ButtonState.get()));
        this.toggleAftLeftDoor();
        break;
      case ServiceButtonType.AftRightDoor:
        this._boardingDoor4ButtonState.set(this.newDoorState(this.boardingDoor4ButtonState.get()));
        this.toggleAftRightDoor();
        break;
      case ServiceButtonType.CargoDoor:
        this._cargoDoor1ButtonState.set(this.newDoorState(this.cargoDoor1ButtonState.get()));
        this.toggleCargoDoor();
        break;
    }
  }

  // DO NOT DELETE, this is the complete code regarding the button updating based off of door position.

  public simpleServiceListenerHandling = (state: ServiceButtonState, doorState: number): ServiceButtonState => {
    if (state <= ServiceButtonState.DISABLED) {
      return state;
    }
    switch (doorState) {
      case 0: // closed
        if (state !== ServiceButtonState.CALLED) {
          return ServiceButtonState.INACTIVE;
        }
        return state;
      case 1: // open
        return ServiceButtonState.ACTIVE;
      default: // in between
        if (state === ServiceButtonState.ACTIVE) {
          return ServiceButtonState.RELEASED;
        }
        return state;
    }
  };

  private _cabinLeftDoorOpenEffect = this._cabinLeftDoorOpen.sub((cabinLeftDoorOpen) => {
    this._boardingDoor1ButtonState.set(
      this.simpleServiceListenerHandling(this.boardingDoor1ButtonState.get(), cabinLeftDoorOpen),
    );
  });

  private _cabinRightDoorOpenEffect = this._cabinRightDoorOpen.sub((cabinRightDoorOpen) => {
    this._boardingDoor2ButtonState.set(
      this.simpleServiceListenerHandling(this.boardingDoor2ButtonState.get(), cabinRightDoorOpen),
    );
  });

  private _aftLeftDoorOpenEffect = this._aftLeftDoorOpen.sub((aftLeftDoorOpen) => {
    this._boardingDoor3ButtonState.set(
      this.simpleServiceListenerHandling(this.boardingDoor3ButtonState.get(), aftLeftDoorOpen),
    );
  });

  private _aftRightDoorOpenEffect = this._aftRightDoorOpen.sub((aftRightDoorOpen) => {
    this._boardingDoor4ButtonState.set(
      this.simpleServiceListenerHandling(this.boardingDoor4ButtonState.get(), aftRightDoorOpen),
    );
  });

  private _cargoDoorOpenEffect = this._cargoDoorOpen.sub((cargoDoorOpen) => {
    this._cargoDoor1ButtonState.set(
      this.simpleServiceListenerHandling(this.cargoDoor1ButtonState.get(), cargoDoorOpen),
    );
  });
}
