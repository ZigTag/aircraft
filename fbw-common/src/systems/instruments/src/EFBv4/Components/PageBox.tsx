import { FSComponent, DisplayComponent, VNode, ComponentProps } from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';

export interface PageBoxProps extends ComponentProps {
  class?: string;
}

export class PageBox extends DisplayComponent<PageBoxProps> {
  render(): VNode | null {
    return (
      <div
        class={twMerge(
          'flex h-content-section-reduced w-full flex-col overflow-hidden rounded-lg border-2 border-theme-accent p-6',
          this.props.class,
        )}
      >
        {this.props.children}
      </div>
    );
  }
}
