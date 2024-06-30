import {
  ComponentProps,
  DisplayComponent,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
  SubscribableUtils,
  VNode,
} from '@microsoft/msfs-sdk';
import { PageEnum } from '../shared/common';
import { Dashboard } from './Dashboard/Dashboard';
import { Dispatch } from './Dispatch/Dispatch';
import { Ground } from './Ground/Ground';
import { Performance } from './Performance/Performance';
import { Navigation } from './Navigation/Navigation';
import { ATC } from './ATC/ATC';
import { Failures } from './Failures/Failures';
import { Checklists } from './Checklists/Checklists';
import { Presets } from './Presets/Presets';
import { Settings } from './Settings/Settings';
import { AbstractUIView, UIVIew, UIVIewUtils } from '../shared/UIView';
import { twMerge } from 'tailwind-merge';
import { ISimbriefData, simbriefDataParser } from '../../EFB/Apis/Simbrief';
import { FlypadClient } from '@shared/flypad-server/FlypadClient';
import { DeviceFlowParams, User } from 'navigraph/auth';
import { navigraphAuth, navigraphCharts } from '../../navigraph';
import { Chart } from 'navigraph/charts';
import { FbwUserSettings } from '../FbwUserSettings';
import { EFB_EVENT_BUS } from '../EfbV4FsInstrument';
import { FlypadChart } from './Navigation/ChartProvider';

// Page should be an enum
export type Pages = readonly [page: number, component: VNode][];

interface MainPageProps extends ComponentProps {
  activePage: Subject<number>;
  flypadClient: FlypadClient;
}

export class SimbriefState {
  constructor(private readonly client: FlypadClient) {}
  private readonly _ofp = Subject.create<ISimbriefData | null>(null);

  public readonly ofpScroll = Subject.create(0);

  public readonly ofp: Subscribable<ISimbriefData | null> = this._ofp;

  public readonly simbriefOfpLoaded = this.ofp.map((value) => !!value);

  public importOfp(username: string) {
    this.client.getSimbriefOfp(username).then((r) => this._ofp.set(simbriefDataParser(r)));
  }
}

export class NavigationState {
  private readonly _selectedChart = Subject.create<FlypadChart | null>(null);

  public readonly selectedChart: Subscribable<FlypadChart | null> = this._selectedChart;
  public setSelectedChart(chart: FlypadChart): void {
    this._selectedChart.set(chart);
  }
}

export class NavigraphAuthState {
  private readonly _initialized = Subject.create(false);

  public readonly initialized: Subscribable<boolean> = this._initialized;

  private readonly _user = Subject.create<User | null>(null);

  public readonly user: Subscribable<User | null> = this._user;

  constructor() {
    navigraphAuth.onAuthStateChanged((user) => {
      this._initialized.set(true);
      this._user.set(user);
    });
  }

  public async login(deviceFlowParamsCallback: (params: DeviceFlowParams) => void): Promise<User> {
    return navigraphAuth.signInWithDeviceFlow(deviceFlowParamsCallback);
  }

  public async logout(): Promise<void> {
    return navigraphAuth.signOut();
  }
}

export class MainPage extends DisplayComponent<MainPageProps> {
  private _brightness = FbwUserSettings.getManager(EFB_EVENT_BUS)
    .getSetting('fbwEfbBrightness')
    .sub((val) => {
      SimVar.SetSimVarValue('L:A32NX_EFB_BRIGHTNESS', 'number', val);
    });

  private navigationState = new NavigationState();

  private simbriefState = new SimbriefState(this.props.flypadClient);

  private readonly navigraphAuthState = new NavigraphAuthState();

  private readonly pages: Pages = [
    [
      PageEnum.MainPage.Dashboard,
      <Dashboard simbriefState={this.simbriefState} navigraphAuthState={this.navigraphAuthState} />,
    ],
    [PageEnum.MainPage.Dispatch, <Dispatch simbriefState={this.simbriefState} />],
    [PageEnum.MainPage.Ground, <Ground />],
    [PageEnum.MainPage.Performance, <Performance />],
    [
      PageEnum.MainPage.Navigation,
      <Navigation
        simbriefState={this.simbriefState}
        navigationState={this.navigationState}
        navigraphState={this.navigraphAuthState}
      />,
    ],
    [PageEnum.MainPage.ATC, <ATC />],
    [PageEnum.MainPage.Failures, <Failures />],
    [PageEnum.MainPage.Checklists, <Checklists />],
    [PageEnum.MainPage.Presets, <Presets />],
    [PageEnum.MainPage.Settings, <Settings navigraphAuthState={this.navigraphAuthState} />],
  ];

  render(): VNode {
    return (
      <div class="h-full grow pr-6 pt-4">
        <Switch pages={this.pages} activePage={this.props.activePage} />
      </div>
    );
  }
}

interface SwitchProps extends ComponentProps {
  activePage: Subscribable<number>;
  pages: Pages;
  class?: string | Subscribable<string>;
}

