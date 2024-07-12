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

  cabinLeftDoorOpen: number;
  cabinRightDoorOpen: number;
  aftLeftDoorOpen: number;
  aftRightDoorOpen: number;
  cargoDoorOpen: number;
  gpuActive: number;
  fuelingActive: number;
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

  cabinLeftDoorOpen = 'A:INTERACTIVE POINT OPEN:0',
  cabinRightDoorOpen = 'A:INTERACTIVE POINT OPEN:1',
  aftLeftDoorOpen = 'A:INTERACTIVE POINT OPEN:2',
  aftRightDoorOpen = 'A:INTERACTIVE POINT OPEN:3',
  cargoDoorOpen = 'A:INTERACTIVE POINT OPEN:5',
  gpuActive = 'A:INTERACTIVE POINT OPEN:8',
  fuelingActive = 'A:INTERACTIVE POINT OPEN:9',
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

    ['cabinLeftDoorOpen', { name: EFBVars.cabinLeftDoorOpen, type: SimVarValueType.PercentOver100 }],
    ['cabinRightDoorOpen', { name: EFBVars.cabinRightDoorOpen, type: SimVarValueType.PercentOver100 }],
    ['aftLeftDoorOpen', { name: EFBVars.aftLeftDoorOpen, type: SimVarValueType.PercentOver100 }],
    ['aftRightDoorOpen', { name: EFBVars.aftRightDoorOpen, type: SimVarValueType.PercentOver100 }],
    ['cargoDoorOpen', { name: EFBVars.cargoDoorOpen, type: SimVarValueType.PercentOver100 }],
    ['gpuActive', { name: EFBVars.gpuActive, type: SimVarValueType.PercentOver100 }],
    ['fuelingActive', { name: EFBVars.fuelingActive, type: SimVarValueType.PercentOver100 }],
  ]);

  public constructor(bus: EventBus) {
    super(EFBSimvarPublisher.simvars, bus);
  }
}
