import { AbstractUIView } from '../../shared/UIView';
import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';

export interface SettingsFlyPadPageProps {
  return_home: () => any;
}

export class SettingsFlyPadPage extends AbstractUIView<SettingsFlyPadPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.flyPad.Title')} return_home={this.props.return_home} ref={this.rootRef}>
        <span />
      </SettingsPage>
    );
  }
}
