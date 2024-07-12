import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { FuelProps } from '../Fuel';

export class A320Fuel extends DisplayComponent<FuelProps> {
  render(): VNode | null {
    return (
      <div>
        <p class="text-white">hi</p>
      </div>
    );
  }
}
