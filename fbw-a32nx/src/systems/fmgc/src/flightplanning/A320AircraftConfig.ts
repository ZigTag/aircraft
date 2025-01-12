// Copyright (c) 2021-2024 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import {
  AircraftConfig,
  EngineModelParameters,
  FlightModelParameters,
  FMSymbolsConfig,
  LnavConfig,
  VnavConfig,
  VnavDescentMode,
} from '@fmgc/flightplanning/AircraftConfigTypes';
import { FlapConf } from '@fmgc/guidance/vnav/common';

const lnavConfig: LnavConfig = {
  DEFAULT_MIN_PREDICTED_TAS: 160,
  TURN_RADIUS_FACTOR: 1.0,
  NUM_COMPUTED_TRANSITIONS_AFTER_ACTIVE: -1,
};

const vnavConfig: VnavConfig = {
  VNAV_DESCENT_MODE: VnavDescentMode.NORMAL,
  VNAV_EMIT_CDA_FLAP_PWP: false,
  DEBUG_PROFILE: false,
  DEBUG_GUIDANCE: false,
  ALLOW_DEBUG_PARAMETER_INJECTION: false,
  VNAV_USE_LATCHED_DESCENT_MODE: false,
  IDLE_N1_MARGIN: 2,
  MAXIMUM_FUEL_ESTIMATE: 40000,
};

const flightModelParams: FlightModelParameters = {
  Cd0: 0.01873,
  wingSpan: 117.454,
  wingArea: 1317.47,
  wingEffcyFactor: 0.7,
  requiredAccelRateKNS: 1.33,
  requiredAccelRateMS2: 0.684,
  gravityConstKNS: 19.0626,
  gravityConstMS2: 9.806665,
  machValues: [0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85],
  dragCoefficientCorrections: [0, 0.0002, 0.0003, 0.0004, 0.0008, 0.0015, 0.01],
  speedBrakeDrag: 0.01008,
  gearDrag: 0.0372,
  dragPolarCoefficients: {
    [FlapConf.CLEAN]: [0.0215, -0.015, 0.0412, 0.0211],
    [FlapConf.CONF_1]: [0.0398, -0.0538, 0.1166, -0.064, 0.0303],
    [FlapConf.CONF_2]: [0.0729, -0.0037, -0.0018, 0.0168],
    [FlapConf.CONF_3]: [0.0902, 0.0005, -0.0056, 0.013],
    [FlapConf.CONF_FULL]: [0.1405, -0.001, -0.0056, 0.0077],
  },
};

