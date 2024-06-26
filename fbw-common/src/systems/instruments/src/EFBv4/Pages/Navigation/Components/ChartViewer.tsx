import {
  CssTransformBuilder,
  CssTransformSubject,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
  VNode,
  Wait,
} from '@microsoft/msfs-sdk';
import { AbstractUIView, UIVIew } from '../../../shared/UIView';
import { Chart } from 'navigraph/charts';
import { navigraphCharts } from '../../../../navigraph';
import { Button } from 'instruments/src/EFBv4/Components/Button';

export interface ChartViewerProps {
  shownChart: Subscribable<Chart | null>; // TODO use a generic type
}

export class ChartViewer extends AbstractUIView<ChartViewerProps> {
  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly imageRef = FSComponent.createRef<HTMLImageElement>();

  private readonly chartImageUrl = Subject.create<string | null>(null);

  private readonly inFullScreen = Subject.create(false);

  private readonly usingDarkTheme = Subject.create(false);

  private containerWidth = 0;

  private containerHeight = 0;

  private chartPanStartPositionX = 0;

  private chartPanStartPositionY = 0;

  private readonly chartTranslateOriginX = Subject.create(0);

  private readonly chartTranslateOriginY = Subject.create(0);

  private readonly chartTransformOriginString = MappedSubject.create(
    ([x, y]) => `${x}px ${y}px`,
    this.chartTranslateOriginX,
    this.chartTranslateOriginY,
  );

  private readonly chartTranslateX = Subject.create(0);

  private readonly chartTranslateY = Subject.create(0);

  private readonly chartScale = Subject.create(1.0);

  private readonly chartRotation = Subject.create(0);

  private readonly chartTranslateTransform = CssTransformBuilder.translate3d('px');

  private readonly chartScaleTransform = CssTransformBuilder.scale();

  private readonly chartRotationTransform = CssTransformBuilder.rotate('deg');

  private readonly chartTransform = CssTransformSubject.create(
    CssTransformBuilder.concat(this.chartTranslateTransform, this.chartScaleTransform, this.chartRotationTransform),
  );

  private readonly chartTransitionsEnabled = Subject.create(true);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.props.shownChart.sub(async (chart) => {
        this.chartScale.set(1.0);
        this.chartTranslateX.set(0);
        this.chartTranslateY.set(0);
        this.chartTransform.resolve();

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
      MappedSubject.create(this.chartTranslateX, this.chartTranslateY, this.chartScale, this.chartRotation).sub(
        ([x, y, scale, rotation]) => {
          this.chartTranslateTransform.set(x, y, 0);
          this.chartScaleTransform.set(scale, scale);
          this.chartRotationTransform.set(rotation);
        },
      ),
    );

    this.imageRef.instance.addEventListener('mousedown', this.handleChartMouseDown);
    this.imageRef.instance.addEventListener('dblclick', this.handleChartDoubleClick);
    this.imageRef.instance.addEventListener('load', this.handleChartImageLoaded);
  }

  private readonly handleChartRotateCounterClockwise = (small: boolean) => {
    const rotation = this.chartRotation.get();
    const wasIn15Increment = rotation % 90 !== 0;

    let newRotation: number;
    if (wasIn15Increment && !small) {
      const prevVal = (rotation < 0 ? Math.ceil : Math.floor)(Math.abs(rotation) / 90) * 90;

      newRotation = Math.sign(rotation) === 1 ? prevVal : -prevVal;
    } else {
      newRotation = rotation - (small ? 15 : 90);
    }

    this.chartRotation.set(newRotation);
    this.chartTransform.resolve();
  };
  private readonly handleChartRotateClockwise = (small: boolean) => {
    const rotation = this.chartRotation.get();
    const wasIn15Increment = rotation % 90 !== 0;

    let newRotation: number;
    if (wasIn15Increment && !small) {
      const prevVal = (rotation < 0 ? Math.floor : Math.ceil)(Math.abs(rotation) / 90) * 90;

      newRotation = Math.sign(rotation) === 1 ? prevVal : -prevVal;
    } else {
      newRotation = rotation + (small ? 15 : 90);
    }

    this.chartRotation.set(newRotation);
    this.chartTransform.resolve();
  };

