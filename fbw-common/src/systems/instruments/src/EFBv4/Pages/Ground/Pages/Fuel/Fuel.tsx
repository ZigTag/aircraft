import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { A320Fuel } from './A320_251N/A320Fuel';
import { SimbriefState } from '../../../../State/NavigationState';

export interface FuelProps {
  simbriefState: SimbriefState;
}

export class Fuel extends DisplayComponent<FuelProps> {
  render(): VNode | null {
    return <A320Fuel {...this.props} />;
  }
}
