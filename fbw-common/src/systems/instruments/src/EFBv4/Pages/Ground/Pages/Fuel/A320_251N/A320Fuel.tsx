import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { FuelProps } from '../Fuel';
import { A320OverwingOutline } from '../../Widgets/GroundOutlines';
import { t } from '@localization/translation';
import { twMerge } from 'tailwind-merge';
import { Slider } from 'instruments/src/EFBv4/Components/Slider';

export class A320Fuel extends DisplayComponent<FuelProps> {
  private readonly centerCurrentBg = this.props.groundState.centerCurrent.map((value) => {
    const percent = this.props.groundState.fillPercent(value, this.props.groundState.CENTER_TANK_GALLONS);
    return `linear-gradient(to top, rgb(var(--color-highlight)) ${percent}%,#ffffff00 0%)`;
  });
  private readonly LInnCurrentBg = this.props.groundState.LInnCurrent.map((value) => {
    const percent = this.props.groundState.fillPercent(value, this.props.groundState.INNER_CELL_GALLONS);
    return `linear-gradient(to top, rgb(var(--color-highlight)) ${percent}%,#ffffff00 0%)`;
  });
  private readonly LOutCurrentBg = this.props.groundState.LOutCurrent.map((value) => {
    const percent = this.props.groundState.fillPercent(value, this.props.groundState.OUTER_CELL_GALLONS);
    return `linear-gradient(to top, rgb(var(--color-highlight)) ${percent}%,#ffffff00 0%)`;
  });
  private readonly RInnCurrentBg = this.props.groundState.RInnCurrent.map((value) => {
    const percent = this.props.groundState.fillPercent(value, this.props.groundState.INNER_CELL_GALLONS);
    return `linear-gradient(to top, rgb(var(--color-highlight)) ${percent}%,#ffffff00 0%)`;
  });
  private readonly ROutCurrentBg = this.props.groundState.ROutCurrent.map((value) => {
    const percent = this.props.groundState.fillPercent(value, this.props.groundState.OUTER_CELL_GALLONS);
    return `linear-gradient(to top, rgb(var(--color-highlight)) ${percent}%,#ffffff00 0%)`;
  });

  render(): VNode | null {
    return (
      <div class="relative mt-6 flex h-content-section-reduced flex-col justify-between">
        <div class="absolute inset-x-0 bottom-0 translate-y-[-150px]">
          <A320OverwingOutline class="absolute bottom-0 left-0 z-20" />

          <div
            class="absolute bottom-[243px] left-[572px] z-20 h-[110px] w-[137px]"
            style={{ background: this.centerCurrentBg }}
          />
          <div
            class="absolute bottom-[140px] left-[260px] z-0 h-[215px] w-[310px]"
            style={{ background: this.LInnCurrentBg }}
          />
          <div
            class="absolute bottom-[140px] right-[260px] z-0 h-[215px] w-[310px]"
            style={{ background: this.RInnCurrentBg }}
          />
          <div
            class="absolute bottom-[100px] left-[138px] z-0 h-[98px] w-[122px]"
            style={{ background: this.LOutCurrentBg }}
          />
          <div
            class="absolute bottom-[100px] right-[138px] z-0 h-[98px] w-[122px]"
            style={{ background: this.ROutCurrentBg }}
          />
          {/* tl overlay */}
          <div class="absolute bottom-[240px] left-[82px] z-10 h-[140px] w-[490px] -rotate-26.5 bg-theme-body" />
          {/* tr overlay */}
          <div class="absolute bottom-[240px] right-[82px] z-10 h-[140px] w-[490px] rotate-26.5 bg-theme-body" />
          {/* bl overlay */}
          <div class="absolute bottom-[78px] left-[144px] z-10 h-[101px] w-[484px] -rotate-18.5 bg-theme-body" />
          {/* br overlay */}
          <div class="absolute bottom-[78px] right-[144px] z-10 h-[101px] w-[484px] rotate-18.5 bg-theme-body" />
        </div>
        <div class="border-theme-accentborder-2 absolute bottom-0 left-0 z-10 flex max-w-3xl flex-row overflow-x-hidden rounded-2xl border">
          <div class="space-y-4 px-5 py-3">
            <div class="flex flex-row items-center justify-between">
              <div class="flex flex-row items-center space-x-3">
                <h2 class="font-medium">{t('Ground.Fuel.Refuel')}</h2>
                {/*<p class={formatRefuelStatusClass()}>{formatRefuelStatusLabel()}</p>*/}
              </div>
              <p>
                {t('Ground.Fuel.EstimatedDuration')}: {0.4}m
              </p>
            </div>
            <div
              class={twMerge(
                `flex flex-row items-center space-x-6`,
                this.props.groundState.refuelStartedByUser && 'opacity-50',
              )}
            >
              <Slider
                value={this.props.groundState.refuelTarget}
                min={0}
                max={100}
                class="w-[28rem]"
                onChange={this.props.groundState.setRefuelTarget}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
