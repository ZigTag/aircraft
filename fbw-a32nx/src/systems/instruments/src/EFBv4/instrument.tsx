// Copyright (c) 2021-2024 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { FSComponent, FsBaseInstrument } from '@microsoft/msfs-sdk';

import { EfbV4FsInstrument } from '@flybywiresim/EFBv4';

import { SettingsAutomaticCalloutsPage } from './SettingsAutomaticCalloutsPage';
import { A32NX_DEFAULT_RADIO_AUTO_CALL_OUTS } from '../../../shared/src/AutoCallOuts';
import { A320251NTakeoffPerformanceCalculator } from '../../../shared/src/performance/a32nx_takeoff';
import { A320251NLandingCalculator } from '../../../shared/src/performance/a32nx_landing';

class A32NX_EFBv4 extends FsBaseInstrument<EfbV4FsInstrument> {
  constructInstrument(): EfbV4FsInstrument {
    return new EfbV4FsInstrument(this, {
      renderAutomaticCalloutsPage: (returnHome, autoCallOuts) => (
        <SettingsAutomaticCalloutsPage returnHome={returnHome} autoCallOuts={autoCallOuts} />
      ),
      defaultAutoCalloutsSettingValue: A32NX_DEFAULT_RADIO_AUTO_CALL_OUTS,
      performanceCalculators: {
        takeoff: new A320251NTakeoffPerformanceCalculator(),
        landing: new A320251NLandingCalculator(),
      },
      pushbackPage: {
        turnIndicatorTuningDefault: 1.35,
      },
      settingsPages: {
        audio: {
          announcements: true,
          boardingMusic: true,
          engineVolume: true,
          masterVolume: true,
          windVolume: true,
          ptuCockpit: true,
          paxAmbience: true,
        },
        // FIXME: just inject the aircraft options page from the aircraft context (or plugin in flypadOSv4).
        pinProgram: {
          latLonExtend: true,
          paxSign: true,
          rmpVhfSpacing: true,
          satcom: true,
        },
        realism: {
          mcduKeyboard: true,
          pauseOnTod: true,
          pilotAvatars: true,
          eclSoftKeys: false,
        },
        sim: {
          cones: true,
          msfsFplnSync: true,
          pilotSeat: false,
          registrationDecal: true,
          wheelChocks: true,
          cabinLighting: false,
        },
        throttle: {
          numberOfAircraftThrottles: 2,
          axisOptions: [1, 2],
          axisMapping: [
            [[1, 2]], // 1
            [[1], [2]], // 2
          ],
        },
      },
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
