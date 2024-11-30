import { AbstractUIView } from '../../Shared/UIView';
import { FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { ChoiceSettingsItem, InputSettingsItem, SettingsItem, ToggleSettingsItem } from './Components/SettingItem';
import {
  FbwUserSettingsDefs,
  IsisBaroUnit,
  LatLonExtendedFormat,
  PaxSigns,
  VhfSpacing,
  WeightUnit,
} from '../../FbwUserSettings';
import { t } from '../../Components/LocalizedText';
import { SettingsPage } from './Settings';
import { Button } from '../../Components/Button';
import { SettingsPages } from '../../EfbV4FsInstrumentAircraftSpecificData';

export interface SettingsAircraftOptionsPinProgramsPageProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;
  settingsPages: SettingsPages;
  returnHome: () => any;
  openAutomaticCallOutsConfigurationPage: () => any;
}

export class SettingsAircraftOptionsPinProgramsPage extends AbstractUIView<SettingsAircraftOptionsPinProgramsPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage
        returnHome={this.props.returnHome}
        title={t('Settings.AircraftOptionsPinPrograms.Title')}
        ref={this.rootRef}
      >
        <InputSettingsItem<number>
          setting={this.props.settings.getSetting('fbwAircraftThrustReductionHeight')}
          settingName={t('Settings.AircraftOptionsPinPrograms.ThrustReductionHeight')}
          inputClassName="w-28 text-center"
          min={400}
          max={5000}
        />
        <InputSettingsItem<number>
          setting={this.props.settings.getSetting('fbwAircraftAccelerationHeight')}
          settingName={t('Settings.AircraftOptionsPinPrograms.AccelerationHeight')}
          inputClassName="w-28 text-center"
          min={400}
          max={10000}
        />
        <InputSettingsItem<number>
          setting={this.props.settings.getSetting('fbwAircraftEngineOutAccelerationHeight')}
          settingName={t('Settings.AircraftOptionsPinPrograms.EngineOutAccelerationHeight')}
          inputClassName="w-28 text-center"
          min={400}
          max={10000}
        />

        <ChoiceSettingsItem
          setting={this.props.settings.getSetting('fbwAircraftIsisBaroUnit')}
          settingName={t('Settings.AircraftOptionsPinPrograms.IsisBaroUnit')}
          choices={{
            [IsisBaroUnit.Hpa]: <>hPa</>,
            [IsisBaroUnit.InHgOrHpa]: <>hPa/inHg</>,
          }}
        />

        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwAircraftIsisIsMetricAltitude')}
          settingName={t('Settings.AircraftOptionsPinPrograms.IsisMetricAltitude')}
        />

        {this.props.settingsPages.pinProgram.paxSign && (
          <ChoiceSettingsItem
            setting={this.props.settings.getSetting('fbwAircraftPaxSigns')}
            settingName={t('Settings.AircraftOptionsPinPrograms.PaxSigns')}
            choices={{
              [PaxSigns.NoSmoking]: <>No Smoking</>,
              [PaxSigns.NoPortableDevices]: <>No Portable Device</>,
            }}
          />
        )}

        {this.props.settingsPages.pinProgram.rmpVhfSpacing && (
          <ChoiceSettingsItem
            setting={this.props.settings.getSetting('fbwAircraftVhfSpacing')}
            settingName={t('Settings.AircraftOptionsPinPrograms.RmpVhfSpacing')}
            choices={{
              [VhfSpacing.EightPointThirtyThreeKHz]: <>8.33 kHz</>,
              [VhfSpacing.TwentyFiveKHz]: <>25 kHz</>,
            }}
          />
        )}

        {this.props.settingsPages.pinProgram.latLonExtend && (
          <ChoiceSettingsItem
            setting={this.props.settings.getSetting('fbwAircraftLatLonExtendedFormat')}
            settingName={t('Settings.AircraftOptionsPinPrograms.LatLonExtendedFormat')}
            choices={{
              [LatLonExtendedFormat.LLnn]: <>LLnn</>,
              [LatLonExtendedFormat.AxxByyy]: <>AxxByyy</>,
            }}
          />
        )}

        <ChoiceSettingsItem
          setting={this.props.settings.getSetting('fbwAircraftWeightUnit')}
          settingName={t('Settings.AircraftOptionsPinPrograms.WeightUnit')}
          choices={{
            [WeightUnit.Kg]: <>kg</>,
            [WeightUnit.Lbs]: <>lbs</>,
          }}
        />

        {this.props.settingsPages.pinProgram.satcom && (
          <ToggleSettingsItem
            setting={this.props.settings.getSetting('fbwAircraftSatcomEnabled')}
            settingName={t('Settings.AircraftOptionsPinPrograms.Satcom')}
          />
        )}

        <SettingsItem settingName={t('Settings.AutomaticCallOuts.Title')}>
          <Button onClick={this.props.openAutomaticCallOutsConfigurationPage}>
            {t('Settings.AircraftOptionsPinPrograms.Select')}
          </Button>
        </SettingsItem>
      </SettingsPage>
    );
  }
}
