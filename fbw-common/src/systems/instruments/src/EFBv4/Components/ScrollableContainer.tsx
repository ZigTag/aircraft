import { DisplayComponent, FSComponent, Subject, ComponentProps, VNode } from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';

export interface ScrollableContainerProps extends ComponentProps {
  height: number;
  class?: string;
  innerClass?: string;
  initialScroll?: number;
  onScroll?: (scrollTop: number) => void;
  onScrollStop?: (scrollTop: number) => void;
  nonRigid?: boolean;
  nonRigidWidth?: boolean;
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

  private mouseMoveHandler = (event: MouseEvent) => {
    const dy = event.clientY - this.position.get().y;

    this.container.instance.scrollTop = this.position.get().top - dy;
  };

  private mouseUpHandler = () => {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('mouseup', this.mouseUpHandler);
  };

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.container.instance.addEventListener('mousedown', (event) => {
      this.position.set({ top: this.container.instance.scrollTop, y: event.clientY });

      document.addEventListener('mousemove', this.mouseMoveHandler);
      document.addEventListener('mouseup', this.mouseUpHandler);
    });
  }

  render(): VNode {
    return (
      <div
        ref={this.container}
        class={twMerge(
          `scrollbar w-full`,
          this.props.class,
          !this.props.nonRigidWidth ? 'overflow-y-auto' : 'overflow-y-visible',
        )}
        style={this.props.nonRigid ? { maxHeight: `${this.props.height}rem` } : { height: `${this.props.height}rem` }}
      >
        <div class={this.innerClass} ref={this.content}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
