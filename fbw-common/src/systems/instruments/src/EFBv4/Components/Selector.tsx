import { ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, VNode } from '@microsoft/msfs-sdk';
import { NavButton } from './Navbar';
import { twMerge } from 'tailwind-merge';
import { TooltipWrapper } from '../Components/Tooltip';

type SelectorTab = readonly [page: number | string, component: VNode, tooltipText?: string];
interface SelectorProps extends ComponentProps {
  class?: string;
  activeClass?: string;
  tabs: readonly SelectorTab[];
  activePage: MutableSubscribable<number | string>;
  innerClass?: string;
}

export class Selector extends DisplayComponent<SelectorProps> {
  render(): VNode {
    return (
      <div class={twMerge('flex h-12 justify-between', this.props.class ?? '')}>
        <div
          class={twMerge(
            'flex size-full divide-x divide-theme-accent overflow-hidden rounded-md border border-theme-accent',
            this.props.innerClass ?? '',
          )}
        >
          {this.props.tabs.map(([page, contents, tooltipText]) => {
            const navButton = (
              <NavButton
                inactiveClass="flex items-centerbg-opacity-0 px-6 py-2 text-theme-text transition duration-300 hover:bg-opacity-100"
                // eslint-disable-next-line tailwindcss/migration-from-tailwind-2
                activeClass={twMerge(
                  'flex items-center bg-theme-accent bg-opacity-100 px-6 py-2 text-theme-text',
                  this.props.activeClass ?? '',
                )}
                page={page}
                activePage={this.props.activePage}
              >
                {contents}
              </NavButton>
            );

            if (tooltipText) {
              return <TooltipWrapper text={tooltipText}>{navButton}</TooltipWrapper>;
            }

            return navButton;
          })}
        </div>
      </div>
    );
  }
}
