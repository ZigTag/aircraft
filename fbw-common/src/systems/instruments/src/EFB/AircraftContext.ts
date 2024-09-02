//  Copyright (c) 2024 FlyByWire Simulations
//  SPDX-License-Identifier: GPL-3.0

import { createContext } from 'react';
import { PerformanceCalculators } from '@flybywiresim/fbw-sdk';

interface SettingsPages {
  autoCalloutsPage: React.ComponentType<any>;
}

interface AircraftEfbContext {
  performanceCalculators: PerformanceCalculators;
  settingsPages: SettingsPages;
}

export const AircraftContext = createContext<AircraftEfbContext>({
  performanceCalculators: {
    takeoff: null,
    landing: null,
  },
  settingsPages: {
    autoCalloutsPage: null,
  },
});
