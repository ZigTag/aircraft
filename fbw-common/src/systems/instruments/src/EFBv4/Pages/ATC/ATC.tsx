import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';

export class ATC extends DisplayComponent<any> {
  render(): VNode {
    return (
      <div>
        <PageTitle>ATC</PageTitle>
      </div>
    );
  }
}
