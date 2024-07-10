// Copyright (c) 2021-2024 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { FSComponent, FsBaseInstrument } from '@microsoft/msfs-sdk';

import { EfbV4FsInstrument } from '@flybywiresim/EFBv4';

import { SettingsAutomaticCalloutsPage } from './SettingsAutomaticCalloutsPage';
import { A32NX_DEFAULT_RADIO_AUTO_CALL_OUTS } from '../../../shared/src/AutoCallOuts';

class A32NX_EFBv4 extends FsBaseInstrument<EfbV4FsInstrument> {
  constructInstrument(): EfbV4FsInstrument {
    return new EfbV4FsInstrument(this, {
      renderAutomaticCalloutsPage: (returnHome, autoCallOuts) => (
        <SettingsAutomaticCalloutsPage returnHome={returnHome} autoCallOuts={autoCallOuts} />
      ),
      defaultAutoCalloutsSettingValue: A32NX_DEFAULT_RADIO_AUTO_CALL_OUTS,
    });
  }

  get isInteractive(): boolean {
    return true;
  }

  get templateID(): string {
    return 'A32NX_EFBv4';
  }
}

registerInstrument('a32nx-efbv4', A32NX_EFBv4);
