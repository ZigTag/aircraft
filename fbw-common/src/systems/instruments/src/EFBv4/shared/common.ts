export namespace PageEnum {
  export enum SwitchIf {
    False,
    True,
  }

  export enum MainPage {
    Dashboard,
    Dispatch,
    Ground,
    Performance,
    Navigation,
    ATC,
    Failures,
    Checklists,
    Presets,
    Settings,
  }

  export enum ReminderWidgets {
    Weather,
    PinnedCharts,
    Maintenance,
    Checklists,
  }

  export enum DispatchPage {
    OFP,
    Overview,
  }

  export enum NavigationPage {
    Navigraph,
    LocalFiles,
    PinnedCharts,
  }

  export enum FailuresPage {
    Comfort,
    Compact,
    Ata,
  }

  export enum Optional {
    None,
    Some,
    Error,
  }

  export enum WeatherWidgetState {
    Loading,
    Loaded,
    Error,
  }

  export enum WeatherWidgetType {
    Visual,
    Raw,
  }

  export enum SettingsPage {
    Index,
    AircraftOptionsPinPrograms,
    SimOptions,
    Realism,
    ThirdPartyOptions,
    AtsuAoc,
    Audio,
    flyPad,
    About,
  }

  export enum BatteryLevel {
    Charging = 0,
    Warning = 8,
    Low = 13,
    LowMedium = 37,
    Medium = 62,
    HighMedium = 87,
    Full = 100,
  }
}
