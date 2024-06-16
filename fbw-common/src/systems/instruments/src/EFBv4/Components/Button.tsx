import {
  DisplayComponent,
  FSComponent,
  VNode,
  ComponentProps,
  Subscribable,
  SubscribableUtils,
  Subject,
} from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ComponentProps {
  onClick: () => any;
  theme?: ButtonTheme | Subscribable<ButtonTheme>;
  class?: string;
  unstyled?: boolean;
}

export enum ButtonTheme {
  Highlight,
  Danger,
}

export class Button extends DisplayComponent<ButtonProps> {
  private readonly root = FSComponent.createRef<HTMLSpanElement>();

  onAfterRender() {
    this.root.instance.addEventListener('click', this.props.onClick);
  }

  private readonly className = (SubscribableUtils.isSubscribable(this.props.theme)
    ? this.props.theme
    : Subject.create(ButtonTheme.Highlight)
  ).map((theme) => {
    return twMerge(
      !this.props.unstyled &&
        'flex items-center justify-center space-x-4 rounded-md border-2 border-theme-highlight bg-theme-highlight p-2 text-theme-body transition duration-100 hover:bg-theme-body hover:text-theme-highlight',
      theme === ButtonTheme.Danger && 'border-utility-red bg-utility-red text-theme-text hover:text-utility-red',
      this.props.class,
    );
  });

  render(): VNode {
    return (
      <button ref={this.root} type="button" class={this.className}>
        {this.props.children}
      </button>
    );
  }
}
