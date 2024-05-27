// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { FSComponent, VNode, Fragment } from '@microsoft/msfs-sdk';

import { LocalizedString } from '../shared/translation';
import { AbstractUIView } from '../shared/UIView';

export interface LocalizedTextProps {
  locKey: string;
}

export class LocalizedText extends AbstractUIView<LocalizedTextProps> {
  private readonly locStringSub = LocalizedString.create(this.props.locKey);

  pause() {
    super.pause();
    console.log(`"${this.props.locKey}" paused!`);
  }

  resume() {
    super.resume();
    console.log(`"${this.props.locKey}" resumed!`);
  }

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(this.locStringSub);
  }

  render(): VNode {
    return <Fragment ref={this.rootRef}>{this.locStringSub}</Fragment>;
  }
}

export function t(locKey: string): VNode {
  return <LocalizedText locKey={locKey} />;
}
