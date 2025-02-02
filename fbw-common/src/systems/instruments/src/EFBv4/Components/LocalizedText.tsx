// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { FSComponent, VNode, Fragment, Subscribable, SubscribableUtils } from '@microsoft/msfs-sdk';

import { LocalizedString } from '../Shared/translation';
import { AbstractUIView } from '../Shared/UIView';

export interface LocalizedTextProps {
  locKey: string | Subscribable<string>;
}

export class LocalizedText extends AbstractUIView<LocalizedTextProps> {
  private readonly locStringSub = LocalizedString.create('');

  pause() {
    super.pause();
  }

  resume() {
    super.resume();
  }

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(SubscribableUtils.toSubscribable(this.props.locKey, true).pipe(this.locStringSub));
    this.subscriptions.push(this.locStringSub);
  }

  render(): VNode {
    return <Fragment ref={this.rootRef}>{this.locStringSub}</Fragment>;
  }
}

export function t(locKey: string | Subscribable<string>): VNode {
  return <LocalizedText locKey={locKey} />;
}
