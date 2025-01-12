import {
  DisplayComponent,
  FSComponent,
  MappedSubject,
  Subject,
  Subscription,
  UserSettingManager,
  VNode,
} from '@microsoft/msfs-sdk';
import { AbstractUIView, LocalizedString } from '../../../Shared';
import { Units } from '@shared/units';
import { TooltipWrapper } from '../../../Components/Tooltip';
import { SimbriefState } from '../../../State/NavigationState';
import {
  Button,
  ButtonTheme,
  ModalKind,
  NotificationKind,
  showModal,
  showNotification,
  SimpleInput,
  t,
} from '../../../Components';
import { Label } from '../../../Components/Label';
import { getAirportMagVar, getRunways, Runway } from '../../../../EFB/Performance/Data/Runways';
import {
  LineupAngle,
  PerformanceCalculators,
  RunwayCondition,
  TakeoffAntiIceSetting,
  TakeoffPerfomanceError,
  TakeoffPerformanceResult,
} from '@shared/performance';
import { SwitchIf } from '../../Pages';
import { FbwUserSettingsDefs } from '../../../FbwUserSettings';
import { SelectInput } from '../../../Components/SelectInput';
import { TakeoffCoGPositions } from '../../../../EFB/Store/features/performance';
import { MathUtils, parseMetar } from '@flybywiresim/fbw-sdk';
import { toast } from 'react-toastify';

class TakeoffCalculatorStore {
  constructor(private readonly settings: UserSettingManager<FbwUserSettingsDefs>) {}

  public readonly usingMetricPinProg = this.settings.getSetting('fbwAircraftWeightUnit');

  /*
    const [temperatureUnit, setTemperatureUnit] = usePersistentProperty(
    'EFB_PREFERRED_TEMPERATURE_UNIT',
    usingMetricPinProg ? 'C' : 'F',
  );
  const [pressureUnit, setPressureUnit] = usePersistentProperty(
    'EFB_PREFERRED_PRESSURE_UNIT',
    usingMetricPinProg ? 'hPa' : 'inHg',
  );
  const [distanceUnit, setDistanceUnit] = usePersistentProperty(
    'EFB_PREFERRED_DISTANCE_UNIT',
    usingMetricPinProg ? 'm' : 'ft',
  );
  const [weightUnit, setWeightUnit] = usePersistentProperty(
    'EFB_PREFERRED_WEIGHT_UNIT',
    usingMetricPinProg ? 'kg' : 'lb',
  );

   */

  // TODO persist those

  public readonly temperatureUnit = Subject.create<'C' | 'F'>(this.usingMetricPinProg.get() ? 'C' : 'F');

  public readonly pressureUnit = Subject.create<'hPa' | 'inHg'>(this.usingMetricPinProg.get() ? 'hPa' : 'inHg');

  public readonly distanceUnit = Subject.create<'m' | 'ft'>(this.usingMetricPinProg.get() ? 'm' : 'ft');

  public readonly weightUnit = Subject.create<'kg' | 'lb'>(this.usingMetricPinProg.get() ? 'kg' : 'lb');

  // end TODO

  public readonly icao = Subject.create('RKSI');

  public readonly runwayBearing = Subject.create<number | null>(null);

  public readonly autoFillSource = Subject.create<'METAR' | 'OFP'>('OFP');

  public readonly availableRunways = Subject.create<Runway[]>([]);

  public readonly selectedRunwayIndex = Subject.create<number>(-1);

  public readonly selectedRunway = MappedSubject.create(
    ([availableRunways, selectedRunwayIndex]) => {
      return availableRunways[selectedRunwayIndex] ?? null;
    },
    this.availableRunways,
    this.selectedRunwayIndex,
  );

  public readonly runwayLength = Subject.create<number | null>(null);

  public readonly lineupAngle = Subject.create<LineupAngle>(90);

  public readonly elevation = Subject.create<number | null>(null);

  public readonly runwaySlope = Subject.create<number | null>(null);

  public readonly runwayCondition = Subject.create<RunwayCondition>(RunwayCondition.Dry);

  public readonly windDirection = Subject.create<number | null>(null);

  public readonly windMagnitude = Subject.create<number | null>(null);

  public readonly windEntry = Subject.create<string | null>(null);

  public readonly oat = Subject.create<number | null>(null);

  public readonly qnh = Subject.create<number | null>(null);

  public readonly weight = Subject.create<number | null>(null);

  public readonly takeoffCg = Subject.create<TakeoffCoGPositions>(TakeoffCoGPositions.Standard);

  public readonly config = Subject.create<number>(-1);

  public readonly forceToga = Subject.create<boolean>(false);

  public readonly antiIce = Subject.create<TakeoffAntiIceSetting>(TakeoffAntiIceSetting.Off);

  public readonly packs = Subject.create<boolean>(true);

  public readonly takeoffShift = MappedSubject.create(
    ([selectedRunway, runwayLength]) => {
      return selectedRunway !== null && runwayLength !== null && selectedRunway.length > runwayLength
        ? selectedRunway.length - runwayLength
        : null;
    },
    this.selectedRunway,
    this.runwayLength,
  );

  public readonly areInputsValid = MappedSubject.create(
    ([windMagnitude, weight, runwayBearing, elevation, runwaySlope, oat, qnh, runwayLength]) =>
      windMagnitude !== null &&
      weight !== null &&
      runwayBearing !== null &&
      elevation !== null &&
      runwaySlope !== null &&
      oat !== null &&
      qnh !== null &&
      runwayLength !== null,
    this.windMagnitude,
    this.weight,
    this.runwayBearing,
    this.elevation,
    this.runwaySlope,
    this.oat,
    this.qnh,
    this.runwayLength,
  );

