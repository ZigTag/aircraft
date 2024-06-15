import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

interface PageTitleProps extends ComponentProps {
  onClick?: () => any;
  class?: string;
}

export class PageTitle extends DisplayComponent<PageTitleProps> {
  render(): VNode | null {
    return <h1 class="mb-4 font-bold text-inherit">{this.props.children}</h1>;
  }
}
