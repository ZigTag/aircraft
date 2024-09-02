import { LandingPerformanceCalculator } from './landing';
import { TakeoffPerformanceCalculator } from './takeoff';

export * from './landing';
export * from './takeoff';

export interface PerformanceCalculators {
  takeoff: TakeoffPerformanceCalculator | null;
  landing: LandingPerformanceCalculator | null;
}
