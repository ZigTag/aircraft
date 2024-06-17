import { FSComponent, DisplayComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';

export interface ToggleProps {
  value: Subscribable<boolean>;
  onToggle: (value: boolean) => void;
  disabled?: Subscribable<boolean>;
}

export class Toggle extends DisplayComponent<ToggleProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly containerClassName = (this.props.disabled ?? Subject.create(false))?.map((disabled) => {
    return twMerge(
      'flex h-8 w-14 cursor-pointer items-center rounded-full',
      disabled ? 'bg-theme-unselected' : 'bg-theme-accent',
    );
  });

  private readonly thumbClassName = this.props.value?.map((value) => {
    return twMerge(
      'mx-1.5 size-6 rounded-full bg-white transition duration-200',
      value && 'translate-x-5 !bg-theme-highlight',
    );
  });

  private readonly handleClick = () => {
    if (this.props.disabled?.get()) {
      return;
    }

    this.props.onToggle(!this.props.value.get());
  };

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    // TODO destroy this
    this.rootRef.instance.addEventListener('click', this.handleClick);
  }

  render(): VNode | null {
    return (
      <div ref={this.rootRef} class={this.containerClassName}>
        <div class={this.thumbClassName} />
      </div>
    );
  }
}
