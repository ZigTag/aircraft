import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';

export class Failures extends DisplayComponent<any> {
  render(): VNode {
    return (
      <div>
        <PageTitle>Failures</PageTitle>
      </div>
    );
  }
}
