import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';

export class Checklists extends DisplayComponent<any> {
  render(): VNode {
    return (
      <div>
        <PageTitle>{t('Checklists.Title')}</PageTitle>
      </div>
    );
  }
}
