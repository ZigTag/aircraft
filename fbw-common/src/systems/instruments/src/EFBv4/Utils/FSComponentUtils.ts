import { VNode } from '@microsoft/msfs-sdk';

export class FSComponentUtils {
  public static getVNodeDomNode(vnode: VNode): HTMLElement | SVGElement | null {
    if (vnode.instance instanceof HTMLElement || vnode.instance instanceof SVGElement) {
      return vnode.instance;
    }

    if (vnode.root && (vnode.root instanceof HTMLElement || vnode.root instanceof SVGElement)) {
      return vnode.root;
    }

    if (vnode.children && vnode.children.length > 0) {
      return this.getVNodeDomNode(vnode.children[0]);
    }

    return null;
  }
}
