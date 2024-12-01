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

  export enum GroundPage {
    Services,
    Fuel,
    Payload,
    Pushback,
  }

  export enum PerformancePage {
    Takeoff,
  }

  export enum NavigationPage {
    Navigraph,
    LocalFiles,
    PinnedCharts,
  }

  export enum SimbriefAirport {
    From,
    To,
    Alternate,
  }

  export enum ChartCategory {
    Star,
    App,
    Sid,
    Taxi,
    Ref,
    // Local charts
    Image,
    Pdf,
    ImageAndPdf,
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

  export enum PresetsPage {
    InteriorLighting,
    AircraftStates,
  }

  export enum SettingsPage {
    Index,
    AircraftOptionsPinPrograms,
    AutomaticCallouts,
    SimOptions,
    Realism,
    ThirdPartyOptions,
    AtsuAoc,
    Audio,
    flyPad,
    About,
  }

  export enum ThirdPartySettingsPage {
    Index,
    NavigraphLogin,
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
