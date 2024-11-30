import { FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { AbstractUIView } from '../../Shared/UIView';
import { SliderSettingsItem, ToggleSettingsItem } from './Components/SettingItem';
import { FbwUserSettingsDefs } from '../../FbwUserSettings';
import { t } from '../../Components/LocalizedText';
import { SettingsPage } from './Settings';
import { SettingsPages } from '../../EfbV4FsInstrumentAircraftSpecificData';

export interface SettingsAudioPageProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;
  settingsPages: SettingsPages;
  returnHome: () => any;
}

export class SettingsAudioPage extends AbstractUIView<SettingsAudioPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.Audio.Title')} returnHome={this.props.returnHome} ref={this.rootRef}>
        {this.props.settingsPages.audio.masterVolume && (
          <SliderSettingsItem
            setting={this.props.settings.getSetting('fbwAudioLevelExteriorMaster')}
            settingName={t('Settings.Audio.ExteriorMasterVolume')}
            sliderMin={0}
            sliderMax={100}
            valueMin={-50}
            valueMax={50}
          />
        )}
        {this.props.settingsPages.audio.engineVolume && (
          <SliderSettingsItem
            setting={this.props.settings.getSetting('fbwAudioLevelInteriorEngine')}
            settingName={t('Settings.Audio.EngineInteriorVolume')}
            sliderMin={0}
            sliderMax={100}
            valueMin={-50}
            valueMax={50}
          />
        )}
        {this.props.settingsPages.audio.windVolume && (
          <SliderSettingsItem
            setting={this.props.settings.getSetting('fbwAudioLevelInteriorWind')}
            settingName={t('Settings.Audio.WindInteriorVolume')}
            sliderMin={0}
            sliderMax={100}
            valueMin={-50}
            valueMax={50}
          />
        )}
        {this.props.settingsPages.audio.ptuCockpit && (
          <ToggleSettingsItem
            setting={this.props.settings.getSetting('fbwAudioPtuInCockpit')}
            settingName={t('Settings.Audio.PtuAudibleInCockpit')}
            unrealistic
          />
        )}
        {this.props.settingsPages.audio.paxAmbience && (
          <ToggleSettingsItem
            setting={this.props.settings.getSetting('fbwAudioPassengerAmbienceEnabled')}
            settingName={t('Settings.Audio.PassengerAmbience')}
          />
        )}
        {this.props.settingsPages.audio.boardingMusic && (
          <ToggleSettingsItem
            setting={this.props.settings.getSetting('fbwAudioBoardingMusicEnabled')}
            settingName={t('Settings.Audio.BoardingMusic')}
          />
        )}
      </SettingsPage>
    );
  }
}
