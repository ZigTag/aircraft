import {
  DefaultUserSettingManager,
  EventBus,
  UserSettingManager,
  UserSettingSaveManager,
  UserSettingValue,
} from '@microsoft/msfs-sdk';

const CURRENT_SETTINGS_VERSION = 1;

export enum IsisBaroUnit {
  Hpa,
  InHgOrHpa,
}

export enum InitBaroUnit {
  Auto = 'AUTO',
  InHg = 'IN HG',
  Hpa = 'HPA',
}

export enum PaxSigns {
  NoSmoking,
  NoPortableDevices,
}

export enum VhfSpacing {
  EightPointThirtyThreeKHz,
  TwentyFiveKHz,
}

export enum LatLonExtendedFormat {
  LLnn,
  AxxByyy,
}

export enum WeightUnit {
  Kg,
  Lbs,
}

export enum FpSyncMode {
  None = 'NONE',
  Load = 'LOAD',
  Save = 'SAVE',
}

export enum SimBridgeMode {
  AutoOn = 'AUTO ON',
  AutoOff = 'AUTO OFF',
  PermOff = 'PERM OFF',
}

export enum FlypadTimeDisplay {
  Utc,
  Local,
  Both,
}

export enum FlypadTimeFormat {
  Twelve,
  TwentyFour,
}

export enum FlypadTheme {
  Blue,
  Dark,
  Light,
}

export enum AtisSource {
  FAA,
  PILOT_EDGE,
  IVAO,
  VATSIM,
}

export enum MetarSource {
  MSFS = 'MSFS',
  PILOTEDGE = 'PILOTEDGE',
  NOAA = 'NOAA',
  VATSIM = 'VATSIM',
}

export enum TafSource {
  NOAA,
}

