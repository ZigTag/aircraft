// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import {
  ArraySubject,
  DisplayComponent,
  FSComponent,
  Subject,
  Subscribable,
  UserSettingManager,
  VNode,
} from '@microsoft/msfs-sdk';
import { FlypadClient } from '@flybywiresim/fbw-sdk';
import { t } from '../../Components/LocalizedText';
import { WeatherReminder } from './Widgets/WeatherWidget';
import { AbstractUIView } from '../../Shared/UIView';
import { PageEnum } from '../../Shared/common';
import { PageTitle } from '../../Components/PageTitle';
import { PageBox } from '../../Components/PageBox';
import { Button } from '../../Components/Button';
import { flypadClientContext } from '../../Contexts';
import { Pages, Switch, SwitchIf, SwitchOn } from '../Pages';
import { ISimbriefData } from '../../../EFB/Apis/Simbrief';
import { RemindersSection } from './Widgets/ReminderSection';
import { ScrollableContainer } from '../../Components/ScrollableContainer';
import { List } from '../../Components/List';
import { PinnedChartCard } from '../Navigation/Components/PinnedChart';
import { twMerge } from 'tailwind-merge';
import { AirplaneIndicator } from 'instruments/src/EFBv4/Assets/AirplaneIndicator';
import { TooltipWrapper } from 'instruments/src/EFBv4/Components/Tooltip';
import { FbwUserSettingsDefs } from '../../FbwUserSettings';
import { NavigationState, NavigraphAuthState, SimbriefState } from '../../State/NavigationState';

export interface FlightWidgetProps {
  simbriefState: SimbriefState;
  navigraphAuthState: NavigraphAuthState;
}

export class FlightWidget extends DisplayComponent<FlightWidgetProps, [FlypadClient]> {
  public override contextType = [flypadClientContext] as const;

  onAfterRender(node: VNode) {
    super.onAfterRender(node);
  }

  private get client(): FlypadClient {
    return this.getContext(flypadClientContext).get();
  }

  private readonly fetchSimBriefData = () =>
    this.props.simbriefState.importOfp(
      this.props.navigraphAuthState.user.map((it) => it?.preferred_username ?? '').get(),
    );

  private readonly ofpPages: Pages = [
    [PageEnum.Optional.None, <SimBriefOfpNotLoadedOverlay onFetchSimbriefOfp={this.fetchSimBriefData} />],
    [
      PageEnum.Optional.Some,
      <SimBriefOfpData ofp={this.props.simbriefState.ofp} onFetchSimbriefOfp={this.fetchSimBriefData} />,
    ],
  ];

  render(): VNode {
    return (
      <div class="w-1/2">
        <div class="flex flex-row justify-between">
          <PageTitle>{t('Dashboard.YourFlight.Title')}</PageTitle>
          <SwitchIf
            condition={this.props.simbriefState.simbriefOfpLoaded}
            on={
              <h1>
                {this.props.simbriefState.ofp.map((ofp) => ofp?.airline ?? '')}
                {this.props.simbriefState.ofp.map((ofp) => ofp?.flightNumber ?? '')} | A320-251N
              </h1>
            }
            off={<h1>A320-251N</h1>}
          />
        </div>

        <PageBox>
          <Switch pages={this.ofpPages} activePage={this.props.simbriefState.ofp.map((it) => (it !== null ? 1 : 0))} />
        </PageBox>
      </div>
    );
  }
}

interface SimBriefOfpNotLoadedOverlayProps {
  onFetchSimbriefOfp: () => void;
}

class SimBriefOfpNotLoadedOverlay extends DisplayComponent<SimBriefOfpNotLoadedOverlayProps> {
  render(): VNode | null {
    return (
      <div class="flex h-full flex-col items-center justify-center space-y-4">
        <h1 class="text-center" style={{ maxWidth: '18em' }}>
          {t('Dashboard.YourFlight.SimBriefDataNotYetLoaded')}
        </h1>

        <Button onClick={this.props.onFetchSimbriefOfp} class="w-96">
          <i class="bi-cloud-arrow-down text-[26px] text-inherit" />
          <p class="text-current">{t('Dashboard.YourFlight.ImportSimBriefData')}</p>
        </Button>
      </div>
    );
  }
}

