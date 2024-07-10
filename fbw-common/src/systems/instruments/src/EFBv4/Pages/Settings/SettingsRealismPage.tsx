import { AbstractUIView } from '../../Shared/UIView';
import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';

export interface SettingsRealismPageProps {
  returnHome: () => any;
}

export class SettingsRealismPage extends AbstractUIView<SettingsRealismPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.Realism.Title')} returnHome={this.props.returnHome} ref={this.rootRef}>
        <span />
      </SettingsPage>
    );
  }
}
