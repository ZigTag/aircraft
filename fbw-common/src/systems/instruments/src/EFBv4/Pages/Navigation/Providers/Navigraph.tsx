import {
  DebounceTimer,
  DisplayComponent,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
  VNode,
} from '@microsoft/msfs-sdk';
import { PageEnum } from '../../../Shared';
import { ChartCategory } from 'navigraph/charts';
import { NavigraphChartProvider } from './NavigraphChartProvider';
import { twMerge } from 'tailwind-merge';
import { SwitchIf, SwitchOn } from '../../Pages';
import { ScrollableContainer, Selector, SimpleInput, t } from '../../../Components';
import { ChartViewer } from '../Components/ChartViewer';
import { ChartSelector, NavigraphUIProps } from '../Navigation';
import { LoadingSpinner } from '../../../Components/LoadingSpinner';

export class NavigraphUI extends DisplayComponent<NavigraphUIProps> {
  private readonly isFullscreen = Subject.create(false);

  private readonly selectedAirport = Subject.create('');

  private readonly selectedCategory = Subject.create(PageEnum.ChartCategory.Star);

  private provider = new NavigraphChartProvider(this.props.navigraphState);

  private handleIcaoChangeTimer = new DebounceTimer();

  private handleIcaoChange = (value: string) =>
    this.handleIcaoChangeTimer.schedule(
      () => this.props.navigationState.displayChartsForAirport(this.provider, value),
      250,
    );

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
            <div class="flex shrink-0 flex-col" style={{ width: '450px' }}>
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

              <div class="mt-6 flex grow flex-col">
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
