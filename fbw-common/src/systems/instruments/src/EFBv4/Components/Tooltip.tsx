import { DisplayComponent, ComponentProps, FSComponent, Subject, VNode, Subscribable } from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';
import { AbstractUIView, UIVIew } from '../shared/UIView';
import { EFB_EVENT_BUS } from '../EfbV4FsInstrument';
import { FlypadControlEvents } from '../FlypadControlEvents';
import { FSComponentUtils } from '../Utils/FSComponentUtils';
import { v4 } from 'uuid';
import { LocalizedString } from '../shared/translation';

export interface TooltipWrapperProps extends ComponentProps {
  text: string;
}

export class TooltipWrapper extends AbstractUIView<TooltipWrapperProps> {
  private id: string | null = null;
  private hiddenLocked = false;
  private timeout: ReturnType<typeof setTimeout> | null = null;

  private readonly TOOLTIP_SHOW_DELAY = 500 as const;

  private get childNode(): VNode {
    if (this.props.children?.length !== 1) {
      throw new Error('[TooltipWrapper](onAfterRender) TooltipWrapper requires exactly one child');
    }

    const childNode = this.props.children[0];

    if (!childNode || typeof childNode !== 'object' || !('instance' in childNode)) {
      throw new Error('[TooltipWrapper](onAfterRender) Invalid child for TooltipWrapper: not a VNode');
    }

    return childNode;
  }

  private get childNodeElement(): HTMLElement {
    const element = FSComponentUtils.getVNodeDomNode(this.childNode);

    if (!(element instanceof HTMLElement)) {
      throw new Error('[TooltipWrapper](onAfterRender) Invalid child for TooltipWrapper: not an HTML element');
    }

    return element;
  }

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.id = v4();

    this.childNodeElement.setAttribute('data-fbw-tooltip-id', this.id);

    this.childNodeElement.addEventListener('mouseenter', this.handleMouseEnter);
    this.childNodeElement.addEventListener('mousedown', this.handleMouseDown);
  }

  private readonly handleMouseDown = () => {
    this.hiddenLocked = true;

    EFB_EVENT_BUS.getPublisher<FlypadControlEvents>().pub('set_tooltip', {
      id: this.id,
      shown: false,
      text: this.props.text,
    });

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  };

  private readonly handleMouseEnter = () => {
    if (this.timeout === null && !this.hiddenLocked) {
      this.timeout = setTimeout(() => {
        EFB_EVENT_BUS.getPublisher<FlypadControlEvents>().pub('set_tooltip', {
          id: this.id,
          shown: true,
          text: this.props.text,
        });
      }, this.TOOLTIP_SHOW_DELAY);
    }

    this.childNodeElement.addEventListener('mouseleave', this.handleMouseLeave);
  };

  private readonly handleMouseLeave = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.hiddenLocked = false;

    EFB_EVENT_BUS.getPublisher<FlypadControlEvents>().pub('set_tooltip', {
      id: null,
      shown: false,
      text: '',
    });

    this.childNodeElement.removeEventListener('mouseleave', this.handleMouseLeave);
  };

  destroy(childFilter?: (child: UIVIew) => boolean) {
    super.destroy(childFilter);

    this.childNodeElement.removeEventListener('mousedown', this.handleMouseDown);
    this.childNodeElement.removeEventListener('mouseenter', this.handleMouseEnter);
    this.childNodeElement.removeEventListener('mouseleave', this.handleMouseLeave);
  }

  render(): VNode | null {
    return this.childNode;
  }
}

export interface TooltipProps extends ComponentProps {
  id: Subscribable<string | null>;

  shown: Subscribable<boolean>;
}

export class Tooltip extends DisplayComponent<TooltipProps> {
  private readonly PADDING_PX = 10 as const;

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly x = Subject.create(0);
  private readonly y = Subject.create(0);

  private readonly top = this.y.map((y) => `${y}px`);
  private readonly left = this.x.map((x) => `${x}px`);

  private readonly className = this.props.shown.map((shown) =>
    twMerge(
      `pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-theme-secondary bg-theme-accent px-2 transition duration-100`,
      shown ? 'opacity-100' : 'opacity-0',
    ),
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.props.id.sub((id) => {
      if (id === null) return;

      const element = document.querySelector(`*[data-fbw-tooltip-id="${id}"]`);

      if (!element) {
        throw new Error(`[Tooltip](onAfterRender) Could not find a DOM node with the provided tooltip ID: ${id}`);
      }

      this.updatePosition(element);
    });
  }

  private updatePosition(wrappedElement: Element) {
    const wrappedElementRect = wrappedElement.getBoundingClientRect();
    const tooltipRect = this.rootRef.instance.getBoundingClientRect();

    const totalheight = wrappedElementRect.height + tooltipRect.height;
    const combinedVerticalOffset = wrappedElementRect.top + totalheight + this.PADDING_PX;

    if (combinedVerticalOffset > window.innerHeight) {
      this.y.set(wrappedElementRect.top - tooltipRect.height - this.PADDING_PX);
    } else {
      this.y.set(wrappedElementRect.bottom + this.PADDING_PX);
    }

    const combinedHorizontalOffset = wrappedElementRect.left + tooltipRect.width + this.PADDING_PX;

    if (combinedHorizontalOffset > window.innerWidth) {
      this.x.set(wrappedElementRect.right - tooltipRect.width);
    } else {
      this.x.set(wrappedElementRect.left);
    }
  }

  render(): VNode | null {
    return (
      <div ref={this.rootRef} class={this.className} style={{ top: this.top, left: this.left }}>
        {this.props.children}
      </div>
    );
  }
}

export class TooltipContainer extends AbstractUIView {
  private targetIDSubject = Subject.create<string | null>(null);
  private shownSubject = Subject.create(false);
  private textSubject = LocalizedString.create('');

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    EFB_EVENT_BUS.getSubscriber<FlypadControlEvents>()
      .on('set_tooltip')
      .handle(({ id, shown, text }) => {
        this.textSubject.set(text);
        this.shownSubject.set(shown);
        this.targetIDSubject.set(id);
      });
  }

  render(): VNode | null {
    return (
      <Tooltip id={this.targetIDSubject} shown={this.shownSubject}>
        {this.textSubject}
      </Tooltip>
    );
  }
}
