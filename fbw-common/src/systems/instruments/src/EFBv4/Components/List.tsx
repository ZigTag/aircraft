import {
  ArraySubject,
  FSComponent,
  RenderPosition,
  Subscribable,
  SubscribableArray,
  SubscribableArrayEventType,
  SubscribableUtils,
  Subscription,
  VNode,
} from '@microsoft/msfs-sdk';
import { AbstractUIView, UIVIew } from '../Shared/UIView';
import { ComponentProps } from 'react';

export interface ListProps<T> extends ComponentProps<any> {
  items: SubscribableArray<T> | Subscribable<T[]>;

  render: (item: T, index: number, subscriptionsForItem: Subscription[]) => VNode;

  class?: string;
}

export class List<T> extends AbstractUIView<ListProps<T>> {
  public readonly rootRef = FSComponent.createRef<HTMLElement>();

  private subArray = ArraySubject.create<T>([]);

  private readonly vnodes: VNode[] = [];

  private readonly itemSubscriptions: Subscription[][] = [];

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    if (this.props.items instanceof ArraySubject) {
      this.subArray = this.props.items;
    } else if (SubscribableUtils.isSubscribable(this.props.items)) {
      this.subscriptions.push(this.props.items.sub((it) => this.subArray.set(it), true));
    }

    this.subscriptions.push(
      this.subArray.sub((index, type, item, array) => {
        const previousIndex = Math.min(0, index - 1);

        switch (type) {
          case SubscribableArrayEventType.Added: {
            for (const it of Array.isArray(item) ? item : [item]) {
              if (!this.itemSubscriptions[index]) {
                this.itemSubscriptions[index] = [];
              }
              this.itemSubscriptions[index].length = 0;

              const itemIndex = array.indexOf(it);
              const renderedNode = this.props.render(it, itemIndex, this.itemSubscriptions[index]);

              if (this.vnodes[itemIndex] === renderedNode) {
                throw new Error(`[List] VNodes should not be reused as return values of the 'render()' prop`);
              }

              this.vnodes[itemIndex] = renderedNode;

              this.appendItemAfter(previousIndex, renderedNode);
            }

            break;
          }
          case SubscribableArrayEventType.Removed:
            this.removeItem(index);
            break;
          case SubscribableArrayEventType.Cleared: {
            this.clearItems();
            break;
          }
        }
      }, true),
    );
  }

  private appendItemAfter(afterChild: number, node: VNode): void {
    if (afterChild === -1) {
      FSComponent.render(node, this.rootRef.instance, RenderPosition.In);
    } else {
      const child = this.rootRef.instance.children.item(afterChild);

      if (!child || !(child instanceof HTMLElement)) {
        throw new Error(`Child #${afterChild} does not exist`);
      }

      FSComponent.render(node, child, RenderPosition.After);
    }
  }

  private clearItems(): void {
    const children = Array.from(this.rootRef.instance.children);

    for (let i = 0; i < children.length; i++) {
      this.removeItem(0);
    }
  }

  private removeItem(childIndex: number): void {
    const vnode = this.vnodes[childIndex];

    if (!vnode) {
      throw new Error(`VNode not stored for child #${childIndex}`);
    }

    FSComponent.shallowDestroy(vnode);

    this.rootRef.instance.children.item(childIndex)?.remove();

    const itemSubscriptions = this.itemSubscriptions[childIndex];

    if (itemSubscriptions) {
      for (const sub of itemSubscriptions) {
        sub.destroy();
      }
    }
  }

  pause(childFilter?: (child: UIVIew) => boolean) {
    super.pause(childFilter);

    this.clearItems();

    for (const array of this.itemSubscriptions) {
      for (const sub of array) {
        sub.pause();
      }
    }
  }

  resume(childFilter?: (child: UIVIew) => boolean) {
    super.resume(childFilter);

    for (const array of this.itemSubscriptions) {
      for (const sub of array) {
        sub.resume();
      }
    }
  }

  render(): VNode | null {
    return <span ref={this.rootRef} class={this.props.class}></span>;
  }
}
