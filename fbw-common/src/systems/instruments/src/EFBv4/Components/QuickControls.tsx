import { AbstractUIView, UIVIew } from '../Shared';
import {
  ConsumerSubject,
  FSComponent,
  MappedSubject,
  Subject,
  SubscribableUtils,
  UserSettingManager,
  VNode,
} from '@microsoft/msfs-sdk';
import { SimBridgeClientState } from '@shared/simbridge';
import { TooltipWrapper } from './Tooltip';
import { t } from './LocalizedText';
import { Button, ButtonProps } from './Button';
import { twMerge } from 'tailwind-merge';
import { FbwUserSettingsDefs } from '../FbwUserSettings';
import { EFBSimvars } from '../EFBSimvarPublisher';
import { Slider } from './Slider';
import { SwitchIf, SwitchOn } from '../Pages/Pages';
import { SimbridgeStateEvents } from '@shared/simbridge/components/SimBridgeStatePublisher';
import { SettingsPages } from '../EfbV4FsInstrumentAircraftSpecificData';

export interface QuickControlsProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;

  settingsPages: SettingsPages;
}

export class QuickControls extends AbstractUIView<QuickControlsProps> {
  private readonly showQuickControlsPane = Subject.create(false);

  private readonly handleToggleQuickSettings = () => this.showQuickControlsPane.set(!this.showQuickControlsPane.get());

  render(): VNode | null {
    return (
      <>
        <TooltipWrapper text={'StatusBar.TT.QuickControls'}>
          <Button unstyled class="bg-none" onClick={this.handleToggleQuickSettings}>
            <i class="bi-gear text-[36px] text-inherit" />
          </Button>
        </TooltipWrapper>
        <SwitchOn
          condition={this.showQuickControlsPane}
          on={
            <QuickControlsContainer
              settings={this.props.settings}
              settingsPages={this.props.settingsPages}
              onToggleShowQuickControls={this.handleToggleQuickSettings}
            />
          }
        />
      </>
    );
  }
}

export interface QuickControlsContainerProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;

  settingsPages: SettingsPages;

  onToggleShowQuickControls: () => void;
}

export class QuickControlsContainer extends AbstractUIView<QuickControlsContainerProps> {
  private readonly overlayRef = FSComponent.createRef<HTMLDivElement>();

  private readonly usingAutoBrightness = this.props.settings.getSetting('fbwEfbAutoBrightness');

  private readonly brightnessSetting = this.props.settings.getSetting('fbwEfbBrightness');

  private readonly cabinUsingAutoBrightness = this.props.settings.getSetting('fbwCabinAutoBrightness');

  private readonly cabinBrightnessSetting = this.props.settings.getSetting('fbwCabinBrightness');

  private readonly autoOskSetting = this.props.settings.getSetting('fbwEfbAutoOsk');

  private readonly pauseAtTodSetting = this.props.settings.getSetting('fbwPauseAtTod');

  private readonly pauseAtTodDistanceSetting = this.props.settings.getSetting('fbwPauseAtTodDistance');

  private readonly brightnessValue = ConsumerSubject.create(null, -1);

  private readonly cabinAutoBrightnessValue = ConsumerSubject.create(null, -1);

  private readonly pauseAtTodArmed = ConsumerSubject.create(null, false);

  private readonly simRate = ConsumerSubject.create(null, -1);

  private readonly brightnessSliderClass = this.usingAutoBrightness.map((it) =>
    twMerge(`flex flex-row items-center`, it && 'opacity-30'),
  );

  private readonly brightnessSliderText = MappedSubject.create(
    ([usingAutoBrightness, brightness, brightnessSetting]) =>
      `${usingAutoBrightness ? brightness.toFixed(0) : brightnessSetting}%`,
    this.usingAutoBrightness,
    this.brightnessValue,
    this.brightnessSetting,
  );

