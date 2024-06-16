import {
  AbstractSubscribableArray,
  ArraySubject,
  DisplayComponent,
  FSComponent,
  RenderPosition,
  Subscribable,
  SubscribableArrayEventType,
  SubscribableUtils,
  VNode,
} from '@microsoft/msfs-sdk';
import { AbstractUIView } from '../shared/UIView';

export interface ListProps<T> {
  items: AbstractSubscribableArray<T> | Subscribable<T[]>;

  render: (item: T, index: number) => VNode;

  class: string;
}

export class List<T> extends AbstractUIView<ListProps<T>> {
  private subArray = ArraySubject.create<T>([]);

  private readonly vnodes: VNode[] = [];

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    if (this.props.items instanceof ArraySubject) {
      this.subArray = this.props.items;
    } else if (SubscribableUtils.isSubscribable(this.props.items)) {
      this.subscriptions.push(this.props.items.sub((it) => this.subArray.set(it)));
    }

    this.subscriptions.push(
      this.subArray.sub((index, type, item, array) => {
        const previousIndex = Math.min(0, index - 1);

        switch (type) {
          case SubscribableArrayEventType.Added: {
            for (const it of Array.isArray(item) ? item : [item]) {
              const renderedNode = this.props.render(it, array.indexOf(it));

              this.vnodes[array.indexOf(it)] = renderedNode;

              this.appendItemAfter(previousIndex, renderedNode);
            }

            break;
          }
          case SubscribableArrayEventType.Removed:
            this.removeItem(index);
            break;
          case SubscribableArrayEventType.Cleared: {
            const children = Array.from(this.rootRef.instance.children);

            for (let i = 0; i < children.length; i++) {
              this.removeItem(i);
            }
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

  private removeItem(childIndex: number): void {
    const vnode = this.vnodes[childIndex];

    if (!vnode) {
      throw new Error(`VNode not stored for child #${childIndex}`);
    }

    FSComponent.shallowDestroy(vnode);

    this.rootRef.instance.children.item(childIndex)?.remove();
  }

  render(): VNode | null {
    return <span ref={this.rootRef} class={this.props.class}></span>;
  }
}
