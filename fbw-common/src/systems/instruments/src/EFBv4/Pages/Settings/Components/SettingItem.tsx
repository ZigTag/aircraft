import {
  FSComponent,
  DisplayComponent,
  ComponentProps,
  VNode,
  UserSetting,
  EventBus,
  UserSettingValue,
} from '@microsoft/msfs-sdk';
import { t } from '@localization/translation';
import { Slider } from '../../../Components/Slider';
import { Toggle } from '../../../Components/Toggle';
import { SimpleInput } from '../../../Components/SimpleInput';
import { busContext } from '../../../Contexts';

export interface SettingsItemProps<T extends UserSettingValue> extends ComponentProps {
  setting: UserSetting<T>;

  settingName: string;

  unrealistic?: boolean;
}

export class SettingsItem extends DisplayComponent<SettingsItemProps<any>> {
  render(): VNode | null {
    return (
      <div class="flex w-full items-center border-b-2 border-b-theme-body py-4">
        {this.props.settingName}

        {(this.props.unrealistic ?? false) && (
          <span class="ml-2 text-theme-highlight">({t('Settings.Unrealistic')})</span>
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
          value={this.props.setting}
          onChange={(x) => this.modifySetting(x)}
        />

        <SimpleInput
          class="w-20 text-center"
          number
          min={this.props.sliderMin}
          max={this.props.sliderMax}
          value={this.props.setting.map((x) => x.toString())}
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
