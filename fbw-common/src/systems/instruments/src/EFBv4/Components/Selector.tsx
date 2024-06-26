import { ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, VNode } from '@microsoft/msfs-sdk';
import { NavButton } from './Navbar';
import { Pages } from '../Pages/Pages';
import { twMerge } from 'tailwind-merge';

interface SelectorProps extends ComponentProps {
  class?: string;
  activeClass?: string;
  tabs: Pages;
  activePage: MutableSubscribable<number>;
  innerClass?: string;
}

export class Selector extends DisplayComponent<SelectorProps> {
  render(): VNode {
    return (
      <div class={twMerge('flex justify-between', this.props.class ?? '')}>
        <div
          class={twMerge(
            'flex size-full divide-x divide-theme-accent overflow-hidden rounded-md border border-theme-accent',
            this.props.innerClass ?? '',
          )}
        >
          {this.props.tabs.map(([page, contents]) => (
            <NavButton
              inactiveClass="flex items-centerbg-opacity-0 px-6 py-2 transition duration-300 hover:bg-opacity-100"
              activeClass={twMerge(
                'flex items-center bg-theme-accent bg-opacity-100 px-6 py-2',
                this.props.activeClass ?? '',
              )}
              page={page}
              activePage={this.props.activePage}
            >
              <div class="size-full">{contents}</div>
            </NavButton>
          ))}
        </div>
      </div>
    );
  }
}
