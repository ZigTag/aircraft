import {
  ComponentProps,
  ConsumerSubject,
  DisplayComponent,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
  UserSettingManager,
  VNode,
} from '@microsoft/msfs-sdk';
import { LocalizedString } from '../Shared/translation';
import { PageEnum } from '../Shared/common';
import { Switch } from '../Pages/Pages';
import { EFBSimvars } from '../EFBSimvarPublisher';
import { FbwUserSettingsDefs, FlypadTimeDisplay, FlypadTimeFormat } from '../FbwUserSettings';
import { AbstractUIView, UIVIew } from '../Shared';
import { ClientState, SimBridgeClientState } from '@shared/simbridge';
import { QuickControls } from './QuickControls';
import { SettingsPages } from '../EfbV4FsInstrumentAircraftSpecificData';

interface BatteryStatusIconProps extends ComponentProps {
  batteryLevel: Subscribable<number>;
  isCharging: Subscribable<boolean>;
}

export class BatteryIcon extends DisplayComponent<BatteryStatusIconProps> {
  private readonly batteryStatus: Subscribable<PageEnum.BatteryLevel>;

  constructor(props: BatteryStatusIconProps) {
    super(props);

    this.batteryStatus = MappedSubject.create(
      ([batteryLevel, isCharging]) => {
        if (isCharging) {
          return PageEnum.BatteryLevel.Charging;
        }

        if (batteryLevel < PageEnum.BatteryLevel.Warning) {
          return PageEnum.BatteryLevel.Warning;
        }

        if (batteryLevel < PageEnum.BatteryLevel.Low) {
          return PageEnum.BatteryLevel.Low;
        }

        if (batteryLevel < PageEnum.BatteryLevel.LowMedium) {
          return PageEnum.BatteryLevel.LowMedium;
        }

        if (batteryLevel < PageEnum.BatteryLevel.Medium) {
          return PageEnum.BatteryLevel.Medium;
        }

        if (batteryLevel < PageEnum.BatteryLevel.HighMedium) {
          return PageEnum.BatteryLevel.HighMedium;
        }

        return PageEnum.BatteryLevel.Full;
      },
      this.props.batteryLevel,
      this.props.isCharging,
    );
  }

  render(): VNode {
    return (
      <Switch
        pages={[
          [PageEnum.BatteryLevel.Charging, <i class="bi-battery-charging text-[35px] !text-green-700" />],
          [PageEnum.BatteryLevel.Warning, <i class="bi-battery text-[35px] !text-utility-red" />],
          [PageEnum.BatteryLevel.Low, <i class="bi-battery text-[35px] !text-white" />],
          [PageEnum.BatteryLevel.LowMedium, <i class="bi-battery-half text-[35px] !text-white" />],
          [PageEnum.BatteryLevel.Medium, <i class="bi-battery-half text-[35px] !text-white" />],
          [PageEnum.BatteryLevel.HighMedium, <i class="bi-battery-half text-[35px] !text-white" />],
          [PageEnum.BatteryLevel.Full, <i class="bi-battery-full text-[35px] !text-white" />],
        ]}
        activePage={this.batteryStatus}
      />
    );
  }
}

interface BatteryProps extends ComponentProps {
  batteryLevel: Subscribable<number>;
  isCharging: Subscribable<boolean>;
}

export class Battery extends DisplayComponent<BatteryProps> {
  private readonly activeClass = this.props.batteryLevel.map(
    (value) => `w-12 text-right ${value < PageEnum.BatteryLevel.Warning ? 'text-utility-red' : 'text-theme-text'}`,
  );

  render(): VNode {
    return (
      <div class="flex items-center space-x-4">
        <p class={this.activeClass}>{this.props.batteryLevel.map((value) => Math.ceil(value))}%</p>
        <BatteryIcon batteryLevel={this.props.batteryLevel} isCharging={this.props.isCharging} />
      </div>
    );
  }
}
interface StatusbarProps extends ComponentProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;

  settingsPages: SettingsPages;

  batteryLevel: Subscribable<number>;

  isCharging: Subscribable<boolean>;
}

export class Statusbar extends AbstractUIView<StatusbarProps> {
  private simbridgeConnectionCheckTimeout: ReturnType<typeof window.setInterval> | null = null;

  private readonly currentUTC = ConsumerSubject.create(null, 0);

  private readonly currentLocalTime = ConsumerSubject.create(null, 0);

  private readonly dayOfWeek = ConsumerSubject.create(null, 0);

  private readonly monthOfYear = ConsumerSubject.create(null, 0);

  private readonly dayOfMonth = ConsumerSubject.create(null, 0);

  private readonly dayName: LocalizedString = LocalizedString.create('StatusBar.Sun');

  private readonly monthName: LocalizedString = LocalizedString.create('StatusBar.Jan');

