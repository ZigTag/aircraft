import {
  DisplayComponent,
  EventBus,
  FSComponent,
  Subject,
  Subscribable,
  Subscription,
  VNode,
} from '@microsoft/msfs-sdk';

import { busContext, flypadClientContext } from '../Contexts';
import { FlypadClient } from '@shared/flypad-server';

/**
 * EFB UI View
 */
export interface UIVIew {
  /** Whether the object is a UIVIew */
  readonly isUIVIew: true;

  /** Whether the UIView is paused */
  readonly isPaused: Subscribable<boolean>;

  hide(): void;

  show(): void;

  /** Callback fired when the view is paused */
  pause(): void;

  /** Callback fired when the view is resumed */
  resume(): void;

  /** Callback fired when the view is destroyed */
  destroy(): void;
}

/**
 * Utils for {@link UIVIew}
 */
export class UIVIewUtils {
  /**
   * Returns whether a value is UIVIew
   */
  public static isUIVIew(thing: any): thing is UIVIew {
    return (
      thing !== null &&
      thing !== undefined &&
      typeof thing === 'object' &&
      'isUIVIew' in thing &&
      thing.isUIVIew === true
    );
  }
}

export abstract class AbstractUIView<T = any> extends DisplayComponent<T, [EventBus, FlypadClient]> implements UIVIew {
  public readonly rootRef = FSComponent.createRef<HTMLElement | AbstractUIView>();

  public override contextType = [busContext, flypadClientContext] as const;

  protected vnode: VNode | undefined;

  protected readonly subscriptions: Subscription[] = [];

  readonly isPaused = Subject.create(false);

  isUIVIew = true as const;

  /**
   * Obtains the event bus via context
   */
  protected get bus(): EventBus {
    return this.getContext(busContext).get() as EventBus;
  }

  protected get client(): FlypadClient {
    return this.getContext(flypadClientContext).get() as FlypadClient;
  }

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.vnode = node;

    if (!this.rootRef.getOrDefault()) {
      console.warn(
        `[AbstractUIVIew](onAfterRender) rootRef had no instance in ${this.constructor.name} - make sure you pass rootRef as a ref in your render function`,
      );
    }
  }

  hide() {
    if (UIVIewUtils.isUIVIew(this.rootRef.instance)) {
      this.rootRef.instance.hide();
    } else {
      this.rootRef.instance.classList.toggle('view-hidden', true);
    }
  }

  show() {
    if (UIVIewUtils.isUIVIew(this.rootRef.instance)) {
      this.rootRef.instance.show();
    } else {
      this.rootRef.instance.classList.toggle('view-hidden', false);
    }
  }

  pause(childFilter?: (child: UIVIew) => boolean): void {
    if (this.isPaused.get()) {
      return;
    }

    this.isPaused.set(true);

    for (const subscription of this.subscriptions) {
      subscription.pause();
    }

    if (this.vnode) {
      this.forEachChildUIView((view) => view.pause(), childFilter);
    }
  }

  resume(childFilter?: (child: UIVIew) => boolean): void {
    if (!this.isPaused.get()) {
      return;
    }

    this.isPaused.set(false);

    for (const subscription of this.subscriptions) {
      subscription.resume(true);
    }

    if (this.vnode) {
      this.forEachChildUIView((view) => view.resume(), childFilter);
    }
  }

  destroy(childFilter?: (child: UIVIew) => boolean): void {
    for (const subscription of this.subscriptions) {
      subscription.destroy();
    }

    if (this.vnode) {
      this.forEachChildUIView((view) => view.destroy(), childFilter);
    }
  }

  private forEachChildUIView(func: (child: UIVIew) => void, filter?: (child: UIVIew) => boolean) {
    if (!this.vnode) {
      return;
    }

    FSComponent.visitNodes(this.vnode, (node) => {
      if (node === this.vnode) {
        return false;
      }

      if (UIVIewUtils.isUIVIew(node.instance)) {
        if (filter && !filter(node.instance)) {
          return true;
        }

        func(node.instance);
        return true;
      }

      return false;
    });
  }

  abstract render(): VNode | null;
}