interface SimBriefOfpDataProps {
  ofp: Subscribable<ISimbriefData | null>;
  onFetchSimbriefOfp: () => void;
}

class SimBriefOfpData extends DisplayComponent<SimBriefOfpDataProps> {
  onAfterRender(node: VNode) {
    super.onAfterRender(node);
    this.props.ofp.sub((it) => console.log(it));
  }

  private readonly flightPlanProgress = Subject.create(0);

  private readonly schedOutParsed = this.props.ofp.map((it) => {
    if (!it) {
      return '----Z';
    }

    const sta = new Date(parseInt(it.times.schedIn));

    return `${sta.getUTCHours().toString().padStart(2, '0')}${sta.getUTCMinutes().toString().padStart(2, '0')}Z`;
  });

  private readonly schedInParsed = this.props.ofp.map((it) => {
    if (!it) {
      return '----Z';
    }

    const sta = new Date(parseInt(it.times.schedOut));

    return `${sta.getUTCHours().toString().padStart(2, '0')}${sta.getUTCMinutes().toString().padStart(2, '0')}Z`;
  });

  private readonly estimatedZfw = this.props.ofp.map((it) => {
    if (!it) {
      return '---';
    }

    const eZfwUnround = Number.parseFloat(it.weights.estZeroFuelWeight) / 100;
    const eZfw = Math.round(eZfwUnround) / 10;

    return eZfw.toString();
  });

  render(): VNode | null {
    return (
      <div class="flex h-full flex-col space-y-8">
        <div class="flex flex-row justify-between">
          <div>
            <h1 class="text-4xl font-bold">{this.props.ofp.map((it) => it?.origin.icao)}</h1>
            <p class="w-52 text-sm">{this.props.ofp.map((it) => it?.origin.name)}</p>
          </div>
          <div>
            <h1 class="text-right text-4xl font-bold">{this.props.ofp.map((it) => it?.destination.icao)}</h1>
            <p class="w-52 text-right text-sm">{this.props.ofp.map((it) => it?.destination.name)}</p>
          </div>
        </div>
        <div>
          <div class="flex w-full flex-row items-center">
            <p
              class={{
                'font-body': true,
                'text-theme-highlight': this.flightPlanProgress.map((it) => it > 1),
                'text-theme-text': this.flightPlanProgress.map((it) => it <= 1),
              }}
            >
              {this.schedOutParsed}
            </p>
            <div class="relative mx-6 flex h-1 w-full flex-row">
              <div class="absolute inset-x-0 border-b-4 border-dashed border-theme-text" />

              <div
                class="relative w-full bg-theme-highlight"
                style={{ width: this.flightPlanProgress.map((it) => `${it}%`) }}
              >
                <AirplaneIndicator
                  width={50}
                  height={50}
                  class={this.flightPlanProgress.map(
                    (progress) => `text-theme-highlight -translate-y-1/2 ${progress > 0 ? 'visible' : 'hidden'}`,
                  )}
                />
              </div>
            </div>
            <p
              class={{
                'text-right': true,
                'font-body': true,
                'text-theme-highlight': this.flightPlanProgress.map((it) => it >= 98),
                'text-theme-text': this.flightPlanProgress.map((it) => it < 98),
              }}
            >
              {this.schedInParsed}
            </p>
          </div>
        </div>
        <div>
          <div class="mb-4 flex flex-row justify-around">
            <InformationEntry
              title={t('Dashboard.YourFlight.Alternate')}
              info={this.props.ofp.map((it) => it?.alternate?.icao ?? 'NONE')}
            />
            <div class="mx-4 my-auto h-8 w-1 bg-theme-accent" />
            <InformationEntry
              title={t('Dashboard.YourFlight.CompanyRoute')}
              info={this.props.ofp.map((it) => (it ? it.origin.iata + it.destination.iata : '------'))}
            />
            <div class="mx-4 my-auto h-8 w-1 bg-theme-accent" />
            <InformationEntry title={t('Dashboard.YourFlight.ZFW')} info={this.estimatedZfw} />
          </div>
          <div class="my-auto h-0.5 w-full bg-theme-accent" />
          <div class="mt-4 flex flex-row justify-around">
            <InformationEntry
              title={t('Dashboard.YourFlight.CostIndex')}
              info={this.props.ofp.map((it) => it?.costIndex ?? '---')}
            />
            <div class="mx-4 my-auto h-8 w-1 bg-theme-accent" />
            <InformationEntry
              title={t('Dashboard.YourFlight.AverageWind')}
              info={this.props.ofp.map((it) =>
                it ? `${it.weather.avgWindDir}/${it.weather.avgWindSpeed}` : '---/---',
              )}
            />
            <div class="mx-4 my-auto h-8 w-1 bg-theme-accent" />
            <InformationEntry
              title={t('Dashboard.YourFlight.CruiseAlt')}
              info={this.props.ofp.map((it) =>
                it ? `FL${(it.cruiseAltitude / 100).toString().padStart(3, '0')}` : 'FL---',
              )}
            />
          </div>
        </div>
        <div>
          <h5 class="mb-2 text-2xl font-bold">{t('Dashboard.YourFlight.Route')}</h5>
          <ScrollableContainer height={15}>
            <p class="font-mono text-2xl">
              <span class="text-2xl text-theme-highlight">
                {this.props.ofp.map((it) => it?.origin.icao ?? '----')}/
                {this.props.ofp.map((it) => it?.origin.runway ?? 'RW---')}
              </span>{' '}
              {this.props.ofp.map((it) => it?.route ?? '---')}{' '}
              <span class="text-2xl text-theme-highlight">
                {this.props.ofp.map((it) => it?.destination.icao ?? '----')}/
                {this.props.ofp.map((it) => it?.destination.runway ?? 'RW---')}
              </span>
            </p>
          </ScrollableContainer>
        </div>

        <Button onClick={this.props.onFetchSimbriefOfp} class="!mt-auto w-full">
          <i class="bi-cloud-arrow-down text-[26px] text-inherit" />
          <p class="text-current">{t('Dashboard.YourFlight.ImportSimBriefData')}</p>
        </Button>
      </div>
    );
  }
}

