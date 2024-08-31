import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

export class LoadingSpinner extends DisplayComponent<any> {
  render(): VNode | null {
    return <i class="bi-arrow-repeat animate-spin text-[50px]" />;
  }
}
