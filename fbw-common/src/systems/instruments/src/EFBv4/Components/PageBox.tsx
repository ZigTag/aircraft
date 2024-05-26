import { FSComponent, DisplayComponent, VNode, ComponentProps } from '@microsoft/msfs-sdk';

export class PageBox extends DisplayComponent<ComponentProps> {
  render(): VNode | null {
    return (
      <div class="flex h-content-section-reduced w-full flex-col overflow-hidden rounded-lg border-2 border-theme-accent p-6">
        {this.props.children}
      </div>
    );
  }
}