  private readonly timezones = this.props.settings.getSetting('fbwEfbTimeDisplay');

  private readonly timeFormat = this.props.settings.getSetting('fbwEfbTimeFormat');

  private readonly timeDisplayed = MappedSubject.create(
    ([currentUTC, currentLocalTime, timezones, timeFormat]) => {
      const getZuluFormattedTime = (seconds: number) =>
        `${Math.floor(seconds / 3600)
          .toString()
          .padStart(2, '0')}${Math.floor((seconds % 3600) / 60)
          .toString()
          .padStart(2, '0')}Z`;
      const getLocalFormattedTime = (seconds: number) => {
        if (timeFormat === FlypadTimeFormat.TwentyFour) {
          return `${Math.floor(seconds / 3600)
            .toString()
            .padStart(2, '0')}:${Math.floor((seconds % 3600) / 60)
            .toString()
            .padStart(2, '0')}`;
        }
        const hours = Math.floor(seconds / 3600) % 12;
        const minutes = Math.floor((seconds % 3600) / 60);
        const ampm = Math.floor(seconds / 3600) >= 12 ? 'pm' : 'am';
        return `${hours === 0 ? 12 : hours}:${minutes.toString().padStart(2, '0')}${ampm}`;
      };

      const currentUTCString = getZuluFormattedTime(currentUTC);
      const currentLocalTimeString = getLocalFormattedTime(currentLocalTime);

      if (timezones === FlypadTimeDisplay.Utc) {
        return currentUTCString;
      }
      if (timezones === FlypadTimeDisplay.Local) {
        return currentLocalTimeString;
      }
      return `${currentUTCString} / ${currentLocalTimeString}`;
    },
    this.currentUTC,
    this.currentLocalTime,
    this.timezones,
    this.timeFormat,
  );

  private readonly simBridgeConnected = Subject.create(false);

  private readonly wifiClass = this.simBridgeConnected.map(
    (isConnected) => `bi-${isConnected ? 'wifi' : 'wifi-off'} text-inherit text-[26px]`,
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    const sub = this.bus.getSubscriber<EFBSimvars>();
    this.subscriptions.push(
      this.currentUTC.setConsumer(sub.on('currentUTC')),
      this.currentLocalTime.setConsumer(sub.on('currentLocalTime')),
      this.dayOfWeek.setConsumer(sub.on('dayOfWeek')),
      this.monthOfYear.setConsumer(sub.on('monthOfYear')),
      this.dayOfMonth.setConsumer(sub.on('dayOfMonth')),
      this.dayOfWeek.setConsumer(sub.on('dayOfWeek')),
    );
    this.subscriptions.push(
      this.dayOfWeek.sub((value) => {
        this.dayName.set(
          [
            'StatusBar.Sun',
            'StatusBar.Mon',
            'StatusBar.Tue',
            'StatusBar.Wed',
            'StatusBar.Thu',
            'StatusBar.Fri',
            'StatusBar.Sat',
          ][value],
        );
      }, true),
    );

    this.subscriptions.push(
      this.monthOfYear.sub((value) => {
        this.monthName.set(
          [
            'StatusBar.Jan',
            'StatusBar.Feb',
            'StatusBar.Mar',
            'StatusBar.Apr',
            'StatusBar.May',
            'StatusBar.Jun',
            'StatusBar.Jul',
            'StatusBar.Aug',
            'StatusBar.Sep',
            'StatusBar.Oct',
            'StatusBar.Nov',
            'StatusBar.Dec',
          ][value - 1],
        );
      }, true),
    );

    this.simbridgeConnectionCheckTimeout = setInterval(() => {
      this.simBridgeConnected.set(
        ClientState.getInstance(this.bus).getSimBridgeClientState() === SimBridgeClientState.CONNECTED,
      );
    });
  }

  destroy(childFilter?: (child: UIVIew) => boolean) {
    super.destroy(childFilter);

    if (this.simbridgeConnectionCheckTimeout) {
      clearInterval(this.simbridgeConnectionCheckTimeout);
    }
  }

  render(): VNode {
    return (
      <div class="z-30 flex h-10 w-full items-center justify-between bg-theme-statusbar px-6 text-lg font-medium leading-none text-theme-text">
        <p>
          {this.dayName} {this.monthName} {this.dayOfMonth.map((value) => value.toFixed())}
        </p>

        <div class="absolute inset-x-0 mx-auto flex w-max flex-row items-center justify-center space-x-4">
          <p>{this.timeDisplayed}</p>
        </div>

        <div class="flex items-center space-x-4">
          <QuickControls settings={this.props.settings} settingsPages={this.props.settingsPages} />
          <i class={this.wifiClass} />
          <Battery batteryLevel={this.props.batteryLevel} isCharging={this.props.isCharging} />
        </div>
      </div>
    );
  }
}
