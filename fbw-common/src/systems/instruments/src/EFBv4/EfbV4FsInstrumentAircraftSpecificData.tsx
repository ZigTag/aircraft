import { UserSetting, VNode } from '@microsoft/msfs-sdk';
import { PerformanceCalculators } from '@shared/performance';

export interface EfbV4FsInstrumentAircraftSpecificData {
  renderAutomaticCalloutsPage: (returnHome: () => any, autoCallOuts: UserSetting<number>) => VNode;

  defaultAutoCalloutsSettingValue: number;

  performanceCalculators: PerformanceCalculators;

  pushbackPage: PushbackPage;

  settingsPages: SettingsPages;
}

export interface PushbackPage {
  turnIndicatorTuningDefault: number;
}

export interface SettingsPages {
  audio: AudioOptions;
  pinProgram: PinProgramOptions;
  realism: RealismOptions;
  sim: SimOptions;
  throttle: ThrottleOptions;
}

interface AudioOptions {
  announcements: boolean;
  boardingMusic: boolean;
  masterVolume: boolean;
  windVolume: boolean;
  engineVolume: boolean;
  paxAmbience: boolean;
  ptuCockpit: boolean;
}

interface PinProgramOptions {
  latLonExtend: boolean;
  paxSign: boolean;
  rmpVhfSpacing: boolean;
  satcom: boolean;
}

interface RealismOptions {
  mcduKeyboard: boolean;
  pauseOnTod: boolean;
  pilotAvatars: boolean;
  eclSoftKeys: boolean;
}

interface SimOptions {
  cones: boolean;
  msfsFplnSync: boolean;
  registrationDecal: boolean;
  wheelChocks: boolean;
  cabinLighting: boolean;
  pilotSeat: boolean;
}

interface ThrottleOptions {
  numberOfAircraftThrottles: number;
  axisOptions: number[];
  axisMapping: number[][][];
}
