import {
  ComponentProps,
  DisplayComponent,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
  UserSettingManager,
  VNode,
} from '@microsoft/msfs-sdk';
import { FlypadClient, MetarParserType } from '@flybywiresim/fbw-sdk';
import { PageEnum } from '../../../Shared/common';
import { Pages, Switch } from '../../Pages';
import { flypadClientContext } from '../../../Contexts';
import { ColoredMetar } from './ColoredMetar';
import { t } from '../../../Components/LocalizedText';
import { RemindersSection } from './ReminderSection';
import { SimpleInput } from 'instruments/src/EFBv4/Components/SimpleInput';
import { Toggle } from '../../../Components/Toggle';
import { FbwUserSettingsDefs, InitBaroUnit } from '../../../FbwUserSettings';
import WeatherWidgetType = PageEnum.WeatherWidgetType;
import { SimbriefState } from '../../../State/NavigationState';

const emptyMetar = {
  raw_text: '',
  raw_parts: [],
  color_codes: [],
  icao: '',
  observed: new Date(0),
  wind: {
    degrees: 0,
    degrees_from: 0,
    degrees_to: 0,
    speed_kts: 0,
    speed_mps: 0,
    gust_kts: 0,
    gust_mps: 0,
  },
  visibility: {
    miles: '',
    miles_float: 0.0,
    meters: '',
    meters_float: 0.0,
  },
  conditions: [],
  clouds: [],
  ceiling: {
    code: '',
    feet_agl: 0,
    meters_agl: 0,
  },
  temperature: {
    celsius: 0,
    fahrenheit: 0,
  },
  dewpoint: {
    celsius: 0,
    fahrenheit: 0,
  },
  humidity_percent: 0,
  barometer: {
    hg: 0,
    kpa: 0,
    mb: 0,
  },
  flight_category: '',
};

interface WeatherReminderProps {
  simbriefState: SimbriefState;

  settings: UserSettingManager<FbwUserSettingsDefs>;
}

export class WeatherReminder extends DisplayComponent<WeatherReminderProps> {
  render(): VNode {
    return (
      <RemindersSection title={t('Dashboard.ImportantInformation.Weather.Title')}>
        <div class="space-y-6">
          <WeatherWidget name="origin" simbriefState={this.props.simbriefState} settings={this.props.settings} />
          <div class="h-1 w-full rounded-full bg-theme-accent" />
          <WeatherWidget name="destination" simbriefState={this.props.simbriefState} settings={this.props.settings} />
        </div>
      </RemindersSection>
    );
  }
}

interface WeatherWidgetProps extends ComponentProps {
  name: string;

  simbriefState: SimbriefState;

  settings: UserSettingManager<FbwUserSettingsDefs>;
}

export class WeatherWidget extends DisplayComponent<WeatherWidgetProps, [FlypadClient]> {
  public override contextType = [flypadClientContext] as const;

  private readonly metarError = Subject.create('');

  private readonly metar = Subject.create<MetarParserType>(emptyMetar);

  private readonly icaoSuggestion = Subject.create('ICAO');

  private get client(): FlypadClient {
    return this.getContext(flypadClientContext).get();
  }

  private _setMetarFromSimbrief = this.props.simbriefState.ofp.map((ofp) => {
    if (this.props.simbriefState.simbriefOfpLoaded.get()) {
      if (this.props.name === 'origin') {
        this.showMetarForIcao(ofp?.origin.icao ?? '', true);
      } else if (this.props.name === 'destination') {
        this.showMetarForIcao(ofp?.destination.icao ?? '', true);
      }
    }
  });

  private async showMetarForIcao(icao: string, isSimbrief?: boolean): Promise<void> {
    const source = this.props.settings.getSetting('fbwAtsuAocMetarSource').get();

    let metar = await this.client.getMetar(icao, source);

    // Debounce for async metar return
    if (metar.icao !== icao) {
      metar = await this.client.getMetar(icao, source);
    }

    this.metar.set(metar);

    if (isSimbrief) {
      this.icaoSuggestion.set(icao);
    }
  }

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    // this.client.initialized.on(() => {
    //   this.showMetarForIcao('CYKF');
    // });
  }

  render(): VNode {
    return (
      <div>
        <WeatherWidgetData
          metar={this.metar}
          metarError={this.metarError}
          icaoSuggestion={this.icaoSuggestion}
          onIcaoEntered={(icao) => this.showMetarForIcao(icao)}
          settings={this.props.settings}
        />
      </div>
    );
  }
}

