import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';

export class Navigation extends DisplayComponent<any> {
  render(): VNode {
    return (
      <div>
        <PageTitle>Navigation</PageTitle>
      </div>
    );
  }
}