export interface PinnedChartsReminderProps {
  navigationState: NavigationState;
}

export class PinnedChartsReminder extends AbstractUIView<PinnedChartsReminderProps> {
  // Placeholder
  private readonly pinnedChartsEmpty = Subject.create(false);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.props.navigationState.pinnedCharts.sub(
        (index, type, item, array) => this.pinnedChartsEmpty.set(array.length === 0),
        true,
      ),
    );
  }

  render(): VNode {
    return (
      <RemindersSection title={t('Dashboard.ImportantInformation.PinnedCharts.Title')}>
        <div class="grid grid-cols-2"></div>
        <SwitchIf
          condition={this.pinnedChartsEmpty}
          on={
            <h1 class="m-auto my-4 w-full text-center font-bold opacity-60">
              {t('Dashboard.ImportantInformation.PinnedCharts.NoPinnedCharts')}
            </h1>
          }
          off={
            <List
              items={this.props.navigationState.pinnedCharts}
              class="-mt-2 grid grid-cols-2"
              render={(item, index) => {
                return (
                  <PinnedChartCard
                    class={twMerge(index && index % 2 !== 0 && 'ml-4', 'mt-4')}
                    title={item.airportIcao}
                    subTitle={item.name}
                    tag={item.tag}
                    color={item.semanticColor}
                    showDelete={false}
                  />
                );
              }}
            />
          }
        />
      </RemindersSection>
    );
  }
}

export class MaintenanceReminder extends DisplayComponent<any> {
  private readonly isFailure = Subject.create(false);

  render(): VNode {
    return (
      <RemindersSection title={t('Dashboard.ImportantInformation.Maintenance.Title')}>
        <div class="space-y-6"></div>
        <SwitchOn
          condition={this.isFailure.map((val) => !val)}
          on={
            <h1 class="m-auto my-4 w-full text-center font-bold opacity-60">
              {t('Dashboard.ImportantInformation.Maintenance.NoActiveFailures')}
            </h1>
          }
        />
      </RemindersSection>
    );
  }
}

