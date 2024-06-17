import { AbstractUIView } from '../../shared/UIView';
import { FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';
import { SelectSettingsItem } from './Components/SettingItem';
import { languageOptions } from '../../shared/translation';
import { FbwUserSettingsDefs } from '../../FbwUserSettings';
import { keyboardLayoutOptions } from '../../Components/KeyboardWrapper';

export interface SettingsFlyPadPageProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;
  returnHome: () => any;
}

export class SettingsFlyPadPage extends AbstractUIView<SettingsFlyPadPageProps> {
  private readonly languageSetting = this.props.settings.getSetting('fbwEfbLanguage');
  private readonly oskLanguageSetting = this.props.settings.getSetting('fbwEfbOskLanguage');

  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.flyPad.Title')} returnHome={this.props.returnHome} ref={this.rootRef}>
        <SelectSettingsItem
          choices={languageOptions.map((option) => [option.langCode, <p>{option.alias}</p>])}
          dropdownOnTop={false}
          forceShowAll={true}
          setting={this.languageSetting}
          settingName={t('Settings.flyPad.Language')}
          activeSettingName={this.languageSetting.map(
            (language) => languageOptions.find((it) => it.langCode === language)!.alias,
          )}
        />

        <SelectSettingsItem
          choices={keyboardLayoutOptions.map((option) => [option.name, <p>{option.alias}</p>])}
          dropdownOnTop={false}
          forceShowAll={true}
          setting={this.oskLanguageSetting}
          settingName={t('Settings.flyPad.Language')}
          activeSettingName={this.oskLanguageSetting.map(
            (language) => keyboardLayoutOptions.find((it) => it.name === language)!.alias,
          )}
        />
      </SettingsPage>
    );
  }
}