interface WeatherWidgetVisualProps {
  metar: Subscribable<MetarParserType | null>;

  settings: UserSettingManager<FbwUserSettingsDefs>;
}

class WeatherWidgetVisual extends DisplayComponent<WeatherWidgetVisualProps> {
  private readonly baroType = this.props.settings.getSetting('fbwInitBaroUnit');

  private readonly baroOutput: Subscribable<string>;

  private readonly windOutput: Subscribable<string>;

  private readonly temperatureOutput: Subscribable<string>;

  private readonly dewpointOutput: Subscribable<string>;

  constructor(props: any) {
    super(props);

    const getBaroTypeForAirport = (icao: string): InitBaroUnit =>
      ['K', 'C', 'M', 'P', 'RJ', 'RO', 'TI', 'TJ'].some((r) => icao.toUpperCase().startsWith(r))
        ? InitBaroUnit.InHg
        : InitBaroUnit.Hpa;

    this.baroOutput = MappedSubject.create(
      ([metar, baroType]) => {
        if (!metar) {
          return 'N/A';
        }

        const displayedBaroType = baroType === InitBaroUnit.Auto ? getBaroTypeForAirport(metar.icao) : baroType;

        switch (displayedBaroType) {
          case 'IN HG':
            return `${metar.barometer.hg.toFixed(2)} ${displayedBaroType}`;
          case 'HPA':
            return `${metar.barometer.mb.toFixed(0)} ${displayedBaroType}`;
          default:
            return 'N/A';
        }
      },
      this.props.metar,
      this.baroType,
    );

    // FIXME get rid of those non-null assertions somehow

    this.windOutput = this.props.metar.map(
      (metar) => `${metar!.wind.degrees.toFixed(0)}° / ${metar!.wind.speed_kts.toFixed(0)} kts`,
    );

    this.temperatureOutput = this.props.metar.map((metar) => `${metar!.temperature.celsius.toFixed(0)} °C`);

    this.dewpointOutput = this.props.metar.map((metar) => `${metar!.dewpoint.celsius.toFixed(0)} °C`);
  }

  render(): VNode | null {
    return (
      <div class="mt-4 flex w-full flex-row items-center justify-between">
        <div class="flex flex-col items-center space-y-1">
          <i class="bi-speedometer2 text-[35px] text-inherit" />
          <p class="text-center">{t('Dashboard.ImportantInformation.Weather.AirPressure')}</p>
          <Switch
            pages={[
              [PageEnum.Optional.Some, <p class="text-center">{this.baroOutput}</p>],
              [
                PageEnum.Optional.None,
                <p class="text-center">{t('Dashboard.ImportantInformation.Weather.NotAvailableShort')}</p>,
              ],
            ]}
            activePage={this.props.metar.map((value) =>
              value && value.barometer ? PageEnum.Optional.Some : PageEnum.Optional.None,
            )}
          />
        </div>
        <div class="flex flex-col items-center space-y-1">
          <i class="bi-wind text-[35px] text-inherit" />
          <p class="text-center">{t('Dashboard.ImportantInformation.Weather.WindSpeed')}</p>
          <Switch
            pages={[
              [PageEnum.Optional.Some, <p class="text-center">{this.windOutput}</p>],
              [
                PageEnum.Optional.None,
                <p class="text-center">{t('Dashboard.ImportantInformation.Weather.NotAvailableShort')}</p>,
              ],
            ]}
            activePage={this.props.metar.map((value) => (value ? PageEnum.Optional.Some : PageEnum.Optional.None))}
          />
        </div>
        <div class="flex flex-col items-center space-y-1">
          <i class="bi-thermometer-half text-[35px] text-inherit" />
          <p class="text-center">{t('Dashboard.ImportantInformation.Weather.Temperature')}</p>
          <Switch
            pages={[
              [PageEnum.Optional.Some, <p class="text-center">{this.temperatureOutput}</p>],
              [
                PageEnum.Optional.None,
                <p class="text-center">{t('Dashboard.ImportantInformation.Weather.NotAvailableShort')}</p>,
              ],
            ]}
            activePage={this.props.metar.map((value) => (value ? PageEnum.Optional.Some : PageEnum.Optional.None))}
          />
        </div>
        <div class="flex flex-col items-center space-y-1">
          <i class="bi-droplet text-[35px] text-inherit" />
          <p class="text-center">{t('Dashboard.ImportantInformation.Weather.DewPoint')}</p>
          <Switch
            pages={[
              [PageEnum.Optional.Some, <p class="text-center">{this.dewpointOutput}</p>],
              [
                PageEnum.Optional.None,
                <p class="text-center">{t('Dashboard.ImportantInformation.Weather.NotAvailableShort')}</p>,
              ],
            ]}
            activePage={this.props.metar.map((value) => (value ? PageEnum.Optional.Some : PageEnum.Optional.None))}
          />
        </div>
      </div>
    );
  }
}

