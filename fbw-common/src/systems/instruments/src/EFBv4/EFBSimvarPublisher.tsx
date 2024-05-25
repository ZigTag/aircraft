import { EventBus, SimVarDefinition, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

export interface EFBSimvars {
  title: string;
  currentUTC: number;
  currentLocalTime: number;
  dayOfWeek: number;
  monthOfYear: number;
  dayOfMonth: number;
  efbBrightness: number;
}

export enum EFBVars {
  title = 'A:TITLE',
  currentUTC = 'E:ZULU TIME',
  currentLocalTime = 'E:LOCAL TIME',
  dayOfWeek = 'E:ZULU DAY OF WEEK',
  monthOfYear = 'E:ZULU MONTH OF YEAR',
  dayOfMonth = 'E:ZULU DAY OF MONTH',
  efbBrightness = 'L:A32NX_EFB_BRIGHTNESS',
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
  ]);

  public constructor(bus: EventBus) {
    super(EFBSimvarPublisher.simvars, bus);
  }
}
