export interface ChartProvider<C extends string | number> {
  canGetChartsForAirport: boolean;

  getChartsForAirport(icao: string): Promise<FlypadAirportCharts<C>>;

  getChartImage(chartID: string, theme: ChartTheme, page?: number): Promise<string>;
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

export interface FlypadChart {
  id: string;

  name: string;

  indexNumber: string;

  numPages: number;

  hasDarkMode: boolean;
}

export interface ChartPage {
  urls: Record<ChartTheme, string | unknown>;
}
