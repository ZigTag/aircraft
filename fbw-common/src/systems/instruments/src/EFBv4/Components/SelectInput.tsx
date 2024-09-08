import { FSComponent, Subject, Subscribable, SubscribableUtils, Subscription, VNode } from '@microsoft/msfs-sdk';
import { Button } from './Button';
import { SwitchOn } from '../Pages/Pages';
import { twMerge } from 'tailwind-merge';
import { ScrollableContainer } from './ScrollableContainer';
import { List } from './List';
import { AbstractUIView, LocalizedString } from '../Shared';

export type SelectInputChoice<T extends string | number | boolean> = readonly [
  page: T,
  component: string | LocalizedString,
];

export interface SelectInputProps<T extends string | number | boolean> {
  value: Subscribable<T>;
  onChange: (value: T) => void;
  choices: SelectInputChoice<T>[] | Subscribable<SelectInputChoice<T>[]>;
  dropdownOnTop?: boolean;
  forceShowAll?: boolean;
  class?: string;
  height?: number;
  width?: number;
  disabled?: boolean | Subscribable<boolean>;
}

export class SelectInput<T extends string | number | boolean> extends AbstractUIView<SelectInputProps<T>> {
  private readonly showDropdown = Subject.create(false);

  private readonly choices = SubscribableUtils.toSubscribable(this.props.choices, true);

  private readonly disabled: Subscribable<boolean> = SubscribableUtils.toSubscribable(
    this.props.disabled ?? false,
    true,
  );

  private dropdownClass = this.showDropdown.map((showDropdown) =>
    twMerge(
      `relative w-64 cursor-pointer rounded-md border-2 border-theme-accent bg-inherit`,
      showDropdown &&
        (this.props.dropdownOnTop ? 'rounded-t-none border-t-theme-body' : 'rounded-b-none border-b-theme-body'),
      this.props.class,
    ),
  );

  private chevronClass = this.showDropdown.map((showDropdown) =>
    twMerge(`bi-chevron-down inset-y-0 right-3 h-full duration-100`, showDropdown && '-rotate-180'),
  );

  private valueTextSub: Subscription | null = null;

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.props.value.sub((value) => {
        if (this.valueTextSub) {
          this.valueTextSub.destroy();

          // Remove the old valueTextSub from the subscriptions array so we don't destroy it twice
          this.subscriptions.splice(this.subscriptions.indexOf(this.valueTextSub), 1);
        }

        const matchingChoice = this.choices.get().find(([key]) => key === value)!;

        if (!matchingChoice) {
          this.buttonText.set('');
          return;
        }

        const [, text] = matchingChoice;

        if (SubscribableUtils.isSubscribable(text)) {
          this.valueTextSub = text.sub((value) => this.buttonText.set(value), true);

          this.subscriptions.push(this.valueTextSub);
        } else {
          this.buttonText.set(text);
        }
      }, true),
    );
  }

  private handleDropdown = () => {
    this.showDropdown.set(!this.showDropdown.get());
  };

  private handleChoiceClicked = (key: T) => {
    this.props.onChange(key);
    this.showDropdown.set(!this.showDropdown.get());
  };

  private readonly buttonClass = this.disabled.map((disabled) =>
    twMerge(
      'relative flex w-full justify-between bg-inherit px-3 py-1.5',
      disabled ? 'pointer-events-none cursor-not-allowed opacity-50' : 'cursor-pointer',
    ),
  );

  private readonly buttonText = Subject.create('');

  render(): VNode | null {
    return (
      <div class={this.dropdownClass}>
        <Button class={this.buttonClass} onClick={this.handleDropdown} unstyled>
          <p class="text-left">{this.buttonText}</p>
          <i class={this.chevronClass} size={20} />
        </Button>
        <SwitchOn
          condition={this.showDropdown}
          on={
            <div
              class={twMerge(
                `absolute -inset-x-0.5 z-10 flex border-2 border-theme-accent bg-theme-body pb-2 pr-2`,
                this.props.dropdownOnTop
                  ? 'top-0 -translate-y-full flex-col-reverse rounded-t-md border-b-0'
                  : 'bottom-0 translate-y-full flex-col rounded-b-md border-t-0',
              )}
            >
              <ScrollableContainer height={this.props.height || 32} class="relative" nonRigidWidth>
                <List
                  items={this.choices}
                  render={([option, displayVal]) => {
                    const buttonClass = this.props.value.map((it) =>
                      twMerge(
                        'flex w-full bg-inherit px-3 py-1.5 text-left transition duration-300 hover:bg-theme-highlight/5 hover:text-theme-body',
                        it === option && !this.props.forceShowAll && 'view-hidden',
                      ),
                    );

                    return (
                      <Button
                        key={option.toString()}
                        class={buttonClass}
                        onClick={() => this.handleChoiceClicked(option)}
                        unstyled
                      >
                        {displayVal}
                      </Button>
                    );
                  }}
                />
              </ScrollableContainer>
            </div>
          }
        />
      </div>
    );
  }
}
