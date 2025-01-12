import { SimbriefClient } from '@microsoft/msfs-sdk';

import { MetarParserType } from '../../../instruments/src/metarTypes';
import { Failure } from '../failures';
import { FailuresOrchestratorState } from '../failures/failures-orchestrator';
import { Runway } from '../../../instruments/src/EFB/Performance/Data/Runways';
import { MetarSource } from '../../../instruments/src/EFBv4/FbwUserSettings';

type UnwrapPromise<T> = T extends PromiseLike<infer V> ? V : T;

/**
 * Events sent from the flypad client to the flypad server
 */
export interface FlypadClientEvents {
  fpc_HelloWorld: void;

  fpc_GetMetar: { icao: string; source: MetarSource };

  fpc_GetMagvar: string;

  fpc_GetAirportRunways: string;

  fpc_GetSimbriefOfp: string;

  fpc_ActivateFailure: number;

  fpc_DeactivateFailure: number;
}

/**
 * Events sent from the flypad server to the flypad client
 */
export interface FlypadServerEvents {
  fps_Initialized: void;

  fps_HelloWorld: string;

  fps_SendMetar: MetarParserType;

  fps_SendMagvar: number;

  fps_SendAirportRunways: Runway[];

  fps_SendSimbriefOfp: UnwrapPromise<ReturnType<(typeof SimbriefClient)['getOfp']>>;

  fps_SendFailuresList: readonly Readonly<Failure>[];

  fps_SendFailuresState: FailuresOrchestratorState;
}
