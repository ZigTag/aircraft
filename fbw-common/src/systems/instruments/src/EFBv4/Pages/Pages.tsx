import { ComponentProps, DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
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
import { UIVIew, UIVIewUtils } from '../shared/UIVIew';

// Page should be an enum
export type Pages = [page: number, component: VNode][];

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
    return <Switch pages={this.pages} activePage={this.props.activePage} class="mt-10  pr-6 pt-4" />;
  }
}

interface SwitchProps extends ComponentProps {
  activePage: Subscribable<number>;
  pages: Pages;
  class?: string;
}

export class Switch extends DisplayComponent<SwitchProps> {
  private readonly pageVisibility = (page: number) => this.props.activePage.map((value) => value === page);

  render(): VNode {
    return (
      <div ref={this.props.ref} class={`h-full w-full ${this.props.class}`}>
        {this.props.pages.map(([page, component]) =>
          UIVIewUtils.isUIVIew(component.instance) ? (
            // TODO we need to also destroy those views when this is destroyed!
            <UIVIewWrapper view={component} isVisible={this.pageVisibility(page)} />
          ) : (
            <PageWrapper isVisible={this.pageVisibility(page)}>{component}</PageWrapper>
          ),
        )}
      </div>
    );
  }
}

interface PageWrapperProps extends ComponentProps {
  isVisible: Subscribable<Boolean>;
}

export class PageWrapper extends DisplayComponent<PageWrapperProps> {
  render(): VNode {
    return (
      <div
        style={{
          display: this.props.isVisible.map((value) => (value ? 'block' : 'none')),
          width: '100%',
          height: '100%',
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

interface UIVIewWrapperProps {
  view: VNode;

  isVisible: Subscribable<boolean>;
}

class UIVIewWrapper extends DisplayComponent<UIVIewWrapperProps> {
  private get view(): UIVIew {
    return this.props.view.instance as unknown as UIVIew;
  }

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.props.isVisible.sub((visible) => {
      this.view.rootRef.instance.classList.toggle('view-hidden', !visible);

      if (!visible) {
        this.view.pause();
      } else {
        this.view.resume();
      }
    }, true);
  }

  destroy() {
    this.view.destroy();
  }

  render(): VNode | null {
    return this.props.view;
  }
}
