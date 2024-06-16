import { DisplayComponent, FSComponent, MappedSubject, Subject, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';
import { Selector } from '../../Components/Selector';
import { Pages, SimbriefState, Switch, SwitchOn } from '../Pages';
import { PageEnum } from '../../shared/common';
import { NavigraphClient } from '@shared/navigraph';
import { SimpleInput } from '../../Components/SimpleInput';
import { ScrollableContainer } from '../Dashboard/Dashboard';
import { twMerge } from 'tailwind-merge';

export interface NavigationProps {
  simbriefState: SimbriefState;
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
      <div>
        <div class="flex justify-between">
          <PageTitle>{t('NavigationAndCharts.Title')}</PageTitle>
          <Selector tabs={this.tabs} activePage={this.activePage} />
        </div>
        <Switch
          class="mt-4"
          activePage={this.activePage}
          pages={[
            [PageEnum.NavigationPage.Navigraph, <NavigraphPage simbriefState={this.props.simbriefState} />],
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
}

export class NavigraphPage extends DisplayComponent<NavigraphPageProps> {
  render(): VNode | null {
    return (
      <NavigraphAuthWrapper>
        <NavigraphUI simbriefState={this.props.simbriefState} />
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
  }, this.props.simbriefState.simbriefDataLoaded);

  render(): VNode | null {
    return (
      <div>
        <>
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
                    condition={this.props.simbriefState.simbriefDataLoaded}
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
                    {/*<NavigraphChartSelector selectedTab={organizedCharts[selectedTabIndex]} loading={loading} />*/}
                  </ScrollableContainer>
                </div>
              </div>
            }
          />
        </>
      </div>
    );
  }
}

export class ChartViewer extends DisplayComponent<any> {
  render(): VNode | null {
    return (
      <>
        {/*<div
        className={`relative ${!this.isFullScreen && 'ml-6 rounded-l-none'}`}
        style={{ width: `${this.isFullScreen ? '1278px' : '804px'}` }}
      ></div>*/}
      </>
    );
  }
}
