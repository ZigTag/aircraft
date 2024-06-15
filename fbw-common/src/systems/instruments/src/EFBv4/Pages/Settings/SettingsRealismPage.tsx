import { AbstractUIView } from '../../shared/UIView';
import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';

export interface SettingsRealismPageProps {
  return_home: () => any;
}

export class SettingsRealismPage extends AbstractUIView<SettingsRealismPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.Realism.Title')} return_home={this.props.return_home} ref={this.rootRef}>
        <span />
      </SettingsPage>
    );
  }
}
