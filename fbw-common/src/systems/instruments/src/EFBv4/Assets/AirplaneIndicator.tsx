import { FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { AbstractUIView } from '../shared/UIView';

interface AirplaneIndicatorProps {
  width: number;
  height: number;
  class?: string | Subscribable<string>;
}

export class AirplaneIndicator extends AbstractUIView<AirplaneIndicatorProps> {
  render(): VNode | null {
    return (
      <svg
        width={this.props.width}
        height={this.props.height}
        class={this.props.class}
        viewBox="0 0 40 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 19C40 17.4 38.6 16 37 16H28L18 0H14L19 16H6L3 12H0L2 19L0 26H3L6 22H19L14 38H18L28 22H37C38.6 22 40 20.6 40 19Z"
          fill="currentColor"
        />
      </svg>
    );
  }
}
