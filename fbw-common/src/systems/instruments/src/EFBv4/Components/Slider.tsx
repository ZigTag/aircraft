import { FSComponent, DisplayComponent, Subscribable, VNode, Subject, Subscription } from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';

export interface SliderProps {
  value: Subscribable<number>;

  min: number;

  max: number;

  onChange: (newValue: number) => void;
}

export class Slider extends DisplayComponent<SliderProps> {
  private readonly subscriptions: Subscription[] = [];

  private readonly trackRef = FSComponent.createRef<HTMLSpanElement>();

  private readonly trackHighlightRef = FSComponent.createRef<HTMLSpanElement>();

  private readonly thumbRef = FSComponent.createRef<HTMLSpanElement>();

  private readonly thumbXPosition = Subject.create(0);

  private readonly isDraggingSlider = Subject.create(false);

  private readonly handleThumbClick = () => {
    this.isDraggingSlider.set(true);

    document.addEventListener('mousemove', this.handleThumbMove);
    document.addEventListener('mouseup', this.handleThumbUnClick);
  };
  private readonly handleThumbMove = (event: MouseEvent) => {
    const trackRect = this.trackRef.instance.getBoundingClientRect();

    const relativeMousePosition = event.clientX - trackRect.left;
    const clampedPosition = Math.max(0, Math.min(relativeMousePosition, trackRect.width));

    const valueRatio = clampedPosition / trackRect.width;
    const scaledValue = this.props.min + valueRatio * Math.abs(this.props.max - this.props.min);

    this.props.onChange(scaledValue);
  };

  private readonly handleThumbUnClick = () => {
    this.isDraggingSlider.set(false);

    document.removeEventListener('mousemove', this.handleThumbMove);
  };

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.props.value.sub((value) => {
        const trackRect = this.trackRef.instance.getBoundingClientRect();

        const valueRatio = (value - this.props.min) / (this.props.max - this.props.min);
        const pixelPosition = valueRatio * trackRect.width;

        this.thumbXPosition.set(pixelPosition);
      }, true),
    );

    this.thumbRef.instance.addEventListener('mousedown', this.handleThumbClick);
    this.trackRef.instance.addEventListener('click', this.handleThumbMove);
    this.trackHighlightRef.instance.addEventListener('click', this.handleThumbMove);
  }

  destroy() {
    super.destroy();

    for (const subscription of this.subscriptions) {
      subscription.destroy();
    }

    this.thumbRef.instance.removeEventListener('mousedown', this.handleThumbClick);
    this.trackRef.instance.removeEventListener('click', this.handleThumbMove);
    this.trackHighlightRef.instance.removeEventListener('click', this.handleThumbMove);
    document.removeEventListener('mouseup', this.handleThumbUnClick);
    document.removeEventListener('mousemove', this.handleThumbMove);
  }

  private readonly thumbClassName = this.isDraggingSlider.map((it) =>
    twMerge(
      'absolute size-5 rounded-full border-2 border-transparent bg-theme-highlight transition-colors duration-100 hover:border-white',
      it && 'border-white',
    ),
  );

  render(): VNode | null {
    return (
      <span class="flex h-3 w-60 flex-col justify-center">
        <span ref={this.trackRef} class="bg-theme-accent h-2.5 w-full rounded-[6px]"></span>

        <span
          ref={this.trackHighlightRef}
          class="bg-theme-highlight pointer-events-none absolute h-2.5 rounded-[6px]"
          style={{ width: this.thumbXPosition.map((it) => `${it}px`) }}
        ></span>

        <span
          ref={this.thumbRef}
          class={this.thumbClassName}
          style={{ transform: this.thumbXPosition.map((x) => `translate(calc(-50% + ${x}px))`) }}
        ></span>
      </span>
    );
  }
}
