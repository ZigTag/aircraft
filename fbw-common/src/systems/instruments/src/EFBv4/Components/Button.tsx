import {
  DisplayComponent,
  FSComponent,
  VNode,
  ComponentProps,
  Subscribable,
  SubscribableUtils,
  MappedSubject,
  StyleRecord,
} from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ComponentProps {
  onClick: (event: MouseEvent) => any;
  theme?: ButtonTheme | Subscribable<ButtonTheme>;
  class?: string | Subscribable<string>;
  style?: string | StyleRecord;
  unstyled?: boolean;
  key?: string;
  disabled?: boolean | Subscribable<boolean>;
}

export enum ButtonTheme {
  Neutral,
  Highlight,
  Danger,
}

export class Button extends DisplayComponent<ButtonProps> {
  private readonly root = FSComponent.createRef<HTMLSpanElement>();

  onAfterRender() {
    this.root.instance.addEventListener('click', (event) => {
      const disabled = SubscribableUtils.isSubscribable(this.props.disabled)
        ? this.props.disabled.get()
        : this.props.disabled;

      if (!disabled) {
        this.props.onClick(event);
      }
    });
  }

  private readonly className = MappedSubject.create(
    ([theme, propClass, disabled]) => {
      return twMerge(
        !this.props.unstyled &&
          'flex items-center justify-center space-x-4 rounded-md border-2 border-theme-highlight bg-theme-highlight p-2 text-theme-body transition duration-100 hover:bg-theme-body hover:text-theme-highlight',
        theme === ButtonTheme.Neutral &&
          'border-theme-accent bg-theme-accent text-theme-text hover:border-theme-highlight hover:text-theme-highlight',
        theme === ButtonTheme.Danger && 'border-utility-red bg-utility-red text-theme-text hover:text-utility-red',
        disabled && 'pointer-events-none opacity-30',
        propClass,
      );
    },
    SubscribableUtils.toSubscribable(this.props.theme, true),
    SubscribableUtils.toSubscribable(this.props.class, true),
    SubscribableUtils.toSubscribable(this.props.disabled, true),
  );

  render(): VNode {
    return (
      <button ref={this.root} type="button" class={this.className} key={this.props.key ?? ''} style={this.props.style}>
        {this.props.children}
      </button>
    );
  }
}
