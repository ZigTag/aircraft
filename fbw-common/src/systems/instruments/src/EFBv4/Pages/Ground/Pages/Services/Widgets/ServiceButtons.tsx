import { DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { GroundState } from '../../../../../State/GroundState';
import { twMerge } from 'tailwind-merge';
import { Button } from '../../../../../Components';

export enum ServiceButtonState {
  HIDDEN,
  DISABLED,
  INACTIVE,
  CALLED,
  ACTIVE,
  RELEASED,
}

export enum ServiceButtonType {
  CabinLeftDoor,
  CabinRightDoor,
  JetBridge,
  FuelTruck,
  Gpu,
  CargoDoor,
  BaggageTruck,
  AftLeftDoor,
  AftRightDoor,
  CateringTruck,
  AirStarterUnit,
}

interface ServiceButtonsProps {
  class?: string;
  xl?: string;
  xr?: string;
  y: string;
  buttons: { icon: string; name: string | VNode; state: Subscribable<ServiceButtonState>; id: ServiceButtonType }[];
  groundState: GroundState;
}

export class ServiceButtons extends DisplayComponent<ServiceButtonsProps> {
  render(): VNode | null {
    return (
      <div
        class={twMerge(
          'flex flex-col divide-y-2 divide-theme-accent overflow-hidden rounded-xl border-2 border-theme-accent',
          this.props.class ?? '',
        )}
        style={{
          position: 'absolute',
          left: this.props.xl,
          right: this.props.xr,
          top: this.props.y,
        }}
      >
        {this.props.buttons.map((button) => (
          <ServiceButton
            icon={button.icon}
            name={button.name}
            id={button.id}
            state={button.state}
            groundState={this.props.groundState}
          />
        ))}
        {this.props.children}
      </div>
    );
  }
}

interface ServiceButtonProps {
  icon: string;
  name: string | VNode;
  state: Subscribable<ServiceButtonState>;
  id: ServiceButtonType;
  groundState: GroundState;
}

const buttonsStyles: Record<ServiceButtonState, string> = {
  [ServiceButtonState.HIDDEN]: '',
  [ServiceButtonState.DISABLED]: 'opacity-20 pointer-events-none',
  [ServiceButtonState.INACTIVE]:
    'hover:bg-theme-highlight text-theme-text hover:text-theme-secondary transition duration-200 disabled:bg-grey-600',
  [ServiceButtonState.CALLED]: 'text-white bg-amber-600 border-amber-600 hover:bg-amber-400',
  [ServiceButtonState.ACTIVE]: 'text-white bg-green-700 border-green-700 hover:bg-green-500 hover:text-theme-secondary',
  [ServiceButtonState.RELEASED]: 'text-white bg-amber-600 border-amber-600 pointer-events-none',
};

export class ServiceButton extends DisplayComponent<ServiceButtonProps> {
  private readonly buttonStyle = this.props.state.map((state) => {
    return twMerge(
      `flex cursor-pointer flex-row items-center space-x-6 bg-inherit p-6 hover:text-black`,
      buttonsStyles[state],
    );
  });

  private handlerWrapper = () => {
    // debugger;
    if (this.props.state.get() !== ServiceButtonState.DISABLED) {
      this.props.groundState.handleButton(this.props.id);
    }
  };

  render(): VNode | null {
    return (
      <Button unstyled class={this.buttonStyle} onClick={this.handlerWrapper}>
        <span class={twMerge(`bi-${this.props.icon}`, 'text-[34px] text-inherit')} />
        <h1 class="shrink-0 text-2xl font-medium text-current">{this.props.name}</h1>
      </Button>
    );
  }
}
