import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';
import { t } from '@localization/translation';
import { ServicesProps } from '../Services';
import { SwitchOn } from 'instruments/src/EFBv4/Pages/Pages';
import { A320GroundOutline } from '../../Widgets/GroundOutlines';
import { ServiceButtons, ServiceButtonType } from '../../Widgets/ServiceButtons';

export class A320Services extends DisplayComponent<ServicesProps> {
  // TODO port over GPU (PR #9470)

  private readonly chocksClassOuter = this.props.groundState.wheelChocksVisible.map((value) => {
    return twMerge(
      `flex cursor-pointer flex-row items-center space-x-6 p-6`,
      value ? 'text-green-500' : 'text-gray-500',
    );
  });

  private readonly chocksClassInner = this.props.groundState.wheelChocksVisible.map((value) => {
    return twMerge(`-ml-2 mr-[-2px] flex justify-center`, value ? 'text-green-500' : 'text-gray-500');
  });

  private readonly conesClass = this.props.groundState.conesVisible.map((value) => {
    return twMerge(
      `flex cursor-pointer flex-row items-center space-x-6 p-6`,
      value ? 'text-green-500' : 'text-gray-500',
    );
  });

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
              id: ServiceButtonType.CabinLeftDoor,
            },
            {
              icon: 'person-plus-fill',
              name: t('Ground.Services.JetBridge'),
              state: this.props.groundState.jetwayButtonState,
              id: ServiceButtonType.JetBridge,
            },
            {
              icon: 'truck',
              name: t('Ground.Services.FuelTruck'),
              state: this.props.groundState.fuelTruckButtonState,
              id: ServiceButtonType.FuelTruck,
            },
            {
              icon: 'fan',
              name: t('Ground.Services.AirStarterUnit'),
              state: this.props.groundState.asuButtonState,
              id: ServiceButtonType.AirStarterUnit,
            },
          ]}
          groundState={this.props.groundState}
        />

        <ServiceButtons
          xr="930px"
          y="600px"
          buttons={[
            {
              icon: 'door-closed-fill',
              name: t('Ground.Services.DoorFwd'),
              state: this.props.groundState.boardingDoor3ButtonState,
              id: ServiceButtonType.AftLeftDoor,
            },
          ]}
          groundState={this.props.groundState}
        >
          <SwitchOn
            condition={this.props.groundState.wheelChocksEnabled}
            on={
              <div class={this.chocksClassOuter}>
                <div class={this.chocksClassInner}>
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
            condition={this.props.groundState.conesEnabled}
            on={
              <div class={this.conesClass}>
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
              id: ServiceButtonType.CabinRightDoor,
            },
            {
              icon: 'plug-fill',
              name: t('Ground.Services.ExternalPower'),
              state: this.props.groundState.gpuButtonState,
              id: ServiceButtonType.Gpu,
            },
            {
              icon: 'door-closed-fill',
              name: t('Ground.Services.DoorCargo'),
              state: this.props.groundState.cargoDoor1ButtonState,
              id: ServiceButtonType.CargoDoor,
            },
            {
              icon: 'handbag-fill',
              name: t('Ground.Services.BaggageTruck'),
              state: this.props.groundState.baggageButtonState,
              id: ServiceButtonType.BaggageTruck,
            },
          ]}
          groundState={this.props.groundState}
        />

        <ServiceButtons
          xl="900px"
          y="600px"
          buttons={[
            {
              icon: 'door-closed-fill',
              name: t('Ground.Services.DoorAft'),
              state: this.props.groundState.boardingDoor4ButtonState,
              id: ServiceButtonType.AftRightDoor,
            },
            {
              icon: 'archive-fill',
              name: t('Ground.Services.CateringTruck'),
              state: this.props.groundState.cateringButtonState,
              id: ServiceButtonType.CateringTruck,
            },
          ]}
          groundState={this.props.groundState}
        />
      </div>
    );
  }
}
