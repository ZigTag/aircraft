import { ConsumerSubject, MappedSubject, Subject, Subscribable } from '@microsoft/msfs-sdk';
import { EFBSimvars } from '../EFBSimvarPublisher';
import { EFB_EVENT_BUS } from '../EfbV4FsInstrument';
import { ServiceButtonState, ServiceButtonType } from '../Pages/Ground/Pages/Services/Widgets/ServiceButtons';

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
  private readonly _gpuActive = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('gpuActive'),
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:8', 'Percent over 100'),
  );
  private readonly _fuelingActive = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('fuelingActive'),
    SimVar.GetSimVarValue('A:INTERACTIVE POINT OPEN:9', 'Percent over 100'),
  );
  private readonly _simOnGround = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('simOnGround'),
    SimVar.GetSimVarValue('SIM ON GROUND', 'bool'),
  );
  private readonly _aircraftIsStationary = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('aircraftIsStationary'),
    SimVar.GetSimVarValue('L:A32NX_IS_STATIONARY', 'bool'),
  );
  private readonly _pushbackAttached = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('pushbackAttached'),
    SimVar.GetSimVarValue('Pushback Attached', 'enum'),
  );
  private readonly _isGroundEquipmentAvailable = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('isGroundEquipmentAvailable'),
    SimVar.GetSimVarValue('L:A32NX_GND_EQP_IS_VISIBLE', 'bool'),
  );
  private readonly _wheelChocksEnabled = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('wheelChocksEnabled'),
    SimVar.GetSimVarValue('L:A32NX_MODEL_WHEELCHOCKS_ENABLED', 'bool'),
  );
  private readonly _conesEnabled = ConsumerSubject.create(
    this.bus.getSubscriber<EFBSimvars>().on('conesEnabled'),
    SimVar.GetSimVarValue('L:A32NX_MODEL_CONES_ENABLED', 'bool'),
  );
  private readonly _asuActive = ConsumerSubject.create(this.bus.getSubscriber<EFBSimvars>().on('asuActive'), false);

  private readonly groundServicesAvailable = MappedSubject.create(
    ([simOnGround, aircraftIsStationary, pushbackAttached]) => {
      return simOnGround && aircraftIsStationary && pushbackAttached === 0;
    },
    this._simOnGround,
    this._aircraftIsStationary,
    this._pushbackAttached,
  );

  public readonly wheelChocksVisible = MappedSubject.create(
    ([wheelChocksEnabled, isGroundEquipmentAvailable]) => {
      return wheelChocksEnabled && isGroundEquipmentAvailable;
    },
    this._wheelChocksEnabled,
    this._isGroundEquipmentAvailable,
  );
  public readonly conesVisible = MappedSubject.create(
    ([conesEnabled, isGroundEquipmentAvailable]) => {
      return conesEnabled && isGroundEquipmentAvailable;
    },
    this._conesEnabled,
    this._isGroundEquipmentAvailable,
  );

  public readonly cabinLeftStatus: Subscribable<boolean> = this._cabinLeftDoorOpen.map((val) => val >= 1.0);
  public readonly cabinRightStatus: Subscribable<boolean> = this._cabinRightDoorOpen.map((val) => val >= 1.0);
  public readonly aftLeftStatus: Subscribable<boolean> = this._aftLeftDoorOpen.map((val) => val >= 1.0);
  public readonly aftRightStatus: Subscribable<boolean> = this._aftRightDoorOpen.map((val) => val >= 1.0);
  public readonly wheelChocksEnabled: Subscribable<boolean> = this._wheelChocksEnabled;
  public readonly conesEnabled: Subscribable<boolean> = this._conesEnabled;

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
  private toggleAsu = () => SimVar.SetSimVarValue('L:A32NX_ASU_TURNED_ON', 'Bool', !this._asuActive.get());

  private setButtonState = (button: ServiceButtonType, value: ServiceButtonState) => {
    switch (button) {
      case ServiceButtonType.CabinLeftDoor:
        this._boardingDoor1ButtonState.set(value);
        break;
      case ServiceButtonType.CabinRightDoor:
        this._boardingDoor2ButtonState.set(value);
        break;
      case ServiceButtonType.AftLeftDoor:
        this._boardingDoor3ButtonState.set(value);
        break;
      case ServiceButtonType.AftRightDoor:
        this._boardingDoor4ButtonState.set(value);
        break;
      case ServiceButtonType.CargoDoor:
        this._cargoDoor1ButtonState.set(value);
        break;
      case ServiceButtonType.JetBridge:
        this._jetwayButtonState.set(value);
        break;
      case ServiceButtonType.CateringTruck:
        this._cateringButtonState.set(value);
        break;
      case ServiceButtonType.BaggageTruck:
        this._baggageButtonState.set(value);
        break;
    }
  };

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

  private newSimpleServiceState(button: ServiceButtonType, buttonState: ServiceButtonState): ServiceButtonState {
    // Toggle called/released
    if (buttonState === ServiceButtonState.INACTIVE) {
      return ServiceButtonState.CALLED;
    } else if (buttonState === ServiceButtonState.CALLED) {
      return ServiceButtonState.INACTIVE;
    } else {
      console.assert(
        buttonState === ServiceButtonState.ACTIVE,
        'Expected %s to be in state %s but was in state %s',
        ServiceButtonType[button],
        ServiceButtonState[ServiceButtonState.ACTIVE],
        ServiceButtonState[buttonState],
      );
      return ServiceButtonState.RELEASED;
    }
  }

  private handleComplexService = (
    serviceButton: ServiceButtonType,
    serviceButtonState: Subscribable<ServiceButtonState>,
    doorButton: ServiceButtonType,
    doorButtonState: Subscribable<ServiceButtonState>,
    doorOpenState: number,
  ) => {
    // Service Button handling
    if (serviceButtonState.get() === ServiceButtonState.INACTIVE) {
      this.setButtonState(serviceButton, ServiceButtonState.CALLED);
      // If door was already open use a timer to set to active
      // as the useEffect will never be called.
      if (doorOpenState === 1) {
        setTimeout(() => {
          this.setButtonState(serviceButton, ServiceButtonState.ACTIVE);
        }, 5000);
      }
    } else if (serviceButtonState.get() === ServiceButtonState.CALLED) {
      // When in state CALLED another click on the button cancels the request.
      // This prevents another click after a "called" has been cancelled
      // to avoid state getting out of sync.
      this.setButtonState(serviceButton, ServiceButtonState.DISABLED);
      setTimeout(() => {
        this.setButtonState(serviceButton, ServiceButtonState.INACTIVE);
      }, 5500);
    } else {
      console.assert(
        serviceButtonState.get() === ServiceButtonState.ACTIVE,
        'Expected %s to be in state %s but was in state %s',
        ServiceButtonType[serviceButton],
        ServiceButtonState[ServiceButtonState.ACTIVE],
        ServiceButtonState[serviceButtonState.get()],
      );
      this.setButtonState(serviceButton, ServiceButtonState.RELEASED);
      // If there is no service vehicle/jet-bridge available the door would
      // never receive a close event, so we need to set the button state
      // to inactive after a timeout.
      setTimeout(() => {
        if (doorOpenState === 1) {
          this.setButtonState(serviceButton, ServiceButtonState.INACTIVE);
        }
      }, 5000);
    }

    // Door Button: enable door button after a timeout if it was disabled
    if (doorButtonState.get() === ServiceButtonState.DISABLED) {
      setTimeout(() => {
        // service button could have been pressed again in the meantime
        if (serviceButtonState.get() < ServiceButtonState.CALLED) {
          if (doorOpenState === 1) {
            this.setButtonState(doorButton, ServiceButtonState.ACTIVE);
          } else {
            this.setButtonState(doorButton, ServiceButtonState.INACTIVE);
          }
        }
      }, 5000);
    } else {
      // disable the door button if the service button has been pressed
      this.setButtonState(doorButton, ServiceButtonState.DISABLED);
    }
  };

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
      // FUBAR?
      case ServiceButtonType.FuelTruck:
        this._fuelTruckButtonState.set(
          this.newSimpleServiceState(ServiceButtonType.FuelTruck, this.fuelTruckButtonState.get()),
        );
        this.toggleFuelTruck();
        break;
      //
      case ServiceButtonType.Gpu:
        this._gpuButtonState.set(this.newSimpleServiceState(ServiceButtonType.Gpu, this.gpuButtonState.get()));
        this.toggleGpu();
        break;
      case ServiceButtonType.JetBridge:
        this.handleComplexService(
          ServiceButtonType.JetBridge,
          this.jetwayButtonState,
          ServiceButtonType.CabinLeftDoor,
          this.boardingDoor1ButtonState,
          this._cabinLeftDoorOpen.get(),
        );
        this.toggleJetBridgeAndStairs();
        break;
      case ServiceButtonType.BaggageTruck:
        this.handleComplexService(
          ServiceButtonType.BaggageTruck,
          this.baggageButtonState,
          ServiceButtonType.CargoDoor,
          this.cargoDoor1ButtonState,
          this._cargoDoorOpen.get(),
        );
        this.toggleBaggageTruck();
        break;
      case ServiceButtonType.CateringTruck:
        this.handleComplexService(
          ServiceButtonType.CateringTruck,
          this.cateringButtonState,
          ServiceButtonType.AftRightDoor,
          this.boardingDoor4ButtonState,
          this._aftRightDoorOpen.get(),
        );
        this.toggleCateringTruck();
        break;
      case ServiceButtonType.AirStarterUnit:
        this._asuButtonState.set(
          this.newSimpleServiceState(ServiceButtonType.AirStarterUnit, this.asuButtonState.get()),
        );
        this.toggleAsu();
        break;
      default:
        break;
    }
  }

  private complexServiceListenerHandling = (
    serviceButton: ServiceButtonType,
    serviceButtonState: Subscribable<ServiceButtonState>,
    doorButton: ServiceButtonType,
    doorButtonState: ServiceButtonState,
    doorState: number,
  ) => {
    switch (serviceButtonState.get()) {
      case ServiceButtonState.HIDDEN:
      case ServiceButtonState.DISABLED:
      case ServiceButtonState.INACTIVE:
        break;
      case ServiceButtonState.CALLED:
        if (doorState === 1) this.setButtonState(serviceButton, ServiceButtonState.ACTIVE);
        if (doorState === 0) this.setButtonState(serviceButton, ServiceButtonState.INACTIVE);
        break;
      case ServiceButtonState.ACTIVE:
        if (doorState < 1 && doorState > 0) this.setButtonState(serviceButton, ServiceButtonState.RELEASED);
        if (doorState === 0) this.setButtonState(serviceButton, ServiceButtonState.INACTIVE);
        break;
      case ServiceButtonState.RELEASED:
        if (doorState === 0) this.setButtonState(serviceButton, ServiceButtonState.INACTIVE);
        break;
      default:
    }
    // enable door button in case door has been closed by other means (e.g. pushback)
    if (
      doorState < 1 &&
      serviceButtonState.get() >= ServiceButtonState.ACTIVE &&
      doorButtonState === ServiceButtonState.DISABLED
    ) {
      setTimeout(() => {
        // double-check as service button could have been pressed again in the meantime
        if (this.groundServicesAvailable.get() && serviceButtonState.get() < ServiceButtonState.CALLED) {
          this.setButtonState(doorButton, ServiceButtonState.INACTIVE);
        }
      }, 5000);
    }
  };

  private newSimpleSimVarState = (state: ServiceButtonState, doorState: number): ServiceButtonState => {
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
      this.newSimpleSimVarState(this.boardingDoor1ButtonState.get(), cabinLeftDoorOpen),
    );
    this.complexServiceListenerHandling(
      ServiceButtonType.JetBridge,
      this.jetwayButtonState,
      ServiceButtonType.CabinLeftDoor,
      this.boardingDoor1ButtonState.get(),
      cabinLeftDoorOpen,
    );
  });

  private _cabinRightDoorOpenEffect = this._cabinRightDoorOpen.sub((cabinRightDoorOpen) => {
    this._boardingDoor2ButtonState.set(
      this.newSimpleSimVarState(this.boardingDoor2ButtonState.get(), cabinRightDoorOpen),
    );
  });

  private _aftLeftDoorOpenEffect = this._aftLeftDoorOpen.sub((aftLeftDoorOpen) => {
    this._boardingDoor3ButtonState.set(this.newSimpleSimVarState(this.boardingDoor3ButtonState.get(), aftLeftDoorOpen));
  });

  private _aftRightDoorOpenEffect = this._aftRightDoorOpen.sub((aftRightDoorOpen) => {
    this._boardingDoor4ButtonState.set(
      this.newSimpleSimVarState(this.boardingDoor4ButtonState.get(), aftRightDoorOpen),
    );
    this.complexServiceListenerHandling(
      ServiceButtonType.CateringTruck,
      this.cateringButtonState,
      ServiceButtonType.AftRightDoor,
      this.boardingDoor4ButtonState.get(),
      aftRightDoorOpen,
    );
  });

  private _cargoDoorOpenEffect = this._cargoDoorOpen.sub((cargoDoorOpen) => {
    this._cargoDoor1ButtonState.set(this.newSimpleSimVarState(this.cargoDoor1ButtonState.get(), cargoDoorOpen));
    this.complexServiceListenerHandling(
      ServiceButtonType.BaggageTruck,
      this.baggageButtonState,
      ServiceButtonType.CargoDoor,
      this.cargoDoor1ButtonState.get(),
      cargoDoorOpen,
    );
  });

  private _gpuActiveEffect = this._gpuActive.sub((gpuActive) => {
    this._gpuButtonState.set(this.newSimpleSimVarState(this.gpuButtonState.get(), gpuActive));
  });

  private _fuelingActiveEffect = this._fuelingActive.sub((fuelingActive) => {
    this._fuelTruckButtonState.set(this.newSimpleSimVarState(this.fuelTruckButtonState.get(), fuelingActive));
  });

  private _asuActiveEffect = this._asuActive.sub((asuActive) => {
    this._asuButtonState.set(this.newSimpleSimVarState(this.asuButtonState.get(), Number(asuActive)));
  });
}
