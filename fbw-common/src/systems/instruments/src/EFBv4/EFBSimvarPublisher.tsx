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
  ]);

  public constructor(bus: EventBus) {
    super(EFBSimvarPublisher.simvars, bus);
  }
}
