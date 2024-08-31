import { DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';
import React from 'react';

interface A320GroundOutlineProps {
  cabinLeftStatus: Subscribable<boolean>;
  cabinRightStatus: Subscribable<boolean>;
  aftLeftStatus: Subscribable<boolean>;
  aftRightStatus: Subscribable<boolean>;
}

export class A320GroundOutline extends DisplayComponent<A320GroundOutlineProps> {
  private readonly cabinLeftStatusClass = this.props.cabinLeftStatus.map((value) => {
    return value ? '#6bbe45' : 'none';
  });

  private readonly cabinRightStatusClass = this.props.cabinRightStatus.map((value) => {
    return value ? '#6bbe45' : 'none';
  });

  private readonly aftLeftStatusClass = this.props.aftLeftStatus.map((value) => {
    return value ? '#6bbe45' : 'none';
  });

  private readonly aftRightStatusClass = this.props.aftRightStatus.map((value) => {
    return value ? '#6bbe45' : 'none';
  });

  render(): VNode | null {
    return (
      <svg
        id="SVG"
        class="inset-x-0 mx-auto size-full text-theme-text"
        xmlns="http://www.w3.org/2000/svg"
        width="777"
        height="814"
        viewBox="0 0 777 814"
      >
        <defs>
          <style>
            {
              '.cls-1,.cls-2,.cls-4,.cls-5,.cls-7{fill:none;stroke-miterlimit:10}.cls-1,.cls-4{stroke:currentColor}.cls-2,.cls-4{stroke-width:2px}.cls-2{stroke:currentColor}.cls-5,.cls-7{stroke:currentColor;stroke-width:.5px}.cls-7{stroke:currentColor}'
            }
          </style>
        </defs>
        <g id="SVG_Detail_Lines">
          <g id="Engines">
            <g id="ENG_1">
              <g id="Strakes">
                <path
                  id="Outer_Strake"
                  class="cls-5"
                  d="m245.67 265.78 1.36 21.31-6.67.39c.61-8.46 2.21-16.4 5.3-21.71Z"
                />
                <path
                  id="Inner_Strake"
                  class="cls-5"
                  d="m276.83 265.78-1.36 21.31 6.67.39c-.61-8.46-2.21-16.4-5.3-21.71Z"
                />
              </g>
              <g id="Reverser_Door">
                <path id="Outer_Side" class="cls-5" d="M256.92 295.91c-7.92 0-14.42-.09-19.83-.7" />
                <path id="Inner_Side" class="cls-5" d="M265.58 295.91c7.92 0 14.42-.09 19.83-.7" />
              </g>
              <g id="Engine_Mount">
                <g id="Connections">
                  <path
                    id="Fan_Connection"
                    class="cls-7"
                    d="m238.37 261.87.37-2.34c14.97-1.51 30.05-1.51 45.02 0l.37 2.34"
                  />
                  <path id="Middle_Connection" class="cls-7" d="M261.25 252.6v5.8" />
                </g>
                <g id="Mounts">
                  <path id="Left_Mount" class="cls-5" d="M255.06 295.9v-37.5" />
                  <path id="Right_Mount" class="cls-5" d="M267.39 295.9v-37.42" />
                  <path id="Front_Mount" class="cls-5" d="M255.06 260.72h12.33" />
                </g>
              </g>
              <path id="Wing_Mount" class="cls-5" d="m272.64 321.82-7.6 3.97-9.98 9.57" />
            </g>
            <g id="ENG_2">
              <g id="Strakes-2">
                <path
                  id="Outer_Strake-2"
                  class="cls-5"
                  d="m530.97 265.78-1.36 21.31 6.67.39c-.61-8.46-2.21-16.4-5.3-21.71Z"
                />
                <path
                  id="Inner_Strake-2"
                  class="cls-5"
                  d="m499.81 265.78 1.36 21.31-6.67.39c.61-8.46 2.21-16.4 5.3-21.71Z"
                />
              </g>
              <g id="Reverser_Door-2">
                <path id="Outer_Side-2" class="cls-5" d="M519.72 295.91c7.92 0 14.42-.09 19.83-.7" />
                <path id="Inner_Side-2" class="cls-5" d="M511.05 295.91c-7.92 0-14.42-.09-19.83-.7" />
              </g>
              <g id="Engine_Mount-2">
                <g id="Connections-2">
                  <path
                    id="Fan_Connection-2"
                    class="cls-7"
                    d="m538.27 261.87-.37-2.34a224.275 224.275 0 0 0-45.02 0l-.37 2.34"
                  />
                  <path id="Middle_Connection-2" class="cls-7" d="M515.39 252.6v5.8" />
                </g>
                <g id="Mounts-2">
                  <path id="Right_Mount-2" class="cls-5" d="M521.58 295.9v-37.5" />
                  <path id="Left_Mount-2" class="cls-5" d="M509.25 295.9v-37.42" />
                  <path id="Front_Mount-2" class="cls-5" d="M521.58 260.72h-12.33" />
                </g>
              </g>
              <path id="Wing_Mount-2" class="cls-5" d="m503.99 321.82 7.61 3.97 9.15 8.61" />
            </g>
          </g>
          <g id="Emergency_Lines">
            <path id="Left_Emergency_Marks" class="cls-5" d="M346.2 307h-20.55a6.31 6.31 0 0 0-6.31 6.31v84.6" />
            <path id="Right_Emergency_Marks" class="cls-5" d="M430.18 307h20.55a6.31 6.31 0 0 1 6.31 6.31v84.6" />
          </g>
          <g id="Wing_Layers">
            <path id="Left_Wing_Markings" class="cls-5" d="M346.2 292.33 35.36 449.78v11.89l219.86-87.34 64.11-12.21" />
            <path
              id="Right_Wing_Markings"
              class="cls-5"
              d="m430.19 292.71 312.1 158.12v11.34l-221.12-87.84-64.09-12.21"
            />
          </g>
          <g id="Doors">
            <g id="Rear_Doors">
              <path
                id="AFT_Left_PS_PSS"
                class="cls-2"
                d="M352.06 650.21h5.13c1.55 0 2.74-1.36 2.54-2.9l-1.55-11.75a2.558 2.558 0 0 0-2.54-2.23h-6.16"
                style={{
                  stroke: '#6bbe45',
                  strokeWidth: '2',
                  fill: this.aftLeftStatusClass,
                  strokeMiterlimit: '10',
                }}
              />
              <path
                id="AFT_Right_CAT"
                class="cls-2"
                d="M424.48 650.21h-5.13c-1.55 0-2.74-1.36-2.54-2.9l1.55-11.75a2.558 2.558 0 0 1 2.54-2.23h6.16"
                style={{
                  stroke: '#6bbe45',
                  strokeWidth: '2',
                  fill: this.aftRightStatusClass,
                  strokeMiterlimit: '10',
                }}
              />
            </g>
            <g id="Emergency_Doors">
              <path
                id="AFT_Left_EMG"
                class="cls-2"
                d="M346.2 337.61h3.14c.95 0 1.72-.77 1.72-1.72v-7.61c0-.95-.77-1.72-1.72-1.72h-3.14"
                style={{
                  stroke: '#6bbe45',
                  strokeWidth: '2',
                  fill: 'none',
                  strokeMiterlimit: '10',
                }}
              />
              <path
                id="FWD_Left_EMG"
                class="cls-2"
                d="M346.2 319.32h3.14c.95 0 1.72-.77 1.72-1.72v-7.61c0-.95-.77-1.72-1.72-1.72h-3.14"
                style={{
                  stroke: '#6bbe45',
                  strokeWidth: '2',
                  fill: 'none',
                  strokeMiterlimit: '10',
                }}
              />
              <path
                id="AFT_Right_EMG"
                class="cls-2"
                d="M430.28 337.61h-3.14c-.95 0-1.72-.77-1.72-1.72v-7.61c0-.95.77-1.72 1.72-1.72h3.14"
                style={{
                  stroke: '#6bbe45',
                  strokeWidth: '2',
                  fill: 'none',
                  strokeMiterlimit: '10',
                }}
              />
              <path
                id="FWD_Right_EMG"
                class="cls-2"
                d="M430.28 319.32h-3.14c-.95 0-1.72-.77-1.72-1.72v-7.61c0-.95.77-1.72 1.72-1.72h3.14"
                style={{
                  stroke: '#6bbe45',
                  strokeWidth: '2',
                  fill: 'none',
                  strokeMiterlimit: '10',
                }}
              />
            </g>
            <g id="Front_Doors">
              <path
                id="FWD_Right_CAT"
                class="cls-2"
                d="M430.28 118.06h-9.08a2.67 2.67 0 0 1-2.67-2.67v-11.72a2.67 2.67 0 0 1 2.67-2.67h8.38"
                style={{
                  stroke: '#6bbe45',
                  strokeWidth: '2',
                  fill: this.cabinRightStatusClass,
                  strokeMiterlimit: '10',
                }}
              />
              <path
                id="FWD_Left_PS_PSS"
                class="cls-2"
                d="M346.2 118.06h9.08a2.67 2.67 0 0 0 2.67-2.67v-11.72a2.67 2.67 0 0 0-2.67-2.67h-8.38"
                style={{
                  stroke: '#6bbe45',
                  strokeWidth: '2',
                  fill: this.cabinLeftStatusClass,
                  strokeMiterlimit: '10',
                }}
              />
            </g>
            <g id="Cargo_Doors">
              <g id="BLK_Cargo">
                <path class="cls-2" d="M430.19 553.33h-2" />
                <path
                  d="M423.87 553.33h-7.83c-1.4 0-2.54 1.14-2.54 2.54v15.25c0 1.4 1.14 2.54 2.54 2.54h9.99"
                  style={{
                    strokeDasharray: '0 0 4.32 4.32',
                    stroke: '#6bbe45',
                    strokeWidth: '2',
                    fill: 'none',
                    strokeMiterlimit: '10',
                  }}
                />
                <path class="cls-2" d="M428.19 573.67h2" />
              </g>
              <g id="AFT_Cargo">
                <path class="cls-2" d="M430.18 503h-2" />
                <path
                  d="M424.16 503h-14.91c-1.98 0-3.58-1.6-3.58-3.58v-27.33c0-1.98 1.6-3.58 3.58-3.58h17.02"
                  style={{
                    strokeDasharray: '0 0 4.03 4.03',
                    stroke: '#6bbe45',
                    strokeWidth: '2',
                    fill: 'none',
                    strokeMiterlimit: '10',
                  }}
                />
                <path class="cls-2" d="M428.28 468.5h2" />
              </g>
              <g id="FWD_Cargo">
                <path class="cls-2" d="M430.28 154.67h-2" />
                <path
                  d="M424.2 154.67h-15.17c-2.13 0-3.86 1.73-3.86 3.86v26.94c0 2.13 1.73 3.86 3.86 3.86h17.21"
                  style={{
                    strokeDasharray: '0 0 4.08 4.08',
                    stroke: '#6bbe45',
                    strokeWidth: '2',
                    fill: 'none',
                    strokeMiterlimit: '10',
                  }}
                />
                <path class="cls-2" d="M428.28 189.33h2" />
              </g>
            </g>
          </g>
        </g>
        <g id="SVG_Main_Lines">
          <g id="Rear_Stablizer">
            <g id="Right_Fin">
              <path id="Right_Elevator" class="cls-1" d="m409.78 769.69 3.03-21.36 109.98 38.56" />
              <path
                id="Right_Fin_Outline"
                class="cls-4"
                d="M405.01 769.34c3.31-.08 7.06.74 8.21 1.02 3.98.98 109.58 24.53 109.58 24.53v-12.35c0-6.22-1.16-14.42-6.88-17.99.08.17-86.62-55.2-86.62-55.2-5.14-3.32-10.2-6.8-12.7-16.62"
              />
            </g>
            <g id="Left_Fin">
              <path id="Left_Elevator" class="cls-1" d="m366.7 769.69-3.03-21.36-109.98 38.56" />
              <path
                id="Left_Fin_Outline"
                class="cls-4"
                d="M371.47 769.34c-3.31-.08-7.06.74-8.21 1.02-3.98.98-109.58 24.53-109.58 24.53v-12.35c0-6.22 1.16-14.42 6.88-17.99-.08.17 86.62-55.2 86.62-55.2 5.14-3.32 10.2-6.8 12.7-16.62"
              />
            </g>
            <path
              id="Rudder"
              class="cls-4"
              d="M388.5 796.17s-6-61-6-87.33 2.5-75.5 6-75.5h.07c3.5 0 5.93 49.17 5.93 75.5s-6 87.33-6 87.33"
            />
          </g>
          <g id="Wings">
            <g id="Right_Wing">
              <g id="Right_Slats">
                <path id="Inner_Slats" class="cls-1" d="M436.35 283.52v10.37L500.48 327l4.56-7.85" />
                <g id="Main_Slats">
                  <path id="Outer_Divider" class="cls-1" d="m692.06 423.46 3.29-5.59" />
                  <path id="Middle_Divider" class="cls-1" d="m637.09 395.69 3.77-6.09" />
                  <path id="Inner_Divider" class="cls-1" d="m582.46 368.11 3.63-6.92" />
                  <path id="Main_Slats_Outline" class="cls-1" d="m740.33 441.28-3.3 4.89-216.28-109.23v-9.72" />
                </g>
              </g>
              <g id="Right_Wing_Flap_Fairings">
                <path
                  id="Outer"
                  class="cls-1"
                  d="M645.34 447.05c-.41 8.89 2.83 18.13 2.83 18.13s2.62-8.94 2.87-16.34"
                />
                <path
                  id="Middle"
                  class="cls-1"
                  d="M565.52 422.12c-.15 6.84 3.02 17.3 3.02 17.3s3.04-10.89 3.24-15.35"
                />
                <path id="Inner" class="cls-1" d="M490.43 409.89c0 6.63 3.2 15.28 3.2 15.28s2.71-9.28 2.71-15.28" />
              </g>
              <g id="Right_Flaps">
                <path id="Flap_Divider" class="cls-1" d="M527.05 410.11v-11.35" />
                <path id="Flap_Outline" class="cls-1" d="M430.28 397.92h94.45l156.08 56.58v3.63" />
              </g>
              <g id="Right_Spoilers">
                <path id="Inner_Spoiler" class="cls-1" d="M494.37 397.92V384h30.34l.08 13.92" />
                <g id="Main_Spoilers">
                  <path id="Outer_Divider-2" class="cls-1" d="m639.29 439.42 4.96-13.81" />
                  <path id="Middle_Divider-2" class="cls-1" d="m606.89 427.68 5.25-13.7" />
                  <path id="Inner_Divider-2" class="cls-1" d="m570.46 414.47 5.34-13.65" />
                  <path id="Main_Spoiler_Outline" class="cls-1" d="m534.5 401.44 6.37-13.27 135.75 49.16-4.68 13.93" />
                </g>
              </g>
              <path id="Right_Aileron" class="cls-1" d="M742.29 476.96v-13.35l-56.26-20.22-1.39 2.78v12.73" />
              <g id="ENG_2-2">
                <path
                  id="Engine_Mount-3"
                  class="cls-1"
                  d="M511.05 321.93V274.5c0-5.5 1.29-10.5 4.29-10.5h.05c3 0 4.33 5 4.33 10.5v51.92"
                />
                <path
                  id="Engine"
                  class="cls-4"
                  d="M519.72 320.06h15.53c.62 0 1.15-.43 1.26-1.04.72-3.83 3.13-17.76 3.13-34.18 0-19.33-1.92-31.04-3-32.5-1.67-2.25-4.6-3.94-21.18-3.94h-.15c-16.58 0-19.5 1.69-21.17 3.94-1.08 1.46-3 13.17-3 32.5 0 11.27 1.13 21.38 2.08 27.84"
                />
                <path id="Exhaust" class="cls-1" d="M530.05 320.06s-1.97 8.42-3.34 10" />
                <path id="Engine_Inner_end" class="cls-4" d="M507.45 320.06h3.6" />
                <path id="Cowling" class="cls-1" d="M493.6 255.65c0-4.06 43.58-4.06 43.58 0" />
              </g>
              <path
                id="Right_Wing_Outliine"
                class="cls-4"
                d="M430.28 409.89h96.07l225.04 70.28s3.99 14.18 5.65 14.18-3.56-29.35-3.74-30.59c0 0-2.65-17.49-13.84-23.29S435.68 282.9 435.68 282.9c-2.57-1.57-5.39-30-5.39-30"
              />
            </g>
            <g id="Left_Wing">
              <g id="Left_Slats">
                <path id="Inner_Slats-2" class="cls-1" d="M339.62 283.52v10.37L275.5 327l-4.57-7.85" />
                <g id="Main_Slats-2">
                  <path id="Outer_Divider-3" class="cls-1" d="m83.92 423.46-3.3-5.59" />
                  <path id="Middle_Divider-3" class="cls-1" d="m138.89 395.69-3.78-6.09" />
                  <path id="Inner_Divider-3" class="cls-1" d="m193.51 368.11-3.62-6.92" />
                  <path id="Main_Slats_Outline-2" class="cls-1" d="m35.65 441.28 3.29 4.89 216.28-109.23v-9.72" />
                </g>
              </g>
              <g id="Left_Wing_Flap_Fairings">
                <path
                  id="Outer-2"
                  class="cls-1"
                  d="M131.14 447.05c.41 8.89-2.83 18.13-2.83 18.13s-2.62-8.94-2.87-16.34"
                />
                <path
                  id="Middle-2"
                  class="cls-1"
                  d="M210.96 422.12c.15 6.84-3.02 17.3-3.02 17.3s-3.04-10.89-3.24-15.35"
                />
                <path id="Inner-2" class="cls-1" d="M286.05 409.89c0 6.63-3.2 15.28-3.2 15.28s-2.71-9.28-2.71-15.28" />
              </g>
              <g id="Left_Flaps">
                <path id="Flap_Divider-2" class="cls-1" d="M249.43 410.11v-11.35" />
                <path id="Flap_Outline-2" class="cls-1" d="M346.2 397.92h-94.45L95.67 454.5v3.63" />
              </g>
              <g id="Left_Spoilers">
                <path id="Inner_Spoiler-2" class="cls-1" d="M282.17 397.92V384h-30.34l-.08 13.92" />
                <g id="Main_Spoilers-2">
                  <path id="Outer_Divider-4" class="cls-1" d="m137.25 439.42-4.96-13.81" />
                  <path id="Middle_Divider-4" class="cls-1" d="m169.65 427.68-5.25-13.7" />
                  <path id="Inner_Divider-4" class="cls-1" d="m206.08 414.47-5.34-13.65" />
                  <path
                    id="Main_Spoilers_Outline"
                    class="cls-1"
                    d="m242.04 401.44-6.37-13.27-135.75 49.16 4.68 13.93"
                  />
                </g>
              </g>
              <path id="Left_Aileron" class="cls-1" d="M35.36 476.96v-13.35l56.25-20.22 1.39 2.78v12.73" />
              <g id="ENG_1-2">
                <path
                  id="Engine_Mount-4"
                  class="cls-1"
                  d="M265.58 321.93V274.5c0-5.5-1.29-10.5-4.29-10.5h-.05c-3 0-4.33 5-4.33 10.5v51.92"
                />
                <path
                  id="Engine-2"
                  class="cls-4"
                  d="M256.92 320.06h-15.53c-.62 0-1.15-.43-1.26-1.04-.72-3.83-3.13-17.76-3.13-34.18 0-19.33 1.92-31.04 3-32.5 1.67-2.25 4.6-3.94 21.18-3.94h.15c16.58 0 19.5 1.69 21.17 3.94 1.08 1.46 3 13.17 3 32.5 0 11.27-1.13 21.38-2.08 27.84"
                />
                <path id="Exhaust-2" class="cls-1" d="M246.58 320.06s1.97 8.42 3.34 10" />
                <path id="Engine_Inner_end-2" class="cls-4" d="M269.19 320.06h-3.61" />
                <path id="Cowling-2" class="cls-1" d="M239.46 255.65c0-4.06 43.58-4.06 43.58 0" />
              </g>
              <path
                id="Left_Wing_Outline"
                class="cls-4"
                d="M346.2 409.89h-96.07L25.09 480.17s-3.99 14.18-5.65 14.18S23 465 23.18 463.76c0 0 2.65-17.49 13.84-23.29C48.21 434.67 340.8 282.9 340.8 282.9c2.57-1.57 5.39-30 5.39-30"
              />
            </g>
          </g>
          <g id="Fuselage">
            <path id="APU_Exhaust" class="cls-1" d="m384.38 809.8.59-.08c2.34-.3 4.71-.28 7.04.06h.08" />
            <g id="Cockpit_Windows">
              <g id="Cockpit_Windows_Left">
                <path
                  class="cls-1"
                  d="m373.46 47.17 12.18-6.93c.37-.21.6-.6.6-1.02v-7c0-.92-1.04-1.47-1.8-.95l-14.67 10c-.6.41-.75 1.24-.32 1.83l2.72 3.79a1 1 0 0 0 1.3.28ZM367.17 44.57l2.08 2.55c.21.26.33.58.33.92v2.37c0 .31-.08.61-.24.88l-3.39 5.74c-.24.4-.67.65-1.14.65h-3.74c-.63 0-1.14-.51-1.14-1.14v-.49c0-.29.07-.58.21-.84l5.53-10.49a.906.906 0 0 1 1.51-.15ZM364.33 61.34l-2.56 6.51c-.07.18-.18.34-.31.48l-3.05 3.5c-.54.62-1.32.98-2.15.98h-1.17c-.9 0-1.5-.91-1.16-1.74L358.15 61c.19-.43.61-.71 1.08-.71h4.37c.54 0 .92.55.72 1.06Z"
                />
              </g>
              <g id="Cockpit_Windows_Right">
                <path
                  class="cls-1"
                  d="m402.93 47.17-12.18-6.93c-.37-.21-.6-.6-.6-1.02v-7c0-.92 1.04-1.47 1.8-.95l14.67 10c.6.41.75 1.24.32 1.83l-2.72 3.79a1 1 0 0 1-1.3.28ZM409.22 44.57l-2.08 2.55c-.21.26-.33.58-.33.92v2.37c0 .31.08.61.24.88l3.39 5.74c.24.4.67.65 1.14.65h3.74c.63 0 1.14-.51 1.14-1.14v-.49c0-.29-.07-.58-.21-.84l-5.53-10.49a.906.906 0 0 0-1.51-.15ZM412.06 61.34l2.56 6.51c.07.18.18.34.31.48l3.05 3.5c.54.62 1.32.98 2.15.98h1.17c.9 0 1.5-.91 1.16-1.74L418.24 61c-.19-.43-.61-.71-1.08-.71h-4.37c-.54 0-.92.55-.72 1.06Z"
                />
              </g>
            </g>
            <path
              id="Fuselage_Outline"
              class="cls-4"
              d="M388.23 3c3.78 0 8.46 3.32 13.37 10.72 11.88 17.9 18.4 36.91 23.48 58.24 4.2 17.63 5.19 34.26 5.19 47.3v478.7c0 34.54-17.99 114-17.99 114l-3.73 19.23c-.1.51-.16 1.03-.17 1.56l-.61 16.28c-.58 9.82-2.6 20.14-6.01 32.56-3.12 11.37-5.9 24.12-11.09 30.1a.64.64 0 0 1-.46.21h-3.95c-.18 0-.35-.07-.46-.21-5.19-5.98-7.97-18.73-11.09-30.1-3.41-12.42-5.43-22.74-6.01-32.56l-.61-16.28a9.19 9.19 0 0 0-.17-1.56l-3.73-19.23s-17.99-79.46-17.99-114v-478.7c0-13.04.99-29.67 5.19-47.3 5.08-21.33 11.6-40.34 23.48-58.24C379.78 6.32 384.38 3 388.16 3h.06Z"
            />
          </g>
        </g>
      </svg>
    );
  }
}

export interface A320OverwingOutlineProps {
  class?: string;
}

export class A320OverwingOutline extends DisplayComponent<A320OverwingOutlineProps> {
  render(): VNode | null {
    return (
      <svg
        width="1278"
        height="455"
        viewBox="0 0 1290 455"
        fill="none"
        class={this.props.class ?? ''}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M717.101 288.355H874.129L1268.63 407.972L1289.48 442.937V430.051L1268.63 358.286L727.518 77.3383C724.937 72.8587 722.81 68.1323 721.169 63.2297C718.113 54.1487 716.735 44.5873 717.101 35.0127V288.355Z"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M814.615 288.355C814.311 299.45 816.623 310.462 821.364 320.499C822.912 315.677 824.146 310.76 825.056 305.779C826.11 300.026 826.723 294.201 826.89 288.355"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeMiterlimit="10"
        />
        <path
          d="M949.258 309.964C949.091 315.811 948.478 321.635 947.424 327.388C946.521 332.369 945.296 337.286 943.755 342.108C939.009 332.076 936.72 321.057 937.077 309.964V307.401"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeMiterlimit="10"
        />
        <path
          d="M1078.42 348.857C1078.1 359.778 1076.24 370.599 1072.9 381.001C1070.77 376.524 1069.13 371.834 1068 367.01C1066.6 361.065 1065.98 354.963 1066.15 348.857V346.317"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeMiterlimit="10"
        />
        <path
          d="M806.174 118.182C805.092 104.607 804.175 90.7884 803.423 76.7269C803.078 70.0645 802.772 63.4727 802.506 56.9514C801.075 55.4438 799.971 53.6575 799.262 51.704C798.553 49.7504 798.254 47.6717 798.384 45.5975C798.514 43.5233 799.071 41.4983 800.018 39.6488C800.966 37.7993 802.285 36.165 803.893 34.8481V29.7925L804.81 23.3496L808.126 21.5155C820.823 20.4104 834.65 19.7049 849.44 19.6814C864.23 19.6579 878.151 20.2928 890.896 21.3744C891.491 22.9151 892.009 24.4847 892.448 26.0773C893.322 29.2444 893.943 32.476 894.305 35.7416C894.958 41.5409 895.178 47.3807 894.964 53.2127"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M891.012 48.2041C895.981 56.2357 898.709 65.4508 898.913 74.8927H891.012V48.2041Z"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M895.033 74.8928C894.469 86.4618 893.505 98.7833 892 111.693C890.707 122.65 889.131 133.091 887.297 142.966H863.783V148.163"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M804.81 23.3496L808.125 14.6258C820.851 13.1616 833.645 12.3766 846.454 12.2744C860.824 12.1788 875.187 12.9641 889.461 14.6258L890.896 21.3744"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M840.856 136.194V77.4089C840.85 73.665 841.608 69.9592 843.083 66.5184C844.559 63.0776 846.722 59.9743 849.439 57.3983C852.498 59.9326 854.922 63.1467 856.518 66.7844C858.115 70.422 858.839 74.3824 858.633 78.3495V145.412"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M573.312 291.929H416.284L21.8569 411.546L0.999789 446.511V433.625L21.8569 361.86L562.895 80.8183C565.479 76.3399 567.606 71.6133 569.244 66.7097C572.308 57.6304 573.686 48.0676 573.312 38.4927V291.929Z"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M475.799 291.929C475.966 298.035 475.342 304.137 473.941 310.082C472.812 314.906 471.172 319.596 469.05 324.073C465.705 313.671 463.845 302.85 463.524 291.929"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeMiterlimit="10"
        />
        <path
          d="M341.156 313.444C341.323 319.291 341.936 325.115 342.99 330.868C343.901 335.847 345.126 340.764 346.659 345.588C348.8 341.117 350.447 336.425 351.573 331.597C352.979 325.653 353.596 319.55 353.407 313.444V310.905"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeMiterlimit="10"
        />
        <path
          d="M211.993 352.337C212.321 363.259 214.19 374.081 217.542 384.481C219.664 380.004 221.304 375.314 222.433 370.49C223.834 364.545 224.458 358.443 224.291 352.337V349.797"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeMiterlimit="10"
        />
        <path
          d="M485.604 26.8534C457.101 22.6458 428.187 21.9744 399.519 24.8547"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M395.38 78.3728C395.944 89.9653 396.908 102.263 398.413 115.173C399.706 126.154 401.282 136.594 403.116 146.446H426.63V151.667"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M449.557 139.675V80.889C449.555 76.6671 448.59 72.5012 446.735 68.7086C445.298 65.7752 443.347 63.1232 440.974 60.8784C437.915 63.4127 435.49 66.6268 433.894 70.2645C432.298 73.9021 431.574 77.8625 431.78 81.8296V148.916"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M399.049 121.663C397.967 108.197 397.034 94.4096 396.25 80.301C395.906 73.6543 395.6 67.0625 395.333 60.5256C393.899 59.0232 392.79 57.2405 392.078 55.2894C391.365 53.3383 391.063 51.261 391.191 49.1877C391.319 47.1144 391.874 45.0899 392.822 43.2414C393.769 41.3929 395.089 39.7602 396.697 38.4457V33.2726L397.614 26.8532L400.93 24.9956"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M484.569 24.502C485.016 25.6541 485.581 27.2766 486.145 29.2048C487.006 32.3658 487.62 35.5892 487.979 38.8456C488.632 44.6528 488.852 50.5004 488.637 56.3402"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M484.758 49.7327C487.075 53.487 488.915 57.5155 490.236 61.7249C491.719 66.486 492.511 71.4352 492.588 76.4213H484.687L484.758 49.7327Z"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path d="M484.757 121.404L487.932 76.4213" stroke="currentColor" strokeMiterlimit="10" />
        <path
          d="M573.383 453.824V378.252V0.0163574"
          stroke="currentColor"
          strokeWidth="0.829759"
          strokeMiterlimit="10"
        />
        <path d="M717.089 0V455" stroke="currentColor" strokeWidth="0.98456" strokeMiterlimit="10" />
        <path
          d="M399.519 27.5586L402.834 18.8113C429.859 15.7286 457.146 15.7286 484.17 18.8113L485.604 25.5598"
          stroke="currentColor"
          strokeMiterlimit="10"
        />
        <path
          d="M717.149 101.605L1258.47 370.443L1259.17 392.523L716.772 211.98L717.149 101.605Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeMiterlimit="10"
        />
        <path
          d="M1151.06 355.229L1149.83 316.431L1151.06 355.229Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeMiterlimit="10"
        />
        <path
          d="M1027.44 256.658L1029.25 314.268L1027.44 256.658Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeMiterlimit="10"
        />
        <path
          d="M714.115 211.98V101.605L576.722 101.605V211.98H714.115Z"
          stroke="currentColor"
          strokeWidth="1.89"
          strokeMiterlimit="10"
        />
        <path
          d="M573.147 101.605L31.7794 370.443L31.0976 392.523L573.547 211.98L573.147 101.605Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeMiterlimit="10"
        />
        <path
          d="M139.334 355.229L140.557 316.431L139.334 355.229Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeMiterlimit="10"
        />
        <path
          d="M262.877 256.658L261.066 314.268L262.877 256.658Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeMiterlimit="10"
        />
      </svg>
    );
  }
}
