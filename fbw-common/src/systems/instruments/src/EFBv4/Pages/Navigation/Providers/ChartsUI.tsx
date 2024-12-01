import { FSComponent, MappedSubject, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { AbstractUIView, PageEnum } from '../../../Shared';
import { twMerge } from 'tailwind-merge';
import { Switch, SwitchIf, SwitchOn } from '../../Pages';
import { ScrollableContainer, Selector, SimpleInput, t } from '../../../Components';
import { ChartViewer } from '../Components/ChartViewer';
import { ChartSelector } from '../Navigation';
import { LoadingSpinner } from '../../../Components/LoadingSpinner';
import { SimBridgeChartProvider } from './SimBridgeChartProvider';
import { NavigationState, NavigraphAuthState, SimbriefState } from '../../../State/NavigationState';
import { SimBridgeState } from '../../../State/SimBridgeState';
import { ChartProvider } from '../ChartProvider';
import { NavigraphChartProvider } from './NavigraphChartProvider';
import ChartCategory = PageEnum.ChartCategory;

export enum ChosenChartsProvider {
  Navigraph,
  SimBridge,
}

export interface ChartsUIProps {
  currentProvider: Subscribable<ChosenChartsProvider>;

  simbriefState: SimbriefState;

  navigationState: NavigationState;

  navigraphState: NavigraphAuthState;

  simBridgeState: SimBridgeState;
}

export class ChartsUI extends AbstractUIView<ChartsUIProps> {
  private readonly isFullscreen = Subject.create(false);

  private readonly selectedAirport = Subject.create('');

  private readonly selectedCategory = Subject.create(
    this.props.currentProvider.get() === ChosenChartsProvider.Navigraph ? ChartCategory.Star : ChartCategory.Image,
  );

  private readonly providers: Record<ChosenChartsProvider, ChartProvider<string | number>> = {
    [ChosenChartsProvider.Navigraph]: new NavigraphChartProvider(this.props.navigraphState),
    [ChosenChartsProvider.SimBridge]: new SimBridgeChartProvider(),
  };

  private provider = this.props.currentProvider.map((it) => this.providers[it]);

  private readonly class = MappedSubject.create(([simbriefDataLoaded]) => {
    let rounding = '';
    if (simbriefDataLoaded) {
      rounding = 'rounded-r-none';
    }

    return twMerge(`w-full shrink uppercase`, rounding);
  }, this.props.simbriefState.simbriefOfpLoaded);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(this.provider);

    this.subscriptions.push(
      this.props.currentProvider.sub((provider) => {
        switch (provider) {
          case ChosenChartsProvider.Navigraph:
            this.selectedCategory.set(ChartCategory.Star);
            break;
          case ChosenChartsProvider.SimBridge:
            this.selectedCategory.set(ChartCategory.Image);
            break;
        }
      }),
    );

    this.subscriptions.push(
      MappedSubject.create(
        ([provider, airport, simBridgeConnected]) => {
          console.log('MappedSubject:', provider, airport, simBridgeConnected);
          if (provider.canGetChartsForAirport) {
            this.props.navigationState.displayChartsForAirport(provider, airport);
          } else if (provider.canGetAllCharts && simBridgeConnected) {
            this.props.navigationState.displayAllCharts(provider);
          }
        },
        this.provider,
        this.selectedAirport,
        this.props.simBridgeState.simBridgeConnected,
      ),
    );
  }

  render(): VNode | null {
    return (
      <div ref={this.rootRef} class="flex h-full items-stretch">
        <div class="w-0"></div>

        <SwitchOn
          condition={this.isFullscreen.map((value) => !value)}
          on={
            <div class="flex shrink-0 flex-col" style={{ width: '450px' }}>
              <div class="flex flex-row items-center justify-center">
                <SwitchOn
                  condition={this.provider.map((it) => it.canGetChartsForAirport)}
                  on={
                    <SimpleInput
                      containerClass="w-full"
                      placeholder="ICAO"
                      value={this.selectedAirport}
                      maxLength={4}
                      class={this.class}
                      onChange={(value) => this.selectedAirport.set(value)}
                    />
                  }
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

              <div class="mt-6 flex grow flex-col">
                <Switch
                  activePage={this.props.currentProvider}
                  pages={[
                    [
                      ChosenChartsProvider.Navigraph,
                      <Selector
                        activeClass="bg-theme-highlight text-theme-body"
                        tabs={[
                          [PageEnum.ChartCategory.Star, <p class="text-inherit">STAR</p>],
                          [PageEnum.ChartCategory.App, <p class="text-inherit">APP</p>],
                          [PageEnum.ChartCategory.Taxi, <p class="text-inherit">TAXI</p>],
                          [PageEnum.ChartCategory.Sid, <p class="text-inherit">SID</p>],
                          [PageEnum.ChartCategory.Ref, <p class="text-inherit">REF</p>],
                          [PageEnum.ChartCategory.Image, <p class="text-inherit">IMAGE</p>],
                          [PageEnum.ChartCategory.Pdf, <p class="text-inherit">PDF</p>],
                          [PageEnum.ChartCategory.ImageAndPdf, <p class="text-inherit">BOTH</p>],
                        ]}
                        activePage={this.selectedCategory}
                      />,
                    ],
                    [
                      ChosenChartsProvider.SimBridge,
                      <Selector
                        activeClass="bg-theme-highlight text-theme-body"
                        tabs={[
                          [
                            PageEnum.ChartCategory.Image,
                            <p class="text-inherit">{t('NavigationAndCharts.LocalFiles.Image')}</p>,
                          ],
                          [
                            PageEnum.ChartCategory.Pdf,
                            <p class="text-inherit">{t('NavigationAndCharts.LocalFiles.Pdf')}</p>,
                          ],
                          [
                            PageEnum.ChartCategory.ImageAndPdf,
                            <p class="text-inherit">{t('NavigationAndCharts.LocalFiles.Both')}</p>,
                          ],
                        ]}
                        activePage={this.selectedCategory}
                      />,
                    ],
                  ]}
                />

                <SwitchIf
                  condition={this.props.navigationState.chartsLoading}
                  on={
                    <div class="flex w-full grow items-center justify-center">
                      <LoadingSpinner />
                    </div>
                  }
                  off={
                    <ScrollableContainer class="mt-5" height={42.75}>
                      <ChartSelector
                        provider={this.provider}
                        navigraphState={this.props.navigraphState}
                        navigationState={this.props.navigationState}
                        selectedCategory={this.selectedCategory}
                      />
                    </ScrollableContainer>
                  }
                />
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