  private readonly brightnessSliderValue = MappedSubject.create(
    ([usingAutoBrightness, brightness, brightnessSetting]) => (usingAutoBrightness ? brightness : brightnessSetting),
    this.usingAutoBrightness,
    this.brightnessValue,
    this.brightnessSetting,
  );

  private readonly autoBrightnessButtonClass = this.usingAutoBrightness.map((usingAutoBrightness) =>
    twMerge(
      `ml-4 flex items-center justify-center rounded-md bg-theme-body text-theme-text transition duration-100 hover:border-4 hover:border-theme-highlight`,
      usingAutoBrightness && 'bg-utility-green text-theme-body',
    ),
  );

  private readonly cabinAutoBrightnessSliderClass = this.cabinUsingAutoBrightness.map((usingCabinAutobrightness) =>
    twMerge(`flex flex-row items-center`, usingCabinAutobrightness && 'opacity-30'),
  );

  private readonly cabinBrightnessSliderText = MappedSubject.create(
    ([usingCabinAutobrightness, cabinAutoBrightness, cabinManualBrightness]) =>
      `${usingCabinAutobrightness ? cabinAutoBrightness.toFixed(0) : cabinManualBrightness}%`,
    this.cabinUsingAutoBrightness,
    this.cabinAutoBrightnessValue,
    this.cabinBrightnessSetting,
  );

  private readonly cabinBrightnessSliderValue = MappedSubject.create(
    ([usingCabinAutobrightness, cabinAutoBrightness, cabinManualBrightness]) =>
      usingCabinAutobrightness ? cabinAutoBrightness : cabinManualBrightness,
    this.cabinUsingAutoBrightness,
    this.cabinAutoBrightnessValue,
    this.cabinBrightnessSetting,
  );

  private readonly cabinAutoBrightnessButtonClass = this.cabinUsingAutoBrightness.map((usingCabinAutobrightness) =>
    twMerge(
      `ml-4 flex items-center justify-center rounded-md bg-theme-body text-theme-text transition duration-100 hover:border-4 hover:border-theme-highlight`,
      usingCabinAutobrightness ? 'bg-utility-green text-theme-body' : '',
    ),
  );

  private readonly simBridgeConnectionState = ConsumerSubject.create<SimBridgeClientState>(
    null,
    SimBridgeClientState.OFF,
  );

  private readonly simBridgeConnectionStateIsConnected = this.simBridgeConnectionState.map(
    (it) => it === SimBridgeClientState.CONNECTED,
  );

  private readonly simBridgeButtonStyle = this.simBridgeConnectionState.map((simBridgeClientState) => {
    switch (simBridgeClientState) {
      case SimBridgeClientState.CONNECTED:
        return 'bg-utility-green text-theme-body';
      case SimBridgeClientState.CONNECTING:
        return 'bg-utility-amber text-theme-body';
      case SimBridgeClientState.OFFLINE:
        return 'bg-utility-red text-theme-body';
      default:
        return '';
    }
  });

  private readonly simBridgeButtonText = this.simBridgeConnectionState.map((simBridgeClientState) => {
    switch (simBridgeClientState) {
      case SimBridgeClientState.CONNECTED:
        return t('QuickControls.SimBridgeConnected');
      case SimBridgeClientState.CONNECTING:
        return t('QuickControls.SimBridgeConnecting');
      case SimBridgeClientState.OFFLINE:
        return t('QuickControls.SimBridgeOffline');
      default:
        return t('QuickControls.SimBridgeOff');
    }
  });

  private readonly oskButtonClass = this.autoOskSetting.map((autoOsk) =>
    autoOsk ? 'bg-utility-green text-theme-body' : 'text-theme-text',
  );

  private readonly pauseAtTodClass = MappedSubject.create(
    ([pauseAtTod, todArmed]) => {
      if (pauseAtTod && todArmed) {
        return 'bg-utility-green';
      } else if (pauseAtTod) {
        return 'bg-utility-amber';
      }

      return '';
    },
    this.pauseAtTodSetting,
    this.pauseAtTodArmed,
  );

