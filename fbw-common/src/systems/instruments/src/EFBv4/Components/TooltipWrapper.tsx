import {
  DisplayComponent,
  ComponentProps,
  FSComponent,
  MappedSubject,
  Subject,
  VNode,
  Subscribable,
} from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';
import { AbstractUIView, UIVIew } from '../shared/UIView';
import { EFB_EVENT_BUS } from '../EfbV4FsInstrument';
import { FlypadControlEvents } from '../FlypadControlEvents';
import { FSComponentUtils } from '../Utils/FSComponentUtils';
import { v4 } from 'uuid';

export interface TooltipWrapperProps extends ComponentProps {
  text: string;
}

export class TooltipWrapper extends AbstractUIView<TooltipWrapperProps> {
  private id: string | null = null;

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
  }

  private readonly handleMouseEnter = (event: MouseEvent) => {
    EFB_EVENT_BUS.getPublisher<FlypadControlEvents>().pub('set_tooltip', {
      id: this.id,
      shown: true,
      text: this.props.text,
    });

    this.childNodeElement.addEventListener('mouseleave', this.handleMouseLeave);
  };
  private readonly handleMouseLeave = (event: MouseEvent) => {
    EFB_EVENT_BUS.getPublisher<FlypadControlEvents>().pub('set_tooltip', {
      id: null,
      shown: false,
      text: '',
    });

    this.childNodeElement.removeEventListener('mouseleave', this.handleMouseLeave);
  };

  destroy(childFilter?: (child: UIVIew) => boolean) {
    super.destroy(childFilter);

    this.childNodeElement.addEventListener('mouseenter', this.handleMouseEnter);
    this.childNodeElement.addEventListener('mouseleave', this.handleMouseLeave);
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
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly x = Subject.create(0);

  private readonly y = Subject.create(0);

  private readonly offsetY = Subject.create(0);

  private readonly top = MappedSubject.create(
    ([posY, offsetY]) => {
      return `${posY + offsetY}px`;
    },
    this.y,
    this.offsetY,
  );

  private readonly left = this.x.map((it) => `${it}px`);

  private readonly className = this.props.shown.map((shown) =>
    twMerge(
      `pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-theme-secondary bg-theme-accent px-2 transition duration-100`,
      shown ? 'opacity-100' : 'opacity-0',
    ),
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.props.id.sub((id) => {
      const element = document.querySelector(`*[data-fbw-tooltip-id="${id}"]`);

      if (!element) {
        throw new Error('[Tooltip](onAfterRender) Could not find a DOM node with the provided tooltip ID');
      }

      const wrappedElementRect = element.getBoundingClientRect();
      const tooltipRect = this.rootRef.instance.getBoundingClientRect();

      this.x.set(wrappedElementRect.left - tooltipRect.width - 15);
      this.y.set(wrappedElementRect.top + wrappedElementRect.height / 2 - tooltipRect.height / 2);
    });
  }

  render(): VNode | null {
    return (
      <div ref={this.rootRef} class={this.className} style={{ top: this.top, left: this.left }}>
        {this.props.children}
      </div>
    );
  }
}
