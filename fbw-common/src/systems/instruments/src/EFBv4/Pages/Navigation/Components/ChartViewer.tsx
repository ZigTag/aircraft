import {
  Accessible,
  CssTransformBuilder,
  CssTransformSubject,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
  VNode,
  Wait,
} from '@microsoft/msfs-sdk';
import { AbstractUIView, UIVIew } from '../../../Shared/UIView';
import { Button } from 'instruments/src/EFBv4/Components/Button';
import { TooltipWrapper } from '../../../Components/Tooltip';
import { ChartProvider, ChartTheme } from '../ChartProvider';
import { twMerge } from 'tailwind-merge';
import { LoadingSpinner } from '../../../Components/LoadingSpinner';

export interface ChartViewerProps {
  provider: Accessible<ChartProvider<string | number>>;

  shownChartID: Subscribable<string | null>;

  isFullscreen: Subscribable<boolean>;

  onToggleFullscreen: () => void;
}

export class ChartViewer extends AbstractUIView<ChartViewerProps> {
  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly wrapperRef = FSComponent.createRef<HTMLDivElement>();

  private readonly lightImageRef = FSComponent.createRef<HTMLImageElement>();

  private readonly darkImageRef = FSComponent.createRef<HTMLImageElement>();

  private readonly chartImageLightUrl = Subject.create<string | null>(null);

  private readonly chartImageDarkUrl = Subject.create<string | null>(null);

  private readonly lightImageLoaded = Subject.create(false);

  private readonly darkImageLoaded = Subject.create(false);

  private readonly inFullScreen = Subject.create(false);

  private readonly usingDarkTheme = Subject.create(false);

  private readonly showLoadingOverlay = Subject.create(false);

  private containerWidth = 0;

  private containerHeight = 0;

  private chartPanStartPositionX = 0;

  private chartPanStartPositionY = 0;

  private chartPanAmountX = 0;

