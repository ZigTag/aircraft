import {
  ComponentProps,
  DisplayComponent,
  EventBus,
  FSComponent,
  HEvent,
  RenderPosition,
  Subject,
  VNode,
} from '@microsoft/msfs-sdk';

import { busContext } from './Contexts/EventBusContext';
import { flypadClientContext, initializeFlypadClientContext } from './Contexts/FlypadClientContext';

import { Navbar } from './Components/Navbar';
import { PageEnum } from './Shared/common';
import { MainPage } from './Pages/Pages';
import { Statusbar } from './Components/Statusbar';
import { FlypadClient } from '../../../shared/src/flypad-server/FlypadClient';

import './style.scss';
import './Assets/Theme.css';
import './Assets/Slider.scss';
import './Assets/bi-icons.css';

import { FbwUserSettings, FbwUserSettingsSaveManager, FlypadTheme } from './FbwUserSettings';
import { EFB_EVENT_BUS } from './EfbV4FsInstrument';
import { TooltipContainer } from './Components/Tooltip';
import { ModalContainer } from './Components/Modal';
import { EFBSimvars } from './EFBSimvarPublisher';
import { PowerManager, PowerStates } from './Power';
import { Button } from 'instruments/src/EFBv4/Components/Button';

import { FbwLogo } from './Assets/FbwLogo';
import { NotificationContainer } from './Components/Notification';
import { EfbV4FsInstrumentAircraftSpecificData } from './EfbV4FsInstrumentAircraftSpecificData';

interface EfbProps extends ComponentProps {
  aircraftSpecificData: EfbV4FsInstrumentAircraftSpecificData;
}

// Disables power state for dev stuff
const disableStartup = process.env.DISABLE_EFB_STARTUP;

export class EFBv4 extends DisplayComponent<EfbProps, [EventBus]> {
  public override contextType = [busContext] as const;

  private readonly renderRoot = FSComponent.createRef<HTMLDivElement>();

  private readonly renderRoot2 = FSComponent.createRef<HTMLDivElement>();

  private readonly currentPage = Subject.create(PageEnum.MainPage.Dashboard);

  private get bus() {
    return this.getContext(busContext).get();
  }

  private settings = FbwUserSettings.getManager(
    EFB_EVENT_BUS,
    this.props.aircraftSpecificData.defaultAutoCalloutsSettingValue,
  );

  onAfterRender(_node: VNode): void {
    // Load user settings
    const settingsSaveManager = new FbwUserSettingsSaveManager(this.bus, this.settings);

    const saveKey = `fbw.${process.env.AIRCRAFT_PROJECT_PREFIX}.profile.default`;

    settingsSaveManager.load(saveKey);
    settingsSaveManager.startAutoSave(saveKey);
    settingsSaveManager.tryPortLegacyA32NXSettings();

    const flypadClient = new FlypadClient(this.bus);

    initializeFlypadClientContext(flypadClient);

    flypadClient.initialized.on((it) => it.sendHelloWorld());

    const theme = this.settings.getSetting('fbwEfbTheme').map((theme) => {
      switch (theme) {
        case FlypadTheme.Light:
          return 'light';
        case FlypadTheme.Dark:
          return 'dark';
        default:
          return 'blue';
      }
    });

    document.documentElement.classList.add(`theme-${theme.get()}`, 'animationsEnabled');

    // FIXME seems like the power manager needs to be initialized here in this method... bus is probably not ready to use yet
    const powerManager = new PowerManager(
      this.bus.getSubscriber<EFBSimvars>(),
      this.settings.getSetting('fbwEfbBatteryLifeEnabled'),
    );

    const getComponentFromPowerState = (powerState: PowerStates): VNode => {
      switch (powerState) {
        case PowerStates.SHUTOFF:
        case PowerStates.STANDBY:
          return <Button unstyled class="h-screen w-screen bg-black" onClick={() => powerManager.offToLoaded()} />;
        case PowerStates.LOADING:
        case PowerStates.SHUTDOWN:
          return (
            <div class="flex h-screen w-screen items-center justify-center bg-theme-body">
              <FbwLogo width={128} height={120} class="text-theme-text" />
            </div>
          );
        case PowerStates.EMPTY:
          return (
            <div class="flex h-screen w-screen items-center justify-center bg-black">
              <i class="bi-battery text-[128px] text-utility-red" />
            </div>
          );
        case PowerStates.LOADED:
          return (
            <>
              <Statusbar
                settings={this.settings}
                batteryLevel={powerManager.batteryCharge}
                isCharging={powerManager.isBatteryCharging}
              />
              <div class="flex grow items-stretch">
                <Navbar activePage={this.currentPage} />
                <MainPage
                  settings={this.settings}
                  settingsPages={this.props.aircraftSpecificData.settingsPages}
                  activePage={this.currentPage}
                  flypadClient={flypadClient}
                  renderAutomaticCalloutsPage={this.props.aircraftSpecificData.renderAutomaticCalloutsPage}
                  performanceCalculators={this.props.aircraftSpecificData.performanceCalculators}
                />
              </div>
              <TooltipContainer />
              <NotificationContainer />
              <ModalContainer />
            </>
          );
      }
    };

    this.bus
      .getSubscriber<HEvent>()
      .on('hEvent')
      .handle((eventName) => {
        if (eventName === 'A32NX_EFB_POWER') {
          powerManager.handlePowerButtonPress();
        }
      });

    FSComponent.render(
      <flypadClientContext.Provider value={flypadClient}>
        <div ref={this.renderRoot2} class="flex w-full flex-col items-stretch" />
      </flypadClientContext.Provider>,
      this.renderRoot.instance,
    );

    powerManager.power.sub((powerState) => {
      this.renderRoot2.instance.innerHTML = '';

      FSComponent.render(
        disableStartup ? getComponentFromPowerState(PowerStates.LOADED) : getComponentFromPowerState(powerState),
        this.renderRoot2.instance,
        RenderPosition.In,
      );
    }, true);
  }

  render(): VNode {
    return (
      <div class="h-screen w-screen bg-theme-body">
        <div ref={this.renderRoot} class="flex size-full flex-row" />
      </div>
    );
  }
}
