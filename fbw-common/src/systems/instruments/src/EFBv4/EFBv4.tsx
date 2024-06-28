import {
  ComponentProps,
  DisplayComponent,
  EventBus,
  FSComponent,
  RenderPosition,
  Subject,
  VNode,
} from '@microsoft/msfs-sdk';

import { busContext } from './Contexts/EventBusContext';
import { flypadClientContext, initializeFlypadClientContext } from './Contexts/FlypadClientContext';

import { Navbar } from './Components/Navbar';
import { PageEnum } from './shared/common';
import { MainPage } from './Pages/Pages';
import { Statusbar } from './Components/Statusbar';
import { FlypadClient } from '../../../shared/src/flypad-server/FlypadClient';

import './style.scss';
import './Assets/Theme.css';
import './Assets/Slider.scss';
import './Assets/bi-icons.css';

import { FbwUserSettings, FbwUserSettingsSaveManager, FlypadTheme } from './FbwUserSettings';
import { EFB_EVENT_BUS } from './EfbV4FsInstrument';
import { Tooltip } from './Components/TooltipWrapper';
import { FlypadControlEvents } from './FlypadControlEvents';
import { LocalizedString } from './shared/translation';
import { Modal, ModalContainer } from './Components/Modal';

interface EfbProps extends ComponentProps {}

export class EFBv4 extends DisplayComponent<EfbProps, [EventBus]> {
  public override contextType = [busContext] as const;

  private readonly renderRoot = FSComponent.createRef<HTMLDivElement>();

  private readonly renderRoot2 = FSComponent.createRef<HTMLDivElement>();

  private readonly currentPage = Subject.create(PageEnum.MainPage.Dashboard);

  private readonly isCharging = Subject.create(false);

  private readonly batteryLevel = Subject.create(100);

  private get bus() {
    return this.getContext(busContext).get();
  }

  onAfterRender(_node: VNode): void {
    // Load user settings
    const settingsSaveManager = new FbwUserSettingsSaveManager(this.bus);

    const saveKey = `fbw.${process.env.AIRCRAFT_PROJECT_PREFIX}.profile.default`;

    settingsSaveManager.load(saveKey);
    settingsSaveManager.startAutoSave(saveKey);
    settingsSaveManager.tryPortLegacyA32NXSettings();

    const flypadClient = new FlypadClient(this.bus);

    initializeFlypadClientContext(flypadClient);

    flypadClient.initialized.on((it) => it.sendHelloWorld());

    const theme = FbwUserSettings.getManager(EFB_EVENT_BUS)
      .getSetting('fbwEfbTheme')
      .map((theme) => {
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

    const targetIDSubject = Subject.create<string | null>(null);
    const shownSubject = Subject.create(false);
    const textSubject = LocalizedString.create('');

    let timeout: ReturnType<typeof setTimeout> | null = null;

    EFB_EVENT_BUS.getSubscriber<FlypadControlEvents>()
      .on('set_tooltip')
      .handle(({ id, shown, text }) => {
        if (!shown) {
          shownSubject.set(false);
        }

        if (shown) {
          textSubject.set(text);
        }

        if (timeout !== null) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
          shownSubject.set(shown);
          targetIDSubject.set(id);
        }, 250);
      });

    const modalSubject = Subject.create<Modal | null>(null);

    EFB_EVENT_BUS.getSubscriber<FlypadControlEvents>()
      .on('show_modal')
      .handle((modal) => modalSubject.set(modal));
    EFB_EVENT_BUS.getSubscriber<FlypadControlEvents>()
      .on('pop_modal')
      .handle(() => {
        modalSubject.set(null);
      });

    FSComponent.render(
      <flypadClientContext.Provider value={flypadClient}>
        <ModalContainer modal={modalSubject} />
        <div ref={this.renderRoot2} class="flex w-full flex-col items-stretch" />
        <Tooltip id={targetIDSubject} shown={shownSubject}>
          {textSubject}
        </Tooltip>
      </flypadClientContext.Provider>,
      this.renderRoot.instance,
    );

    FSComponent.render(
      <>
        <Statusbar batteryLevel={this.batteryLevel} isCharging={this.isCharging} />
        <div class="flex grow items-stretch">
          <Navbar activePage={this.currentPage} />
          <MainPage activePage={this.currentPage} flypadClient={flypadClient} />
        </div>
      </>,
      this.renderRoot2.instance,
      RenderPosition.In,
    );
  }

  render(): VNode {
    return (
      <div class="h-screen w-screen bg-theme-body">
        <div ref={this.renderRoot} class="flex size-full flex-row" />
      </div>
    );
  }
}
