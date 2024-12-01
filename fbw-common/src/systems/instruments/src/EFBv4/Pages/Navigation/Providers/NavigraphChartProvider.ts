import {
  ChartsError,
  ChartProvider,
  FlypadChartIndex,
  FlypadChart,
  ChartTheme,
  ChartSemanticColor,
} from '../ChartProvider';
import { navigraphCharts } from '../../../../navigraph';
import { Chart, ChartCategory } from 'navigraph/charts';
import { NavigraphAuthState } from '../../../State/NavigationState';
import { PageEnum } from '../../../Shared';

export class NavigraphChartProvider implements ChartProvider<ChartCategory> {
  public readonly canGetChartsForAirport = true;

  public readonly canGetAllCharts = false;

  private chartCache = new Map<string, Chart>();

  private chartUrlCache = new Map<string, string>();

  constructor(private readonly navigraphState: NavigraphAuthState) {}

  async getChartsForAirport(icao: string): Promise<FlypadChartIndex<ChartCategory>> {
    if (!this.navigraphState.user.get()) {
      throw ChartsError.NotAuthenticated;
    }

    const charts = await navigraphCharts.getChartsIndex({ icao });

    if (!charts) {
      throw ChartsError.Unknown;
    }

    for (const chart of charts) {
      this.chartCache.set(chart.id, chart);
    }

    const chartMapper = (it: Chart): FlypadChart => {
      let semanticColor: ChartSemanticColor;
      switch (it.category) {
        case 'ARR':
          semanticColor = ChartSemanticColor.Green;
          break;
        case 'APP':
          semanticColor = ChartSemanticColor.Orange;
          break;
        case 'APT':
          semanticColor = ChartSemanticColor.LightBlue;
          break;
        case 'DEP':
          semanticColor = ChartSemanticColor.Pink;
          break;
        case 'REF':
          semanticColor = ChartSemanticColor.Purple;
          break;
        default:
          semanticColor = ChartSemanticColor.Default;
          break;
      }

      return {
        id: it.id,
        name: it.name,
        airportIcao: it.icao_airport_identifier,
        indexNumber: it.index_number,
        category: it.category,
        tag: it.category,
        semanticColor,
        numPages: 1,
        hasDarkMode: true,
      };
    };

    return {
      charts: {
        APT: charts.filter((it) => it.category === 'APT').map(chartMapper),
        DEP: charts.filter((it) => it.category === 'DEP').map(chartMapper),
        ARR: charts.filter((it) => it.category === 'ARR').map(chartMapper),
        APP: charts.filter((it) => it.category === 'APP').map(chartMapper),
        REF: charts.filter((it) => it.category === 'REF').map(chartMapper),
      },
    };
  }

  getAllCharts(): Promise<FlypadChartIndex<ChartCategory>> {
    throw new Error('Method not implemented.');
  }

  async getChartImage(chartID: string, theme: ChartTheme, page = 1): Promise<string> {
    if (page !== 1) {
      console.warn(
        '[NavigraphChartProvider](getChartImage) Navigraph chart provider does not support more than 1 page',
      );
    }

    const chartUrlKey = `${chartID}-${theme}-${page}`;
    const cachedChartUrl = this.chartUrlCache.get(chartUrlKey);

    if (cachedChartUrl) {
      return cachedChartUrl;
    }

    const cachedChart = this.chartCache.get(chartID);

    if (!cachedChart) {
      throw ChartsError.Unknown;
    }

    const blob = await navigraphCharts.getChartImage({
      chart: cachedChart,
      theme: theme === ChartTheme.Dark ? 'dark' : 'light',
    });

    if (!blob) {
      throw ChartsError.ServerError;
    }

    const url = URL.createObjectURL(blob);

    this.chartUrlCache.set(chartUrlKey, url);

    return url;
  }

  getCategoriesForTab(tab: PageEnum.ChartCategory): ChartCategory[] {
    switch (tab) {
      case PageEnum.ChartCategory.Star:
        return ['ARR'];
      case PageEnum.ChartCategory.App:
        return ['APP'];
      case PageEnum.ChartCategory.Sid:
        return ['DEP'];
      case PageEnum.ChartCategory.Taxi:
        return ['APT'];
      case PageEnum.ChartCategory.Ref:
        return ['REF'];
      default:
        throw new Error('[NavigraphChartProvider](getCategoryForTab) Unknown selected category');
    }
  }
}
