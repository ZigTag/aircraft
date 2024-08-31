import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { GroundState } from '../../../../State/GroundState';
import { A320Services } from './A320_251N/A320Services';

export interface ServicesProps {
  groundState: GroundState;
}

export class Services extends DisplayComponent<ServicesProps> {
  render(): VNode | null {
    return <A320Services {...this.props} />;
  }
}
