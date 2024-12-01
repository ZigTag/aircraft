import { FlypadClient } from '@shared/flypad-server';
import { ArraySubject, Subject, Subscribable, SubscribableArray } from '@microsoft/msfs-sdk';
import { ISimbriefData, simbriefDataParser } from '../../EFB/Apis/Simbrief';
import { ChartProvider, ChartsError, FlypadChartIndex, FlypadChart } from '../Pages/Navigation/ChartProvider';
import { DeviceFlowParams, User } from 'navigraph/auth';
import { navigraphAuth } from '../../navigraph';
import { NotificationKind, showNotification } from '../Components';

export class SimbriefState {
  constructor(private readonly client: FlypadClient) {}
  private readonly _ofp = Subject.create<ISimbriefData | null>(null);

  public readonly ofpScroll = Subject.create(0);

  public readonly ofp: Subscribable<ISimbriefData | null> = this._ofp;

  public readonly simbriefOfpLoaded = this.ofp.map((value) => !!value);

  public importOfp(username: string) {
    this.client.getSimbriefOfp(username).then((r) => this._ofp.set(simbriefDataParser(r)));
  }
}

export class NavigationState {
  private readonly _chartsLoading = Subject.create(false);

  public readonly chartsLoading: Subscribable<boolean> = this._chartsLoading;

  private readonly _displayedCharts = Subject.create<Record<any, FlypadChart[]>>({});

  public readonly displayedCharts: Subscribable<Record<any, FlypadChart[]>> = this._displayedCharts;

  private readonly _selectedChart = Subject.create<FlypadChart | null>(null);

  public readonly selectedChart: Subscribable<FlypadChart | null> = this._selectedChart;

  private readonly _pinnedCharts = ArraySubject.create<FlypadChart>([]);

  public readonly pinnedCharts: SubscribableArray<FlypadChart> = this._pinnedCharts;

  public async displayChartsForAirport(provider: ChartProvider<string | number>, icao: string): Promise<void> {
    const validatedIcao = icao.match(/[A-Za-z][A-Za-z][A-Za-z][A-Za-z]?/);

    if (!validatedIcao) {
      return;
    }

    let charts: FlypadChartIndex<any> | null = null;

    this._chartsLoading.set(true);

    try {
      charts = await provider.getChartsForAirport(validatedIcao[0]);
    } catch (e) {
      switch (e as ChartsError) {
        case ChartsError.NotAuthenticated:
          showNotification({ kind: NotificationKind.Error, text: 'Not authenticated to Navigraph' });
          break;
        case ChartsError.ServerError:
          showNotification({ kind: NotificationKind.Error, text: 'Server error while requesting charts' });
          break;
        case ChartsError.Unknown:
          showNotification({ kind: NotificationKind.Error, text: 'Unknown error while request charts' });
          break;
      }
    } finally {
      this._chartsLoading.set(false);
    }

    if (charts) {
      this._displayedCharts.set(charts.charts);
    }
  }

  public async displayAllCharts<C extends string | number>(provider: ChartProvider<C>): Promise<void> {
    let charts: FlypadChartIndex<C> | null = null;

    this._chartsLoading.set(true);

    try {
      charts = await provider.getAllCharts();
    } catch (e) {
      switch (e as ChartsError) {
        case ChartsError.NotAuthenticated:
          // TODO i18n
          showNotification({ kind: NotificationKind.Error, text: 'Not authenticated to Navigraph' });
          break;
        case ChartsError.ServerError:
          // TODO i18n
          showNotification({ kind: NotificationKind.Error, text: 'Server error while requesting charts' });
          break;
        case ChartsError.Unknown:
          // TODO i18n
          showNotification({ kind: NotificationKind.Error, text: 'Unknown error while request charts' });
          break;
      }
    } finally {
      this._chartsLoading.set(false);
    }

    if (charts) {
      console.log('SETTING _displayedCharts:', charts.charts);
      this._displayedCharts.set(charts.charts);
    }
  }

  public setSelectedChart(chart: FlypadChart): void {
    this._selectedChart.set(chart);
  }

  public toggleChartPinned(chart: FlypadChart): void {
    const pinnedIndex = this._pinnedCharts.getArray().findIndex((it) => it.id === chart.id);

    if (pinnedIndex !== -1) {
      this._pinnedCharts.removeAt(pinnedIndex);
    } else {
      this._pinnedCharts.insert(chart);
    }
  }
}

export class NavigraphAuthState {
  private readonly _initialized = Subject.create(false);

  public readonly initialized: Subscribable<boolean> = this._initialized;

  private readonly _user = Subject.create<User | null>(null);

  public readonly user: Subscribable<User | null> = this._user;

  constructor() {
    navigraphAuth.onAuthStateChanged((user) => {
      this._initialized.set(true);
      this._user.set(user);
    });
  }

  public async login(deviceFlowParamsCallback: (params: DeviceFlowParams) => void): Promise<User> {
    return navigraphAuth.signInWithDeviceFlow(deviceFlowParamsCallback);
  }

  public async logout(): Promise<void> {
    return navigraphAuth.signOut();
  }
}
