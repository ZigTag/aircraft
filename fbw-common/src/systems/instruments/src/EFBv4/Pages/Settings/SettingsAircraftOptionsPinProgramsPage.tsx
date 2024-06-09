import { AbstractUIView } from '../../shared/UIView';
import { FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { PageBox } from '../../Components/PageBox';
import { ChoiceSettingsItem, InputSettingsItem, ToggleSettingsItem } from './Components/SettingItem';
import { FbwUserSettingsDefs, IsisBaroUnit, LatLonExtendedFormat, PaxSigns, VhfSpacing } from '../../FbwUserSettings';
import { t } from '../../Components/LocalizedText';

export interface SettingsAircraftOptionsPinProgramsPageProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;
}

export class SettingsAircraftOptionsPinProgramsPage extends AbstractUIView<SettingsAircraftOptionsPinProgramsPageProps> {
  render(): VNode | null {
    return (
      <div ref={this.rootRef}>
        <PageTitle>
          {t('Settings.Title')}
          {' - '}
          {t('Settings.AircraftOptionsPinPrograms.Title')}
        </PageTitle>

        <PageBox>
          <div class="-mt-6 h-full divide-y-2 divide-theme-accent">
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

            <ChoiceSettingsItem
              setting={this.props.settings.getSetting('fbwAircraftPaxSigns')}
              settingName={t('Settings.AircraftOptionsPinPrograms.PaxSigns')}
              choices={{
                [PaxSigns.NoSmoking]: <>No Smoking</>,
                [PaxSigns.NoPortableDevices]: <>No Portable Device</>,
              }}
            />

            <ChoiceSettingsItem
              setting={this.props.settings.getSetting('fbwAircraftVhfSpacing')}
              settingName={t('Settings.AircraftOptionsPinPrograms.PaxSigns')}
              choices={{
                [VhfSpacing.EightPointThirtyThreeKHz]: <>8.33 kHz</>,
                [VhfSpacing.TwentyFiveKHz]: <>25 kHz</>,
              }}
            />

            <ChoiceSettingsItem
              setting={this.props.settings.getSetting('fbwAircraftLatLonExtendedFormat')}
              settingName={t('Settings.AircraftOptionsPinPrograms.LatLonExtendedFormat')}
              choices={{
                [LatLonExtendedFormat.LLnn]: <>LLnn</>,
                [LatLonExtendedFormat.AxxByyy]: <>AxxByyy</>,
              }}
            />
          </div>
        </PageBox>
      </div>
    );
  }
}
