// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { AbstractUIView } from '../shared/UIView';

interface LogoProps {
  width: number;
  height: number;
  class?: string;
}

export class FbwLogo extends AbstractUIView<LogoProps> {
  render(): VNode | null {
    return (
      <svg
        width={this.props.width}
        height={this.props.height}
        viewBox="0 0 214 200"
        class={this.props.class}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M213.333 0H162.497C152.738 0 143.759 5.33034 139.086 13.8973L66.6667 146.667C44.8001 186.667 19.1275 200 0 200H173.334L213.333 0Z"
          fill="currentColor"
        />
      </svg>
    );
  }
}
