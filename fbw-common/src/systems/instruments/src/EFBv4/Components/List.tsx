import {
  AbstractSubscribableArray,
  FSComponent,
  RenderPosition,
  SubscribableArrayEventType,
  VNode,
} from '@microsoft/msfs-sdk';
import { AbstractUIView } from '../shared/UIView';

export interface ListProps<T> {
  items: AbstractSubscribableArray<T>;

  render: (item: T) => VNode;
}

export class List<T> extends AbstractUIView<ListProps<T>> {
  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.props.items.sub((index, type, item, array) => {
        const previousIndex = Math.min(0, index - 1);

        switch (type) {
          case SubscribableArrayEventType.Added: {
            for (const it of Array.isArray(item) ? item : [item]) {
              this.appendItemAfter(previousIndex, this.props.render(it));
            }

            break;
          }
          case SubscribableArrayEventType.Removed:
            // TODO implement operation
            throw new Error('Not yet implemented');
          case SubscribableArrayEventType.Cleared:
            // TODO implement operation
            throw new Error('Not yet implemented');
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

  render(): VNode | null {
    return <span ref={this.rootRef}></span>;
  }
}
