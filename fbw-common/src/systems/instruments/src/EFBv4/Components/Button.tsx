import { DisplayComponent, FSComponent, VNode, ComponentProps } from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ComponentProps {
  onClick: () => any;
  class?: string;
  unstyled?: boolean;
}

export class Button extends DisplayComponent<ButtonProps> {
  private readonly root = FSComponent.createRef<HTMLSpanElement>();

  onAfterRender() {
    this.root.instance.addEventListener('click', this.props.onClick);
  }

  render(): VNode {
    return (
      <button
        ref={this.root}
        type="button"
        class={twMerge(
          !this.props.unstyled &&
            'text-theme-body hover:text-theme-highlight bg-theme-highlight hover:bg-theme-body border-theme-highlight flex w-full items-center justify-center space-x-4 rounded-md border-2 p-2 transition duration-100',
          this.props.class,
        )}
      >
        {this.props.children}
      </button>
    );
  }
}
