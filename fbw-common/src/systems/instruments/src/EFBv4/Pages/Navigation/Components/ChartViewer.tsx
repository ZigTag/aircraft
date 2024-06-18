import {
  CssTransformBuilder,
  CssTransformSubject,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
  VNode,
} from '@microsoft/msfs-sdk';
import { AbstractUIView, UIVIew } from '../../../shared/UIView';
import { Chart } from 'navigraph/charts';
import { navigraphCharts } from '../../../../navigraph';

export interface ChartViewerProps {
  shownChart: Subscribable<Chart | null>; // TODO use a generic type
}

export class ChartViewer extends AbstractUIView<ChartViewerProps> {
  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly imageRef = FSComponent.createRef<HTMLImageElement>();

  private readonly chartImageUrl = Subject.create<string | null>(null);

  private chartPanStartPositionX = 0;

  private chartPanStartPositionY = 0;

  private readonly chartTranslateX = Subject.create(0);

  private readonly chartTranslateY = Subject.create(0);

  private readonly chartScale = Subject.create(1.0);

  private readonly chartTranslateTransform = CssTransformBuilder.translate3d('px');

  private readonly chartScaleTransforme = CssTransformBuilder.scale();

  private readonly chartTransform = CssTransformSubject.create(
    CssTransformBuilder.concat(this.chartTranslateTransform, this.chartScaleTransforme),
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.props.shownChart.sub(async (chart) => {
        this.chartScale.set(1.0);
        this.chartTranslateX.set(0);
        this.chartTranslateY.set(0);

        if (!chart) {
          return;
        }

        const dayBlob = await navigraphCharts.getChartImage({ chart, theme: 'light' });

        if (!dayBlob) {
          throw new Error('[Navigation] Blob returned by Navigraph SDK was null');
        }

        const dayUrl = URL.createObjectURL(dayBlob);

        this.chartImageUrl.set(dayUrl);
      }),
      MappedSubject.create(this.chartTranslateX, this.chartTranslateY, this.chartScale).sub(([x, y, scale]) => {
        this.chartTranslateTransform.set(x, y, 0);
        this.chartScaleTransforme.set(scale, scale);
        this.chartTransform.resolve();
      }),
    );

    this.imageRef.instance.addEventListener('mousedown', this.handleChartMouseDown);
    this.imageRef.instance.addEventListener('load', this.handleChartImageLoaded);
  }

  private readonly handleChartMouseDown = (event: MouseEvent) => {
    this.imageRef.instance.addEventListener('mousemove', this.handleChartMouseMove);
    this.imageRef.instance.addEventListener('mouseup', this.handleChartMouseUp);

    this.chartPanStartPositionX = event.offsetX;
    this.chartPanStartPositionY = event.offsetY;
  };

  private readonly handleChartMouseMove = (event: MouseEvent) => {
    const dx = (event.offsetX - this.chartPanStartPositionX) * this.chartScale.get();
    const dy = (event.offsetY - this.chartPanStartPositionY) * this.chartScale.get();

    this.chartTranslateX.set(this.chartTranslateX.get() + dx);
    this.chartTranslateY.set(this.chartTranslateY.get() + dy);
  };

  private readonly handleChartMouseUp = () => {
    this.imageRef.instance.removeEventListener('mousemove', this.handleChartMouseMove);
    this.imageRef.instance.removeEventListener('mouseup', this.handleChartMouseUp);
  };

  private readonly handleChartImageLoaded = () => {
    const containerRect = this.containerRef.instance.getBoundingClientRect();
    const chartRect = this.imageRef.instance.getBoundingClientRect();

    const aspectRatio = chartRect.width / chartRect.height;

    if (aspectRatio > 1) {
      // Fit chart width
      const containerWidth = containerRect.width;
      const chartWidth = chartRect.width;
      const scale = containerWidth / chartWidth;

      this.chartScale.set(scale);

      const halfContainerHeight = containerRect.height / 2;
      const halfChartHeight = (chartRect.height * scale) / 2;
      const chartY = halfContainerHeight - halfChartHeight;

      this.chartTranslateX.set(0);
      this.chartTranslateY.set(chartY);
    } else {
      // Fit chart height
      const containerHeight = containerRect.height;
      const chartHeight = chartRect.height;
      const scale = containerHeight / chartHeight;

      this.chartScale.set(scale);

      const halfContainerWidth = containerRect.width / 2;
      const halfChartWidth = (chartRect.width * scale) / 2;
      const chartX = halfContainerWidth - halfChartWidth;

      this.chartTranslateX.set(chartX);
      this.chartTranslateY.set(0);
    }
  };

  destroy(childFilter?: (child: UIVIew) => boolean) {
    super.destroy(childFilter);

    this.imageRef.instance.removeEventListener('mousedown', this.handleChartMouseDown);
    this.imageRef.instance.removeEventListener('mousemove', this.handleChartMouseMove);
    this.imageRef.instance.removeEventListener('mouseup', this.handleChartMouseUp);
    this.imageRef.instance.removeEventListener('load', this.handleChartImageLoaded);
  }

  render(): VNode | null {
    return (
      <div ref={this.containerRef} class="relative grow self-stretch overflow-hidden bg-red-500">
        <img
          ref={this.imageRef}
          src={this.chartImageUrl}
          class="absolute"
          style={{ transform: this.chartTransform, 'transform-origin': '0 0' }}
        />
      </div>
    );
  }
}