  private clampZoom = (zoom: number) => Math.max(0.1, zoom, Math.min(zoom, 5));

  private readonly handleChartZoomIn = () => {
    this.chartScale.set(this.clampZoom(this.chartScale.get() * 1.25));
    this.chartTransform.resolve();
  };

  private readonly handleChartZoomOut = () => {
    this.chartScale.set(this.clampZoom(this.chartScale.get() / 1.25));
    this.chartTransform.resolve();
  };

  private readonly handleChartMouseDown = (event: MouseEvent) => {
    this.imageRef.instance.addEventListener('mousemove', this.handleChartMouseMove);
    this.imageRef.instance.addEventListener('mouseup', this.handleChartMouseUp);

    this.chartPanStartPositionX = event.offsetX;
    this.chartPanStartPositionY = event.offsetY;
  };

  private readonly handleChartDoubleClick = (event: MouseEvent) => {
    this.chartScale.set(this.chartScale.get() * 1.25);

    this.centerChartOnPoint(event.offsetX, event.offsetY);
  };

  private readonly handleChartMouseMove = (event: MouseEvent) => {
    const dx = (event.offsetX - this.chartPanStartPositionX) * this.chartScale.get();
    const dy = (event.offsetY - this.chartPanStartPositionY) * this.chartScale.get();

    // this.chartTranslateX.set(this.chartTranslateX.get() + dx);
    // this.chartTranslateY.set(this.chartTranslateY.get() + dy);
    // this.chartTranslateOriginX.set(event.offsetX);
    // this.chartTranslateOriginX.set(event.offsetY);
  };

  private readonly handleChartMouseUp = () => {
    this.imageRef.instance.removeEventListener('mousemove', this.handleChartMouseMove);
    this.imageRef.instance.removeEventListener('mouseup', this.handleChartMouseUp);
  };

  private readonly handleChartImageLoaded = () => {
    this.animate(() => this.fitChart(), true);
  };

  private centerChartOnPoint(chartX: number, chartY: number): void {
    const containerRect = this.containerRef.instance.getBoundingClientRect();

    this.containerWidth = containerRect.width;
    this.containerHeight = containerRect.height;

    const centerX = this.containerWidth / 2;
    const centerY = this.containerHeight / 2;

    this.chartTranslateX.set(centerX - chartX);
    this.chartTranslateY.set(centerY - chartY);

    this.chartTranslateOriginX.set(chartX);
    this.chartTranslateOriginY.set(chartY);

    this.chartTransform.resolve();
  }

  private centerChartInContainer(): void {
    const chartRect = this.imageRef.instance.getBoundingClientRect();

    this.centerChartOnPoint(chartRect.width / this.chartScale.get() / 2, chartRect.height / this.chartScale.get() / 2);
  }

  private readonly fitChart = async (forceFit?: 'width' | 'height') => {
    this.centerChartInContainer();
    this.chartRotation.set(0);

    const containerRect = this.containerRef.instance.getBoundingClientRect();
    const chartRect = this.imageRef.instance.getBoundingClientRect();

    const aspectRatio = chartRect.width / chartRect.height;

    const chartWidth = chartRect.width / this.chartScale.get();
    const chartHeight = chartRect.height / this.chartScale.get();

    let scale;

    const fit = forceFit ?? (aspectRatio > 1 ? 'width' : 'height');

    if (fit === 'width') {
      // Fit chart width
      const containerWidth = containerRect.width;
      scale = containerWidth / chartWidth;

      this.chartScale.set(scale);
    } else {
      // Fit chart height
      const containerHeight = containerRect.height;
      scale = containerHeight / chartHeight;

      this.chartScale.set(scale);
    }

    this.chartTransform.resolve();
  };

  private async animate(func: () => void, instant = false): Promise<void> {
    const exec = async () => {
      func();
      if (!instant) {
        return Wait.awaitDelay(151);
      } else {
        return;
      }
    };

    if (instant) {
      this.chartTransitionsEnabled.set(false);
      return new Promise((resolve) =>
        setTimeout(() => {
          exec();
          setTimeout(() => {
            this.chartTransitionsEnabled.set(true);
            resolve();
          });
        }),
      );
    } else {
      return exec();
    }
  }

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
          style={{
            transition: this.chartTransitionsEnabled.map((it) => (it ? 'transform, transform-origin, 200ms' : 'unset')),
            transform: this.chartTransform,
            'transform-origin': this.chartTransformOriginString,
          }}
        />