export class ChecklistsReminder extends DisplayComponent<any> {
  render(): VNode {
    return (
      <RemindersSection title={t('Dashboard.ImportantInformation.Checklists.Title')}>
        <div class="space-y-6"></div>
        <h1 class="m-auto my-4 w-full text-center font-bold opacity-60">No Pinned Checklists</h1>
      </RemindersSection>
    );
  }
}

type _ReminderKey = 'Weather' | 'Pinned Charts' | 'Maintenance' | 'Checklists';

const _TRANSLATIONS: [PageEnum.ReminderWidgets, string][] = [
  [PageEnum.ReminderWidgets.Weather, 'Dashboard.ImportantInformation.Weather.Title'],
  [PageEnum.ReminderWidgets.PinnedCharts, 'Dashboard.ImportantInformation.PinnedCharts.Title'],
  [PageEnum.ReminderWidgets.Maintenance, 'Dashboard.ImportantInformation.Maintenance.Title'],
  [PageEnum.ReminderWidgets.Checklists, 'Dashboard.ImportantInformation.Checklists.Title'],
];

interface RemindersWidgetProps {
  simbriefState: SimbriefState;

  navigationState: NavigationState;

  settings: UserSettingManager<FbwUserSettingsDefs>;
}

interface ReminderKeyEditCardProps {
  reminderText: VNode;
  index: number;
  setter: (destIndex: number) => void;
  keyArrLen: number;
}

class ReminderKeyEditCard extends AbstractUIView<ReminderKeyEditCardProps> {
  render() {
    return (
      <div class="flex w-full flex-row items-center justify-between rounded-md bg-theme-accent p-4">
        <h1>{this.props.reminderText}</h1>
        <div class="flex flex-row">
          <Button
            unstyled
            class="w-10 bg-transparent"
            onClick={() => {
              if (this.props.index === 0) {
                this.props.setter(this.props.keyArrLen - 1);
              } else {
                this.props.setter(this.props.index - 1);
              }
            }}
          >
            <i class="bi-arrow-up text-[25px]" />
          </Button>
          <Button
            unstyled
            class="w-10 bg-transparent"
            onClick={() => {
              if (this.props.index === this.props.keyArrLen - 1) {
                this.props.setter(0);
              } else {
                this.props.setter(this.props.index + 1);
              }
            }}
          >
            <i class="bi-arrow-down text-[25px]" />
          </Button>
        </div>
      </div>
    );
  }
}

export class RemindersWidget extends DisplayComponent<RemindersWidgetProps> {
  // Has to be in here idk why
  private readonly REMINDERS = [
    PageEnum.ReminderWidgets.Weather,
    PageEnum.ReminderWidgets.PinnedCharts,
    PageEnum.ReminderWidgets.Maintenance,
    PageEnum.ReminderWidgets.Checklists,
  ];

  private readonly TRANSLATIONS = new Map<PageEnum.ReminderWidgets, string>([
    [PageEnum.ReminderWidgets.Weather, 'Dashboard.ImportantInformation.Weather.Title'],
    [PageEnum.ReminderWidgets.PinnedCharts, 'Dashboard.ImportantInformation.PinnedCharts.Title'],
    [PageEnum.ReminderWidgets.Maintenance, 'Dashboard.ImportantInformation.Maintenance.Title'],
    [PageEnum.ReminderWidgets.Checklists, 'Dashboard.ImportantInformation.Checklists.Title'],
  ]);

  // This gets saved to settings
  private readonly orderedReminderKeys = Subject.create<string>([...this.REMINDERS.keys()].toString());

  private reorderModeActive = Subject.create(false);

  private readonly reminderKeyArr = ArraySubject.create(
    this.orderedReminderKeys
      .get()
      .split(',')
      .map((key) => Number(key) as PageEnum.ReminderWidgets),
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    /**
     * Let's check for any missing keys in the saved list in case more widgets get added in the future.
     * TODO: test it
     */
    [...this.REMINDERS.keys()].forEach((key) => {
      const keyEnum = key as PageEnum.ReminderWidgets;
      if (!this.reminderKeyArr.getArray().includes(keyEnum)) {
        this.reminderKeyArr.insert(keyEnum);
        this.orderedReminderKeys.set(`${this.orderedReminderKeys.get()},${keyEnum}`);
      }
    });
  }

