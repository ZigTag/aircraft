import { AbstractUIView } from '../../shared/UIView';
import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';

export interface SettingsAtsuAocPageProps {
  return_home: () => any;
}

export class SettingsAtsuAocPage extends AbstractUIView<SettingsAtsuAocPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.AtsuAoc.Title')} return_home={this.props.return_home} ref={this.rootRef}>
        <span />
      </SettingsPage>
    );
  }
}