  public readonly result = Subject.create<TakeoffPerformanceResult | null>(null);

  public get subsriptions(): Subscription[] {
    return [this.selectedRunway, this.takeoffShift, this.areInputsValid];
  }

  public resetInitialValues(): void {
    this.runwayBearing.set(null);
    this.autoFillSource.set('OFP');
    this.availableRunways.set([]);
    this.selectedRunwayIndex.set(-1);
    this.runwayLength.set(null);
    this.lineupAngle.set(90);
    this.elevation.set(null);
    this.runwaySlope.set(null);
    this.runwayCondition.set(RunwayCondition.Dry);
    this.windDirection.set(null);
    this.windMagnitude.set(null);
    this.windEntry.set(null);
    this.oat.set(null);
    this.qnh.set(null);
    this.weight.set(null);
    this.takeoffCg.set(TakeoffCoGPositions.Standard);
    this.config.set(1);
    this.forceToga.set(false);
    this.antiIce.set(TakeoffAntiIceSetting.Off);
    this.packs.set(true);
  }
}

const isValidIcao = (icao: string): boolean => icao?.length === 4;

const getVariableUnitDisplayValue = <T,>(
  value: number | null,
  unit: T,
  imperialUnit: T,
  metricToImperial: (value: number) => number,
) => {
  if (value !== null) {
    if (unit === imperialUnit) {
      return metricToImperial(value);
    }
    return value;
  }
  return null;
};

const isContaminated = (runwayCondition: RunwayCondition): boolean => {
  return runwayCondition !== RunwayCondition.Dry && runwayCondition !== RunwayCondition.Wet;
};

const WIND_MAGNITUDE_ONLY_REGEX = /^(TL|HD|\+|-)?(\d{1,2}(?:\.\d)?)$/;
const WIND_MAGNITUDE_AND_DIR_REGEX = /^(\d{1,3})\/(\d{1,2}(?:\.\d)?)$/;

const isWindMagnitudeOnly = (input: string): boolean => {
  const magnitudeOnlyMatch = input.match(WIND_MAGNITUDE_ONLY_REGEX);
  return magnitudeOnlyMatch !== null && (magnitudeOnlyMatch[1] !== '' || input === '0');
};

const isWindMagnitudeAndDirection = (input: string): boolean => {
  const magnitudeOnlyMatch = input.match(WIND_MAGNITUDE_AND_DIR_REGEX);
  return magnitudeOnlyMatch !== null;
};

export interface TakeoffProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;

  simbriefState: SimbriefState;

  calculators: PerformanceCalculators;
}

export class Takeoff extends AbstractUIView<TakeoffProps> {
  private readonly store = new TakeoffCalculatorStore(this.props.settings);

  private readonly isAutoFillIcaoValid = MappedSubject.create(
    ([icao, ofpDepartingAirport, autoFillSource]) => {
      if (autoFillSource === 'METAR') {
        return isValidIcao(icao);
      }
      return ofpDepartingAirport ? isValidIcao(ofpDepartingAirport) : false;
    },
    this.store.icao,
    this.props.simbriefState.ofp.map((it) => it?.origin.icao),
    this.store.autoFillSource,
  );

  private readonly fillDataTooltip = MappedSubject.create(
    ([autoFillSource, isAutoFillIcaoValid]) => {
      switch (autoFillSource) {
        case 'METAR':
          if (isAutoFillIcaoValid) {
            return 'Performance.Landing.TT.YouNeedToEnterAnIcaoCodeInOrderToMakeAMetarRequest';
          }
          break;
        case 'OFP':
          if (isAutoFillIcaoValid) {
            return 'Performance.Landing.TT.YouNeedToLoadSimBriefDataInOrderToAutofillData';
          }
          break;
        default:
          return undefined;
      }

      return undefined;
    },
    this.store.autoFillSource,
    this.isAutoFillIcaoValid,
  );

  private readonly runwayChoices = this.store.availableRunways.map((it) => [
    [-1, LocalizedString.create('Performance.Takeoff.EnterManually')] as const,
    ...it.map((r, i) => [i, r.ident] as const),
  ]);

  private readonly tora = MappedSubject.create(
    ([runwayLength, distanceUnit]) =>
      getVariableUnitDisplayValue<'ft' | 'm'>(runwayLength, distanceUnit as 'ft' | 'm', 'ft', Units.metreToFoot),
    this.store.runwayLength,
    this.store.distanceUnit,
  );

  private readonly temperature = MappedSubject.create(
    ([oat, temperatureUnit]) => {
      return getVariableUnitDisplayValue<'C' | 'F'>(oat, temperatureUnit as 'C' | 'F', 'F', Units.celsiusToFahrenheit);
    },
    this.store.oat,
    this.store.temperatureUnit,
  );

  private readonly qnh = MappedSubject.create(
    ([qnh, pressureUnit]) =>
      getVariableUnitDisplayValue<'hPa' | 'inHg'>(
        qnh,
        pressureUnit as 'hPa' | 'inHg',
        'inHg',
        Units.hectopascalToInchOfMercury,
      ),
    this.store.qnh,
    this.store.pressureUnit,
  );

  private readonly weight = MappedSubject.create(
    ([weight, weightUnit]) =>
      getVariableUnitDisplayValue<'kg' | 'lb'>(weight, weightUnit as 'kg' | 'lb', 'lb', Units.kilogramToPound),
    this.store.weight,
    this.store.weightUnit,
  );

