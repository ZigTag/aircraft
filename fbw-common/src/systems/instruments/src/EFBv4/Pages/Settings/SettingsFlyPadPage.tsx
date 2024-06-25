import { AbstractUIView } from '../../shared/UIView';
import { FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';
import {
  ChoiceSettingsItem,
  SelectSettingsItem,
  SettingsItem,
  SliderSettingsItem,
  ToggleSettingsItem,
} from './Components/SettingItem';
import { languageOptions } from '../../shared/translation';
import { FbwUserSettingsDefs, FlypadTheme, FlypadTimeDisplay, FlypadTimeFormat } from '../../FbwUserSettings';
import { keyboardLayoutOptions } from '../../Components/KeyboardWrapper';
import { Selector } from '../../Components/Selector';

export interface SettingsFlyPadPageProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;
  returnHome: () => any;
}

export class SettingsFlyPadPage extends AbstractUIView<SettingsFlyPadPageProps> {
  private _themeHandler = this.props.settings
    .getSetting('fbwEfbTheme')
    .map((theme) => {
      switch (theme) {
        case FlypadTheme.Light:
          return 'light';
        case FlypadTheme.Dark:
          return 'dark';
        default:
          return 'blue';
      }
    })
    .sub((theme) => {
      document.documentElement.classList.forEach((className) => {
        if (className.includes('theme-')) {
          document.documentElement.classList.remove(className);
        }
      });
      document.documentElement.classList.add(`theme-${theme}`);
    });

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
          settingName={t('Settings.flyPad.OnscreenKeyboardLayout')}
          activeSettingName={this.oskLanguageSetting.map(
            (language) => keyboardLayoutOptions.find((it) => it.name === language)!.alias,
          )}
        />

        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwEfbAutoOsk')}
          settingName={t('Settings.flyPad.AutomaticallyShowOnscreenKeyboard')}
        />

        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwEfbAutoBrightness')}
          settingName={t('Settings.flyPad.AutoBrightness')}
        />

        <SliderSettingsItem
          sliderMin={0}
          sliderMax={100}
          valueMin={1}
          valueMax={100}
          setting={this.props.settings.getSetting('fbwEfbBrightness')}
          settingName={t('Settings.flyPad.Brightness')}
        />

        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwEfbEnableBattery')}
          settingName={t('Settings.flyPad.BatteryLifeEnabled')}
        />

        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwEfbFlightProgressbar')}
          settingName={t('Settings.flyPad.ShowStatusBarFlightProgressIndicator')}
        />

        <ToggleSettingsItem
          setting={this.props.settings.getSetting('fbwEfbColoredMetar')}
          settingName={t('Settings.flyPad.ShowColoredRawMetar')}
        />

        {/** This is for the grouped time settings, not used enough to make a separate element **/}
        <SettingsItem
          settingName={
            <div class="flex flex-col">
              {t('Settings.flyPad.TimeDisplayed')}
              <span class="ml-8 mt-6">{t('Settings.flyPad.LocalTimeFormat')}</span>
            </div>
          }
        >
          <div class="flex flex-col justify-end space-y-2">
            <Selector
              activeClass="bg-theme-highlight text-theme-body"
              tabs={Object.entries({
                [FlypadTimeDisplay.Utc]: <>UTC</>,
                [FlypadTimeDisplay.Local]: <>Local</>,
                [FlypadTimeDisplay.Both]: <>Both</>,
              }).map(([k, v]) => [parseInt(k), v as VNode])}
              activePage={this.props.settings.getSetting('fbwEfbTimeDisplay')}
            />
            <Selector
              class="ml-auto"
              activeClass="bg-theme-highlight text-theme-body"
              tabs={Object.entries({
                [FlypadTimeFormat.Twelve]: <>12h</>,
                [FlypadTimeFormat.TwentyFour]: <>24h</>,
              }).map(([k, v]) => [parseInt(k), v as VNode])}
              activePage={this.props.settings.getSetting('fbwEfbTimeFormat')}
            />
          </div>
        </SettingsItem>

        <ChoiceSettingsItem
          setting={this.props.settings.getSetting('fbwEfbTheme')}
          settingName={t('Settings.flyPad.Theme')}
          choices={{
            [FlypadTheme.Blue]: <>Blue</>,
            [FlypadTheme.Dark]: <>Dark</>,
            [FlypadTheme.Light]: <>Light</>,
          }}
        />
      </SettingsPage>
    );
  }
}