  private chartPanAmountY = 0;

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
      this.props.shownChartID.sub(async (chartID) => {
        this.lightImageLoaded.set(false);
        this.darkImageLoaded.set(false);
        this.showLoadingOverlay.set(true);
        this.chartTransitionsEnabled.set(false);

        this.chartScale.set(1.0);
        this.chartTranslateX.set(0);
        this.chartTranslateY.set(0);
        this.chartTransform.resolve();

        await Wait.awaitDelay(100);

        this.chartTransitionsEnabled.set(true);

        if (!chartID) {
          return;
        }

        const nightUrl = await this.props.provider.get().getChartImage(chartID, ChartTheme.Dark);

        this.chartImageDarkUrl.set(nightUrl);

        const dayUrl = await this.props.provider.get().getChartImage(chartID, ChartTheme.Light);

        this.chartImageDarkUrl.set(nightUrl);
        this.chartImageLightUrl.set(dayUrl);
      }),
      MappedSubject.create(this.chartTranslateX, this.chartTranslateY, this.chartScale, this.chartRotation).sub(
        ([x, y, scale, rotation]) => {
          this.chartTranslateTransform.set(x, y, 0);
          this.chartScaleTransform.set(scale, scale);
          this.chartRotationTransform.set(rotation);
        },
      ),
    );

    this.wrapperRef.instance.addEventListener('mousedown', this.handleChartMouseDown);
    this.wrapperRef.instance.addEventListener('dblclick', this.handleChartDoubleClick);
    this.lightImageRef.instance.addEventListener('load', this.onLightChartImageLoaded);
    this.darkImageRef.instance.addEventListener('load', this.onDarkChartImageLoaded);
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

  private readonly handleChartToggleTheme = () => {
    this.usingDarkTheme.set(!this.usingDarkTheme.get());
  };

  private readonly handleChartMouseDown = (event: MouseEvent) => {
    this.wrapperRef.instance.addEventListener('mousemove', this.handleChartMouseMove);
    this.wrapperRef.instance.addEventListener('mouseup', this.handleChartMouseUp);

    this.chartPanStartPositionX = event.screenX;
    this.chartPanStartPositionY = event.screenY;
    this.chartPanAmountX = 0;
    this.chartPanAmountY = 0;

    this.chartTransitionsEnabled.set(false);
  };

  private readonly handleChartDoubleClick = (event: MouseEvent) => {
    this.chartScale.set(this.chartScale.get() * 1.25);

    this.centerChartOnPoint(event.offsetX, event.offsetY);
  };

  private readonly handleChartMouseMove = (event: MouseEvent) => {
    const dx = event.screenX - this.chartPanStartPositionX;
    const dy = event.screenY - this.chartPanStartPositionY;

    this.chartPanStartPositionX = event.screenX;
    this.chartPanStartPositionY = event.screenY;

    this.chartPanAmountX += dx;
    this.chartPanAmountY += dy;
    this.chartTranslateX.set(this.chartTranslateX.get() + dx);
    this.chartTranslateY.set(this.chartTranslateY.get() + dy);

    this.chartTransform.resolve();
  };

  private readonly handleChartMouseUp = () => {
    this.wrapperRef.instance.removeEventListener('mousemove', this.handleChartMouseMove);
    this.wrapperRef.instance.removeEventListener('mouseup', this.handleChartMouseUp);

    const hy = Math.hypot(this.chartPanAmountX, this.chartPanAmountY);
    const angle = Math.atan2(-this.chartPanAmountY, -this.chartPanAmountX);

    const correctedPanAmountX = hy * Math.cos(angle - Avionics.Utils.DEG2RAD * this.chartRotation.get());
    const correctedPanAmountY = hy * Math.sin(angle - Avionics.Utils.DEG2RAD * this.chartRotation.get());

    this.centerChartOnPoint(
      this.chartTranslateOriginX.get() + correctedPanAmountX / this.chartScale.get(),
      this.chartTranslateOriginY.get() + correctedPanAmountY / this.chartScale.get(),
    );

    this.chartTransitionsEnabled.set(true);
  };

  private readonly handleChartImageLoaded = (whichImage: 'light' | 'dark') => {
    (whichImage === 'light' ? this.lightImageLoaded : this.darkImageLoaded).set(true);

    if (this.lightImageLoaded.get() && this.darkImageLoaded.get()) {
      this.animate(() => this.fitChart(), true);
      this.showLoadingOverlay.set(false);
    }
  };

  private onLightChartImageLoaded = () => this.handleChartImageLoaded('light');
  private onDarkChartImageLoaded = () => this.handleChartImageLoaded('dark');

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
    const chartRect = this.lightImageRef.instance.getBoundingClientRect();

    this.centerChartOnPoint(chartRect.width / this.chartScale.get() / 2, chartRect.height / this.chartScale.get() / 2);
  }

  private readonly fitChart = async (forceFit?: 'width' | 'height') => {
    this.centerChartInContainer();
    this.chartRotation.set(0);

    const containerRect = this.containerRef.instance.getBoundingClientRect();
    const chartRect = this.lightImageRef.instance.getBoundingClientRect();

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

    this.wrapperRef.instance.removeEventListener('mousedown', this.handleChartMouseDown);
    this.wrapperRef.instance.removeEventListener('mousemove', this.handleChartMouseMove);
    this.wrapperRef.instance.removeEventListener('mouseup', this.handleChartMouseUp);
    this.lightImageRef.instance.removeEventListener('load', this.onLightChartImageLoaded);
    this.darkImageRef.instance.removeEventListener('load', this.onDarkChartImageLoaded);
  }

  private readonly className = this.props.isFullscreen.map((it) =>
    twMerge('relative h-[862px] grow self-stretch overflow-hidden rounded-md bg-theme-secondary', !it && 'ml-6'),
  );

  render(): VNode | null {
    return (
      <div ref={this.containerRef} class={this.className}>
        <div
          ref={this.wrapperRef}
          class="absolute"
          style={{
            transition: this.chartTransitionsEnabled.map((it) => (it ? 'transform, transform-origin, 200ms' : 'unset')),
            transform: this.chartTransform,
            'transform-origin': this.chartTransformOriginString,
          }}
        >
          <img
            ref={this.darkImageRef}
            src={this.chartImageDarkUrl}
            class="absolute z-10 transition-all duration-200"
            style={{ opacity: this.usingDarkTheme.map((it) => (it ? 1 : 0).toString()) }}
          />
          <img ref={this.lightImageRef} src={this.chartImageLightUrl} class="absolute" />
        </div>

        <div
          class="absolute flex size-full items-center justify-center bg-theme-secondary"
          style={{
            visibility: this.showLoadingOverlay.map((it) => (it ? 'visible' : 'hidden')),
            'pointer-events': this.showLoadingOverlay.map((it) => (it ? 'auto' : 'none')),
          }}
        >
          <LoadingSpinner />
        </div>

        <div class="absolute inset-y-6 right-6 z-20 flex cursor-pointer flex-col justify-between overflow-hidden rounded-md">
          <div class="flex flex-col overflow-hidden rounded-md">
            <TooltipWrapper text="NavigationAndCharts.TT.RotateLeft45Degrees">
              <Button
                unstyled
                class={`cursor-pointer bg-theme-accent p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body ${false && 'pointer-events-none text-theme-unselected text-opacity-60'}`}
                onClick={(event) => this.handleChartRotateCounterClockwise(event.shiftKey)}
              >
                <i class="bi-arrow-counterclockwise text-[35px] text-inherit" />
              </Button>
            </TooltipWrapper>
            <TooltipWrapper text="NavigationAndCharts.TT.RotateRight45Degrees">
              <Button
                unstyled
                class={`cursor-pointer bg-theme-accent p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body ${false && 'pointer-events-none text-theme-unselected text-opacity-60'}`}
                onClick={(event) => this.handleChartRotateClockwise(event.shiftKey)}
              >
                <i class="bi-arrow-clockwise fill-current text-[35px] text-inherit" />
              </Button>
            </TooltipWrapper>
          </div>
          <div class="flex flex-col overflow-hidden rounded-md">
            <TooltipWrapper text="NavigationAndCharts.TT.FitChartToHeight">
              <Button
                unstyled
                class="cursor-pointer bg-theme-accent p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
                onClick={() => this.fitChart('height')}
              >
                <i class="bi-arrows-expand text-[35px] text-inherit" />
              </Button>
            </TooltipWrapper>

            <TooltipWrapper text="NavigationAndCharts.TT.FitChartToWidth">
              <Button
                unstyled
                class="cursor-pointer bg-theme-accent p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
                onClick={() => this.fitChart('width')}
              >
                <i class="bi-arrows-expand-vertical text-[35px] text-inherit" />
              </Button>
            </TooltipWrapper>

            <TooltipWrapper text="NavigationAndCharts.TT.ResetMovement">
              <button
                type="button"
                class="cursor-pointer bg-theme-accent p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
              >
                <i class="bi-x-circle-fill text-[35px] text-inherit" />
              </button>
            </TooltipWrapper>

            <TooltipWrapper text="NavigationAndCharts.TT.ZoomIn">
              <Button
                unstyled
                class="cursor-pointer bg-theme-accent p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
                onClick={this.handleChartZoomIn}
              >
                <i class="bi-plus text-[35px] text-inherit" />
              </Button>
            </TooltipWrapper>

            <TooltipWrapper text="NavigationAndCharts.TT.ZoomOut">
              <Button
                unstyled
                class="cursor-pointer bg-theme-accent p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
                onClick={this.handleChartZoomOut}
              >
                <i class="bi-dash text-[35px] text-inherit" />
              </Button>
            </TooltipWrapper>
          </div>

          <div class="flex flex-col overflow-hidden rounded-md">
            <Button // TODO TT
              unstyled
              class="cursor-pointer bg-theme-accent p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
              onClick={this.props.onToggleFullscreen}
            >
              <i
                class={this.inFullScreen.map((it) =>
                  it ? 'bi-fullscreen text-[35px] text-inherit' : 'bi-fullscreen-exit text-[35px] text-inherit',
                )}
              />
            </Button>
            <Button // TODO TT
              unstyled
              class="cursor-pointer bg-theme-accent p-2 transition duration-100 hover:bg-theme-highlight hover:text-theme-body"
              onClick={this.handleChartToggleTheme}
            >
              <i
                class={this.usingDarkTheme.map((it) =>
                  it ? 'bi-moon-fill text-[35px] text-inherit' : 'bi-sun-fill text-[35px] text-inherit',
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
