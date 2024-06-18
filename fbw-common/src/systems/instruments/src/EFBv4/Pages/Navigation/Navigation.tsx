import { DisplayComponent, FSComponent, MappedSubject, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';
import { Selector } from '../../Components/Selector';
import { NavigationState, NavigraphAuthState, Pages, SimbriefState, Switch, SwitchIf, SwitchOn } from '../Pages';
import { PageEnum } from '../../shared/common';
import { NavigraphClient } from '@shared/navigraph';
import { SimpleInput } from '../../Components/SimpleInput';
import { ScrollableContainer } from '../Dashboard/Dashboard';
import { twMerge } from 'tailwind-merge';
import { List } from '../../Components/List';
import { Chart, ChartCategory } from 'navigraph/charts';
import { navigraphCharts } from '../../../navigraph';
import { ChartViewer } from './Components/ChartViewer';

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
        <div class="flex justify-between">
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
      <NavigraphAuthWrapper>
        <NavigraphUI
          simbriefState={this.props.simbriefState}
          navigationState={this.props.navigationState}
          navigraphState={this.props.navigraphState}
        />
      </NavigraphAuthWrapper>
    );
  }
}

export class NavigraphAuthWrapper extends DisplayComponent<any> {
  render(): VNode | null {
    return NavigraphClient.hasSufficientEnv ? (
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

export class NavigraphUI extends DisplayComponent<NavigraphUIProps> {
  private readonly isFullscreen = Subject.create(false);
  private readonly selectedAirport = Subject.create('');
  private readonly selectedCategory = Subject.create(PageEnum.ChartCategory.Star);

  private handleIcaoChange = () => {};

  private readonly class = MappedSubject.create(([simbriefDataLoaded]) => {
    let rounding = '';
    if (simbriefDataLoaded) {
      rounding = 'rounded-r-none';
    }

    return twMerge(`w-full shrink uppercase`, rounding);
  }, this.props.simbriefState.simbriefOfpLoaded);

  render(): VNode | null {
    return (
      <div class="flex h-full">
        <SwitchOn
          condition={this.isFullscreen.map((value) => !value)}
          on={
            <div class="shrink-0" style={{ width: '450px' }}>
              <div class="flex flex-row items-center justify-center">
                <SimpleInput
                  containerClass="w-full"
                  placeholder="ICAO"
                  value={this.selectedAirport}
                  maxLength={4}
                  class={this.class}
                  onChange={this.handleIcaoChange}
                />

                <SwitchOn
                  condition={this.props.simbriefState.simbriefOfpLoaded}
                  on={
                    <Selector
                      innerClass="rounded-l-none"
                      activeClass="bg-theme-highlight text-theme-body"
                      tabs={[
                        [
                          PageEnum.SimbriefAirport.From,
                          <p class="uppercase text-inherit">{t('NavigationAndCharts.From')}</p>,
                        ],
                        [
                          PageEnum.SimbriefAirport.To,
                          <p class="uppercase text-inherit">{t('NavigationAndCharts.To')}</p>,
                        ],
                        [
                          PageEnum.SimbriefAirport.Alternate,
                          <p class="uppercase text-inherit">{t('NavigationAndCharts.Altn')}</p>,
                        ],
                      ]}
                      activePage={Subject.create(0)}
                    />
                  }
                />
              </div>

              <div class="flex h-11 w-full flex-row items-center">
                <i class="bi-arrow-return-right text-[26px] text-inherit" />
                <div class="block w-full overflow-hidden whitespace-nowrap px-4" style={{ textOverflow: 'ellipsis' }}>
                  {/*getStatusBarText()*/}
                </div>
              </div>

              <div class="mt-6">
                <Selector
                  activeClass="bg-theme-highlight text-theme-body"
                  tabs={[
                    [PageEnum.ChartCategory.Star, <p class="text-inherit">STAR</p>],
                    [PageEnum.ChartCategory.App, <p class="text-inherit">APP</p>],
                    [PageEnum.ChartCategory.Taxi, <p class="text-inherit">TAXI</p>],
                    [PageEnum.ChartCategory.Sid, <p class="text-inherit">SID</p>],
                    [PageEnum.ChartCategory.Ref, <p class="text-inherit">REF</p>],
                  ]}
                  activePage={this.selectedCategory}
                />
                <ScrollableContainer class="mt-5" height={42.75}>
                  <NavigraphChartSelector
                    navigraphState={this.props.navigraphState}
                    navigationState={this.props.navigationState}
                    selectedCategory={this.selectedCategory}
                  />
                </ScrollableContainer>
              </div>
            </div>
          }
        />

        <ChartViewer shownChart={this.props.navigationState.selectedChart} />
      </div>
    );
  }
}

interface NavigraphChartSelectorProps {
  navigraphState: NavigraphAuthState;

  navigationState: NavigationState;

  selectedCategory: Subscribable<PageEnum.ChartCategory>;
}

const UIChartCategoryToNavigraphChartCategory: Record<PageEnum.ChartCategory, ChartCategory> = {
  [PageEnum.ChartCategory.Star]: 'ARR',
  [PageEnum.ChartCategory.App]: 'APP',
  [PageEnum.ChartCategory.Sid]: 'DEP',
  [PageEnum.ChartCategory.Ref]: 'REF',
  [PageEnum.ChartCategory.Taxi]: 'APT',
};

class NavigraphChartSelector extends DisplayComponent<NavigraphChartSelectorProps> {
  private readonly charts = Subject.create<Chart[]>([]);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    MappedSubject.create(
      async ([user, selectedCategory]) => {
        if (!user) {
          this.charts.set([]);
          return;
        }

        const charts = await navigraphCharts.getChartsIndex({ icao: 'RKSI' });

        if (!charts) {
          this.charts.set([]);
          return;
        }

        const filteredCharts = charts.filter(
          (it) => it.category === UIChartCategoryToNavigraphChartCategory[selectedCategory],
        );

        this.charts.set(filteredCharts);
      },
      this.props.navigraphState.user,
      this.props.selectedCategory,
    );
  }

  render(): VNode | null {
    return (
      <List
        class="space-y-4"
        items={this.charts}
        render={(chart) => (
          <ChartCard
            chart={chart}
            isPinned={Subject.create(true)}
            isSelected={Subject.create(false)}
            onSelected={() => this.props.navigationState.setSelectedChart(chart)}
          />
        )}
      />
    );
  }
}

interface ChartCardProps {
  chart: Chart;

  isPinned: Subscribable<boolean>;

  isSelected: Subscribable<boolean>;

  onSelected: () => void;
}

class ChartCard extends DisplayComponent<ChartCardProps> {
  private ref = FSComponent.createRef<HTMLDivElement>();

  private readonly className = this.props.isSelected.map((selected) => {
    return twMerge(`h-full w-2 transition duration-100`, selected ? 'bg-theme-highlight' : 'bg-theme-secondary');
  });

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.ref.instance.addEventListener('click', () => this.props.onSelected());
  }

  render(): VNode | null {
    return (
      <div
        ref={this.ref}
        class="flex w-full flex-row overflow-hidden rounded-md bg-theme-accent"
        // onClick={() => handleChartClick(chart)}
      >
        <div class="flex flex-row items-center">
          <div class={this.className} />
          <div
            class="flex h-full items-center px-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
            // onClick={(event) => {
            //   event.stopPropagation();
            //
            //   if (isChartPinned(chart.id)) {
            //     dispatch(removedPinnedChart({ chartId: chart.id }));
            //   } else {
            //     dispatch(
            //       addPinnedChart({
            //         chartId: chart.id,
            //         chartName: { light: chart.fileDay, dark: chart.fileNight },
            //         title: searchQuery,
            //         subTitle: chart.procedureIdentifier,
            //         tabIndex: selectedTabIndex,
            //         timeAccessed: 0,
            //         tag: selectedTab.name,
            //         provider: ChartProvider.NAVIGRAPH,
            //         pagesViewable: 1,
            //         boundingBox: chart.boundingBox,
            //         pageIndex: navigationTabs.findIndex((tab) => tab.associatedTab === NavigationTab.NAVIGRAPH),
            //       }),
            //     );
            //   }
            // }}
          >
            {/*{pinnedCharts.some((pinnedChart) => pinnedChart.chartId === chart.id) ? (*/}
            {/*  <PinFill size={40} />*/}
            {/*) : (*/}
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
          </div>
        </div>
        <div class="m-2 flex flex-col">
          <span>{this.props.chart.name || 'BRUH'}</span>
          <span class="mr-auto rounded-sm bg-theme-secondary px-2 text-sm text-theme-text">
            {this.props.chart.index_number}
          </span>
        </div>
      </div>
    );
  }
}
