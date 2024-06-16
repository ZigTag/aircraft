// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import {
  ArraySubject,
  ComponentProps,
  DisplayComponent,
  FSComponent,
  Subject,
  Subscribable,
  VNode,
} from '@microsoft/msfs-sdk';
import { FlypadClient } from '@flybywiresim/fbw-sdk';

import { t } from '../../Components/LocalizedText';
import { WeatherReminder } from './Widgets/WeatherWidget';
import { AbstractUIView } from '../../shared/UIView';
import { PageEnum } from '../../shared/common';
import { PageTitle } from '../../Components/PageTitle';
import { PageBox } from '../../Components/PageBox';
import { Button } from '../../Components/Button';
import { flypadClientContext } from '../../Contexts';
import { Pages, Switch } from '../Pages';
import { ISimbriefData, simbriefDataParser } from '../../../EFB/Apis/Simbrief';
import React from 'react';

interface ScrollableContainerProps extends ComponentProps {
  height: number;
  class?: string;
  innerClass?: string;
  initialScroll?: number;
  onScroll?: (scrollTop: number) => void;
  onScrollStop?: (scrollTop: number) => void;
  nonRigid?: boolean;
}

export interface FlightWidgetProps {}

export class FlightWidget extends DisplayComponent<FlightWidgetProps, [FlypadClient]> {
  public override contextType = [flypadClientContext] as const;

  private readonly loadedOfp = Subject.create<ISimbriefData | null>(null);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);
  }

  private get client(): FlypadClient {
    return this.getContext(flypadClientContext).get();
  }

  private readonly fetchSimBriefData = async () => {
    const ofp = await this.client.getSimbriefOfp();

    this.loadedOfp.set(simbriefDataParser(ofp));
  };

  private readonly ofpPages: Pages = [
    [PageEnum.Optional.None, <SimBriefOfpNotLoadedOverlay onFetchSimbriefOfp={this.fetchSimBriefData} />],
    [PageEnum.Optional.Some, <SimBriefOfpData ofp={this.loadedOfp} onFetchSimbriefOfp={this.fetchSimBriefData} />],
  ];

  render(): VNode {
    return (
      <div class="w-1/2">
        <PageTitle>{t('Dashboard.YourFlight.Title')}</PageTitle>

        <PageBox>
          <Switch pages={this.ofpPages} activePage={this.loadedOfp.map((it) => (it !== null ? 1 : 0))} />
        </PageBox>

        {/*<PageBox>*/}
        {/*  <div>*/}
        {/*    <button type="button" ref={this.languageButtonRefs[0]} class="bg-cyan px-5 py-2.5">*/}
        {/*      Set language to English*/}
        {/*    </button>*/}
        {/*    <button type="button" ref={this.languageButtonRefs[1]} class="bg-cyan px-5 py-2.5">*/}
        {/*      Set language to Korean*/}
        {/*    </button>*/}
        {/*  </div>*/}
        {/*</PageBox>*/}
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
              <div class="border-theme-text absolute inset-x-0 border-b-4 border-dashed" />

              <div
                class="bg-theme-highlight relative w-full"
                style={{ width: this.flightPlanProgress.map((it) => `${it}%`) }}
              >
                <i
                  class="bi-airplane text-[50px] text-inherit"
                  style={{ visibility: this.flightPlanProgress.map((it) => (it ? 'visible' : 'hidden')) }}
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
            <div class="bg-theme-accent mx-4 my-auto h-8 w-1" />
            <InformationEntry
              title={t('Dashboard.YourFlight.CompanyRoute')}
              info={this.props.ofp.map((it) => (it ? it.origin.iata + it.destination.iata : '------'))}
            />
            <div class="bg-theme-accent mx-4 my-auto h-8 w-1" />
            <InformationEntry title={t('Dashboard.YourFlight.ZFW')} info={this.estimatedZfw} />
          </div>
          <div class="bg-theme-accent my-auto h-0.5 w-full" />
          <div class="mt-4 flex flex-row justify-around">
            <InformationEntry
              title={t('Dashboard.YourFlight.CostIndex')}
              info={this.props.ofp.map((it) => it?.costIndex ?? '---')}
            />
            <div class="bg-theme-accent mx-4 my-auto h-8 w-1" />
            <InformationEntry
              title={t('Dashboard.YourFlight.AverageWind')}
              info={this.props.ofp.map((it) =>
                it ? `${it.weather.avgWindDir}/${it.weather.avgWindSpeed}` : '---/---',
              )}
            />
            <div class="bg-theme-accent mx-4 my-auto h-8 w-1" />
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
              <span class="text-theme-highlight text-2xl">
                {this.props.ofp.map((it) => it?.origin.icao ?? '----')}/
                {this.props.ofp.map((it) => it?.origin.runway ?? 'RW---')}
              </span>{' '}
              {this.props.ofp.map((it) => it?.route ?? '---')}{' '}
              <span class="text-theme-highlight text-2xl">
                {this.props.ofp.map((it) => it?.destination.icao ?? '----')}/
                {this.props.ofp.map((it) => it?.destination.runway ?? 'RW---')}
              </span>
            </p>
          </ScrollableContainer>
        </div>

        <Button onClick={this.props.onFetchSimbriefOfp} class="!mt-auto w-96 w-full">
          <i class="bi-cloud-arrow-down text-[26px] text-inherit" />
          <p class="text-current">{t('Dashboard.YourFlight.ImportSimBriefData')}</p>
        </Button>
      </div>
    );
  }
}

