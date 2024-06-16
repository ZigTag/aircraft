import {
  FSComponent,
  DisplayComponent,
  ComponentProps,
  VNode,
  UserSetting,
  EventBus,
  UserSettingValue,
} from '@microsoft/msfs-sdk';
import { Slider } from '../../../Components/Slider';
import { Toggle } from '../../../Components/Toggle';
import { SimpleInput } from '../../../Components/SimpleInput';
import { busContext } from '../../../Contexts';
import { t } from '../../../Components/LocalizedText';
import { Selector } from '../../../Components/Selector';

export interface SettingsItemProps<T extends UserSettingValue> extends ComponentProps {
  setting: UserSetting<T>;

  settingName: string | VNode;

  unrealistic?: boolean;
}

export class SettingsItem extends DisplayComponent<SettingsItemProps<any>> {
  render(): VNode | null {
    return (
      <div class="border-b-theme-body flex w-full items-center border-b-2 py-4">
        {this.props.settingName}

        {(this.props.unrealistic ?? false) && (
          <span class="text-theme-highlight ml-2">({t('Settings.Unrealistic')})</span>
        )}

        <div class="ml-auto flex h-full items-center space-x-4">{this.props.children}</div>
      </div>
    );
  }
}

export interface SliderSettingsItemProps extends SettingsItemProps<number> {
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

export class ToggleSettingsItem extends DisplayComponent<SettingsItemProps<boolean>> {
  render(): VNode | null {
    return (
      <SettingsItem {...this.props}>
        <Toggle value={this.props.setting} onToggle={(x) => this.props.setting.set(x)} />
      </SettingsItem>
    );
  }
}
export interface InputSettingsItemProps<T extends string | number> extends SettingsItemProps<T> {
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

export interface ChoiceSettingsItemProps<T extends number> extends SettingsItemProps<T> {
  choices: Record<T, VNode>;
}

export class ChoiceSettingsItem<T extends number> extends DisplayComponent<ChoiceSettingsItemProps<T>> {
  render(): VNode | null {
    return (
      <SettingsItem {...this.props}>
        <Selector
          activeClass="bg-theme-highlight text-theme-body"
          tabs={Object.entries(this.props.choices).map(([k, v]) => [parseInt(k), v as VNode])}
          activePage={this.props.setting}
        />
      </SettingsItem>
    );
  }
}
