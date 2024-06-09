import {
  ComponentProps,
  DisplayComponent,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
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

// Page should be an enum
export type Pages = readonly [page: number, component: VNode][];

interface MainPageProps extends ComponentProps {
  activePage: Subject<number>;
}

export class MainPage extends DisplayComponent<MainPageProps> {
  private readonly pages: Pages = [
    [PageEnum.MainPage.Dashboard, <Dashboard />],
    [PageEnum.MainPage.Dispatch, <Dispatch />],
    [PageEnum.MainPage.Ground, <Ground />],
    [PageEnum.MainPage.Performance, <Performance />],
    [PageEnum.MainPage.Navigation, <Navigation />],
    [PageEnum.MainPage.ATC, <ATC />],
    [PageEnum.MainPage.Failures, <Failures />],
    [PageEnum.MainPage.Checklists, <Checklists />],
    [PageEnum.MainPage.Presets, <Presets />],
    [PageEnum.MainPage.Settings, <Settings />],
  ];

  render(): VNode {
    return <Switch pages={this.pages} activePage={this.props.activePage} class="mt-10 pr-6 pt-4" />;
  }
}

interface SwitchProps extends ComponentProps {
  activePage: Subscribable<number>;
  pages: Pages;
  class?: string;
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

  render(): VNode {
    return (
      <div ref={this.props.ref} class={`h-full w-full ${this.props.class}`}>
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
