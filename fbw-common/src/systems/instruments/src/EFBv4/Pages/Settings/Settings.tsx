import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';

export class Settings extends DisplayComponent<any> {
  render(): VNode {
    return (
      <div>
        <PageTitle>{t('Settings.Title')}</PageTitle>
      </div>
    );
  }
}