interface WeatherWidgetDataProps {
  metar: Subscribable<MetarParserType | null>;

  metarError: Subscribable<string>;

  icaoSuggestion: Subscribable<string>;

  onIcaoEntered: (icao: string) => void;

  settings: UserSettingManager<FbwUserSettingsDefs>;
}

export class WeatherWidgetData extends DisplayComponent<WeatherWidgetDataProps> {
  private readonly widgetType = Subject.create(PageEnum.WeatherWidgetType.Visual);

  private readonly icao = Subject.create<string | null>(null);

  private readonly widgetTypePages: Pages = [
    [
      PageEnum.WeatherWidgetType.Visual,
      <WeatherWidgetVisual metar={this.props.metar} settings={this.props.settings} />,
    ],
    [PageEnum.WeatherWidgetType.Raw, <ColoredMetar metar={this.props.metar} />],
  ];

  private readonly statePages: Pages = [
    [PageEnum.WeatherWidgetState.Loading, <p>{t('Dashboard.ImportantInformation.Weather.Loading')}</p>],
    [
      PageEnum.WeatherWidgetState.Loaded,
      <>
        <div class="flex flex-row items-center justify-between">
          <SimpleInput
            class="w-32 text-center !text-2xl font-medium uppercase"
            placeholder={this.props.icaoSuggestion} // TODO support simbriefIcao from v3
            value={this.icao}
            onChange={this.props.onIcaoEntered}
            maxLength={4}
          />
          {/*<TooltipWrapper*/} {/* TODO port TooltipWrapper */}
          {/*  text={*/}
          {/*    showMetar*/}
          {/*      ? t('Dashboard.ImportantInformation.Weather.TT.SwitchToIconView')*/}
          {/*      : t('Dashboard.ImportantInformation.Weather.TT.SwitchToRawMetarView')*/}
          {/*  }*/}
          {/*>*/}
          <div class="flex flex-row space-x-2">
            <p>{t('Dashboard.ImportantInformation.Weather.Raw')}</p>
            <Toggle
              value={this.widgetType.map((it) => it === WeatherWidgetType.Raw)}
              onToggle={(value) => this.widgetType.set(value ? WeatherWidgetType.Raw : WeatherWidgetType.Visual)}
            />
          </div>
          {/*</TooltipWrapper>*/}
        </div>
        <div style={{ minHeight: '100px' }}>
          <Switch pages={this.widgetTypePages} activePage={this.widgetType} />
        </div>
      </>,
    ],
    [PageEnum.WeatherWidgetState.Error, <div class="mt-4 text-xl">{this.props.metarError}</div>],
  ];

  render(): VNode | null {
    return (
      <Switch
        pages={this.statePages}
        activePage={this.props.metar.map((it) =>
          it ? PageEnum.WeatherWidgetState.Loaded : PageEnum.WeatherWidgetState.Loading,
        )}
      />
    );
  }
}
