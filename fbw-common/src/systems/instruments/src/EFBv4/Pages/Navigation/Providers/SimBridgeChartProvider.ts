import { LocalizedString, PageEnum } from 'instruments/src/EFBv4/Shared';
import { ChartProvider, ChartSemanticColor, ChartTheme, FlypadChartIndex } from '../ChartProvider';
import { Viewer } from '@shared/simbridge';

export enum SimBridgeChartType {
  Image,
  Pdf,
}

export class SimBridgeChartProvider implements ChartProvider<SimBridgeChartType> {
  public readonly canGetChartsForAirport = false;

  public readonly canGetAllCharts = true;

  public getChartsForAirport(): Promise<FlypadChartIndex<SimBridgeChartType>> {
    throw new Error('Method not implemented.');
  }

  public async getAllCharts(): Promise<FlypadChartIndex<SimBridgeChartType>> {
    const index: FlypadChartIndex<SimBridgeChartType> = {
      charts: {
        [SimBridgeChartType.Image]: [],
        [SimBridgeChartType.Pdf]: [],
      },
    };

    const images = await Viewer.getImageList();

    index.charts[SimBridgeChartType.Image].push(
      ...images.map((it) => ({
        id: `image-${it}`,
        name: it,
        airportIcao: null,
        indexNumber: LocalizedString.translate('NavigationAndCharts.LocalFiles.Image')?.toUpperCase() ?? '',
        category: SimBridgeChartType.Image,
        tag: '',
        semanticColor: ChartSemanticColor.LightBlue,
        numPages: 1, // TODO populate
        hasDarkMode: false,
      })),
    );

    const pdfs = await Viewer.getPDFList();

    index.charts[SimBridgeChartType.Pdf].push(
      ...pdfs.map((it) => ({
        id: `pdf-${it}`,
        name: it,
        airportIcao: null,
        indexNumber: LocalizedString.translate('NavigationAndCharts.LocalFiles.Pdf')?.toUpperCase() ?? '',
        category: SimBridgeChartType.Pdf,
        tag: '',
        semanticColor: ChartSemanticColor.Red,
        numPages: 1, // TODO populate
        hasDarkMode: false,
      })),
    );

    return index;
  }

  public getChartImage(chartID: string, theme: ChartTheme, page?: number): Promise<string> {
    switch (chartID.split('-')[0]) {
      case 'image':
        return Viewer.getImageUrl(chartID.replace(/^image-/, ''));
      case 'pdf':
        return Viewer.getPDFPageUrl(chartID.replace(/^pdf-/, ''), page ?? 1);
      default:
        throw new Error(`[SimBridgeChartProvider](getChartImage) Cannot parse type from chart ID: ${chartID}`);
    }
  }

  public getCategoriesForTab(tab: PageEnum.ChartCategory): SimBridgeChartType[] {
    switch (tab) {
      case PageEnum.ChartCategory.Image:
        return [SimBridgeChartType.Image];
      case PageEnum.ChartCategory.Pdf:
        return [SimBridgeChartType.Pdf];
      case PageEnum.ChartCategory.ImageAndPdf:
        return [SimBridgeChartType.Image, SimBridgeChartType.Pdf];
      default:
        throw new Error(`[SimBridgeChartProvider](getCategoryForTab) Unsupported chart tab: ${tab}`);
    }
  }
}
