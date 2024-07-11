import { DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { A320GroundOutline } from './Widgets/GroundOutlines';
import { Button } from 'instruments/src/EFBv4/Components/Button';
import { twMerge } from 'tailwind-merge';
import { t } from '@localization/translation';
import { GroundState, SwitchOn } from '../../Pages';

export interface ServicesProps {
  groundState: GroundState;
}

export enum ServiceButtonState {
  HIDDEN,
  DISABLED,
  INACTIVE,
  CALLED,
  ACTIVE,
  RELEASED,
}

export class Services extends DisplayComponent<ServicesProps> {
  render(): VNode | null {
    return <A320Services {...this.props} />;
  }
}

export class A320Services extends DisplayComponent<ServicesProps> {
  private readonly wheelChocksEnabled = Subject.create(true);
  private readonly wheelChocksVisible = Subject.create(false);

  private readonly conesEnabled = Subject.create(true);
  private readonly conesVisible = Subject.create(false);

  render(): VNode | null {
    return (
      <div class="relative h-content-section-reduced">
        <A320GroundOutline
          cabinLeftStatus={this.props.groundState.cabinLeftStatus}
          cabinRightStatus={this.props.groundState.cabinRightStatus}
          aftLeftStatus={this.props.groundState.aftLeftStatus}
          aftRightStatus={this.props.groundState.aftRightStatus}
        />

        <ServiceButtons
          xr="930px"
          y="24px"
          buttons={[
            {
              icon: 'door-closed-fill',
              name: t('Ground.Services.DoorFwd'),
              state: this.props.groundState.boardingDoor1ButtonState,
              handler: () => {},
            },
            {
              icon: 'person-plus-fill',
              name: t('Ground.Services.JetBridge'),
              state: this.props.groundState.jetwayButtonState,
              handler: () => {},
            },
            {
              icon: 'truck',
              name: t('Ground.Services.FuelTruck'),
              state: this.props.groundState.fuelTruckButtonState,
              handler: () => {},
            },
            {
              icon: 'fan',
              name: t('Ground.Services.AirStarterUnit'),
              state: this.props.groundState.asuButtonState,
              handler: () => {},
            },
          ]}
        />

        <ServiceButtons
          xr="930px"
          y="600px"
          buttons={[
            {
              icon: 'door-closed-fill',
              name: t('Ground.Services.DoorFwd'),
              state: this.props.groundState.boardingDoor3ButtonState,
              handler: () => {},
            },
          ]}
        >
          <SwitchOn
            condition={this.wheelChocksEnabled}
            on={
              <div
                class={twMerge(
                  `flex cursor-pointer flex-row items-center space-x-6 p-6`,
                  this.wheelChocksVisible ? 'text-green-500' : 'text-gray-500',
                )}
              >
                <div
                  class={twMerge(
                    `-ml-2 mr-[-2px] flex justify-center`,
                    this.wheelChocksVisible ? 'text-green-500' : 'text-gray-500',
                  )}
                >
                  <div class="relative w-[12px] text-inherit">
                    <span class="bi-triangle-fill absolute bottom-[-6px] text-[12px] font-[4px] text-inherit" />
                  </div>
                  <span class="bi-vinyl-fill -mx-0.5 text-[36px] font-[5px] text-inherit" />
                  <div class="relative w-[12px] text-inherit">
                    <span class="bi-triangle-fill absolute bottom-[-6px] text-[12px] font-[4px] text-inherit" />
                  </div>
                </div>
                <h1 class="shrink-0 text-2xl font-medium text-inherit">{t('Ground.Services.WheelChocks')}</h1>
              </div>
            }
          />
          <SwitchOn
            condition={this.conesEnabled}
            on={
              <div
                class={twMerge(
                  `flex cursor-pointer flex-row items-center space-x-6 p-6`,
                  this.conesVisible ? 'text-green-500' : 'text-gray-500',
                )}
              >
                <span class="bi-cone-striped mr-2 text-[38px] font-[1.5px] text-inherit" />
                <h1 class="shrink-0 text-2xl font-medium text-inherit">{t('Ground.Services.Cones')}</h1>
              </div>
            }
          />
        </ServiceButtons>

        <ServiceButtons
          xl="900px"
          y="24px"
          buttons={[
            {
              icon: 'door-closed-fill',
              name: t('Ground.Services.DoorFwd'),
              state: this.props.groundState.boardingDoor2ButtonState,
              handler: () => {},
            },
            {
              icon: 'plug-fill',
              name: t('Ground.Services.ExternalPower'),
              state: this.props.groundState.gpuButtonState,
              handler: () => {},
            },
            {
              icon: 'door-closed-fill',
              name: t('Ground.Services.DoorCargo'),
              state: this.props.groundState.cargoDoor1State,
              handler: () => {},
            },
            {
              icon: 'handbag-fill',
              name: t('Ground.Services.BaggageTruck'),
              state: this.props.groundState.baggageButtonState,
              handler: () => {},
            },
          ]}
        />

        <ServiceButtons
          xl="900px"
          y="600px"
          buttons={[
            {
              icon: 'door-closed-fill',
              name: t('Ground.Services.DoorAft'),
              state: this.props.groundState.boardingDoor4ButtonState,
              handler: () => {},
            },
            {
              icon: 'archive-fill',
              name: t('Ground.Services.CateringTruck'),
              state: this.props.groundState.cateringButtonState,
              handler: () => {},
            },
          ]}
        />
      </div>
    );
  }
}

interface ServiceButtonsProps {
  class?: string;
  xl?: string;
  xr?: string;
  y: string;
  buttons: { icon: string; name: string | VNode; state: Subscribable<ServiceButtonState>; handler: () => void }[];
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
          <ServiceButton icon={button.icon} name={button.name} handler={button.handler} state={button.state} />
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
  handler: () => void;
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

  private handlerWrapper() {
    if (this.props.state.get() !== ServiceButtonState.DISABLED) {
      this.props.handler();
    }
  }

  render(): VNode | null {
    return (
      <Button
        unstyled
        class={this.buttonStyle}
        onClick={this.props.state.get() === ServiceButtonState.DISABLED ? () => {} : this.handlerWrapper}
      >
        <span class={twMerge(`bi-${this.props.icon}`, 'text-[34px] text-inherit')} />
        <h1 class="shrink-0 text-2xl font-medium text-current">{this.props.name}</h1>
      </Button>
    );
  }
}