  private readonly pauseAtTodString = MappedSubject.create(
    ([pauseAtTod, todArmed]) => {
      if (pauseAtTod && todArmed) {
        return t('QuickControls.PauseAtTodArmed');
      } else if (pauseAtTod) {
        return t('QuickControls.PauseAtTodStandby');
      } else {
        return t('QuickControls.PauseAtTodInactive');
      }
    },
    this.pauseAtTodSetting,
    this.pauseAtTodArmed,
  );

  private readonly simRateString = this.simRate.map((it) => `${it}x`);

  private readonly handleClickSettings = () => {
    // TODO
  };

  private readonly handleSleep = () => {
    // TODO
  };

  private readonly handlePower = () => {
    // TODO
  };

  private readonly handleAutoBrightness = () => {
    // TODO
  };

  private readonly handleCabinAutoBrightness = () => {
    // TODO
  };

  private readonly handleAlignADIRS = () => {
    // TODO
  };

  private readonly handleInstantBoarding = () => {
    // TODO
  };

  private readonly handleResetSimBridgeConnection = () => {
    // TODO
  };

  private readonly handleToggleOsk = () => {
    // TODO
  };

  private readonly handleTogglePauseAtTod = () => {
    // TODO
  };

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.brightnessValue.setConsumer(this.bus.getSubscriber<EFBSimvars>().on('efbBrightness'));
    this.cabinAutoBrightnessValue.setConsumer(this.bus.getSubscriber<EFBSimvars>().on('cabinAutoBrightness'));
    this.pauseAtTodArmed.setConsumer(this.bus.getSubscriber<EFBSimvars>().on('pauseAtTodArmed'));
    this.simRate.setConsumer(this.bus.getSubscriber<EFBSimvars>().on('simRate'));

    this.simBridgeConnectionState.setConsumer(this.bus.getSubscriber<SimbridgeStateEvents>().on('simbridge.state'));

    this.subscriptions.push(
      this.brightnessValue,
      this.brightnessSliderClass,
      this.brightnessSliderText,
      this.autoBrightnessButtonClass,
      this.cabinAutoBrightnessSliderClass,
      this.simBridgeConnectionStateIsConnected,
      this.simBridgeButtonStyle,
      this.simBridgeButtonText,
      this.oskButtonClass,
      this.pauseAtTodClass,
      this.pauseAtTodString,
      this.simRateString,
    );

