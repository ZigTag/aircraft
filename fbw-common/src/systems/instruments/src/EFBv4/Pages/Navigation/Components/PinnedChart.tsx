import { FSComponent, DisplayComponent, VNode, Subject } from '@microsoft/msfs-sdk';
import { Button } from 'instruments/src/EFBv4/Components/Button';
import { TooltipWrapper } from 'instruments/src/EFBv4/Components/Tooltip';
import { twMerge } from 'tailwind-merge';
import { ChartSemanticColor } from '../ChartProvider';

const getColorClass = (color: ChartSemanticColor) => {
  switch (color) {
    case ChartSemanticColor.Green:
      return 'text-utility-green';
    case ChartSemanticColor.Orange:
      return 'text-utility-orange';
    case ChartSemanticColor.LightBlue:
      return 'text-[#5280EA]';
    case ChartSemanticColor.Pink:
      return 'text-utility-pink';
    case ChartSemanticColor.Purple:
      return 'text-utility-purple';
    case ChartSemanticColor.Red:
      return 'text-utility-red';
    default:
      return 'text-theme-text';
  }
};

export interface PinnedChartCardProps {
  title: string;

  subTitle: string;

  showDelete: boolean;

  tag: string;

  color: ChartSemanticColor;

  class?: string;
}

export class PinnedChartCard extends DisplayComponent<PinnedChartCardProps> {
  private readonly currentTag = Subject.create(this.props.tag);

  private readonly currentColor = Subject.create(this.props.color);

  private readonly topBorderClassName = this.currentColor.map((currentTag) =>
    twMerge(`absolute inset-x-0 top-0 h-1.5 w-full bg-current`, getColorClass(currentTag)),
  );

  render(): VNode | null {
    return (
      <>
        {this.props.showDelete ? (
          <Button
            unstyled
            class={twMerge(
              'relative flex cursor-pointer flex-col flex-wrap items-stretch overflow-hidden rounded-md px-2 pb-2 pt-3 text-left',
              this.props.class,
            )}
            onClick={() => {}}
            // onMouseEnter={() => setCurrentTag('DEL')}
            // onMouseLeave={() => setCurrentTag(tag)}
          >
            <TooltipWrapper text="NavigationAndCharts.PinnedCharts.Delete">
              <div class="absolute bottom-0 right-0 z-10 text-utility-red">
                <i class="bi-trash z-10 text-[48px] text-inherit" />
              </div>
            </TooltipWrapper>

            <div class="opacity-70">
              <div class={this.topBorderClassName} />
              <h2 class="break-all font-bold">
                {this.props.title} <div class="inline-block text-theme-unselected">{this.currentTag}</div>
              </h2>
              <p class="font-inter mt-2">{this.props.subTitle}</p>
              <i
                class={this.currentColor.map((tag) =>
                  twMerge('bi-arrow-right ml-auto mt-auto opacity-0', getColorClass(tag)),
                )}
              />
            </div>
          </Button>
        ) : (
          <Button
            unstyled
            class={twMerge(
              'relative flex flex-col flex-wrap items-stretch overflow-hidden rounded-md bg-theme-accent px-2 pb-2 pt-3 text-left',
              this.props.showDelete && 'rounded-t-none',
              this.props.class,
            )}
            onClick={() => {}}
          >
            <div
              class={this.currentColor.map((tag) =>
                twMerge('absolute inset-x-0 top-0 h-1.5 w-full bg-current', getColorClass(tag)),
              )}
            />
            <h2 class="break-all font-bold">
              {this.props.title} <div class="inline-block text-theme-unselected">{this.currentTag}</div>
            </h2>
            <p class="font-inter mt-2">{this.props.subTitle}</p>
            <i
              class={this.currentColor.map((tag) => twMerge('bi-arrow-right ml-auto mt-auto', getColorClass(tag)))}
            ></i>
          </Button>
        )}
      </>
    );
  }
}
