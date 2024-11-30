import {
  FSComponent,
  DisplayComponent,
  ComponentProps,
  VNode,
  UserSetting,
  EventBus,
  UserSettingValue,
  Subject,
  Subscribable,
} from '@microsoft/msfs-sdk';
import { Slider } from '../../../Components/Slider';
import { Toggle } from '../../../Components/Toggle';
import { SimpleInput } from '../../../Components/SimpleInput';
import { busContext } from '../../../Contexts';
import { t } from '../../../Components/LocalizedText';
import { Selector } from '../../../Components/Selector';
import { ScrollableContainer } from '../../../Components/ScrollableContainer';
import { twMerge } from 'tailwind-merge';
import { SwitchOn } from '../../Pages';
import { Button } from '../../../Components/Button';

export interface SettingsItemProps extends ComponentProps {
  settingName: string | VNode;

  unrealistic?: boolean;
}

export class SettingsItem extends DisplayComponent<SettingsItemProps> {
  render(): VNode | null {
    return (
      <div class="flex w-full items-center py-4">
        {this.props.settingName}

        {(this.props.unrealistic ?? false) && (
          <span class="ml-2 text-theme-highlight">({t('Settings.Unrealistic')})</span>
        )}

        <div class="ml-auto flex h-full items-center space-x-4">{this.props.children}</div>
      </div>
    );
  }
}

export interface ValueSettingsItemProps<T extends UserSettingValue> extends SettingsItemProps {
  setting: UserSetting<T>;
}

export interface SliderSettingsItemProps extends ValueSettingsItemProps<number> {
  sliderMin: number;

  sliderMax: number;

  valueMin: number;

  valueMax: number;
}

export class SliderSettingsItem extends DisplayComponent<SliderSettingsItemProps, [EventBus]> {
  public override contextType = [busContext] as const;

  private readonly sliderValue = this.props.setting.map((value) => {
    const settingValueRatio = (value - this.props.valueMin) / Math.abs(this.props.valueMax - this.props.valueMin);
    const sliderValue = this.props.sliderMin + settingValueRatio * (this.props.sliderMax - this.props.sliderMin);

    return sliderValue;
  });

  private modifySetting(value: number) {
    const ratio = value / (this.props.sliderMax - this.props.sliderMin);
    const adjustedValue = this.props.valueMin + ratio * (this.props.valueMax - this.props.valueMin);

    this.props.setting.set(adjustedValue);
  }

  render(): VNode | null {
    return (
      <SettingsItem {...this.props}>
        <Slider
          min={this.props.sliderMin}
          max={this.props.sliderMax}
          value={this.sliderValue}
          onChange={(x) => this.modifySetting(x)}
        />

        <SimpleInput
          class="w-20 text-center"
          number
          decimalPrecision={0}
          min={this.props.sliderMin}
          max={this.props.sliderMax}
          value={this.sliderValue.map((x) => x.toString())}
          onChange={(x) => this.modifySetting(Number(x))}
        />
      </SettingsItem>
    );
  }
}

export class ToggleSettingsItem extends DisplayComponent<ValueSettingsItemProps<boolean>> {
  render(): VNode | null {
    return (
      <SettingsItem {...this.props}>
        <Toggle value={this.props.setting} onToggle={(x) => this.props.setting.set(x)} />
      </SettingsItem>
    );
  }
}
export interface InputSettingsItemProps<T extends string | number> extends ValueSettingsItemProps<T> {
  placeholder?: string;
  min?: number;
  max?: number;
  number?: T extends number ? true : false;
  padding?: number;
  decimalPrecision?: number;
  inputClassName?: string;
  fontSizeClassName?: string;
  reverse?: boolean; // Flip label/input order;
  class?: string;
  maxLength?: number;
}

export class InputSettingsItem<T extends string | number = string> extends DisplayComponent<InputSettingsItemProps<T>> {
  private readonly mappedValue = this.props.setting.map((value) => {
    if (typeof value === 'number') {
      return value.toString();
    } else {
      return value as string;
    }
  });

  private readonly handleValueChange = (newValue: string) => {
    const isNumber = typeof this.props.setting.get() === 'number';

    if (isNumber) {
      (this.props.setting as UserSetting<number>).set(Number(newValue));
    } else {
      (this.props.setting as UserSetting<string>).set(newValue);
    }
  };

  render(): VNode | null {
    return (
      <SettingsItem {...this.props}>
        <SimpleInput
          {...this.props}
          class={this.props.inputClassName}
          value={this.mappedValue}
          onChange={this.handleValueChange}
        />
      </SettingsItem>
    );
  }
}

export interface ChoiceSettingsItemProps<T extends number | string> extends ValueSettingsItemProps<T> {
  choices: Record<T, VNode>;
}

export class ChoiceSettingsItem<T extends number | string> extends DisplayComponent<ChoiceSettingsItemProps<T>> {
  render(): VNode | null {
    return (
      <SettingsItem {...this.props}>
        <Selector
          activeClass="bg-theme-highlight text-theme-body"
          tabs={Object.entries(this.props.choices).map(([k, v]) => {
            const number = parseInt(k);

            return [Number.isFinite(number) ? number : k, v as VNode];
          })}
          activePage={this.props.setting}
        />
        {this.props.children}
      </SettingsItem>
    );
  }
}

export interface SelectSettingsItemProps<T extends string> extends ValueSettingsItemProps<T> {
  choices: [page: T, component: VNode][];
  dropdownOnTop: boolean;
  forceShowAll: boolean;
  activeSettingName: string | VNode | Subscribable<string>;
  height?: number;
  width?: number;
}

export class SelectSettingsItem<T extends string> extends DisplayComponent<SelectSettingsItemProps<T>> {
  private readonly showDropdown = Subject.create(false);

  private dropdownClass = this.showDropdown.map((showDropdown) =>
    twMerge(
      `relative cursor-pointer rounded-md border-2 border-theme-accent bg-inherit`,
      showDropdown &&
        (this.props.dropdownOnTop ? 'rounded-t-none border-t-theme-body' : 'rounded-b-none border-b-theme-body'),
    ),
  );

  private chevronClass = this.showDropdown.map((showDropdown) =>
    twMerge(`bi-chevron-down inset-y-0 right-3 h-full duration-100`, showDropdown && '-rotate-180'),
  );

  private handleDropdown = () => {
    this.showDropdown.set(!this.showDropdown.get());
  };

  private handleChoiceClicked = (key: T) => {
    this.props.setting.set(key);
    this.showDropdown.set(!this.showDropdown.get());
  };

  render(): VNode | null {
    return (
      <SettingsItem {...this.props}>
        <div class={this.dropdownClass} style={{ width: `${this.props.width ?? 300}px` }}>
          <Button
            class="relative flex w-full justify-between bg-inherit px-3 py-1.5"
            onClick={this.handleDropdown}
            unstyled
          >
            <p class="text-left">{this.props.activeSettingName}</p>
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
                  {this.props.choices.map(
                    ([option, displayVal]) =>
                      (this.props.setting.get() !== option || this.props.forceShowAll) && (
                        <Button
                          key={option}
                          class="flex w-full bg-inherit px-3 py-1.5 text-left transition duration-300 hover:bg-theme-highlight/5 hover:text-theme-body"
                          onClick={() => this.handleChoiceClicked(option)}
                          unstyled
                        >
                          {displayVal}
                        </Button>
                      ),
                  )}
                </ScrollableContainer>
              </div>
            }
          />
        </div>
      </SettingsItem>
    );
  }
}