  private arrayMove = (element: PageEnum.ReminderWidgets, toIndex: number): string => {
    // FIXME what the hell this is updating properly
    console.log(this.reminderKeyArr.getArray().map((key) => PageEnum.ReminderWidgets[key]));
    this.reminderKeyArr.removeItem(element);
    this.reminderKeyArr.insert(element, toIndex);
    console.log(this.reminderKeyArr.getArray().map((key) => PageEnum.ReminderWidgets[key]));

    console.log(this.reminderKeyArr.getArray().toString());
    return this.reminderKeyArr.getArray().toString();
  };

  render(): VNode {
    return (
      <div class="w-1/2">
        <div class="flex flex-row items-center justify-between">
          <PageTitle>{t('Dashboard.ImportantInformation.Title')}</PageTitle>
          <TooltipWrapper text="Dashboard.ImportantInformation.TT.RearrangeWidgets">
            <Button
              unstyled
              class="bg-transparent"
              onClick={() => this.reorderModeActive.set(!this.reorderModeActive.get())}
            >
              <i
                class={this.reorderModeActive.map(
                  (reorderModeActive) =>
                    `bi-pencil-fill transition duration-100 text-[25px] ${reorderModeActive && 'text-theme-highlight'}`,
                )}
              />
            </Button>
          </TooltipWrapper>
        </div>

        <PageBox class="relative">
          <ScrollableContainer height={51}>
            <List
              class="space-y-4"
              items={this.reminderKeyArr}
              render={(key) => {
                switch (key) {
                  case PageEnum.ReminderWidgets.Weather:
                    return <WeatherReminder simbriefState={this.props.simbriefState} settings={this.props.settings} />;
                  case PageEnum.ReminderWidgets.PinnedCharts:
                    return <PinnedChartsReminder navigationState={this.props.navigationState} />;
                  case PageEnum.ReminderWidgets.Maintenance:
                    return <MaintenanceReminder />;
                  case PageEnum.ReminderWidgets.Checklists:
                    return <ChecklistsReminder />;
                }
              }}
            />
          </ScrollableContainer>
          <div
            class={this.reorderModeActive.map(
              (reorderModeActive) =>
                `absolute inset-0 z-30 transition duration-100 ${reorderModeActive ? 'opacity-100' : 'pointer-events-none opacity-0'}`,
            )}
          >
            <div class="absolute inset-0 bg-theme-body/80">
              <ScrollableContainer class="p-6" height={51}>
                <List
                  class="space-y-4"
                  items={this.reminderKeyArr}
                  render={(key, index) => (
                    <ReminderKeyEditCard
                      reminderText={t(this.TRANSLATIONS.get(key) as string)}
                      keyArrLen={this.reminderKeyArr.length}
                      setter={(idx) => this.orderedReminderKeys.set(this.arrayMove(key, idx))}
                      index={index}
                    />
                  )}
                />
              </ScrollableContainer>
            </div>
          </div>
        </PageBox>
      </div>
    );
  }
}

export interface InformationEntryProps {
  title: VNode;
  info: Subscribable<string>;
}

class InformationEntry extends DisplayComponent<InformationEntryProps> {
  render(): VNode | null {
    return (
      <div class="justify-content flex w-full flex-col items-center">
        <h3 class="text-center font-light">{this.props.title}</h3>
        <h2 class="font-bold">{this.props.info}</h2>
      </div>
    );
  }
}
export interface DashboardProps {
  simbriefState: SimbriefState;

  navigraphAuthState: NavigraphAuthState;

  navigationState: NavigationState;

  settings: UserSettingManager<FbwUserSettingsDefs>;
}

export class Dashboard extends AbstractUIView<DashboardProps> {
  render(): VNode {
    return (
      <div ref={this.rootRef} class="flex w-full space-x-8">
        <FlightWidget simbriefState={this.props.simbriefState} navigraphAuthState={this.props.navigraphAuthState} />
        <RemindersWidget
          simbriefState={this.props.simbriefState}
          navigationState={this.props.navigationState}
          settings={this.props.settings}
        />
      </div>
    );
  }
}
