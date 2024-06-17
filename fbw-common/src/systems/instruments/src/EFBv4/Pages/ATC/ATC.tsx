import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';

export class ATC extends DisplayComponent<any> {
  render(): VNode {
    return (
      <div>
        <PageTitle>{t('AirTrafficControl.Title')}</PageTitle>
      </div>
    );
  }
}
