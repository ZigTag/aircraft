import { EventBus, SimVarDefinition, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

export interface EFBSimvars {
  title: string;
  currentUTC: number;
  currentLocalTime: number;
  dayOfWeek: number;
  monthOfYear: number;
  dayOfMonth: number;
  efbBrightness: number;
  isLookingAtLeftEfb: boolean;
  isLookingAtRightEfb: boolean;

  currentLatitude: number;
  currentLongitude: number;
  activeFrequency: number;
  standbyFrequency: number;

  dc2BusIsPowered: boolean;
  absoluteTime: number;

  // Ground page (move to a32nx specific)
  cabinLeftDoorOpen: number;
  cabinRightDoorOpen: number;
  aftLeftDoorOpen: number;
  aftRightDoorOpen: number;
  cargoDoorOpen: number;
  gpuActive: number;
  fuelingActive: number;
  simOnGround: boolean;
  aircraftIsStationary: boolean;
  pushbackAttached: number;
  isGroundEquipmentAvailable: boolean;
  wheelChocksEnabled: boolean;
  conesEnabled: boolean;
  asuActive: boolean;

  // Fuel page (move to a32nx specific)
  centerCurrent: number;
  LInnCurrent: number;
  LOutCurrent: number;
  RInnCurrent: number;
  ROutCurrent: number;
  refuelTarget: number;

  // Presets page
  loadPreset: number;
  loadPresetsExpedite: boolean;

  // Quick controls
  cabinAutoBrightness: number;
  pauseAtTodArmed: boolean;
  simRate: number;
}

export enum EFBVars {
  title = 'A:TITLE',
  currentUTC = 'E:ZULU TIME',
  currentLocalTime = 'E:LOCAL TIME',
  dayOfWeek = 'E:ZULU DAY OF WEEK',
  monthOfYear = 'E:ZULU MONTH OF YEAR',
  dayOfMonth = 'E:ZULU DAY OF MONTH',
  efbBrightness = 'L:A32NX_EFB_BRIGHTNESS',
  isLookingAtLeftEfb = 'A:IS CAMERA RAY INTERSECT WITH NODE:1',
  isLookingAtRightEfb = 'A:IS CAMERA RAY INTERSECT WITH NODE:2',

  currentLatitude = 'A:GPS POSITION LAT',
  currentLongitude = 'A:GPS POSITION LON',

  activeFrequency = 'COM ACTIVE FREQUENCY:1',
  standbyFrequency = 'COM STANDBY FREQUENCY:1',

  dc2BusIsPowered = 'L:A32NX_ELEC_DC_2_BUS_IS_POWERED',
  absoluteTime = 'E:ABSOLUTE TIME',

  // Ground page (move to a32nx specific)
  cabinLeftDoorOpen = 'A:INTERACTIVE POINT OPEN:0',
  cabinRightDoorOpen = 'A:INTERACTIVE POINT OPEN:1',
  aftLeftDoorOpen = 'A:INTERACTIVE POINT OPEN:2',
  aftRightDoorOpen = 'A:INTERACTIVE POINT OPEN:3',
  cargoDoorOpen = 'A:INTERACTIVE POINT OPEN:5',
  gpuActive = 'A:INTERACTIVE POINT OPEN:8',
  fuelingActive = 'A:INTERACTIVE POINT OPEN:9',
  simOnGround = 'SIM ON GROUND',
  aircraftIsStationary = 'L:A32NX_IS_STATIONARY',
  pushbackAttached = 'Pushback Attached',
  isGroundEquipmentAvailable = 'L:A32NX_GND_EQP_IS_VISIBLE',
  wheelChocksEnabled = 'L:A32NX_MODEL_WHEELCHOCKS_ENABLED',
  conesEnabled = 'L:A32NX_MODEL_CONES_ENABLED',
  asuActive = 'L:A32NX_ASU_TURNED_ON',

  // Fuel page (move to a32nx specific)
  centerCurrent = 'FUEL TANK CENTER QUANTITY',
  LInnCurrent = 'FUEL TANK LEFT MAIN QUANTITY',
  LOutCurrent = 'FUEL TANK LEFT AUX QUANTITY',
  RInnCurrent = 'FUEL TANK RIGHT MAIN QUANTITY',
  ROutCurrent = 'FUEL TANK RIGHT AUX QUANTITY',
  refuelTarget = 'L:A32NX_FUEL_DESIRED_PERCENT',

  // Presets page
  loadPreset = 'L:A32NX_AIRCRAFT_PRESET_LOAD',
  loadPresetsExpedite = 'L:A32NX_AIRCRAFT_PRESET_LOAD_EXPEDITE',

  // Quick settings
  cabinAutoBrightness = 'L:A32NX_CABIN_AUTOBRIGHTNESS',
  pauseAtTodArmed = 'L:A32NX_PAUSE_AT_TOD_ARMED',
  simRate = 'SIMULATION RATE',
}

export class EFBSimvarPublisher extends SimVarPublisher<EFBSimvars> {
  private static simvars = new Map<keyof EFBSimvars, SimVarDefinition>([
    ['title', { name: EFBVars.title, type: SimVarValueType.String }],
    ['currentUTC', { name: EFBVars.currentUTC, type: SimVarValueType.Seconds }],
    ['currentLocalTime', { name: EFBVars.currentLocalTime, type: SimVarValueType.Seconds }],
    ['dayOfWeek', { name: EFBVars.dayOfWeek, type: SimVarValueType.Number }],
    ['dayOfMonth', { name: EFBVars.dayOfMonth, type: SimVarValueType.Number }],
    ['monthOfYear', { name: EFBVars.monthOfYear, type: SimVarValueType.Number }],
    ['dayOfMonth', { name: EFBVars.dayOfMonth, type: SimVarValueType.Number }],
    ['efbBrightness', { name: EFBVars.efbBrightness, type: SimVarValueType.Number }],
    ['isLookingAtLeftEfb', { name: EFBVars.isLookingAtLeftEfb, type: SimVarValueType.Bool }],
    ['isLookingAtRightEfb', { name: EFBVars.isLookingAtRightEfb, type: SimVarValueType.Bool }],

    ['currentLatitude', { name: EFBVars.currentLatitude, type: SimVarValueType.Degree }],
    ['currentLongitude', { name: EFBVars.currentLongitude, type: SimVarValueType.Degree }],
    ['activeFrequency', { name: EFBVars.activeFrequency, type: 'Hz' as SimVarValueType }],
    ['standbyFrequency', { name: EFBVars.standbyFrequency, type: 'Hz' as SimVarValueType }],

    ['dc2BusIsPowered', { name: EFBVars.dc2BusIsPowered, type: SimVarValueType.Bool }],
    ['absoluteTime', { name: EFBVars.absoluteTime, type: SimVarValueType.Seconds }],

    // Ground page (move to a32nx specific)
    ['cabinLeftDoorOpen', { name: EFBVars.cabinLeftDoorOpen, type: SimVarValueType.PercentOver100 }],
    ['cabinRightDoorOpen', { name: EFBVars.cabinRightDoorOpen, type: SimVarValueType.PercentOver100 }],
    ['aftLeftDoorOpen', { name: EFBVars.aftLeftDoorOpen, type: SimVarValueType.PercentOver100 }],
    ['aftRightDoorOpen', { name: EFBVars.aftRightDoorOpen, type: SimVarValueType.PercentOver100 }],
    ['cargoDoorOpen', { name: EFBVars.cargoDoorOpen, type: SimVarValueType.PercentOver100 }],
    ['gpuActive', { name: EFBVars.gpuActive, type: SimVarValueType.PercentOver100 }],
    ['fuelingActive', { name: EFBVars.fuelingActive, type: SimVarValueType.PercentOver100 }],
    ['simOnGround', { name: EFBVars.simOnGround, type: SimVarValueType.Bool }],
    ['aircraftIsStationary', { name: EFBVars.aircraftIsStationary, type: SimVarValueType.Bool }],
    ['pushbackAttached', { name: EFBVars.pushbackAttached, type: SimVarValueType.Enum }],
    ['isGroundEquipmentAvailable', { name: EFBVars.isGroundEquipmentAvailable, type: SimVarValueType.Bool }],
    ['wheelChocksEnabled', { name: EFBVars.wheelChocksEnabled, type: SimVarValueType.Bool }],
    ['conesEnabled', { name: EFBVars.conesEnabled, type: SimVarValueType.Bool }],
    ['asuActive', { name: EFBVars.asuActive, type: SimVarValueType.Bool }],

    // Fuel page (move to a32nx specific)
    ['centerCurrent', { name: EFBVars.centerCurrent, type: SimVarValueType.GAL }],
    ['LInnCurrent', { name: EFBVars.LInnCurrent, type: SimVarValueType.GAL }],
    ['LOutCurrent', { name: EFBVars.LOutCurrent, type: SimVarValueType.GAL }],
    ['RInnCurrent', { name: EFBVars.RInnCurrent, type: SimVarValueType.GAL }],
    ['ROutCurrent', { name: EFBVars.ROutCurrent, type: SimVarValueType.GAL }],
    ['refuelTarget', { name: EFBVars.refuelTarget, type: SimVarValueType.Number }],

    // Presets
    ['loadPreset', { name: EFBVars.loadPreset, type: SimVarValueType.Number }],
    ['loadPresetsExpedite', { name: EFBVars.loadPresetsExpedite, type: SimVarValueType.Bool }],

    // Quick controls
    ['cabinAutoBrightness', { name: EFBVars.cabinAutoBrightness, type: SimVarValueType.Number }],
    ['pauseAtTodArmed', { name: EFBVars.pauseAtTodArmed, type: SimVarValueType.Bool }],
    ['simRate', { name: EFBVars.simRate, type: SimVarValueType.Number }],
  ]);

  public constructor(bus: EventBus) {
    super(EFBSimvarPublisher.simvars, bus);
  }
}
