import { AbstractUIView } from '../../Shared/UIView';
import { FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';
import { ChoiceSettingsItem, InputSettingsItem, ToggleSettingsItem } from './Components/SettingItem';
import { AtisSource, FbwUserSettingsDefs, MetarSource, TafSource } from '../../FbwUserSettings';

export interface SettingsAtsuAocPageProps {
  returnHome: () => any;
  settings: UserSettingManager<FbwUserSettingsDefs>;
}

export class SettingsAtsuAocPage extends AbstractUIView<SettingsAtsuAocPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.AtsuAoc.Title')} returnHome={this.props.returnHome} ref={this.rootRef}>
        <ChoiceSettingsItem
          setting={this.props.settings.getSetting('fbwAtsuAocAtisSource')}
          settingName={t('Settings.AtsuAoc.AtisAtcSource')}
          choices={{
            [AtisSource.FAA]: <>FAA (US)</>,
            [AtisSource.PILOT_EDGE]: <>PilotEdge</>,
            [AtisSource.IVAO]: <>IVAO</>,
            [AtisSource.VATSIM]: <>VATSIM</>,
          }}
        />
        <ChoiceSettingsItem
          setting={this.props.settings.getSetting('fbwAtsuAocMetarSource')}
          settingName={t('Settings.AtsuAoc.MetarSource')}
          choices={{
            [MetarSource.MSFS]: <>MSFS</>,
            [MetarSource.NOAA]: <>NOAA</>,
            [MetarSource.PILOT_EDGE]: <>PilotEdge</>,
            [MetarSource.VATSIM]: <>VATSIM</>,
          }}
        />
        <ChoiceSettingsItem
          setting={this.props.settings.getSetting('fbwAtsuAocTafSource')}
          settingName={t('Settings.AtsuAoc.TafSource')}
          choices={{
            [TafSource.NOAA]: <>NOAA</>,
          }}
        />

        {/*TODO <ERROR REPORTING HERE>*/}

        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwAtsuAocOnlineFeaturesEnabled')}
          settingName={t('Settings.AtsuAoc.Telex')}
        />
        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwAtsuAocHoppieEnabled')}
          settingName={t('Settings.AtsuAoc.HoppieEnabled')}
        />
        {/* TODO: This is missing validation logic from the React implementation. Port that over when possible. */}
        <InputSettingsItem
          setting={this.props.settings.getSetting('fbwAtsuAocHoppieUserId')}
          settingName={t('Settings.AtsuAoc.HoppieUserId')}
        />
      </SettingsPage>
    );
  }
}
