import {
  ComponentProps,
  DisplayComponent,
  FSComponent,
  MutableSubscribable,
  Subject,
  VNode,
} from '@microsoft/msfs-sdk';
// @ts-ignore
import FbwTail from '../Assets/FBW-Tail.svg';
import { PageEnum } from '../Shared/common';
import { Button } from './Button';
import { twMerge } from 'tailwind-merge';
import { TooltipWrapper } from 'instruments/src/EFBv4/Components/Tooltip';

interface NavbarProps extends ComponentProps {
  activePage: Subject<number>;
}

interface NavButtonProps extends ComponentProps {
  activePage: MutableSubscribable<number | string>;
  page: number | string;
  class?: string;
  activeClass?: string;
  inactiveClass?: string;
}

interface NavIconProps extends ComponentProps {
  activePage: Subject<number>;
  page: number;
  tooltipLocKey: string;
}

export class Navbar extends DisplayComponent<NavbarProps> {
  private readonly tabs: [page: number, icon: string, tooltipLocKey: string][] = [
    [PageEnum.MainPage.Dispatch, 'clipboard', 'Dispatch.Title'],
    [PageEnum.MainPage.Ground, 'truck', 'Ground.Title'],
    [PageEnum.MainPage.Performance, 'calculator', 'Performance.Title'],
    [PageEnum.MainPage.Navigation, 'compass', 'NavigationAndCharts.Title'],
    [PageEnum.MainPage.ATC, 'broadcast-pin', 'AirTrafficControl.Title'],
    [PageEnum.MainPage.Failures, 'exclamation-diamond', 'Failures.Title'],
    [PageEnum.MainPage.Checklists, 'journal', 'Checklists.Title'],
    [PageEnum.MainPage.Presets, 'sliders', 'Presets.Title'],
  ];

  render(): VNode {
    return (
      <div class="flex w-32 shrink-0 flex-col justify-between self-stretch py-6">
        <div class="mAX-H-F flex flex-col items-center space-y-4">
          <NavIcon
            page={PageEnum.MainPage.Dashboard}
            activePage={this.props.activePage}
            tooltipLocKey="Dashboard.Title"
          >
            <img class="w-[35px]" src={FbwTail} alt="FbwTail" />
          </NavIcon>
          {this.tabs.map(([page, icon, tooltipLocKey]) => (
            <NavIcon page={page} activePage={this.props.activePage} tooltipLocKey={tooltipLocKey}>
              <i class={`bi-${icon} text-[35px] text-inherit`} />
            </NavIcon>
          ))}
        </div>

        <div class="mt-auto flex flex-col items-center">
          <div class="my-4 h-1.5 w-14 rounded-full bg-theme-accent" />

          <NavIcon page={PageEnum.MainPage.Settings} activePage={this.props.activePage} tooltipLocKey="Settings.Title">
            <i class="bi-gear text-[35px] text-inherit" />
          </NavIcon>
        </div>
      </div>
    );
  }
}

export class NavButton extends DisplayComponent<NavButtonProps> {
  private handlePressed = () => this.props.activePage.set(this.props.page);

  private readonly activeClass = this.props.activePage.map((value) => {
    const activeClassText = value === this.props.page ? this.props.activeClass : this.props.inactiveClass;

    return twMerge('bg-transparent', this.props.class, activeClassText);
  });

  render(): VNode {
    return (
      <Button unstyled class={this.activeClass} onClick={this.handlePressed}>
        {this.props.children}
      </Button>
    );
  }
}

// Pre themed for simplification
export class NavIcon extends DisplayComponent<NavIconProps> {
  render(): VNode {
    return (
      <TooltipWrapper text={this.props.tooltipLocKey}>
        <NavButton
          page={this.props.page}
          activePage={this.props.activePage}
          activeClass="bg-theme-accent text-theme-text"
          inactiveClass="text-theme-unselected"
          class="flex items-center justify-center rounded-md p-3.5 transition duration-100 hover:bg-theme-accent hover:text-theme-text"
        >
          {this.props.children}
        </NavButton>
      </TooltipWrapper>
    );
  }
}
