import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';

export class Ground extends DisplayComponent<any> {
  render(): VNode {
    return (
      <div>
        <PageTitle>Ground</PageTitle>
      </div>
    );
  }
}
