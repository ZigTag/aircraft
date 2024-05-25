import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';

export class Performance extends DisplayComponent<any> {
  render(): VNode {
    return (
      <div>
        <PageTitle>Performance</PageTitle>
      </div>
    );
  }
}