const fbwUserSettings = (defaultAutoCallouts: number) =>
  [
    {
      name: 'fbwSettingsVersion',
      defaultValue: 0 as number,
    },
    {
      name: 'fbwAircraftThrustReductionHeight',
      defaultValue: 1500 as number,
    },
    {
      name: 'fbwAircraftAccelerationHeight',
      defaultValue: 1500 as number,
    },
    {
      name: 'fbwAircraftEngineOutAccelerationHeight',
      defaultValue: 1500 as number,
    },
    {
      name: 'fbwAircraftIsisBaroUnit',
      defaultValue: IsisBaroUnit.Hpa as IsisBaroUnit,
    },
    {
      name: 'fbwAircraftIsisIsMetricAltitude',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwAudioPtuInCockpit',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwAircraftPaxSigns',
      defaultValue: PaxSigns.NoSmoking as PaxSigns,
    },
    {
      name: 'fbwAircraftVhfSpacing',
      defaultValue: VhfSpacing.EightPointThirtyThreeKHz as VhfSpacing,
    },
    {
      name: 'fbwAircraftLatLonExtendedFormat',
      defaultValue: LatLonExtendedFormat.LLnn as LatLonExtendedFormat,
    },
    {
      name: 'fbwAircraftWeightUnit',
      defaultValue: WeightUnit.Kg as WeightUnit,
    },
    {
      name: 'fbwAircraftSatcomEnabled',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwAircraftFwcRadioAutoCallOutPins',
      defaultValue: defaultAutoCallouts,
    },
    {
      name: 'fbwAutomaticallyImportSimbriefData',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwPauseAtTod',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwPauseAtTodDistance',
      defaultValue: 500 as number,
    },
    {
      name: 'fbwAtsuAocAtisSource',
      defaultValue: AtisSource.FAA as AtisSource,
    },
    {
      name: 'fbwAtsuAocMetarSource',
      defaultValue: MetarSource.MSFS as MetarSource,
    },
    {
      name: 'fbwAtsuAocTafSource',
      defaultValue: TafSource.NOAA as TafSource,
    },
    {
      name: 'fbwAtsuAocOnlineFeaturesEnabled',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwAtsuAocHoppieEnabled',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwAtsuAocHoppieUserId',
      defaultValue: '',
    },
    {
      name: 'fbwAudioLevelExteriorMaster',
      defaultValue: 0 as number,
    },
    {
      name: 'fbwAudioLevelInteriorEngine',
      defaultValue: 0 as number,
    },
    {
      name: 'fbwAudioLevelInteriorWind',
      defaultValue: 0 as number,
    },
    {
      name: 'fbwAudioPassengerAmbienceEnabled',
      defaultValue: true as boolean,
    },
    {
      name: 'fbwAudioAnnouncementsEnabled',
      defaultValue: true as boolean,
    },
    {
      name: 'fbwAudioBoardingMusicEnabled',
      defaultValue: true as boolean,
    },
    {
      name: 'fbwTelexEnabled',
      defaultValue: true as boolean,
    },
    {
      name: 'fbwInitBaroUnit',
      defaultValue: InitBaroUnit.Auto as InitBaroUnit,
    },
    {
      name: 'fbwSimbriefOverrideUserID',
      defaultValue: -1 as number,
    },
    {
      name: 'fbwDynamicRegistrationDecal',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwFpSync',
      defaultValue: FpSyncMode.Load as FpSyncMode,
    },
    {
      name: 'fbwSimBridgeEnabled',
      defaultValue: SimBridgeMode.AutoOn as SimBridgeMode,
    },
    {
      name: 'fbwSimbridgeRemote',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwSimBridgeIP',
      defaultValue: 'localhost' as string,
    },
    {
      name: 'fbwSimBridgePort',
      defaultValue: 8380 as number,
    },
    {
      name: 'fbwRadioReceiverUsageEnabled',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwModelWheelChocksEnabled',
      defaultValue: true as boolean,
    },
    {
      name: 'fbwModelConesEnabled',
      defaultValue: true as boolean,
    },
    {
      name: 'fbwCabinBrightness',
      defaultValue: 0 as number,
    },
    {
      name: 'fbwCabinAutoBrightness',
      defaultValue: true as boolean,
    },
    {
      name: 'fbwGsxFuelSyncEnabled',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwGsxPayloadSyncEnabled',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwEfbLanguage',
      defaultValue: 'en' as string,
    },
    {
      name: 'fbwEfbOskLanguage',
      defaultValue: 'english' as string,
    },
    {
      name: 'fbwEfbAutoOsk',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwEfbRemindersOrder',
      defaultValue: ['Weather', 'Pinned Charts', 'Maintenance', 'Checklists'].toString(),
    },
    {
      name: 'fbwEfbBrightness',
      defaultValue: 0 as number,
    },
    {
      name: 'fbwEfbAutoBrightness',
      defaultValue: false as boolean,
    },
    {
      name: 'fbwEfbBatteryLifeEnabled',
      defaultValue: true as boolean,
    },
    {
      name: 'fbwEfbFlightProgressbar',
      defaultValue: true as boolean,
    },
    {
      name: 'fbwEfbColoredMetar',
      defaultValue: true as boolean,
    },
    {
      name: 'fbwEfbTimeDisplay',
      defaultValue: FlypadTimeDisplay.Utc as FlypadTimeDisplay,
    },
    {
      name: 'fbwEfbTimeFormat',
      defaultValue: FlypadTimeFormat.TwentyFour as FlypadTimeFormat,
    },
    {
      name: 'fbwEfbTheme',
      defaultValue: FlypadTheme.Blue as FlypadTheme,
    },
    {
      name: 'fbwEfbOfpFontSize',
      defaultValue: 14 as number,
    },
    {
      name: 'fbwEfbOfpImageSize',
      defaultValue: 60 as number,
    },
  ] as const;

export type FbwUserSettingsDefs = {
  readonly [Item in ReturnType<typeof fbwUserSettings>[number] as Item['name']]: Item['defaultValue'];
};

type LegacySettingMapping = {
  newSettingName: keyof FbwUserSettingsDefs & string;
  valueMapper?: (value: string) => UserSettingValue;
};

export class FbwUserSettings {
  private static INSTANCE: DefaultUserSettingManager<FbwUserSettingsDefs> | undefined;

  public static getExistingManager(): UserSettingManager<FbwUserSettingsDefs> {
    if (!FbwUserSettings.INSTANCE) {
      throw new Error(
        '[FbwUserSettings](getExistingManager) Called before an instance existed. Make sure FbwUserSettings::getManager is called before this method is called.',
      );
    }

    return FbwUserSettings.INSTANCE;
  }

