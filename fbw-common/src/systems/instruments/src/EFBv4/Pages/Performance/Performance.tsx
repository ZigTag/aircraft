import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';

export class Performance extends DisplayComponent<any> {
  render(): VNode {
    return (
      <div>
        <PageTitle>{t('Performance.Title')}</PageTitle>
      </div>
    );
  }
}