const engineModelParams: EngineModelParameters = {
  maxThrust: 27120,
  numberOfEngines: 2,
  fuelBurnFactor: 1.0,
  cn1ClimbLimit: [
    [-2000, 30.8, 56.87, 80.28, 72.0],
    [2000, 20.99, 48.157, 82.58, 74.159],
    [5000, 16.139, 43.216, 84.642, 75.737],
    [8000, 7.342, 38.17, 86.835, 77.338],
    [10000, 4.051, 34.518, 88.183, 77.999],
    [10000.1, 4.051, 34.518, 87.453, 77.353],
    [12000, 0.76, 30.865, 88.303, 78.66],
    [15000, -4.859, 25.039, 89.748, 79.816],
    [17000, -9.934, 19.813, 90.668, 80.895],
    [20000, -15.822, 13.676, 92.106, 81.894],
    [24000, -22.75, 6.371, 93.651, 82.716],
    [27000, -29.105, -0.304, 93.838, 83.26],
    [29314, -32.049, -3.377, 93.502, 82.962],
    [31000, -34.98, -6.452, 95.392, 84.11],
    [35000, -45.679, -17.15, 96.104, 85.248],
    [39000, -45.679, -17.15, 96.205, 84.346],
    [41500, -45.679, -17.15, 95.676, 83.745],
  ],
  table1502: [
    [0, 0, 0.2, 0.9],
    [18.2, 0.0, 0.0, 17.0],
    [22.0, 1.9, 1.9, 17.4],
    [26.0, 2.5, 2.5, 18.2],
    [57.0, 12.8, 12.8, 27.0],
    [68.2, 19.6, 19.6, 34.827774],
    [77.0, 26.0, 26.0, 40.839552],
    [83.0, 31.42024, 31.42024, 44.768766],
    [89.0, 40.972041, 40.972041, 50.09214],
    [92.8, 51.0, 51.0, 55.042],
    [97.0, 65.0, 65.0, 65.0],
    [100.0, 77.0, 77.0, 77.0],
    [104.0, 85.0, 85.0, 85.5],
    [116.5, 101.0, 101.0, 101.0],
  ],
  table1503: [
    [0, 1.0, 1.20172257, 1.453783983, 2.175007333, 3.364755652, 4.47246108, 5.415178313],
    [0.0, 68.2, 69.402657, 70.671269, 73.432244, 76.544349, 78.644882, 78.644882],
    [0.1, 76.0, 77.340205, 78.753906, 81.830654, 85.298688, 87.639458, 87.639458],
    [0.2, 83.0, 84.463645, 86.007556, 89.367688, 93.155146, 95.711513, 95.711513],
    [0.4, 92.8, 94.436461, 96.162664, 99.919535, 104.154188, 107.01239, 107.01239],
    [0.6, 98.0, 99.728159, 101.55109, 105.518475, 109.990414, 113.008774, 113.008774],
    [0.75, 101.5, 103.289879, 105.177914, 109.286991, 113.918643, 117.044802, 117.044802],
    [0.9, 103.0, 104.81633, 106.0, 110.90207, 115.60217, 118.774528, 118.774528],
    [1.0, 104.2, 106.037491, 107.97575, 112.194133, 116.948991, 120.158309, 120.158309],
  ],
  table1504: [
    [0, 1.0, 1.20172257, 1.453783983, 2.175007333, 3.364755652, 4.47246108, 5.415178313],
    [0.0, 63.267593, 64.383271, 65.560133, 68.121427, 71.008456, 72.957073, 72.957073],
    [0.1, 70.503476, 71.746753, 73.058212, 75.912441, 79.129658, 81.301137, 81.301137],
    [0.2, 76.997217, 78.355007, 79.787258, 82.904376, 86.417916, 88.789399, 88.789399],
    [0.4, 86.088455, 87.606562, 89.207922, 92.693086, 96.621477, 99.272967, 99.272967],
    [0.6, 90.912377, 92.51555, 94.206642, 97.887095, 102.035612, 104.835676, 104.835676],
    [0.75, 94.159247, 95.819677, 97.571165, 101.383063, 105.679741, 108.579808, 108.579808],
    [0.9, 95.550763, 97.235732, 98.333795, 102.881334, 107.24151, 110.184435, 110.184435],
    [1.0, 104.2, 106.037491, 107.97575, 112.194133, 116.948991, 120.158309, 120.158309],
  ],
  table1506: [
    [0.0, 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [20.0, 0.091741, 0.05702, 0.052029, 0.028096, -0.017284, -0.037284, -0.057077, -0.205841, -0.315399, -0.488717],
    [25.0, 0.14281, 0.072215, 0.053026, 0.030404, -0.009593, -0.026571, -0.041999, -0.151328, -0.266204, -0.439028],
    [30.0, 0.189837, 0.082322, 0.05505, 0.032748, 0.017389, 0.00399, -0.026921, -0.051814, -0.081946, -0.369391],
    [35.0, 0.262207, 0.126047, 0.077206, 0.045921, 0.024719, 0.006062, -0.002812, -0.0228, -0.044248, -0.293631],
    [40.0, 0.33023, 0.162757, 0.124088, 0.069579, 0.057905, 0.049621, 0.02979, -0.002139, -0.025811, -0.22063],
    [45.0, 0.393293, 0.250096, 0.156707, 0.112419, 0.091418, 0.076757, 0.05609, 0.018509, -0.007375, -0.15512],
    [50.0, 0.452337, 0.311066, 0.211353, 0.158174, 0.127429, 0.104915, 0.081171, 0.047419, 0.011062, -0.098474],
    [55.0, 0.509468, 0.373568, 0.269961, 0.209106, 0.16865, 0.137223, 0.108383, 0.07566, 0.028704, -0.049469],
    [60.0, 0.594614, 0.439955, 0.334629, 0.267477, 0.217773, 0.176899, 0.141404, 0.107148, 0.064556, -0.005036],
    [65.0, 0.660035, 0.512604, 0.407151, 0.335055, 0.276928, 0.226669, 0.183627, 0.14585, 0.104441, 0.039012],
    [70.0, 0.733601, 0.593506, 0.488571, 0.412623, 0.347163, 0.28821, 0.237559, 0.195142, 0.152485, 0.087269],
    [75.0, 0.818693, 0.68388, 0.578756, 0.499514, 0.427939, 0.361604, 0.304241, 0.257197, 0.212005, 0.144042],
    [80.0, 0.910344, 0.783795, 0.675982, 0.593166, 0.516644, 0.444822, 0.382689, 0.332384, 0.284867, 0.212679],
    [85.0, 1.025165, 0.891823, 0.776548, 0.688692, 0.608128, 0.53321, 0.469351, 0.41869, 0.37087, 0.294907],
    [90.0, 1.157049, 1.004695, 0.8744, 0.778466, 0.694251, 0.619011, 0.557581, 0.511153, 0.467149, 0.390203],
    [95.0, 1.281333, 1.116993, 0.960774, 0.851733, 0.763455, 0.69089, 0.637136, 0.601322, 0.567588, 0.495167],
    [100.0, 1.357935, 1.220844, 1.023864, 0.894234, 0.800352, 0.733488, 0.693684, 0.654691, 0.617963, 0.539115],
    [105.0, 1.378826, 1.239626, 1.048498, 0.91575, 0.819609, 0.751137, 0.710375, 0.670444, 0.632832, 0.552086],
    [110.0, 1.392754, 1.252148, 1.069322, 0.933937, 0.835886, 0.766054, 0.724483, 0.683759, 0.6454, 0.563051],
  ],
};

const fmsSymbolConfig: FMSymbolsConfig = {
  publishDepartureIdent: false,
};

export const A320AircraftConfig: AircraftConfig = {
  lnavConfig,
  vnavConfig,
  engineModelParameters: engineModelParams,
  flightModelParameters: flightModelParams,
  fmSymbolConfig: fmsSymbolConfig,
};
