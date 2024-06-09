import { SimbriefClient } from '@microsoft/msfs-sdk';

import { MetarParserType } from '../../../instruments/src/metarTypes';
import { Failure } from '../failures';

type UnwrapPromise<T> = T extends PromiseLike<infer V> ? V : T;

/**
 * Events sent from the flypad client to the flypad server
 */
export interface FlypadClientEvents {
  fpc_HelloWorld: void;

  fpc_GetMetar: string;

  fpc_GetSimbriefOfp: void;

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

  fps_SendSimbriefOfp: UnwrapPromise<ReturnType<(typeof SimbriefClient)['getOfp']>>;

  fps_SendFailuresList: readonly Readonly<Failure>[];

  fps_SendFailuresState: FlypadFailuresUpdatePacket;
}

export interface FlypadFailuresUpdatePacket {
  active: number[];
  changing: number[];
}
