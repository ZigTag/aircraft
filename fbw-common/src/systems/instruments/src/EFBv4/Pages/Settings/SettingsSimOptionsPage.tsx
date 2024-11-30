import { AbstractUIView } from '../../Shared/UIView';
import { FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';
import { ChoiceSettingsItem } from './Components/SettingItem';
import { FbwUserSettingsDefs, SimBridgeMode } from '../../FbwUserSettings';
import { LocalizedString } from '../../Shared';

export interface SettingsSimOptionsPageProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;
  returnHome: () => any;
}

export class SettingsSimOptionsPage extends AbstractUIView<SettingsSimOptionsPageProps> {
  private readonly simBridgeStateText = LocalizedString.create('Settings.SimOptions.Active');

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.props.settings
        .getSetting('fbwSimBridgeEnabled')
        .pipe(this.simBridgeStateText, (it) =>
          it === SimBridgeMode.AutoOn ? 'Settings.SimOptions.Active' : 'Settings.SimOptions.Inactive',
        ),
    );
  }

  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.SimOptions.Title')} returnHome={this.props.returnHome} ref={this.rootRef}>
        <ChoiceSettingsItem
          setting={this.props.settings.getSetting('fbwSimBridgeEnabled')}
          settingName={t('Settings.SimOptions.EnableSimBridge')}
          choices={{
            [SimBridgeMode.AutoOn]: t('Settings.SimOptions.Auto'),
            // TODO figure out how to get rid of this - this internal
            //  distinction should not be leaking through the settings
            [SimBridgeMode.AutoOff]: t('Settings.SimOptions.Auto'),
            [SimBridgeMode.PermOff]: t('Settings.SimOptions.Off'),
          }}
        >
          <div className="pt-2 text-center">{this.simBridgeStateText}</div>
        </ChoiceSettingsItem>
      </SettingsPage>
    );
  }
}
