import { DisplayComponent, FSComponent, MappedSubject, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { AbstractUIView, LocalizedString } from '../../../Shared';
import { Units } from '@shared/units';
import { TooltipWrapper } from '../../../Components/Tooltip';
import { SimbriefState } from '../../../State/NavigationState';
import { SimpleInput, t } from '../../../Components';
import { Label } from '../../../Components/Label';
import { Runway } from '../../../../EFB/Performance/Data/Runways';
import { LineupAngle, RunwayCondition, TakeoffPerformanceResult } from '@shared/performance';
import { SwitchIf } from '../../Pages';
import { FbwUserSettingsDefs } from '../../../FbwUserSettings';
import { twMerge } from 'tailwind-merge';
import { SelectInput } from '../../../Components/SelectInput';

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

  public readonly selectedRunway = Subject.create<Runway | null>(null);

  public readonly selectedRunwayIndex = Subject.create<number>(-1);

  public readonly runwayLength = Subject.create<number | null>(null);

  public readonly lineupAngle = Subject.create<LineupAngle>(90);

  public readonly elevation = Subject.create<number | null>(null);

  public readonly runwaySlope = Subject.create<number | null>(null);

  public readonly runwayCondition = Subject.create<RunwayCondition>(RunwayCondition.Dry);

  public readonly windDirection = Subject.create<number | null>(null);

  public readonly windMagnitude = Subject.create<number | null>(null);

  public readonly windEntry = Subject.create<string | null>(null);

  public readonly takeoffShift = MappedSubject.create(
    ([selectedRunway, runwayLength]) => {
      return selectedRunway !== null && runwayLength !== null && selectedRunway.length > runwayLength
        ? selectedRunway.length - runwayLength
        : null;
    },
    this.selectedRunway,
    this.runwayLength,
  );

  public readonly areInputsValid = Subject.create(false);

  public readonly result = Subject.create<TakeoffPerformanceResult | null>(null);
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

  private readonly fillDataButtonClass = this.isAutoFillIcaoValid.map((it) =>
    twMerge(
      `flex flex-row items-center justify-center space-x-4 rounded-md rounded-r-none border-2 border-theme-highlight bg-theme-highlight px-8 py-2 text-theme-body outline-none transition duration-100`,
      !it ? 'opacity-50' : 'hover:bg-theme-body hover:text-theme-highlight',
    ),
  );

  private readonly calculateClass = this.store.areInputsValid.map((it) =>
    twMerge(
      `flex w-full flex-row items-center justify-center space-x-4 rounded-md border-2 border-theme-highlight bg-theme-highlight py-2 text-theme-body outline-none hover:bg-theme-body hover:text-theme-highlight`,
      !it && 'pointer-events-none cursor-not-allowed opacity-50',
    ),
  );

  private readonly tora = MappedSubject.create(
    ([runwayLength, distanceUnit]) =>
      getVariableUnitDisplayValue<'ft' | 'm'>(runwayLength, distanceUnit as 'ft' | 'm', 'ft', Units.metreToFoot),
    this.store.runwayLength,
    this.store.distanceUnit,
  );

  private readonly runwayChoices = this.store.availableRunways.map((it) => [
    [-1, LocalizedString.create('Performance.Takeoff.EnterManually')] as const,
    ...it.map((r, i) => [i, r.ident] as const),
  ]);

  private readonly clearAirportRunways = () => {
    this.store.availableRunways.set([]);
    this.store.selectedRunwayIndex.set(-1);
    this.store.runwayBearing.set(null);
    this.store.runwayLength.set(null);
    this.store.runwaySlope.set(null);
    this.store.elevation.set(null);
  };

  private readonly handleICAOChange = (icao: string) => {
    // dispatch(clearTakeoffValues());

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
    // clearResult();

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
    // clearResult();

    let runwayBearing: number | null = parseInt(value);

    if (Number.isNaN(runwayBearing)) {
      runwayBearing = null;
    }

    this.store.runwayBearing.set(runwayBearing);
  };

  private readonly handleRunwayLengthChange = (value: string): void => {
    // clearResult();

    let runwayLength: number | null = parseInt(value);

    if (Number.isNaN(runwayLength)) {
      runwayLength = null;
    } else if (this.store.distanceUnit.get() === 'ft') {
      runwayLength = Units.footToMetre(runwayLength);
    }

    this.store.runwayLength.set(runwayLength);
  };

  private readonly handleLineupAngle = (lineupAngle: LineupAngle): void => {
    // clearResult();

    this.store.lineupAngle.set(lineupAngle);
  };

  private readonly handleElevationChange = (value: string): void => {
    // clearResult();

    let elevation: number | null = parseInt(value);

    if (Number.isNaN(elevation)) {
      elevation = null;
    }

    this.store.elevation.set(elevation);
  };

  private readonly handleRunwaySlopeChange = (value: string): void => {
    // clearResult();

    let runwaySlope: number | null = parseFloat(value);

    if (Number.isNaN(runwaySlope)) {
      runwaySlope = null;
    }

    this.store.runwaySlope.set(runwaySlope);
  };

  private readonly handleRunwayConditionChange = (runwayCondition: RunwayCondition): void => {
    // clearResult();

    if (isContaminated(runwayCondition)) {
      // this.store.forceToga.set(true);
    }

    this.store.runwayCondition.set(runwayCondition);
  };

  private readonly handleWindChange = (input: string): void => {
    // clearResult();

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
                      {/* TODO replace with EFBv4 button component */}
                      <button
                        // onClick={isAutoFillIcaoValid() ? handleAutoFill : undefined}
                        class={this.fillDataButtonClass}
                        type="button"
                      >
                        <i class="bi-cloud-arrow-down text-[26px] text-inherit" />
                        <p class="text-current">{t('Performance.Landing.FillDataFrom')}</p>
                      </button>
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
                      {/*<SimpleInput*/}
                      {/*  class="w-full rounded-r-none"*/}
                      {/*  value={getVariableUnitDisplayValue<'C' | 'F'>(*/}
                      {/*    oat,*/}
                      {/*    temperatureUnit as 'C' | 'F',*/}
                      {/*    'F',*/}
                      {/*    Units.celsiusToFahrenheit,*/}
                      {/*  )}*/}
                      {/*  placeholder={`°${temperatureUnit}`}*/}
                      {/*  decimalPrecision={1}*/}
                      {/*  onChange={handleTemperatureChange}*/}
                      {/*  number*/}
                      {/*/>*/}
                      {/*<SelectInput*/}
                      {/*  value={temperatureUnit}*/}
                      {/*  class="w-20 rounded-l-none"*/}
                      {/*  options={[*/}
                      {/*    { value: 'C', displayValue: 'C' },*/}
                      {/*    { value: 'F', displayValue: 'F' },*/}
                      {/*  ]}*/}
                      {/*  onChange={(newValue: 'C' | 'F') => setTemperatureUnit(newValue)}*/}
                      {/*/>*/}
                    </div>
                  </Label>
                  <Label text={t('Performance.Takeoff.Qnh')}>
                    <div class="flex w-60 flex-row">
                      {/*<SimpleInput*/}
                      {/*  class="w-full rounded-r-none"*/}
                      {/*  value={getVariableUnitDisplayValue<'hPa' | 'inHg'>(*/}
                      {/*    qnh,*/}
                      {/*    pressureUnit as 'hPa' | 'inHg',*/}
                      {/*    'inHg',*/}
                      {/*    Units.hectopascalToInchOfMercury,*/}
                      {/*  )}*/}
                      {/*  placeholder={pressureUnit}*/}
                      {/*  min={pressureUnit === 'hPa' ? 800 : 23.624}*/}
                      {/*  max={pressureUnit === 'hPa' ? 1200 : 35.43598}*/}
                      {/*  decimalPrecision={2}*/}
                      {/*  onChange={handlePressureChange}*/}
                      {/*  number*/}
                      {/*/>*/}
                      {/*<SelectInput*/}
                      {/*  value={pressureUnit}*/}
                      {/*  class="w-24 rounded-l-none"*/}
                      {/*  options={[*/}
                      {/*    { value: 'inHg', displayValue: 'inHg' },*/}
                      {/*    { value: 'hPa', displayValue: 'hPa' },*/}
                      {/*  ]}*/}
                      {/*  onChange={(newValue: 'hPa' | 'inHg') => setPressureUnit(newValue)}*/}
                      {/*/>*/}
                    </div>
                  </Label>
                  <Label text={t('Performance.Takeoff.Weight')}>
                    <div class="flex w-60 flex-row">
                      {/*<SimpleInput*/}
                      {/*  class="w-full rounded-r-none"*/}
                      {/*  value={getVariableUnitDisplayValue<'kg' | 'lb'>(*/}
                      {/*    weight,*/}
                      {/*    weightUnit as 'kg' | 'lb',*/}
                      {/*    'lb',*/}
                      {/*    Units.kilogramToPound,*/}
                      {/*  )}*/}
                      {/*  placeholder={weightUnit}*/}
                      {/*  decimalPrecision={0}*/}
                      {/*  onChange={handleWeightChange}*/}
                      {/*  number*/}
                      {/*/>*/}
                      {/*<SelectInput*/}
                      {/*  value={weightUnit}*/}
                      {/*  class="w-20 rounded-l-none"*/}
                      {/*  options={[*/}
                      {/*    { value: 'kg', displayValue: 'kg' },*/}
                      {/*    { value: 'lb', displayValue: 'lb' },*/}
                      {/*  ]}*/}
                      {/*  onChange={(newValue: 'kg' | 'lb') => setWeightUnit(newValue)}*/}
                      {/*/>*/}
                    </div>
                  </Label>
                  <Label text={t('Performance.Takeoff.CoGPosition')}>
                    {/*<SelectInput*/}
                    {/*  class="w-60"*/}
                    {/*  defaultValue={initialState.takeoff.takeoffCg}*/}
                    {/*  value={takeoffCg}*/}
                    {/*  onChange={handleCoG}*/}
                    {/*  options={[*/}
                    {/*    {*/}
                    {/*      value: TakeoffCoGPositions.Standard,*/}
                    {/*      displayValue: t('Performance.Takeoff.CoGPositions.Standard'),*/}
                    {/*    },*/}
                    {/*    {*/}
                    {/*      value: TakeoffCoGPositions.Forward,*/}
                    {/*      displayValue: t('Performance.Takeoff.CoGPositions.Forward'),*/}
                    {/*    },*/}
                    {/*  ]}*/}
                    {/*/>*/}
                  </Label>
                  <Label text={t('Performance.Takeoff.Configuration')}>
                    {/*<SelectInput*/}
                    {/*  class="w-60"*/}
                    {/*  defaultValue={initialState.takeoff.config}*/}
                    {/*  value={config}*/}
                    {/*  onChange={handleConfigChange}*/}
                    {/*  options={[*/}
                    {/*    { value: -1, displayValue: 'OPT' },*/}
                    {/*    { value: 1, displayValue: 'CONF 1+F' },*/}
                    {/*    { value: 2, displayValue: 'CONF 2' },*/}
                    {/*    { value: 3, displayValue: 'CONF 3' },*/}
                    {/*  ]}*/}
                    {/*/>*/}
                  </Label>
                  <Label text={t('Performance.Takeoff.Thrust')}>
                    {/*<SelectInput*/}
                    {/*  class="w-60"*/}
                    {/*  defaultValue={initialState.takeoff.forceToga}*/}
                    {/*  value={forceToga}*/}
                    {/*  onChange={handleThrustChange}*/}
                    {/*  options={[*/}
                    {/*    { value: false, displayValue: 'FLEX' },*/}
                    {/*    { value: true, displayValue: 'TOGA' },*/}
                    {/*  ]}*/}
                    {/*  disabled={isContaminated(runwayCondition)}*/}
                    {/*/>*/}
                  </Label>
                  <Label text={t('Performance.Takeoff.AntiIce')}>
                    {/*<SelectInput*/}
                    {/*  class="w-60"*/}
                    {/*  defaultValue={initialState.takeoff.antiIce}*/}
                    {/*  value={antiIce}*/}
                    {/*  onChange={handleAntiIce}*/}
                    {/*  options={[*/}
                    {/*    { value: TakeoffAntiIceSetting.Off, displayValue: 'Off' },*/}
                    {/*    { value: TakeoffAntiIceSetting.Engine, displayValue: 'Engine' },*/}
                    {/*    { value: TakeoffAntiIceSetting.EngineWing, displayValue: 'Engine & Wing' },*/}
                    {/*  ]}*/}
                    {/*/>*/}
                  </Label>
                  <Label text={t('Performance.Takeoff.Packs')}>
                    {/*<SelectInput*/}
                    {/*  class="w-60"*/}
                    {/*  defaultValue={initialState.takeoff.antiIce}*/}
                    {/*  value={packs}*/}
                    {/*  onChange={handlePacks}*/}
                    {/*  options={[*/}
                    {/*    { value: false, displayValue: 'Off' },*/}
                    {/*    { value: true, displayValue: 'On' },*/}
                    {/*  ]}*/}
                    {/*/>*/}
                  </Label>
                </div>
                <McduPreview store={this.store} />
              </div>
              <div class="mt-14 flex flex-row space-x-8">
                {/* TODO replace with EFBv4 button component */}

                <button
                  // onClick={handleCalculateTakeoff}
                  class={this.calculateClass}
                  type="button"
                  // disabled={!areInputsValid()}
                >
                  <i className="bi-calculator text-[26px] text-inherit" />
                  <p class="font-bold text-current">{t('Performance.Takeoff.Calculate')}</p>
                </button>
                {/* TODO replace with EFBv4 button component */}
                <button
                  // onClick={handleClearInputs}
                  class="flex w-full flex-row items-center justify-center space-x-4 rounded-md border-2 border-utility-red bg-utility-red py-2 text-theme-body outline-none hover:bg-theme-body hover:text-utility-red"
                  type="button"
                >
                  <i className="bi-trash text-[26px] text-inherit" />
                  <p class="font-bold text-current">{t('Performance.Takeoff.Clear')}</p>
                </button>
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
