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
    this.client.getSimbriefOfp().then((r) => this._ofp.set(simbriefDataParser(r)));
  }
}

export class NavigationState {
  private readonly _selectedChart = Subject.create<Chart | null>(null);

  public readonly selectedChart: Subscribable<Chart | null> = this._selectedChart;
  public setSelectedChart(chart: Chart): void {
    this._selectedChart.set(chart);
  }

  public readonly selectedChartImage = Subject.create<Blob | null>(null);

  constructor() {
    this.selectedChart.sub(async (chart) => {
      if (!chart) {
        return;
      }

      const blob = await navigraphCharts.getChartImage({ chart: chart, theme: 'dark' });

      if (!blob) {
        return;
      }

      this.selectedChartImage.set(blob);
    });
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
  private navigationState = new NavigationState();

  private simbriefState = new SimbriefState(this.props.flypadClient);

  private readonly navigraphAuthState = new NavigraphAuthState();

  private readonly pages: Pages = [
    [PageEnum.MainPage.Dashboard, <Dashboard simbriefState={this.simbriefState} />],
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
    return <Switch pages={this.pages} activePage={this.props.activePage} class="mt-10 pr-6 pt-4" />;
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
      if (child === this.vnode || child.instance instanceof HTMLElement) {
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
      return twMerge('h-full w-full', propClass);
    },
    SubscribableUtils.toSubscribable(this.props.class, true),
  );

  render(): VNode {
    return (
      <div ref={this.props.ref ?? this.rootRef} class={this.class}>
        {this.props.pages.map(([page, component]) =>
          UIVIewUtils.isUIVIew(component.instance) ? (
            <UIVIewWrapper index={page} view={component} isVisible={this.pageVisibility(page)} />
          ) : (
            <PageWrapper index={page} isVisible={this.pageVisibility(page)}>
              {component}
            </PageWrapper>
          ),
        )}
      </div>
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
}

export class PageWrapper extends DisplayComponent<PageWrapperProps> implements SwitchChild {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  get index() {
    return this.props.index;
  }

  show() {
    this.rootRef.instance.classList.toggle('view-hidden', false);
  }

  hide() {
    this.rootRef.instance.classList.toggle('view-hidden', true);
  }

  render(): VNode {
    return (
      <div
        ref={this.rootRef}
        class="view-hidden"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {this.props.children}
      </div>
    );
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
    this.view.rootRef.instance.classList.toggle('view-hidden', false);
    this.view.resume();
  }

  hide() {
    this.view.rootRef.instance.classList.toggle('view-hidden', true);
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
