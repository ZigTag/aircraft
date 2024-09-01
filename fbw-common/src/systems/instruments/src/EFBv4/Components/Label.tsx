import { FSComponent, DisplayComponent, VNode } from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';

export interface LabelProps {
  class?: string;

  text: string | VNode;
}

export class Label extends DisplayComponent<LabelProps> {
  render(): VNode | null {
    return (
      <div class="flex flex-row items-center justify-between">
        <p class={twMerge(`mr-4 text-theme-text`, this.props.class)}>{this.props.text}</p>
        {this.props.children}
      </div>
    );
  }
}