    this.overlayRef.instance.addEventListener('mousedown', this.props.onToggleShowQuickControls);
  }

  destroy(childFilter?: (child: UIVIew) => boolean) {
    super.destroy(childFilter);

    this.overlayRef.instance.removeEventListener('mousedown', this.props.onToggleShowQuickControls);
  }

  render(): VNode | null {
    return (
      <div ref={this.rootRef}>
        <div ref={this.overlayRef} class="absolute left-0 top-0 z-30 h-screen w-screen bg-theme-body opacity-70" />

        <div
          class="absolute z-40 rounded-md border border-theme-secondary bg-theme-accent p-6 transition duration-100"
          style={{ top: '40px', right: '50px', width: '620px' }}
        >
          <div class="mb-5 flex flex-row items-center justify-end">
            <span class="mr-auto">
              <TooltipWrapper text={'QuickControls.TT.Settings'}>
                <QuickSettingsButton onClick={this.handleClickSettings}>
                  <i class="bi-gear text-[24px] text-inherit" />
                </QuickSettingsButton>
              </TooltipWrapper>
            </span>

            <TooltipWrapper text={'QuickControls.TT.Sleep'}>
              <QuickSettingsButton onClick={this.handleSleep}>
                <i class="bi-moon-fill text-[20px] text-inherit" />
              </QuickSettingsButton>
            </TooltipWrapper>

            <TooltipWrapper text={'QuickControls.TT.PowerButton'}>
              <QuickSettingsButton onClick={this.handlePower} class="ml-4">
                <i class="bi-power text-[24px] text-inherit" />
              </QuickSettingsButton>
            </TooltipWrapper>
          </div>
          <div class="mb-5 flex flex-row items-center justify-between">
            <div class={this.brightnessSliderClass}>
              <TooltipWrapper text={'QuickControls.TT.Brightness'}>
                <div>
                  <div class="mr-4 flex w-[80px] flex-row items-center text-theme-text">
                    <i class="bi-brightness-high-fill text-[24px] text-inherit" />
                    <span class="pointer-events-none ml-2 text-inherit">{this.brightnessSliderText}</span>
                  </div>
                  <div>
                    <Slider
                      disabled={this.usingAutoBrightness}
                      // ref={brightnessSliderRef} TODO restore v3 blur functionality
                      value={this.brightnessSliderValue}
                      min={1}
                      max={100}
                      onChange={(value) => this.brightnessSetting.set(value)}
                      // onAfterChange={() => brightnessSliderRef.current && brightnessSliderRef.current.blur()} TODO restore v3 blur functionality
                      class="rounded-md"
                      // style={{ width: '380px', height: '50px', padding: '0' }} TODO restore v3 styling
                      // trackStyle={{ backgroundColor: 'var(--color-highlight)', height: '50px' }}
                      // railStyle={{ backgroundColor: 'var(--color-body)', height: '50px' }}
                      // handleStyle={{ top: '13px', height: '0px', width: '0px' }}
                    />
                  </div>
                </div>
              </TooltipWrapper>
            </div>
            <TooltipWrapper text={'QuickControls.TT.AutoBrightness'}>
              <button
                type="button"
                onClick={this.handleAutoBrightness}
                class={this.autoBrightnessButtonClass}
                style={{ width: '80px', height: '50px' }}
              >
                <i class="bi-brightness-high text-[24px] text-inherit" />
              </button>
            </TooltipWrapper>
          </div>
          {/* Cabin Lighting */}
          {this.props.settingsPages.sim.cabinLighting && (
            <div class="mb-5 flex flex-row items-center justify-between">
              <div class={this.cabinAutoBrightnessSliderClass}>
                <TooltipWrapper text={'QuickControls.TT.CabinLighting'}>
                  <div class="mr-4 flex w-[80px] flex-row items-center text-theme-text">
                    <i class="bi-lightbulb-fill text-[24px] text-inherit" />
                    <span class="pointer-events-none ml-2 text-inherit">{this.cabinBrightnessSliderText}</span>
                  </div>
                  <div>
                    <Slider
                      disabled={this.cabinUsingAutoBrightness}
                      // ref={cabinBrightnessSliderRef} TODO restore v3 blur functionality
                      value={this.cabinBrightnessSliderValue}
                      min={0}
                      max={100}
                      onChange={(value) => this.cabinBrightnessSetting.set(value)}
                      // onAfterChange={() => cabinBrightnessSliderRef.current && cabinBrightnessSliderRef.current.blur()} TODO restore v3 blur functionality
                      class="rounded-md"
                      // style={{ width: '380px', height: '50px', padding: '0' }} TODO restore v3 styling
                      // trackStyle={{ backgroundColor: 'var(--color-highlight)', height: '50px' }}
                      // railStyle={{ backgroundColor: 'var(--color-body)', height: '50px' }}
                      // handleStyle={{ top: '13px', height: '0px', width: '0px' }}
                    />
                  </div>
                </TooltipWrapper>
              </div>
              <TooltipWrapper text={'QuickControls.TT.CabinAutoBrightness'}>
                <button
                  type="button"
                  onClick={this.handleCabinAutoBrightness}
                  class={this.cabinAutoBrightnessButtonClass}
                  style={{ width: '80px', height: '50px' }}
                >
                  <i class="bi-lightbulb-fill text-[24px] text-inherit" />
                </button>
              </TooltipWrapper>
            </div>
          )}
          {/* Quick Settings Button */}
          {/* First Row */}
          <div class="mb-5 flex flex-row items-center justify-between">
            <TooltipWrapper text={'QuickControls.TT.AlignAdirs'}>
              <QuickSettingsToggle
                onClick={this.handleAlignADIRS}
                icon={<i class="bi-compass text-[42px] text-inherit" />}
              >
                {t('QuickControls.AlignAdirs')}
              </QuickSettingsToggle>
            </TooltipWrapper>
            <TooltipWrapper text={'QuickControls.TT.FinishBoarding'}>
              <QuickSettingsToggle
                onClick={this.handleInstantBoarding}
                icon={<i class="bi-person-check text-[42px] text-inherit" />}
              >
                {t('QuickControls.FinishBoarding')}
              </QuickSettingsToggle>
            </TooltipWrapper>
            <TooltipWrapper text={'QuickControls.TT.SimBridge'}>
              <QuickSettingsToggle
                onClick={this.handleResetSimBridgeConnection}
                icon={
                  <SwitchIf
                    condition={this.simBridgeConnectionStateIsConnected}
                    on={<i class="bi-wifi text-[42px] text-inherit" />}
                    off={<i class="bi-wifi-off text-[42px] text-inherit" />}
                  />
                }
                class={this.simBridgeButtonStyle}
              >
                {t('QuickControls.SimBridge')}
                <br />
                {this.simBridgeButtonText}
              </QuickSettingsToggle>
            </TooltipWrapper>

            <TooltipWrapper text={'QuickControls.TT.OnScreenKeyboard'}>
              <QuickSettingsToggle
                onClick={this.handleToggleOsk}
                icon={<i class="bi-keyboard text-[42px] text-inherit" />}
                class={this.oskButtonClass}
              >
                {t('QuickControls.OnScreenKeyboard')}
              </QuickSettingsToggle>
            </TooltipWrapper>
          </div>
          {/* Second Row */}
          <div class="flex flex-row items-center justify-between">
            {this.props.settingsPages.realism.pauseOnTod && (
              <TooltipWrapper text={'QuickControls.TT.PauseAtTod'}>
                <LargeQuickSettingsToggle
                  onClick={this.handleTogglePauseAtTod}
                  icon={<i class="bi-airplane-fill text-[42px] text-inherit" />} // TODO use the right icon from v3
                  class={this.pauseAtTodClass}
                >
                  {t('QuickControls.PauseAtTod')} <br />
                  {this.pauseAtTodString}
                </LargeQuickSettingsToggle>
              </TooltipWrapper>
            )}
            <TooltipWrapper text={'QuickControls.TT.Simrate'}>
              <LargeQuickSettingsIncrementer
                onDownClick={() => SimVar.SetSimVarValue('K:SIM_RATE_DECR', 'bool', true)}
                onUpClick={() => SimVar.SetSimVarValue('K:SIM_RATE_INCR', 'bool', true)}
                icon={<i class="bi-clock-history text-[42px] text-inherit" />}
                infoBox={<span>{this.simRateString}</span>}
              >
                {t('QuickControls.Simrate')}
              </LargeQuickSettingsIncrementer>
            </TooltipWrapper>
          </div>
        </div>
      </div>
    );
  }
}

