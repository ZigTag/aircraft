import { DisplayComponent, FSComponent, MappedSubject, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';
import { Selector } from '../../Components/Selector';
import { Pages, Switch, SwitchIf, SwitchOn } from '../Pages';
import { PageEnum } from '../../Shared/common';
import { NavigraphKeys } from '@shared/navigraph';
import { SimpleInput } from '../../Components/SimpleInput';
import { ScrollableContainer } from '../../Components/ScrollableContainer';
import { twMerge } from 'tailwind-merge';
import { List } from '../../Components/List';
import { ChartCategory } from 'navigraph/charts';
import { ChartViewer } from './Components/ChartViewer';
import { NavigraphChartProvider } from './Providers/NavigraphChartProvider';
import { ChartProvider, FlypadChart } from './ChartProvider';
import { Button } from '../../Components/Button';
import { NavigationState, NavigraphAuthState, SimbriefState } from '../../State/NavigationState';

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

export class NavigraphUI extends DisplayComponent<NavigraphUIProps> {
  private readonly isFullscreen = Subject.create(false);

  private readonly selectedAirport = Subject.create('');

  private readonly selectedCategory = Subject.create(PageEnum.ChartCategory.Star);

  private readonly selectedCategoryAsNavigraphChartCategory: Subscribable<ChartCategory> = this.selectedCategory.map(
    (it) => {
      switch (it) {
        case PageEnum.ChartCategory.Star:
          return 'ARR';
        case PageEnum.ChartCategory.App:
          return 'APP';
        case PageEnum.ChartCategory.Sid:
          return 'DEP';
        case PageEnum.ChartCategory.Taxi:
          return 'APT';
        case PageEnum.ChartCategory.Ref:
          return 'REF';
      }
    },
  );

  private provider = new NavigraphChartProvider(this.props.navigraphState);

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
      <div class="flex h-full items-stretch">
        <div class="w-0"></div>

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
                    // TODO those should somehow be dynamically generated
                    [PageEnum.ChartCategory.Star, <p class="text-inherit">STAR</p>],
                    [PageEnum.ChartCategory.App, <p class="text-inherit">APP</p>],
                    [PageEnum.ChartCategory.Taxi, <p class="text-inherit">TAXI</p>],
                    [PageEnum.ChartCategory.Sid, <p class="text-inherit">SID</p>],
                    [PageEnum.ChartCategory.Ref, <p class="text-inherit">REF</p>],
                  ]}
                  activePage={this.selectedCategory}
                />
                <ScrollableContainer class="mt-5" height={42.75}>
                  <ChartSelector
                    provider={this.provider}
                    navigraphState={this.props.navigraphState}
                    navigationState={this.props.navigationState}
                    selectedCategory={this.selectedCategoryAsNavigraphChartCategory}
                  />
                </ScrollableContainer>
              </div>
            </div>
          }
        />

        <ChartViewer
          provider={this.provider}
          shownChartID={this.props.navigationState.selectedChart.map((it) => it?.id ?? null)}
          isFullscreen={this.isFullscreen}
          onToggleFullscreen={() => this.isFullscreen.set(!this.isFullscreen.get())}
        />
      </div>
    );
  }
}

interface ChartSelectorProps<C extends string | number> {
  provider: ChartProvider<C>;

  navigraphState: NavigraphAuthState;

  navigationState: NavigationState;

  selectedCategory: Subscribable<C>;
}

class ChartSelector<C extends string | number> extends DisplayComponent<ChartSelectorProps<C>> {
  private readonly charts = Subject.create<FlypadChart[]>([]);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    MappedSubject.create(
      async ([user, selectedCategory]) => {
        if (!user) {
          this.charts.set([]);
          return;
        }

        const airportCharts = await this.props.provider.getChartsForAirport('RKSI');

        const filteredCharts = airportCharts.charts[selectedCategory];

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
