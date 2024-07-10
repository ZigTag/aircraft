import { AbstractUIView } from '../../Shared/UIView';
import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';

export interface SettingsSimOptionsPageProps {
  returnHome: () => any;
}

export class SettingsSimOptionsPage extends AbstractUIView<SettingsSimOptionsPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.SimOptions.Title')} returnHome={this.props.returnHome} ref={this.rootRef}>
        <span />
      </SettingsPage>
    );
  }
}