class QuickSettingsButton extends AbstractUIView<ButtonProps> {
  private readonly buttonClass = SubscribableUtils.toSubscribable(this.props.class ?? '', true).map((it) =>
    twMerge(
      `flex size-12 items-center justify-center rounded-full bg-theme-body text-theme-text transition duration-100 hover:border-4 hover:border-theme-highlight`,
      it,
    ),
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(this.buttonClass);
  }

  render(): VNode | null {
    return (
      <Button ref={this.rootRef} class={this.buttonClass} {...this.props}>
        {this.props.children}
      </Button>
    );
  }
}

interface QuickSettingsToggleProps extends ButtonProps {
  icon: VNode;

  width?: number;
}

class QuickSettingsToggle extends AbstractUIView<QuickSettingsToggleProps> {
  private readonly buttonClass = SubscribableUtils.toSubscribable(this.props.class ?? '', true).map((it) =>
    twMerge(
      `flex h-[100px] flex-col items-center justify-center rounded-md bg-theme-body text-theme-text transition duration-100 hover:border-4 hover:border-theme-highlight`,
      it,
    ),
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(this.buttonClass);
  }

  render(): VNode | null {
    return (
      <Button
        ref={this.rootRef}
        class={this.buttonClass}
        style={{ width: `${this.props.width ?? 130}px` }}
        {...this.props}
      >
        {this.props.icon}
        <div class="mt-1 flex flex-col items-center text-sm text-inherit">{this.props.children}</div>
      </Button>
    );
  }
}

