import { AbstractUIView } from '../../shared/UIView';
import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';

export interface SettingsThirdPartyOptionsPageProps {
  return_home: () => any;
}

export class SettingsThirdPartyOptionsPage extends AbstractUIView<SettingsThirdPartyOptionsPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage
        title={t('Settings.ThirdPartyOptions.Title')}
        return_home={this.props.return_home}
        ref={this.rootRef}
      >
        <span />
      </SettingsPage>
    );
  }
}
