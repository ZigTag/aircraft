import { AbstractUIView } from '../../shared/UIView';
import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';

export interface SettingsAtsuAocPageProps {
  returnHome: () => any;
}

export class SettingsAtsuAocPage extends AbstractUIView<SettingsAtsuAocPageProps> {
  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.AtsuAoc.Title')} returnHome={this.props.returnHome} ref={this.rootRef}>
        <span />
      </SettingsPage>
    );
  }
}