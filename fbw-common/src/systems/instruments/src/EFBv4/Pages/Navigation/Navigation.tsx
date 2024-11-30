import { DisplayComponent, FSComponent, MappedSubject, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';
import { Selector } from '../../Components/Selector';
import { Pages, Switch, SwitchIf } from '../Pages';
import { PageEnum } from '../../Shared/common';
import { NavigraphKeys } from '@shared/navigraph';
import { twMerge } from 'tailwind-merge';
import { List } from '../../Components/List';
import { ChartProvider, FlypadChart } from './ChartProvider';
import { Button } from '../../Components/Button';
import { NavigationState, NavigraphAuthState, SimbriefState } from '../../State/NavigationState';
import { AbstractUIView } from '../../Shared';
import { NavigraphUI } from './Providers/Navigraph';

export interface NavigationProps {
  simbriefState: SimbriefState;

  navigationState: NavigationState;

  navigraphState: NavigraphAuthState;
}

export class Navigation extends DisplayComponent<NavigationProps> {
  private readonly activePage = Subject.create(PageEnum.NavigationPage.Navigraph);

  private readonly tabs: Pages = [
    [PageEnum.NavigationPage.Navigraph, <>{t('NavigationAndCharts.Navigraph.Title')}</>],
    [PageEnum.NavigationPage.LocalFiles, <>{t('NavigationAndCharts.LocalFiles.Title')}</>],
    [PageEnum.NavigationPage.PinnedCharts, <>{t('NavigationAndCharts.PinnedCharts.Title')}</>],
  ];

  render(): VNode {
    return (
      <div class="h-full">
        <div class="flex items-start justify-between">
          <PageTitle>{t('NavigationAndCharts.Title')}</PageTitle>
          <Selector tabs={this.tabs} activePage={this.activePage} />
        </div>
        <Switch
          activePage={this.activePage}
          pages={[
            [
              PageEnum.NavigationPage.Navigraph,
              <NavigraphPage
                simbriefState={this.props.simbriefState}
                navigationState={this.props.navigationState}
                navigraphState={this.props.navigraphState}
              />,
            ],
            [PageEnum.NavigationPage.LocalFiles, <span />],
            [PageEnum.NavigationPage.PinnedCharts, <span />],
          ]}
        />
      </div>
    );
  }
}

export interface NavigraphPageProps {
  simbriefState: SimbriefState;

  navigationState: NavigationState;

  navigraphState: NavigraphAuthState;
}

export class NavigraphPage extends DisplayComponent<NavigraphPageProps> {
  render(): VNode | null {
    return (
      <NavigraphUI
        simbriefState={this.props.simbriefState}
        navigationState={this.props.navigationState}
        navigraphState={this.props.navigraphState}
      />
    );
  }
}

export class NavigraphAuthWrapper extends DisplayComponent<any> {
  render(): VNode | null {
    return NavigraphKeys.hasSufficientEnv ? (
      <>{this.props.children}</>
    ) : (
      <div class="mr-4 flex h-content-section-reduced w-full items-center justify-center overflow-x-hidden">
        <p class="mb-6 pt-6 text-3xl">{t('NavigationAndCharts.Navigraph.InsufficientEnv')}</p>
      </div>
    );
  }
}

export interface NavigraphUIProps {
  simbriefState: SimbriefState;

  navigationState: NavigationState;

  navigraphState: NavigraphAuthState;
}

interface ChartSelectorProps<C extends string | number> {
  provider: ChartProvider<C>;

  navigraphState: NavigraphAuthState;

  navigationState: NavigationState;

  selectedCategory: Subscribable<PageEnum.ChartCategory>;
}

export class ChartSelector<C extends string | number> extends AbstractUIView<ChartSelectorProps<C>> {
  private readonly charts = Subject.create<FlypadChart[]>([]);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      MappedSubject.create(
        async ([selectedCategory]) => {
          const filteredCharts =
            this.props.navigationState.displayedCharts.get()[
              this.props.provider.getCategoryForTab(selectedCategory).toString().toUpperCase()
            ];

          if (filteredCharts) {
            this.charts.set(filteredCharts);
          }
        },
        this.props.selectedCategory,
        this.props.navigationState.displayedCharts,
      ),
    );
  }

  render(): VNode | null {
    return (
      <List
        ref={this.rootRef}
        class="space-y-4"
        items={this.charts}
        render={(chart, index, subscriptionsForItem) => {
          const pinned = Subject.create(false);

          subscriptionsForItem.push(
            this.props.navigationState.pinnedCharts.sub(
              (index, type, item, array) => pinned.set(array.some((it) => it.id === chart.id)),
              true,
            ),
          );

          return (
            <ChartCard
              chart={chart}
              isPinned={pinned}
              isSelected={Subject.create(false)}
              onSelected={() => this.props.navigationState.setSelectedChart(chart)}
              onPinnedToggle={() => this.props.navigationState.toggleChartPinned(chart)}
            />
          );
        }}
      />
    );
  }
}

interface ChartCardProps {
  chart: FlypadChart;

  isPinned: Subscribable<boolean>;

  isSelected: Subscribable<boolean>;

  onPinnedToggle: () => void;

  onSelected: () => void;
}

class ChartCard extends AbstractUIView<ChartCardProps> {
  private ref = FSComponent.createRef<HTMLDivElement>();

  private readonly className = this.props.isSelected.map((selected) => {
    return twMerge(`h-full w-2 transition duration-100`, selected ? 'bg-theme-highlight' : 'bg-theme-secondary');
  });

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(this.className);

    this.ref.instance.addEventListener('click', () => this.props.onSelected());
  }

  render(): VNode | null {
    return (
      <div ref={this.ref} class="flex w-full flex-row overflow-hidden rounded-md bg-theme-accent">
        <div class="flex flex-row items-center">
          <div class={this.className} />
          <Button
            unstyled
            class="flex h-full items-center bg-transparent px-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
            onClick={this.props.onPinnedToggle}
          >
            <SwitchIf
              condition={this.props.isPinned}
              on={
                <span class="flex h-full items-center justify-center">
                  <i class="bi-pin-fill text-[40px] text-inherit" />
                </span>
              }
              off={
                <span class="flex h-full items-center justify-center">
                  <i class="bi-pin text-[40px] text-inherit" />
                </span>
              }
            />
            {/*)}*/}
          </Button>
        </div>
        <div class="m-2 flex flex-col">
          <span>{this.props.chart.name || 'BRUH'}</span>
          <span class="mr-auto rounded-sm bg-theme-secondary px-2 text-sm text-theme-text">
            {this.props.chart.indexNumber}
          </span>
        </div>
      </div>
    );
  }
}