  private readonly temperaturePlaceholder = this.store.temperatureUnit.map((it) => `°${it}`);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.isAutoFillIcaoValid,
      this.fillDataTooltip,
      this.runwayChoices,
      this.tora,
      this.temperature,
      this.qnh,
      this.weight,
      this.temperaturePlaceholder,
      ...this.store.subsriptions,
    );
  }

  private readonly clearResult = () => {
    if (this.store.result.get() === null) {
      return;
    }

    this.store.result.set(null);
  };

  private readonly clearAirportRunways = () => {
    this.store.availableRunways.set([]);
    this.store.selectedRunwayIndex.set(-1);
    this.store.runwayBearing.set(null);
    this.store.runwayLength.set(null);
    this.store.runwaySlope.set(null);
    this.store.elevation.set(null);
  };

  private readonly syncValuesWithApiMetar = async (icao: string): Promise<void> => {
    if (!isValidIcao(icao)) {
      return;
    }

    const source = this.props.settings.getSetting('fbwAtsuAocMetarSource').get();

    const parsedMetar = await this.client.getMetar(icao, source);

    try {
      const magvar = await this.client.getMagvar(icao);

      const windDirection = MathUtils.normalise360(parsedMetar.wind.degrees - (magvar ?? 0));
      const windEntry = `${windDirection.toFixed(0).padStart(3, '0')}/${parsedMetar.wind.speed_kts}`;

      this.store.windDirection.set(windDirection);
      this.store.windMagnitude.set(parsedMetar.wind.speed_kts);
      this.store.windEntry.set(windEntry);
      this.store.oat.set(parsedMetar.temperature.celsius);
      this.store.qnh.set(parsedMetar.barometer.mb);
    } catch (err) {
      toast.error('Could not fetch airport');
    }
  };

  private readonly syncValuesWithOfp = async () => {
    const ofpDepartingAirport = this.props.simbriefState.ofp.get()?.origin.icao;
    const ofpDepartingRunway = this.props.simbriefState.ofp.get()?.origin.runway;
    const ofpOriginMetar = this.props.simbriefState.ofp.get()?.origin.metar;
    const ofpWeights = this.props.simbriefState.ofp.get()?.weights;
    const ofpUnits = this.props.simbriefState.ofp.get()?.units;

    if (!ofpDepartingAirport || !ofpOriginMetar || !ofpWeights) {
      return;
    }

    const parsedMetar = parseMetar(ofpOriginMetar);

    const ofpTow = parseInt(ofpWeights.estTakeOffWeight);
    const weightKgs = ofpUnits === 'lbs' ? Math.round(Units.poundToKilogram(ofpTow)) : ofpTow;

    if (!isValidIcao(ofpDepartingAirport)) {
      toast.error('OFP airport is invalid');
      return;
    }

    try {
      const runways = await getRunways(ofpDepartingAirport);
      const magvar = await getAirportMagVar(ofpDepartingAirport);

      const runwayIndex = runways.findIndex((r) => r.ident === ofpDepartingRunway);

      if (runwayIndex >= 0) {
        const newRunway = runways[runwayIndex];
        const runwaySlope = -Math.tan(newRunway.gradient * Avionics.Utils.DEG2RAD) * 100;
        const windDirection = Math.round(MathUtils.normalise360(parsedMetar.wind.degrees - (magvar ?? 0)));
        const windEntry = `${windDirection.toFixed(0).padStart(3, '0')}/${parsedMetar.wind.speed_kts}`;

        this.store.icao.set(ofpDepartingAirport);
        this.store.availableRunways.set(runways);
        this.store.selectedRunwayIndex.set(runwayIndex);
        this.store.runwayBearing.set(newRunway.magneticBearing);
        this.store.runwayLength.set(newRunway.length);
        this.store.runwaySlope.set(runwaySlope);
        this.store.elevation.set(newRunway.elevation);
        this.store.weight.set(weightKgs);
        this.store.windDirection.set(windDirection);
        this.store.windMagnitude.set(parsedMetar.wind.speed_kts);
        this.store.windEntry.set(windEntry);
        this.store.oat.set(parsedMetar.temperature.celsius);
        this.store.qnh.set(parsedMetar.barometer.mb);
      } else {
        throw new Error('Failed to import OFP');
      }
    } catch (e) {
      toast.error(e);
    }
  };

  private readonly handleAutoFill = () => {
    this.clearResult();

    if (this.store.autoFillSource.get() === 'METAR') {
      this.syncValuesWithApiMetar(this.store.icao.get());
    } else {
      this.syncValuesWithOfp();
    }
  };

  private readonly performCalculateTakeoff = (headwind: number): void => {
    if (!this.props.calculators.takeoff) {
      return;
    }

    const weight = this.store.weight.get();
    const runwayLength = this.store.runwayLength.get();
    const runwaySlope = this.store.runwaySlope.get();
    const elevation = this.store.elevation.get();
    const qnh = this.store.qnh.get();
    const oat = this.store.oat.get();

    if (
      weight === null ||
      runwayLength === null ||
      runwaySlope == null ||
      elevation == null ||
      qnh === null ||
      oat === null
    ) {
      return;
    }

    const perf =
      this.store.config.get() > 0
        ? this.props.calculators.takeoff.calculateTakeoffPerformance(
            weight,
            this.store.takeoffCg.get() === TakeoffCoGPositions.Forward,
            this.store.config.get(),
            runwayLength,
            runwaySlope,
            this.store.lineupAngle.get(),
            headwind,
            elevation,
            qnh,
            oat,
            this.store.antiIce.get(),
            this.store.packs.get(),
            this.store.forceToga.get(),
            this.store.runwayCondition.get(),
            undefined,
          )
        : this.props.calculators.takeoff.calculateTakeoffPerformanceOptConf(
            weight,
            this.store.takeoffCg.get() === TakeoffCoGPositions.Forward,
            runwayLength,
            runwaySlope,
            this.store.lineupAngle.get(),
            headwind,
            elevation,
            qnh,
            oat,
            this.store.antiIce.get(),
            this.store.packs.get(),
            this.store.forceToga.get(),
            this.store.runwayCondition.get(),
            undefined,
          );

    const formatWeight = (kg: number | undefined): string => {
      return kg !== undefined
        ? Math.floor(this.store.weightUnit.get() === 'lb' ? Units.kilogramToPound(kg) : kg).toFixed(0)
        : '-';
    };

    const replacements = {
      mtow: formatWeight(perf.mtow),
      weight_unit: this.store.weightUnit.get(),
      oew: formatWeight(this.props.calculators.takeoff.oew),
      structural_mtow: formatWeight(this.props.calculators.takeoff.structuralMtow),
      max_zp: this.props.calculators.takeoff.maxPressureAlt.toFixed(0),
      max_headwind: this.props.calculators.takeoff.maxHeadwind.toFixed(0),
      max_tailwind: this.props.calculators.takeoff.maxTailwind.toFixed(0),
      tmax: perf.params?.tMax?.toFixed(0) ?? '-',
    };

    if (perf.error === TakeoffPerfomanceError.None) {
      this.store.result.set(perf);

      if (!this.store.forceToga.get() && perf.flex === undefined) {
        showNotification({
          kind: NotificationKind.Info,
          text: LocalizedString.translate('Performance.Takeoff.Messages.FlexNotPossible') ?? '',
        });
      } else if (perf.params.headwind < perf.inputs.wind) {
        showNotification({
          kind: NotificationKind.Info,
          text: LocalizedString.translate('Performance.Takeoff.Messages.FlexNotPossible', replacements) ?? '',
        });
      }
    } else {
      this.store.result.set(null);

      showNotification({
        kind: NotificationKind.Error,
        text: LocalizedString.translate(`Performance.Takeoff.Messages.${perf.error}`, replacements) ?? '',
      });
    }
  };

  private readonly handleCalculateTakeoff = (): void => {
    if (!this.store.areInputsValid.get() || !this.props.calculators.takeoff) {
      return;
    }

    const runwayBearing = this.store.runwayBearing.get();
    const windDirection = this.store.windDirection.get();
    const windMagnitude = this.store.windMagnitude.get();
    const oat = this.store.oat.get();

    if (runwayBearing === null || windMagnitude === null || oat === null) {
      return;
    }

    const headwind =
      windDirection === null
        ? windMagnitude
        : windMagnitude *
          Math.cos(Math.abs(Avionics.Utils.diffAngle(runwayBearing, windDirection)) * Avionics.Utils.DEG2RAD);
    const crosswind =
      windDirection === null
        ? 0
        : windMagnitude *
          Math.sin(Math.abs(Avionics.Utils.diffAngle(runwayBearing, windDirection)) * Avionics.Utils.DEG2RAD);

    if (crosswind > this.props.calculators.takeoff.getCrosswindLimit(this.store.runwayCondition.get(), oat)) {
      const replacements = {
        max_crosswind: this.props.calculators.takeoff
          .getCrosswindLimit(this.store.runwayCondition.get(), oat)
          .toFixed(0),
        actual_crosswind: crosswind.toFixed(0),
      };

      showModal({
        kind: ModalKind.Prompt,
        title: LocalizedString.translate('Performance.Takeoff.CrosswindAboveLimitTitle', replacements) ?? '',
        bodyText: LocalizedString.translate('Performance.Takeoff.CrosswindAboveLimitMessage', replacements) ?? '',
        declineText: 'No', // TODO i18n
        confirmText: 'Yes', // TODO i18n
        onConfirm: () => {
          this.performCalculateTakeoff(headwind);
        },
      });
    } else {
      this.performCalculateTakeoff(headwind);
    }
  };

  private readonly handleClearInputs = (): void => {
    this.store.resetInitialValues();
    this.clearResult();
  };

  private readonly handleICAOChange = (icao: string) => {
    this.store.resetInitialValues();

    this.store.icao.set(icao);

    if (isValidIcao(icao)) {
      this.client
        .getAirportRunways(icao)
        .then((runways) => {
          this.store.availableRunways.set(runways);

          if (runways.length > 0) {
            this.handleRunwayChange(0);
          } else {
            this.handleRunwayChange(-1);
          }
        })
        .catch(() => {
          this.clearAirportRunways();
        });
    } else {
      this.clearAirportRunways();
    }
  };

  private readonly handleRunwayChange = (runwayIndex: number | undefined): void => {
    this.clearResult();

    const newRunway =
      runwayIndex !== undefined && runwayIndex >= 0 ? this.store.availableRunways.get()[runwayIndex] : undefined;

    if (runwayIndex !== undefined && newRunway !== undefined) {
      const runwaySlope = -Math.tan(newRunway.gradient * Avionics.Utils.DEG2RAD) * 100;

      this.store.selectedRunwayIndex.set(runwayIndex);
      this.store.runwayBearing.set(newRunway.magneticBearing);
      this.store.runwayLength.set(newRunway.length);
      this.store.runwaySlope.set(runwaySlope);
      this.store.elevation.set(newRunway.elevation);
    } else {
      this.store.selectedRunwayIndex.set(-1);
      this.store.runwayBearing.set(null);
      this.store.runwayLength.set(null);
      this.store.runwaySlope.set(null);
      this.store.elevation.set(null);
    }
  };

  private readonly handleRunwayBearingChange = (value: string): void => {
    this.clearResult();

    let runwayBearing: number | null = parseInt(value);

    if (Number.isNaN(runwayBearing)) {
      runwayBearing = null;
    }

    this.store.runwayBearing.set(runwayBearing);
  };

  private readonly handleRunwayLengthChange = (value: string): void => {
    this.clearResult();

    let runwayLength: number | null = parseInt(value);

    if (Number.isNaN(runwayLength)) {
      runwayLength = null;
    } else if (this.store.distanceUnit.get() === 'ft') {
      runwayLength = Units.footToMetre(runwayLength);
    }

    this.store.runwayLength.set(runwayLength);
  };

  private readonly handleLineupAngle = (lineupAngle: LineupAngle): void => {
    this.clearResult();

    this.store.lineupAngle.set(lineupAngle);
  };

  private readonly handleElevationChange = (value: string): void => {
    this.clearResult();

    let elevation: number | null = parseInt(value);

    if (Number.isNaN(elevation)) {
      elevation = null;
    }

    this.store.elevation.set(elevation);
  };

  private readonly handleRunwaySlopeChange = (value: string): void => {
    this.clearResult();

    let runwaySlope: number | null = parseFloat(value);

    if (Number.isNaN(runwaySlope)) {
      runwaySlope = null;
    }

    this.store.runwaySlope.set(runwaySlope);
  };

  private readonly handleRunwayConditionChange = (runwayCondition: RunwayCondition): void => {
    this.clearResult();

    if (isContaminated(runwayCondition)) {
      this.store.forceToga.set(true);
    }

    this.store.runwayCondition.set(runwayCondition);
  };

  private readonly handleWindChange = (input: string): void => {
    this.clearResult();

    if (input === '0') {
      this.store.windMagnitude.set(0);
      this.store.windDirection.set(null);
      this.store.windEntry.set(input);
      return;
    }

    if (isWindMagnitudeOnly(input)) {
      const magnitudeOnlyMatch = input.match(WIND_MAGNITUDE_ONLY_REGEX)!;

      const windMagnitude = parseFloat(magnitudeOnlyMatch[2]);

      switch (magnitudeOnlyMatch[1]) {
        case 'TL':
        case '-':
          this.store.windMagnitude.set(-windMagnitude);
          this.store.windDirection.set(null);
          this.store.windEntry.set(input);
          return;
        case 'HD':
        case '+':
        default:
          this.store.windMagnitude.set(windMagnitude);
          this.store.windDirection.set(null);
          this.store.windEntry.set(input);
          return;
      }
    } else if (isWindMagnitudeAndDirection(input)) {
      const directionMagnitudeMatch = input.match(WIND_MAGNITUDE_AND_DIR_REGEX)!;

      this.store.windMagnitude.set(parseInt(directionMagnitudeMatch[1]));
      this.store.windDirection.set(parseFloat(directionMagnitudeMatch[2]));
      this.store.windEntry.set(input);
      return;
    }

    this.store.windMagnitude.set(null);
    this.store.windDirection.set(null);
    this.store.windEntry.set(input);
  };

  private readonly handleTemperatureChange = (value: string): void => {
    this.clearResult();

    let oat: number | null = parseFloat(value);

    if (Number.isNaN(oat)) {
      oat = null;
    } else if (this.store.temperatureUnit.get() === 'F') {
      oat = Units.fahrenheitToCelsius(oat);
    }

    this.store.oat.set(oat);
  };

  private readonly handlePressureChange = (value: string): void => {
    this.clearResult();

    let qnh: number | null = parseFloat(value);

    if (Number.isNaN(qnh)) {
      qnh = null;
    } else if (this.store.pressureUnit.get() === 'inHg') {
      qnh = Units.inchOfMercuryToHectopascal(qnh);
    }

    this.store.qnh.set(qnh);
  };

  private readonly handleWeightChange = (value: string): void => {
    this.clearResult();

    let weight: number | null = parseInt(value);

    if (Number.isNaN(weight)) {
      weight = null;
    } else if (this.store.weightUnit.get() === 'lb') {
      weight = Units.poundToKilogram(weight);
    }

    this.store.weight.set(weight);
  };

  private readonly handleCoG = (takeoffCg: TakeoffCoGPositions): void => {
    this.clearResult();

    this.store.takeoffCg.set(takeoffCg);
  };

  private readonly handleConfigChange = (newValue: number | string): void => {
    this.clearResult();

    let config = parseInt(newValue.toString());

    if (config !== -1 && config !== 1 && config !== 2 && config !== 3) {
      config = -1;
    }

    this.store.config.set(config);
  };

  private readonly handleThrustChange = (newValue: boolean | string): void => {
    this.clearResult();

    this.store.forceToga.set(!!newValue);
  };

  private readonly handleAntiIce = (antiIce: TakeoffAntiIceSetting): void => {
    this.clearResult();

    this.store.antiIce.set(antiIce);
  };

  private readonly handlePacks = (packs: boolean): void => {
    this.clearResult();

    this.store.packs.set(packs);
  };

  render(): VNode | null {
    return (
      <div
        ref={this.rootRef}
        class="flex h-content-section-reduced flex-row justify-between space-x-10 overflow-hidden"
      >
        <div class="w-full">
          <div class="flex size-full flex-col justify-between">
            <div class="mb-4">
              <div class="mb-8 mt-4">
                <div class="mt-4 flex flex-row justify-end">
                  <div class="flex flex-row">
                    <TooltipWrapper text={this.fillDataTooltip}>
                      <Button
                        class="rounded-r-none"
                        onClick={this.handleAutoFill}
                        disabled={this.isAutoFillIcaoValid.map((it) => !it)}
                      >
                        <i class="bi-cloud-arrow-down text-[26px] text-inherit" />
                        <p class="text-current">{t('Performance.Landing.FillDataFrom')}</p>
                      </Button>
                    </TooltipWrapper>
                    <SelectInput<'OFP' | 'METAR'>
                      value={this.store.autoFillSource}
                      class="w-36 rounded-l-none"
                      choices={[
                        ['OFP', 'OFP'],
                        ['METAR', 'METAR'],
                      ]}
                      onChange={(value: 'METAR' | 'OFP') => {
                        this.store.autoFillSource.set(value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div class="flex flex-row justify-between">
                <div class="flex flex-col space-y-4">
                  <Label text={t('Performance.Takeoff.Airport')}>
                    <SimpleInput
                      class="w-48 uppercase"
                      value={this.store.icao}
                      placeholder="ICAO"
                      onChange={this.handleICAOChange}
                      maxLength={4}
                      uppercase
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.Runway')}>
                    <SelectInput<number>
                      class="w-48"
                      value={this.store.selectedRunwayIndex}
                      onChange={this.handleRunwayChange}
                      choices={this.runwayChoices}
                      disabled={this.store.availableRunways.map((it) => it.length === 0)}
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.RunwayBearing')}>
                    <SimpleInput
                      class="w-48"
                      value={this.store.runwayBearing}
                      placeholder={LocalizedString.create('Performance.Takeoff.RunwayBearingUnit')}
                      min={0}
                      max={360}
                      padding={3}
                      decimalPrecision={0}
                      onChange={this.handleRunwayBearingChange}
                      number
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.Tora')}>
                    <div class="flex w-48 flex-row">
                      <SimpleInput
                        class="w-full rounded-r-none"
                        value={this.tora}
                        placeholder={this.store.distanceUnit}
                        min={0}
                        max={this.store.distanceUnit.map((distanceUnit) => (distanceUnit === 'm' ? 6000 : 19685.04))}
                        decimalPrecision={0}
                        onChange={this.handleRunwayLengthChange}
                        number
                      />
                      <SelectInput
                        value={this.store.distanceUnit}
                        class="w-20 rounded-l-none"
                        choices={[
                          ['ft', LocalizedString.create('Performance.Takeoff.RunwayLengthUnitFt')],
                          ['m', LocalizedString.create('Performance.Takeoff.RunwayLengthUnitMeter')],
                        ]}
                        onChange={(newValue: 'ft' | 'm') => this.store.distanceUnit.set(newValue)}
                      />
                    </div>
                  </Label>
                  <Label text={t('Performance.Takeoff.EntryAngle')}>
                    <SelectInput
                      class="w-48"
                      value={this.store.lineupAngle}
                      onChange={this.handleLineupAngle}
                      choices={[
                        [0, LocalizedString.create('Performance.Takeoff.EntryAngles.0')],
                        [90, LocalizedString.create('Performance.Takeoff.EntryAngles.90')],
                        [180, LocalizedString.create('Performance.Takeoff.EntryAngles.180')],
                      ]}
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.RunwayElevation')}>
                    <SimpleInput
                      class="w-48"
                      value={this.store.elevation}
                      placeholder={LocalizedString.create('Performance.Takeoff.RunwayElevationUnit')}
                      min={-2000}
                      max={20000}
                      decimalPrecision={0}
                      onChange={this.handleElevationChange}
                      number
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.RunwaySlope')}>
                    <SimpleInput
                      class="w-48"
                      value={this.store.runwaySlope}
                      placeholder="%"
                      decimalPrecision={2}
                      onChange={this.handleRunwaySlopeChange}
                      number
                      reverse
                    />
                  </Label>
                </div>
                <div class="flex flex-col space-y-4">
                  <Label text={t('Performance.Takeoff.RunwayCondition')}>
                    <SelectInput
                      class="w-60"
                      value={this.store.runwayCondition}
                      onChange={this.handleRunwayConditionChange}
                      choices={[
                        [RunwayCondition.Dry, LocalizedString.create('Performance.Takeoff.RunwayConditions.Dry')],
                        [RunwayCondition.Wet, LocalizedString.create('Performance.Takeoff.RunwayConditions.Wet')],
                        [
                          RunwayCondition.Contaminated6mmWater,
                          LocalizedString.create('Performance.Takeoff.RunwayConditions.Contaminated6mmWater'),
                        ],
                        [
                          RunwayCondition.Contaminated13mmWater,
                          LocalizedString.create('Performance.Takeoff.RunwayConditions.Contaminated13mmWater'),
                        ],
                        [
                          RunwayCondition.Contaminated6mmSlush,
                          LocalizedString.create('Performance.Takeoff.RunwayConditions.Contaminated6mmSlush'),
                        ],
                        [
                          RunwayCondition.Contaminated13mmSlush,
                          LocalizedString.create('Performance.Takeoff.RunwayConditions.Contaminated13mmSlush'),
                        ],
                        [
                          RunwayCondition.ContaminatedCompactedSnow,
                          LocalizedString.create('Performance.Takeoff.RunwayConditions.ContaminatedCompactedSnow'),
                        ],
                        [
                          RunwayCondition.Contaminated5mmWetSnow,
                          LocalizedString.create('Performance.Takeoff.RunwayConditions.Contaminated5mmWetSnow'),
                        ],
                        [
                          RunwayCondition.Contaminated15mmWetSnow,
                          LocalizedString.create('Performance.Takeoff.RunwayConditions.Contaminated15mmWetSnow'),
                        ],
                        [
                          RunwayCondition.Contaminated30mmWetSnow,
                          LocalizedString.create('Performance.Takeoff.RunwayConditions.Contaminated30mmWetSnow'),
                        ],
                        [
                          RunwayCondition.Contaminated10mmDrySnow,
                          LocalizedString.create('Performance.Takeoff.RunwayConditions.Contaminated10mmDrySnow'),
                        ],
                        [
                          RunwayCondition.Contaminated100mmDrySnow,
                          LocalizedString.create('Performance.Takeoff.RunwayConditions.Contaminated100mmDrySnow'),
                        ],
                      ]}
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.Wind')}>
                    <SimpleInput
                      class="w-60"
                      value={this.store.windEntry}
                      placeholder={LocalizedString.create('Performance.Takeoff.WindMagnitudeUnit')}
                      onChange={this.handleWindChange}
                      uppercase
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.Temperature')}>
                    <div class="flex w-60 flex-row">
                      <SimpleInput
                        class="w-full rounded-r-none"
                        value={this.temperature}
                        placeholder={this.temperaturePlaceholder}
                        decimalPrecision={1}
                        onChange={this.handleTemperatureChange}
                        number
                      />
                      <SelectInput
                        value={this.store.temperatureUnit}
                        class="w-20 rounded-l-none"
                        choices={[
                          ['C', 'C'],
                          ['F', 'F'],
                        ]}
                        onChange={(newValue: 'C' | 'F') => this.store.temperatureUnit.set(newValue)}
                      />
                    </div>
                  </Label>
                  <Label text={t('Performance.Takeoff.Qnh')}>
                    <div class="flex w-60 flex-row">
                      <SimpleInput
                        class="w-full rounded-r-none"
                        value={this.qnh}
                        placeholder={this.store.pressureUnit}
                        min={this.store.pressureUnit.map((pressureUnit) => (pressureUnit === 'hPa' ? 800 : 23.624))}
                        max={this.store.pressureUnit.map((pressureUnit) => (pressureUnit === 'hPa' ? 1200 : 35.43598))}
                        decimalPrecision={2}
                        onChange={this.handlePressureChange}
                        number
                      />
                      <SelectInput
                        value={this.store.pressureUnit}
                        class="w-24 rounded-l-none"
                        choices={[
                          ['inHg', 'inHg'],
                          ['hPa', 'hPa'],
                        ]}
                        onChange={(newValue: 'hPa' | 'inHg') => this.store.pressureUnit.set(newValue)}
                      />
                    </div>
                  </Label>
                  <Label text={t('Performance.Takeoff.Weight')}>
                    <div class="flex w-60 flex-row">
                      <SimpleInput
                        class="w-full rounded-r-none"
                        value={this.weight}
                        placeholder={this.store.weightUnit}
                        decimalPrecision={0}
                        onChange={this.handleWeightChange}
                        number
                      />
                      <SelectInput
                        value={this.store.weightUnit}
                        class="w-20 rounded-l-none"
                        choices={[
                          ['kg', 'kg'],
                          ['lb', 'lb'],
                        ]}
                        onChange={(newValue: 'kg' | 'lb') => this.store.weightUnit.set(newValue)}
                      />
                    </div>
                  </Label>
                  <Label text={t('Performance.Takeoff.CoGPosition')}>
                    <SelectInput
                      class="w-60"
                      value={this.store.takeoffCg}
                      onChange={this.handleCoG}
                      choices={[
                        [
                          TakeoffCoGPositions.Standard,
                          LocalizedString.create('Performance.Takeoff.CoGPositions.Standard'),
                        ],
                        [
                          TakeoffCoGPositions.Forward,
                          LocalizedString.create('Performance.Takeoff.CoGPositions.Forward'),
                        ],
                      ]}
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.Configuration')}>
                    <SelectInput
                      class="w-60"
                      value={this.store.config}
                      onChange={this.handleConfigChange}
                      choices={[
                        [-1, 'OPT'],
                        [1, 'CONF 1+F'],
                        [2, 'CONF 2'],
                        [3, 'CONF 3'],
                      ]}
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.Thrust')}>
                    <SelectInput
                      class="w-60"
                      value={this.store.forceToga}
                      onChange={this.handleThrustChange}
                      choices={[
                        [false, 'FLEX'],
                        [true, 'TOGA'],
                      ]}
                      disabled={this.store.runwayCondition.map((runwayCondition) => isContaminated(runwayCondition))}
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.AntiIce')}>
                    <SelectInput
                      class="w-60"
                      value={this.store.antiIce}
                      onChange={this.handleAntiIce}
                      choices={[
                        [TakeoffAntiIceSetting.Off, 'Off'],
                        [TakeoffAntiIceSetting.Engine, 'Engine'],
                        [TakeoffAntiIceSetting.EngineWing, 'Engine & Wing'],
                      ]}
                    />
                  </Label>
                  <Label text={t('Performance.Takeoff.Packs')}>
                    <SelectInput
                      class="w-60"
                      value={this.store.packs}
                      onChange={this.handlePacks}
                      choices={[
                        [false, 'Off'],
                        [true, 'On'],
                      ]}
                    />
                  </Label>
                </div>
                <McduPreview store={this.store} />
              </div>
              <div class="mt-14 flex flex-row space-x-8">
                <Button
                  class="grow"
                  onClick={this.handleCalculateTakeoff}
                  disabled={this.store.areInputsValid.map((it) => !it)}
                  theme={ButtonTheme.Highlight}
                >
                  <i class="bi-calculator text-[26px] text-inherit" />
                  <p class="font-bold text-current">{t('Performance.Takeoff.Calculate')}</p>
                </Button>

                <Button class="grow" onClick={this.handleClearInputs} theme={ButtonTheme.Danger}>
                  <i class="bi-trash text-[26px] text-inherit" />
                  <p class="font-bold text-current">{t('Performance.Takeoff.Clear')}</p>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export interface McduPreviewProps {
  store: TakeoffCalculatorStore;
}

class McduPreview extends DisplayComponent<McduPreviewProps> {
  private readonly v1Class = this.props.store.result.map(
    (it) => `mcdu-big ${it?.v1 !== undefined ? 'text-green-500' : 'text-white'}`,
  );

  private readonly vRClass = this.props.store.result.map(
    (it) => `mcdu-big ${it?.vR !== undefined ? 'text-green-500' : 'text-white'}`,
  );

  private readonly takeoffShiftClassClass = this.props.store.takeoffShift.map(
    (it) => `mcdu-big ${it !== undefined ? 'text-green-500' : 'text-white'}`,
  );

  private readonly v2Class = this.props.store.result.map(
    (it) => `mcdu-big ${it?.v2 !== undefined ? 'text-green-500' : 'text-white'}`,
  );

  private readonly confClass = this.props.store.result.map(
    (it) => `mcdu-big ${it?.inputs.conf !== undefined ? 'text-green-500' : 'text-white'}`,
  );

  private readonly stabTrimClass = this.props.store.result.map(
    (it) => `mcdu-big ${it?.stabTrim !== undefined ? 'text-green-500' : 'text-white'}`,
  );

  private readonly flexClass = this.props.store.result.map(
    (it) => `mcdu-big ${it?.flex !== undefined ? 'text-green-500' : 'text-white'}`,
  );

  private readonly takeoffShiftContent = MappedSubject.create(
    ([usingMetricPinProg, takeoffShift]) => {
      {
        takeoffShift !== null
          ? Math.round(usingMetricPinProg ? takeoffShift : Units.metreToFoot(takeoffShift))
              .toString()
              .padStart(6, '\xa0')
          : '';
      }
    },
    this.props.store.usingMetricPinProg,
    this.props.store.takeoffShift,
  );

  render(): VNode | null {
    return (
      <div class="flex flex-col space-y-4">
        <div
          style={{
            padding: '10px 10px 60px 10px',
            background: 'black',
          }}
        >
          <div class="mcdu-big text-white">
            {'\xa0\xa0\xa0\xa0'}
            TAKE OFF RWY
            {'\xa0'}
            <span class="mcdu-big text-green-500">
              {this.props.store.selectedRunway.map((it) => (it ? it.ident : ''))}
            </span>
          </div>
          <div class="mcdu-sml text-white">{'\xa0V1\xa0\xa0\xa0FLP\xa0RETR'}</div>
          <div class="mcdu-big text-white">
            <span class={this.v1Class}>
              {this.props.store.result.map((result) => (result?.v1 !== undefined ? result.v1.toFixed(0) : '---'))}
            </span>
            {'\xa0\xa0\xa0\xa0F=---'}
          </div>
          <div class="mcdu-sml text-white">{'\xa0VR\xa0\xa0\xa0SLT\xa0RETR\xa0\xa0TO\xa0SHIFT'}</div>
          <div class="mcdu-big text-white">
            <span class={this.vRClass}>
              {this.props.store.result.map((result) => (result?.vR !== undefined ? result.vR.toFixed(0) : '---'))}
            </span>
            {'\xa0\xa0\xa0\xa0S=---\xa0\xa0'}

            <SwitchIf
              condition={this.props.store.takeoffShift.map((it) => it !== null)}
              on={
                <div>
                  <span class={'mcdu-small text-white-500'}>
                    {this.props.store.usingMetricPinProg.map((it) => (it ? '\xa0[M]' : '[FT]'))}
                  </span>
                  <span class={this.takeoffShiftClassClass}>{this.takeoffShiftContent}</span>
                </div>
              }
              off={<span>{"'\xa0\xa0\xa0\xa0\xa0\xa0----'"}</span>}
            />
          </div>
          <div class="mcdu-sml text-white">{'\xa0V2\xa0\xa0\xa0CLEAN\xa0\xa0\xa0\xa0FLAPS/THS'}</div>
          <div class="mcdu-big text-white">
            <span class={this.v2Class}>
              {this.props.store.result.map((result) => (result?.v2 !== undefined ? result.v2.toFixed(0) : '---'))}
            </span>
            {'\xa0\xa0\xa0\xa0O=---\xa0\xa0\xa0'}
            <span class={this.confClass}>
              {this.props.store.result.map((result) =>
                result?.inputs.conf !== undefined ? result.inputs.conf.toString().padStart(3, '\xa0') : '---',
              )}
            </span>
            <span class={this.stabTrimClass}>
              /
              {this.props.store.result.map((result) =>
                result?.stabTrim !== undefined
                  ? `${result.stabTrim < 0 ? 'DN' : 'UP'}${Math.abs(result.stabTrim).toFixed(1)}`
                  : '-----',
              )}
            </span>
          </div>
          <div class="mcdu-sml text-white">{'TRANS\xa0ALT\xa0\xa0\xa0FLEX\xa0TO\xa0TEMP'}</div>
          <div class={this.flexClass}>
            {'\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0'}
            {this.props.store.result.map((result) =>
              result?.flex !== undefined ? result.flex.toFixed(0).padStart(4, '\xa0') : '----',
            )}
            °
          </div>
          <div class="mcdu-sml text-white">{'THR RED/ACC\xa0\xa0ENG\xa0OUT\xa0ACC'}</div>
          <div class="mcdu-big text-white">{'-----/-----\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0-----'}</div>
        </div>
      </div>
    );
  }
}
