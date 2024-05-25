import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';

export class Checklists extends DisplayComponent<any> {
  render(): VNode {
    return (
      <div>
        <PageTitle>Checklists</PageTitle>
      </div>
    );
  }
}