export class PinnedChartsReminder extends DisplayComponent<any> {
  render(): VNode {
    return <></>;
  }
}

export class MaintenanceReminder extends DisplayComponent<any> {
  render(): VNode {
    return <></>;
  }
}

export class ChecklistsReminder extends DisplayComponent<any> {
  render(): VNode {
    return <></>;
  }
}

type _ReminderKey = 'Weather' | 'Pinned Charts' | 'Maintenance' | 'Checklists';

const _TRANSLATIONS: [PageEnum.ReminderWidgets, string][] = [
  [PageEnum.ReminderWidgets.Weather, 'Dashboard.ImportantInformation.Weather.Title'],
  [PageEnum.ReminderWidgets.PinnedCharts, 'Dashboard.ImportantInformation.PinnedCharts.Title'],
  [PageEnum.ReminderWidgets.Maintenance, 'Dashboard.ImportantInformation.Maintenance.Title'],
  [PageEnum.ReminderWidgets.Checklists, 'Dashboard.ImportantInformation.Checklists.Title'],
];

export class RemindersWidget extends DisplayComponent<any> {
  // Has to be in here idk why
  private readonly REMINDERS = new Map<PageEnum.ReminderWidgets, VNode>([
    [PageEnum.ReminderWidgets.Weather, <WeatherReminder />],
    [PageEnum.ReminderWidgets.PinnedCharts, <PinnedChartsReminder />],
    [PageEnum.ReminderWidgets.Maintenance, <MaintenanceReminder />],
    [PageEnum.ReminderWidgets.Checklists, <ChecklistsReminder />],
  ]);

  private readonly TRANSLATIONS = new Map<PageEnum.ReminderWidgets, string>([
    [PageEnum.ReminderWidgets.Weather, 'Dashboard.ImportantInformation.Weather.Title'],
    [PageEnum.ReminderWidgets.PinnedCharts, 'Dashboard.ImportantInformation.PinnedCharts.Title'],
    [PageEnum.ReminderWidgets.Maintenance, 'Dashboard.ImportantInformation.Maintenance.Title'],
    [PageEnum.ReminderWidgets.Checklists, 'Dashboard.ImportantInformation.Checklists.Title'],
  ]);

  // This gets saved to settings
  private readonly orderedReminderKeys = Subject.create<string>([...this.REMINDERS.keys()].toString());

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

  render(): VNode {
    return (
      <div class="w-1/2">
        <PageTitle>{t('Dashboard.ImportantInformation.Title')}</PageTitle>

        <PageBox>
          <ScrollableContainer height={51}>
            <div class="flex flex-col space-y-4">
              {this.reminderKeyArr.getArray().map((key) => this.REMINDERS.get(key))}
            </div>
          </ScrollableContainer>
        </PageBox>
      </div>
    );
  }
}

export class ScrollableContainer extends DisplayComponent<ScrollableContainerProps> {
  private readonly content = FSComponent.createRef<HTMLSpanElement>();

  private readonly container = FSComponent.createRef<HTMLSpanElement>();

  private readonly contentOverflows = Subject.create(false);

  private readonly position = Subject.create({ top: 0, y: 0 });

  private readonly innerClass = this.contentOverflows.map((value) => {
    // TODO: I'm inverting this so it always treats them as overflowing.
    const contentPadding = !value ? 'mr-6' : '';

    return `${this.props.innerClass ? this.props.innerClass : ''} ${contentPadding}`;
  });

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    // this.container.instance.addEventListener('mousedown', () => {
    //     this.container.instance.offsetTop = this.position.
    // })
  }

  render(): VNode {
    return (
      <div
        ref={this.container}
        class={`scrollbar w-full overflow-y-auto ${this.props.class}`}
        style={this.props.nonRigid ? { maxHeight: `${this.props.height}rem` } : { height: `${this.props.height}rem` }}
      >
        <div class={this.innerClass} ref={this.content}>
          {this.props.children}
        </div>
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
export interface DashboardProps {}

export class Dashboard extends AbstractUIView<DashboardProps> {
  render(): VNode {
    return (
      <div ref={this.rootRef} class="flex w-full space-x-8">
        <FlightWidget />
        <RemindersWidget />
      </div>
    );
  }
}
