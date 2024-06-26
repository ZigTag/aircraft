import { DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { A320GroundOutline } from './Widgets/GroundOutlines';
import React from 'react';
import { Button } from 'instruments/src/EFBv4/Components/Button';
import { twMerge } from 'tailwind-merge';
import { t } from '@localization/translation';
import { SwitchOn } from '../../Pages';
import { TriangleFill as Chock, VinylFill as Wheel } from 'react-bootstrap-icons';

enum ServiceButtonState {
  HIDDEN,
  DISABLED,
  INACTIVE,
  CALLED,
  ACTIVE,
  RELEASED,
}

export class Services extends DisplayComponent<any> {
  render(): VNode | null {
    return <A320Services />;
  }
}

export class A320Services extends DisplayComponent<any> {
  private readonly wheelChocksEnabled = Subject.create(true);
  private readonly wheelChocksVisible = Subject.create(false);

  private readonly cabinLeftStatus = Subject.create(false);
  private readonly cabinRightStatus = Subject.create(false);
  private readonly aftLeftStatus = Subject.create(false);
  private readonly aftRightStatus = Subject.create(false);

  private readonly boarding1DoorButtonState = Subject.create(ServiceButtonState.INACTIVE);
  private readonly boarding2DoorButtonState = Subject.create(ServiceButtonState.INACTIVE);
  private readonly boarding3DoorButtonState = Subject.create(ServiceButtonState.INACTIVE);
  private readonly boarding4DoorButtonState = Subject.create(ServiceButtonState.INACTIVE);
  private readonly jetwayButtonState = Subject.create(ServiceButtonState.INACTIVE);
  private readonly fuelTruckButtonState = Subject.create(ServiceButtonState.INACTIVE);
  private readonly asuButtonState = Subject.create(ServiceButtonState.INACTIVE);

  render(): VNode | null {
    return (
      <div class="relative h-content-section-reduced">
        <A320GroundOutline
          cabinLeftStatus={this.cabinLeftStatus}
          cabinRightStatus={this.cabinRightStatus}
          aftLeftStatus={this.aftLeftStatus}
          aftRightStatus={this.aftRightStatus}
        />

        <ServiceButtons
          xr="930px"
          y="24px"
          buttons={[
            {
              icon: 'door-closed-fill',
              name: t('Ground.Services.DoorFwd'),
              state: this.boarding1DoorButtonState,
              handler: () => {},
            },
            {
              icon: 'person-plus-fill',
              name: t('Ground.Services.JetBridge'),
              state: this.jetwayButtonState,
              handler: () => {},
            },
            {
              icon: 'truck',
              name: t('Ground.Services.FuelTruck'),
              state: this.fuelTruckButtonState,
              handler: () => {},
            },
            {
              icon: 'fan',
              name: t('Ground.Services.AirStarterUnit'),
              state: this.asuButtonState,
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
              state: this.boarding3DoorButtonState,
              handler: () => {},
            },
          ]}
        >
          {/*<SwitchOn*/}
          {/*  condition={this.wheelChocksEnabled}*/}
          {/*  on={*/}
          {/*    <div*/}
          {/*      class={`flex cursor-pointer flex-row items-center space-x-6 p-6 ${this.wheelChocksVisible ? 'text-green-500' : 'text-gray-500'}`}*/}
          {/*    >*/}
          {/*      <div*/}
          {/*        class={`-ml-2 mr-[-2px] flex items-end justify-center ${this.wheelChocksVisible ? 'text-green-500' : 'text-gray-500'}`}*/}
          {/*      >*/}
          {/*        <span class="bi-chock text-[12px] font-[4px] text-inherit" />*/}
          {/*        <span class="bi-wheel -mx-0.5 text-[36px] font-[5px] text-inherit" />*/}
          {/*        <span class="bi-chock text-[12px] font-[4px] text-inherit" />*/}
          {/*      </div>*/}
          {/*      <h1 className="shrink-0 text-2xl font-medium text-current">{t('Ground.Services.WheelChocks')}</h1>*/}
          {/*    </div>*/}
          {/*  }*/}
          {/*/>*/}
        </ServiceButtons>
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
