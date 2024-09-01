import { Accessible, DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { Button } from './Button';
import { SwitchOn } from '../Pages/Pages';
import { twMerge } from 'tailwind-merge';
import { ScrollableContainer } from './ScrollableContainer';
import { List } from './List';

export interface SelectInputProps<T extends string> {
  value: Subscribable<T>;
  onChange: (value: T) => void;
  choices: [page: T, component: string | VNode][];
  dropdownOnTop?: boolean;
  forceShowAll?: boolean;
  class?: string;
  height?: number;
  width?: number;
}

export class SelectInput<T extends string> extends DisplayComponent<SelectInputProps<T>> {
  private readonly showDropdown = Subject.create(false);

  private dropdownClass = this.showDropdown.map((showDropdown) =>
    twMerge(
      `relative cursor-pointer rounded-md border-2 border-theme-accent bg-inherit`,
      showDropdown &&
        (this.props.dropdownOnTop ? 'rounded-t-none border-t-theme-body' : 'rounded-b-none border-b-theme-body'),
      this.props.class,
    ),
  );

  private chevronClass = this.showDropdown.map((showDropdown) =>
    twMerge(`bi-chevron-down inset-y-0 right-3 h-full duration-100`, showDropdown && '-rotate-180'),
  );

  private handleDropdown = () => {
    this.showDropdown.set(!this.showDropdown.get());
  };

  private handleChoiceClicked = (key: T) => {
    this.props.onChange(key);
    this.showDropdown.set(!this.showDropdown.get());
  };

  render(): VNode | null {
    return (
      <div class={this.dropdownClass} style={{ width: `${this.props.width ?? 300}px` }}>
        <Button
          class="relative flex w-full justify-between bg-inherit px-3 py-1.5"
          onClick={this.handleDropdown}
          unstyled
        >
          <p class="text-left">{this.props.value}</p>
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
                {this.props.choices.map(([option, displayVal]) => {
                  const buttonClass = this.props.value.map((it) =>
                    twMerge(
                      'flex w-full bg-inherit px-3 py-1.5 text-left transition duration-300 hover:bg-theme-highlight/5 hover:text-theme-body',
                      it === option && !this.props.forceShowAll && 'view-hidden',
                    ),
                  );

                  return (
                    <Button key={option} class={buttonClass} onClick={() => this.handleChoiceClicked(option)} unstyled>
                      {displayVal}
                    </Button>
                  );
                })}
              </ScrollableContainer>
            </div>
          }
        />
      </div>
    );
  }
}