interface LargeQuickSettingsToggleProps extends QuickSettingsToggleProps {
  infoBox?: React.ReactElement;
}

class LargeQuickSettingsToggle extends AbstractUIView<LargeQuickSettingsToggleProps> {
  private readonly buttonClass = SubscribableUtils.toSubscribable(this.props.class ?? '', true).map((it) =>
    twMerge(
      'relative flex h-[100px] flex-col items-center justify-center rounded-md border-2 border-transparent bg-theme-body text-theme-text transition duration-100 hover:border-current',
      it,
    ),
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(this.buttonClass);
  }

  render(): VNode | null {
    return (
      <Button
        ref={this.rootRef}
        class={this.buttonClass}
        style={{ width: `${this.props.width ?? 275}px` }}
        {...this.props}
      >
        <div class="flex flex-row items-center justify-center">
          <div class="mr-5 flex flex-col items-center justify-center">
            {this.props.icon}
            <div class="mt-1 text-sm text-inherit">{this.props.children}</div>
          </div>
          <div class="flex flex-col items-center justify-center">{this.props.infoBox}</div>
        </div>
      </Button>
    );
  }
}

interface LargeQuickSettingsIncrementerProps {
  onDownClick?: (e: MouseEvent) => void;
  onUpClick?: () => void;
  icon: VNode;
  className?: string;
  width?: number;
  infoBox?: VNode;
}

class LargeQuickSettingsIncrementer extends AbstractUIView<LargeQuickSettingsIncrementerProps> {
  render(): VNode | null {
    return (
      <div
        ref={this.rootRef}
        class="flex flex-col items-center justify-center rounded-md bg-theme-body text-theme-text transition duration-100"
        style={{ width: `${this.props.width ?? 275}px`, height: '100px' }}
      >
        <div class="flex flex-row items-center justify-center">
          <Button
            unstyled
            class="mr-5 flex flex-col items-center justify-center rounded-md border-2 border-transparent bg-theme-accent px-4 py-2 text-theme-text transition duration-100 hover:border-current"
            onClick={this.props.onDownClick ?? (() => {})}
          >
            <i class="bi-chevron-compact-down text-[24px] text-inherit" />
          </Button>
          <div class="mr-5 flex flex-col items-center justify-center">
            {this.props.icon}
            <div class="mt-1 text-sm text-inherit">{this.props.children}</div>
          </div>
          <div class="flex flex-col items-center justify-center">{this.props.infoBox}</div>

          <Button
            unstyled
            class="ml-5 flex flex-col items-center justify-center rounded-md border-2 border-transparent bg-theme-accent px-4 py-2 text-theme-text transition duration-100 hover:border-current"
            onClick={this.props.onUpClick ?? (() => {})}
          >
            <i class="bi-chevron-compact-up text-[24px] text-inherit" />
          </Button>
        </div>
      </div>
    );
  }
}