  public static getManager(bus: EventBus, defaultAutoCallouts: number): UserSettingManager<FbwUserSettingsDefs> {
    if (FbwUserSettings.INSTANCE === undefined) {
      FbwUserSettings.INSTANCE = new DefaultUserSettingManager<FbwUserSettingsDefs>(
        bus,
        fbwUserSettings(defaultAutoCallouts),
      );
    }

    return FbwUserSettings.INSTANCE;
  }
}

export class FbwUserSettingsSaveManager extends UserSettingSaveManager {
  private static readonly LEGACY_SETTINGS_TO_NEW_SETTINGS: Record<string, LegacySettingMapping> = {
    A32NX_CONFIG_THR_RED_ALT: {
      newSettingName: 'fbwAircraftThrustReductionHeight',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_CONFIG_ACCEL_ALT: {
      newSettingName: 'fbwAircraftAccelerationHeight',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_CONFIG_ENG_OUT_ACCEL_ALT: {
      newSettingName: 'fbwAircraftEngineOutAccelerationHeight',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_ISIS_BARO_UNIT_INHG: {
      newSettingName: 'fbwAircraftIsisBaroUnit',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_ISIS_METRIC_ALTITUDE: {
      newSettingName: 'fbwAircraftIsisBaroUnit',
      valueMapper: (value) => value === '1',
    },
    A32NX_CONFIG_USING_PORTABLE_DEVICES: {
      newSettingName: 'fbwAircraftPaxSigns',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_RMP_VHF_SPACING_25KHZ: {
      newSettingName: 'fbwAircraftVhfSpacing',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_LATLON_EXT_FMT: {
      newSettingName: 'fbwAircraftLatLonExtendedFormat',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_MODEL_SATCOM_ENABLED: {
      newSettingName: 'fbwAircraftSatcomEnabled',
      valueMapper: (value) => value === '1',
    },
    A32NX_FWC_RADIO_AUTO_CALL_OUT_PINS: {
      newSettingName: 'fbwAircraftFwcRadioAutoCallOutPins',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_CONFIG_AUTO_SIMBRIEF_IMPORT: {
      newSettingName: 'fbwAutomaticallyImportSimbriefData',
      valueMapper: (value) => value === 'ENABLED',
    },

    // TODO AircraftOptionsPinProgramsPage
    // TODO SimOptionsPort

    // RealismPage
    A32NX_CONFIG_PAUSE_AT_TOD: {
      newSettingName: 'fbwPauseAtTod',
      valueMapper: (value) => value === '1',
    },
    A32NX_CONFIG_PAUSE_AT_TOD_DISTANCE: {
      newSettingName: 'fbwPauseAtTodDistance',
      valueMapper: (value) => parseInt(value),
    },

    // TODO ThirdPartyOptionsPage
    A32NX_CONFIG_ATIS_SRC: {
      newSettingName: 'fbwAtsuAocAtisSource',
      valueMapper: (value) => {
        switch (value) {
          case 'FAA':
            return AtisSource.FAA;
          case 'PILOTEDGE':
            return AtisSource.PILOT_EDGE;
          case 'IVAO':
            return AtisSource.IVAO;
          case 'VATSIM':
            return AtisSource.VATSIM;
          default:
            return AtisSource.FAA;
        }
      },
    },
    A32NX_CONFIG_METAR_SRC: {
      newSettingName: 'fbwAtsuAocMetarSource',
      valueMapper: (value) => {
        switch (value) {
          case 'MSFS':
            return MetarSource.MSFS;
          case 'PILOTEDGE':
            return MetarSource.PILOTEDGE;
          case 'NOAA':
            return MetarSource.NOAA;
          case 'VATSIM':
            return MetarSource.VATSIM;
          default:
            return MetarSource.MSFS;
        }
      },
    },
    A32NX_CONFIG_TAF_SRC: {
      newSettingName: 'fbwAtsuAocTafSource',
      valueMapper: () => TafSource.NOAA,
    },
    A32NX_CONFIG_ONLINE_FEATURES_STATUS: {
      newSettingName: 'fbwAtsuAocOnlineFeaturesEnabled',
      valueMapper: (value) => value === 'ENABLED',
    },
    A32NX_CONFIG_HOPPIE_ENABLED: {
      newSettingName: 'fbwAtsuAocHoppieEnabled',
      valueMapper: (value) => value === 'ENABLED',
    },
    // TODO add sentry setting key here later

    // TODO AudioPage
    // TODO FlyPadPage

    A32NX_SOUND_PTU_AUDIBLE_COCKPIT: {
      newSettingName: 'fbwAudioPtuInCockpit',
      valueMapper: (value) => value === '1',
    },
    A32NX_SOUND_EXTERIOR_MASTER: {
      newSettingName: 'fbwAudioLevelExteriorMaster',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_SOUND_INTERIOR_ENGINE: {
      newSettingName: 'fbwAudioLevelInteriorEngine',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_SOUND_INTERIOR_WIND: {
      newSettingName: 'fbwAudioLevelInteriorWind',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_SOUND_PASSENGER_AMBIENCE_ENABLED: {
      newSettingName: 'fbwAudioPassengerAmbienceEnabled',
      valueMapper: (value) => value === '1',
    },
    A32NX_SOUND_ANNOUNCEMENTS_ENABLED: {
      newSettingName: 'fbwAudioAnnouncementsEnabled',
      valueMapper: (value) => value === '1',
    },
    A32NX_SOUND_BOARDING_MUSIC_ENABLED: {
      newSettingName: 'fbwAudioBoardingMusicEnabled',
      valueMapper: (value) => value === '1',
    },
    A32NX_CONFIG_TELEX_STATUS: {
      newSettingName: 'fbwTelexEnabled',
      valueMapper: (value) => value === 'ENABLED',
    },
    A32NX_CONFIG_INIT_BARO_UNIT: { newSettingName: 'fbwInitBaroUnit' },
    A32NX_CONFIG_OVERRIDE_SIMBRIEF_USERID: { newSettingName: 'fbwSimbriefOverrideUserID' },
    A32NX_DYNAMIC_REGISTRATION_DECAL: {
      newSettingName: 'fbwDynamicRegistrationDecal',
      valueMapper: (value) => value === '1',
    },
    A32NX_FP_SYNC: { newSettingName: 'fbwFpSync' },
    A32NX_CONFIG_SIMBRIDGE_ENABLED: { newSettingName: 'fbwSimBridgeEnabled' },
    A32NX_CONFIG_SIMBRIDGE_REMOTE: {
      newSettingName: 'fbwSimbridgeRemote',
      valueMapper: (value) => value !== 'local',
    },
    A32NX_CONFIG_SIMBRIDGE_IP: { newSettingName: 'fbwSimBridgeIP' },
    A32NX_CONFIG_SIMBRIDGE_PORT: {
      newSettingName: 'fbwSimBridgePort',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_RADIO_RECEIVER_USAGE_ENABLED: {
      newSettingName: 'fbwRadioReceiverUsageEnabled',
      valueMapper: (value) => value === '1',
    },
    A32NX_MODEL_WHEELCHOCKS_ENABLED: {
      newSettingName: 'fbwModelWheelChocksEnabled',
      valueMapper: (value) => value === '1',
    },
    A32NX_MODEL_CONES_ENABLED: {
      newSettingName: 'fbwModelConesEnabled',
      valueMapper: (value) => value === '1',
    },
    A32NX_CABIN_MANUAL_BRIGHTNESS: {
      newSettingName: 'fbwCabinBrightness',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_CABIN_USING_AUTOBRIGHTNESS: {
      newSettingName: 'fbwCabinAutoBrightness',
      valueMapper: (value) => value === '1',
    },
    A32NX_GSX_FUEL_SYNC: {
      newSettingName: 'fbwGsxFuelSyncEnabled',
      valueMapper: (value) => value === '1',
    },
    A32NX_GSX_PAYLOAD_SYNC: {
      newSettingName: 'fbwGsxPayloadSyncEnabled',
      valueMapper: (value) => value === '1',
    },
    A32NX_EFB_LANGUAGE: { newSettingName: 'fbwEfbLanguage' },
    A32NX_EFB_KEYBOARD_LAYOUT_IDENT: { newSettingName: 'fbwEfbOskLanguage' },
    A32NX_EFB_AUTO_OSK: {
      newSettingName: 'fbwEfbAutoOsk',
      valueMapper: (value) => value === '1',
    },
    A32NX_REMINDER_WIDGET_ORDERED_KEYS: { newSettingName: 'fbwEfbRemindersOrder' },
    A32NX_EFB_BRIGHTNESS: {
      newSettingName: 'fbwEfbBrightness',
      valueMapper: (value) => parseInt(value),
    },
    A32NX_EFB_USING_AUTOBRIGHTNESS: {
      newSettingName: 'fbwEfbAutoBrightness',
      valueMapper: (value) => value === '1',
    },
    A32NX_EFB_BATTERY_LIFE_ENABLED: {
      newSettingName: 'fbwEfbBatteryLifeEnabled',
      valueMapper: (value) => value === '1',
    },
    A32NX_EFB_SHOW_STATUSBAR_FLIGHTPROGRESS: {
      newSettingName: 'fbwEfbFlightProgressbar',
      valueMapper: (value) => value === '1',
    },
    A32NX_EFB_USING_COLOREDMETAR: {
      newSettingName: 'fbwEfbColoredMetar',
      valueMapper: (value) => value === '1',
    },
    A32NX_EFB_TIME_DISPLAYED: {
      newSettingName: 'fbwEfbTimeDisplay',
      valueMapper: (value) => {
        if (value === 'utc') {
          return FlypadTimeDisplay.Utc;
        } else if (value === 'local') {
          return FlypadTimeDisplay.Local;
        } else {
          return FlypadTimeDisplay.Both;
        }
      },
    },
    A32NX_EFB_TIME_FORMAT: {
      newSettingName: 'fbwEfbTimeFormat',
      valueMapper: (value) => {
        if (value === '12') {
          return FlypadTimeFormat.Twelve;
        } else {
          return FlypadTimeFormat.TwentyFour;
        }
      },
    },
    A32NX_EFB_UI_THEME: {
      newSettingName: 'fbwEfbTheme',
      valueMapper: (value) => {
        if (value === 'blue') {
          return FlypadTheme.Blue;
        } else if (value === 'dark') {
          return FlypadTheme.Dark;
        } else {
          return FlypadTheme.Light;
        }
      },
    },
  };

  constructor(
    bus: EventBus,
    private readonly settingsManager: UserSettingManager<FbwUserSettingsDefs>,
  ) {
    const settings = [...settingsManager.getAllSettings()];

    super(settings, bus);
  }

  public tryPortLegacyA32NXSettings(): void {
    const settingsVersion = this.settingsManager.getSetting('fbwSettingsVersion');
    const version = settingsVersion.get();

    if (version !== 0) {
      console.log('[FbwUserSettingsSaveManager](portLegacyA32NXSettings) Version is not 0, no need to port anything');
      return;
    }

    console.log(
      '[FbwUserSettingsSaveManager](portLegacyA32NXSettings) Version is 0, looking for legacy settings to port...',
    );

    const oldData = GetDataStorage().searchData('A32NX_');

    if (oldData === null) {
      return;
    }

    for (const oldSetting of oldData) {
      let formattedData = oldSetting.data;

      if (formattedData.length === 0) {
        formattedData = '<empty string>';
      }

      console.log(`[FbwUserSettingsSaveManager](portLegacyA32NXSettings) ${oldSetting.key} = ${formattedData}`);

      const newSetting = FbwUserSettingsSaveManager.LEGACY_SETTINGS_TO_NEW_SETTINGS[oldSetting.key];

      if (!newSetting) {
        console.warn(
          `[FbwUserSettingsSaveManager](portLegacyA32NXSettings) No equivalent new setting found for ${oldSetting.key}`,
        );
        continue;
      }

      const mappedValue = newSetting.valueMapper?.(oldSetting.data) ?? oldSetting.data;

      console.info(
        `[FbwUserSettingsSaveManager](portLegacyA32NXSettings) newSetting: ${newSetting.newSettingName}, mappedValue = ${mappedValue}`,
      );

      this.settingsManager.getSetting(newSetting.newSettingName).set(mappedValue);
    }

    settingsVersion.set(CURRENT_SETTINGS_VERSION);
  }
}
