import { FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { AbstractUIView } from '../../shared/UIView';
import { SliderSettingsItem, ToggleSettingsItem } from './Components/SettingItem';
import { FbwUserSettingsDefs } from '../../FbwUserSettings';
import { t } from '../../Components/LocalizedText';
import { SettingsPage } from './Settings';

export interface SettingsAudioPageProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;
  returnHome: () => any;
}

export class SettingsAudioPage extends AbstractUIView<SettingsAudioPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.Audio.Title')} returnHome={this.props.returnHome} ref={this.rootRef}>
        <SliderSettingsItem
          setting={this.props.settings.getSetting('fbwAudioLevelExteriorMaster')}
          settingName={t('Settings.Audio.ExteriorMasterVolume')}
          sliderMin={0}
          sliderMax={100}
          valueMin={-50}
          valueMax={50}
        />
        <SliderSettingsItem
          setting={this.props.settings.getSetting('fbwAudioLevelInteriorEngine')}
          settingName={t('Settings.Audio.EngineInteriorVolume')}
          sliderMin={0}
          sliderMax={100}
          valueMin={-50}
          valueMax={50}
        />
        <SliderSettingsItem
          setting={this.props.settings.getSetting('fbwAudioLevelInteriorWind')}
          settingName={t('Settings.Audio.WindInteriorVolume')}
          sliderMin={0}
          sliderMax={100}
          valueMin={-50}
          valueMax={50}
        />

        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwAudioPtuInCockpit')}
          settingName={t('Settings.Audio.PtuAudibleInCockpit')}
          unrealistic
        />
        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwAudioPassengerAmbienceEnabled')}
          settingName={t('Settings.Audio.PassengerAmbience')}
        />
        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwAudioAnnouncementsEnabled')}
          settingName={t('Settings.Audio.Announcements')}
        />
        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwAudioBoardingMusicEnabled')}
          settingName={t('Settings.Audio.BoardingMusic')}
        />
      </SettingsPage>
    );
  }
}
