import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

export class PageTitle extends DisplayComponent<{}> {
  render(): VNode | null {
    return <h1 class="mb-6 font-bold">{this.props.children}</h1>;
  }
}
