import { PageEnum } from '../../Shared';

export interface ChartProvider<C extends string | number> {
  canGetChartsForAirport: boolean;

  getChartsForAirport(icao: string): Promise<FlypadAirportCharts<C>>;

  getChartImage(chartID: string, theme: ChartTheme, page?: number): Promise<string>;

  getCategoryForTab(tab: PageEnum.ChartCategory): C;
}

export enum ChartsError {
  NotAuthenticated,
  ServerError,
  Unknown,
}

export enum ChartTheme {
  Light,
  Dark,
}

export interface FlypadAirportCharts<C extends string | number> {
  charts: Record<C, FlypadChart[]>;
}

export interface FlypadChart<C extends string | number = string | number> {
  id: string;

  name: string;

  airportIcao: string;

  indexNumber: string;

  category: C;

  tag: string;

  semanticColor: ChartSemanticColor;

  numPages: number;

  hasDarkMode: boolean;
}

export enum ChartSemanticColor {
  Green,
  Orange,
  LightBlue,
  Pink,
  Purple,
  Red,
  Default,
}