export class Switch extends AbstractUIView<SwitchProps> {
  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.props.activePage.sub((activePage) => {
        this.forEachSwitchChild((switchChild) => {
          if (switchChild.index === activePage) {
            switchChild.show();
          } else {
            switchChild.hide();
          }
        });
      }, true),
    );
  }

  hide() {
    this.forEachSwitchChild((switchChild) => switchChild.hide());
  }

  show() {
    this.forEachSwitchChild((switchChild) => switchChild.show());
  }

  resume() {
    super.resume((child) => !(child instanceof UIVIewWrapper));

    this.forEachSwitchChild((switchChild) => {
      if (switchChild instanceof UIVIewWrapper && switchChild.index === this.props.activePage.get()) {
        switchChild.resume();
      }
    });
  }

  pause() {
    super.pause((child) => !(child instanceof UIVIewWrapper));

    this.forEachSwitchChild((switchChild) => {
      if (switchChild instanceof UIVIewWrapper && switchChild.index === this.props.activePage.get()) {
        switchChild.pause();
      }
    });
  }

  private forEachSwitchChild(func: (child: SwitchChild) => void) {
    if (!this.vnode) {
      return;
    }

    FSComponent.visitNodes(this.vnode, (child) => {
      if (child === this.vnode || child.instance instanceof HTMLElement || child.instance === null) {
        return false;
      }

      const switchChild = child.instance as unknown as SwitchChild;

      func(switchChild);

      return true;
    });
  }

  private readonly pageVisibility = (page: number) => {
    const subject = MappedSubject.create(
      ([activePage, isPaused]) => {
        if (isPaused) {
          return false;
        }

        return activePage === page;
      },
      this.props.activePage,
      this.isPaused,
    );

    this.subscriptions.push(subject);

    return subject;
  };

  private readonly class = MappedSubject.create(
    ([propClass]) => {
      return twMerge('', propClass);
    },
    SubscribableUtils.toSubscribable(this.props.class, true),
  );

  render(): VNode {
    return (
      <>
        {this.props.pages.map(([page, component]) =>
          UIVIewUtils.isUIVIew(component.instance) ? (
            <UIVIewWrapper index={page} view={component} isVisible={this.pageVisibility(page)} />
          ) : (
            <PageWrapper index={page} isVisible={this.pageVisibility(page)} node={component} />
          ),
        )}
      </>
    );
  }
}

interface SwitchChild {
  index: number;

  show(): void;

  hide(): void;
}

interface PageWrapperProps extends ComponentProps {
  index: number;

  isVisible: Subscribable<Boolean>;

  node: VNode;
}

export class PageWrapper extends DisplayComponent<PageWrapperProps> implements SwitchChild {
  get index() {
    return this.props.index;
  }

  private getVNodeDomNode(vnode: VNode): HTMLElement | SVGElement | null {
    if (vnode.instance instanceof HTMLElement || vnode.instance instanceof SVGElement) {
      return vnode.instance;
    }

    if (vnode.root && (vnode.root instanceof HTMLElement || vnode.root instanceof SVGElement)) {
      return vnode.root;
    }

    if (vnode.children && vnode.children.length > 0) {
      return this.getVNodeDomNode(vnode.children[0]);
    }

    return null;
  }

  show() {
    this.getVNodeDomNode(this.props.node)?.classList.toggle('view-hidden', false);
  }

  hide() {
    this.getVNodeDomNode(this.props.node)?.classList.toggle('view-hidden', true);
  }

  render(): VNode {
    return this.props.node;
  }
}

interface UIVIewWrapperProps extends ComponentProps {
  view: VNode;

  index: number;

  isVisible: Subscribable<boolean>;
}

class UIVIewWrapper extends AbstractUIView<UIVIewWrapperProps> implements SwitchChild {
  get index() {
    return this.props.index;
  }

  get view(): UIVIew {
    return this.props.view.instance as unknown as UIVIew;
  }

  show() {
    this.view.show();
    this.view.resume();
  }

  hide() {
    this.view.hide();
    this.view.pause();
  }

  resume() {
    if (this.props.isVisible.get()) {
      this.view.resume();
    }
  }

  pause() {
    this.view.pause();
  }

  destroy() {
    this.view.destroy();
  }

  render(): VNode | null {
    return this.props.view;
  }
}

export interface SwitchIfProps {
  class?: string;
  condition: Subscribable<boolean>;
  on: VNode;
  off: VNode;
}

export class SwitchIf extends AbstractUIView<SwitchIfProps> {
  render(): VNode | null {
    return (
      <Switch
        class={this.props.class}
        activePage={this.props.condition.map((value) => (value ? PageEnum.SwitchIf.True : PageEnum.SwitchIf.False))}
        pages={[
          [PageEnum.SwitchIf.False, this.props.off],
          [PageEnum.SwitchIf.True, this.props.on],
        ]}
      />
    );
  }
}

export interface SwitchOnProps {
  class?: string;
  condition: Subscribable<boolean>;
  on: VNode;
}

export class SwitchOn extends AbstractUIView<SwitchOnProps> {
  private readonly class = MappedSubject.create(([condition]) => {
    let classReturn = '';
    if (!condition) {
      classReturn = 'hidden';
    }

    return twMerge(classReturn, this.props.class ?? '');
  }, this.props.condition);

  render(): VNode | null {
    return (
      <Switch
        class={this.class}
        activePage={this.props.condition.map((value) => (value ? PageEnum.SwitchIf.True : PageEnum.SwitchIf.False))}
        pages={[
          [PageEnum.SwitchIf.False, <></>],
          [PageEnum.SwitchIf.True, this.props.on],
        ]}
      />
    );
  }
}