        <div class="absolute inset-y-6 right-6 z-20 flex cursor-pointer flex-col justify-between overflow-hidden rounded-md">
          <div class="flex flex-col overflow-hidden rounded-md">
            {/*<TooltipWrapper text={t('NavigationAndCharts.TT.RotateLeft45Degrees')}>*/}
            <Button
              unstyled
              class={`cursor-pointer bg-theme-secondary p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body ${false && 'pointer-events-none text-theme-unselected text-opacity-60'}`}
              onClick={(event) => this.handleChartRotateCounterClockwise(event.shiftKey)}
            >
              <i class="bi-arrow-counterclockwise text-[35px] text-inherit" />
            </Button>
            {/*</TooltipWrapper>*/}
            {/*<TooltipWrapper text={t('NavigationAndCharts.TT.RotateRight45Degrees')}>*/}
            <Button
              unstyled
              class={`cursor-pointer bg-theme-secondary p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body ${false && 'pointer-events-none text-theme-unselected text-opacity-60'}`}
              onClick={(event) => this.handleChartRotateClockwise(event.shiftKey)}
            >
              <i class="bi-arrow-clockwise fill-current text-[35px] text-inherit" />
            </Button>
            {/*</TooltipWrapper>*/}
          </div>
          <div class="flex flex-col overflow-hidden rounded-md">
            {/*<TooltipWrapper text={t('NavigationAndCharts.TT.FitChartToHeight')}>*/}
            <Button
              unstyled
              class="cursor-pointer bg-theme-secondary p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
              onClick={() => this.fitChart('height')}
            >
              <i class="bi-arrows-expand text-[35px] text-inherit" />
            </Button>
            {/*</TooltipWrapper>*/}

            {/*<TooltipWrapper text={t('NavigationAndCharts.TT.FitChartToWidth')}>*/}
            <Button
              unstyled
              class="cursor-pointer bg-theme-secondary p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
              onClick={() => this.fitChart('width')}
            >
              <i class="bi-arrows-expand-vertical text-[35px] text-inherit" />
            </Button>
            {/*</TooltipWrapper>*/}

            {/*<TooltipWrapper text={t('NavigationAndCharts.TT.ResetMovement')}>*/}
            <button
              type="button"
              class="cursor-pointer bg-theme-secondary p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
            >
              <i class="bi-x-circle-fill text-[35px] text-inherit" />
            </button>
            {/*</TooltipWrapper>*/}

            {/*<TooltipWrapper text={t('NavigationAndCharts.TT.ZoomIn')}>*/}
            <Button
              unstyled
              class="cursor-pointer bg-theme-secondary p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
              onClick={this.handleChartZoomIn}
            >
              <i class="bi-plus text-[35px] text-inherit" />
            </Button>
            {/*</TooltipWrapper>*/}

            {/*<TooltipWrapper text={t('NavigationAndCharts.TT.ZoomOut')}>*/}
            <Button
              unstyled
              class="cursor-pointer bg-theme-secondary p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
              onClick={this.handleChartZoomOut}
            >
              <i class="bi-dash text-[35px] text-inherit" />
            </Button>
            {/*</TooltipWrapper>*/}
          </div>
          <div class="flex flex-col overflow-hidden rounded-md">
            <div class="cursor-pointer rounded-md bg-theme-secondary p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body">
              <i
                class={this.inFullScreen.map((it) =>
                  it ? 'bi-fullscreen text-[35px] text-inherit' : 'bi-fullscreen-exit text-[35px] text-inherit',
                )}
              />
            </div>

            {true && (
              <div class="mt-3 cursor-pointer rounded-md bg-theme-secondary p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body">
                <i
                  class={this.inFullScreen.map((it) =>
                    it ? 'bi-moon-fill text-[35px] text-inherit' : 'bi-sun-fill text-[35px] text-inherit',
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
