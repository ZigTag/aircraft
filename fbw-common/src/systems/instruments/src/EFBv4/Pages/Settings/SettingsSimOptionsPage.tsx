import { AbstractUIView } from '../../shared/UIView';
import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';

export interface SettingsSimOptionsPageProps {
  return_home: () => any;
}

export class SettingsSimOptionsPage extends AbstractUIView<SettingsSimOptionsPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.SimOptions.Title')} return_home={this.props.return_home} ref={this.rootRef}>
        <span />
      </SettingsPage>
    );
  }
}
