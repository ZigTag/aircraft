import { FSComponent, MappedSubject, MutableSubscribable, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { PageBox } from '../../Components/PageBox';
import { AbstractUIView } from '../../shared/UIView';
import * as apiClient from '@flybywiresim/api-client';
import { AtcType } from '@flybywiresim/api-client';
import { AtisSource, FbwUserSettings } from '../../FbwUserSettings';
import { EFB_EVENT_BUS } from '../../EfbV4FsInstrument';
import { EFBSimvars } from '../../EFBSimvarPublisher';
import { Button } from 'instruments/src/EFBv4/Components/Button';
import { ScrollableContainer } from '../../Components/ScrollableContainer';
import { SimpleInput } from '../../Components/SimpleInput';
import { TooltipWrapper } from '../../Components/Tooltip';
import { Selector } from '../../Components/Selector';
import { t } from '../../Components/LocalizedText';
import { LocalizedString } from '../../shared/translation';
import { List } from '../../Components/List';

export declare class ATCInfoExtended extends apiClient.ATCInfo {
  distance: number;
}
interface FrequencyCardProps {
  class?: string;
  callsign: string;
  frequency: string;
  setActive: () => void;
  setCurrent: () => void;
  setStandby: () => void;
}

class FrequencyCard extends AbstractUIView<FrequencyCardProps> {
  render(): VNode | null {
    return (
      <div class={this.props.class} ref={this.rootRef}>
        <div class="relative w-full overflow-hidden rounded-md bg-theme-secondary p-6">
          <h2 class="font-bold">{this.props.callsign}</h2>
          <h2>{this.props.frequency}</h2>

          <div class="absolute inset-0 flex flex-row opacity-0 transition duration-100 hover:opacity-100">
            <Button
              unstyled
              class="flex w-full items-center justify-center border-2 border-theme-highlight bg-theme-highlight px-2 text-center font-bold text-theme-body transition duration-100 hover:bg-theme-body hover:text-theme-highlight"
              onClick={this.props.setActive}
            >
              <h2 class="text-current">{t('AirTrafficControl.SetActive')}</h2>
            </Button>
            <Button
              unstyled
              class="flex w-full items-center justify-center border-2 border-utility-amber bg-utility-amber px-2 text-center font-bold text-theme-body transition duration-100 hover:bg-theme-body hover:text-utility-amber"
              onClick={this.props.setStandby}
            >
              <h2 class="text-current">{t('AirTrafficControl.SetStandby')}</h2>
            </Button>
            <Button
              unstyled
              class="flex w-1/4 items-center justify-center border-2 border-theme-text bg-theme-text font-bold text-theme-body transition duration-100 hover:bg-theme-body hover:text-theme-text"
              onClick={this.props.setCurrent}
            >
              <i class="bi-info-circle text-[35px]" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

interface ControllerInformationProps {
  currentAtc?: ATCInfoExtended | undefined;
}

class ControllerInformation extends AbstractUIView<ControllerInformationProps> {
  render(): VNode | null {
    return (
      <ScrollableContainer height={15.9} class="p-3" ref={this.rootRef}>
        <h2 class="text-utility-amber">{this.props.currentAtc?.callsign}</h2>
        {(this.props.currentAtc?.textAtis ?? []).map((line) => (
          <p class="mt-2 flex flex-wrap text-2xl">{line}</p>
        ))}
      </ScrollableContainer>
    );
  }
}

interface FrequencyInformationProps {
  displayedActiveFrequency: Subscribable<string>;
  displayedStandbyFrequency: Subscribable<string>;
  currentAtc: MutableSubscribable<ATCInfoExtended | undefined>;
}

class FrequencyInformation extends AbstractUIView<FrequencyInformationProps> {
  private controllerInformationContainerRef = FSComponent.createRef<HTMLDivElement>();

  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.currentAtc.sub((atc) => {
      this.controllerInformationContainerRef.instance.innerHTML = '';

      if (atc?.textAtis) {
        FSComponent.render(
          <ControllerInformation currentAtc={this.props.currentAtc.get()} />,
          this.controllerInformationContainerRef.instance,
        );
      } else {
        FSComponent.render(
          <div class="flex w-full items-center justify-center">
            <h1 class="text-center font-bold">{t('AirTrafficControl.NoInformationAvailableForThisFrequency')}</h1>
          </div>,
          this.controllerInformationContainerRef.instance,
        );
      }
    });
  }

  render(): VNode | null {
    return (
      <div
        class="mt-4 flex h-64 flex-row divide-x-2 divide-theme-accent rounded-lg border-2 border-theme-accent"
        ref={this.rootRef}
      >
        <div class="flex flex-col justify-between p-4">
          <div>
            <p>{t('AirTrafficControl.Active')}</p>
            <div class="h-18 mt-2 flex w-72 items-center justify-center rounded-lg border-2 border-theme-accent font-rmp text-6xl text-theme-highlight">
              {this.props.displayedActiveFrequency && this.props.displayedActiveFrequency}
            </div>
          </div>
          <div>
            <p>{t('AirTrafficControl.Standby')}</p>
            <div class="h-18 mt-2 flex w-72 items-center justify-center rounded-lg border-2 border-theme-accent font-rmp text-6xl text-utility-amber">
              {this.props.displayedStandbyFrequency && this.props.displayedStandbyFrequency}
            </div>
          </div>
        </div>

        <div ref={this.controllerInformationContainerRef} />
      </div>
    );
  }
}

interface AtcUnavailableUIProps {
  navigateToAtsuAocSettingsPage: () => any;
}

class AtcUnavailableUI extends AbstractUIView<AtcUnavailableUIProps> {
  render(): VNode | null {
    return (
      <PageBox ref={this.rootRef} class="items-center justify-center">
        <div class="max-w-4xl space-y-8">
          <h1 class="text-center">{t('AirTrafficControl.SelectCorrectATISATCSource')}</h1>

          <Button class="w-full" onClick={this.props.navigateToAtsuAocSettingsPage}>
            <i class="bi-gear text-[26px]" />
            <p class="text-current">{t('AirTrafficControl.ChangeATISATCSourceButton')}</p>
          </Button>
        </div>
      </PageBox>
    );
  }
}

interface AtcAvailableUIProps extends FrequencyInformationProps {
  atcDataPending: Subscribable<boolean>;
  controllers: Subscribable<ATCInfoExtended[]>;
  setActiveFrequency: (frequency: number) => any;
  setStandbyFrequency: (frequency: number) => any;
}

class AtcAvailableUI extends AbstractUIView<AtcAvailableUIProps> {
  private controllerTypeFilterIndex = Subject.create(0);
  private controllerCallSignFilter = Subject.create('');

  private readonly atcTypeOptions = [
    { typeName: t('AirTrafficControl.ShowAll'), atcType: undefined },
    { typeName: t('AirTrafficControl.ShowAtis'), atcType: AtcType.ATIS },
    { typeName: t('AirTrafficControl.ShowDelivery'), atcType: AtcType.DELIVERY },
    { typeName: t('AirTrafficControl.ShowGround'), atcType: AtcType.GROUND },
    { typeName: t('AirTrafficControl.ShowTower'), atcType: AtcType.TOWER },
    { typeName: t('AirTrafficControl.ShowApproach'), atcType: AtcType.APPROACH },
    { typeName: t('AirTrafficControl.ShowDeparture'), atcType: AtcType.DEPARTURE },
    { typeName: t('AirTrafficControl.ShowRadar'), atcType: AtcType.RADAR },
  ];

  private toFrequency(frequency: string): number {
    if (frequency) {
      return parseFloat(`${frequency.replace('.', '').padEnd(9, '0')}.000`);
    }

    return 0;
  }

  private filterController = (
    c: ATCInfoExtended,
    controllerTypeFilter: AtcType | undefined,
    callSignFilter: string,
  ): boolean => {
    return !(
      (controllerTypeFilter && c.type !== controllerTypeFilter) ||
      (callSignFilter !== '' && !c.callsign.toUpperCase().includes(this.controllerCallSignFilter.get().toUpperCase()))
    );
  };

  render(): VNode | null {
    return (
      <PageBox class="border-none p-0" ref={this.rootRef}>
        <div class="relative space-y-4">
          <div class="flex flex-row items-center space-x-3">
            <TooltipWrapper text={'AirTrafficControl.TT.AtcCallSignSearch'}>
              <div class="flex flex-row">
                <SimpleInput
                  placeholder={LocalizedString.create('AirTrafficControl.SearchPlaceholder')}
                  class="w-64 grow rounded-r-none"
                  value={this.controllerCallSignFilter}
                  onChange={(value) => this.controllerCallSignFilter.set(value)}
                />
                <Button
                  unstyled
                  class="flex items-center rounded-md rounded-l-none border-2 border-utility-red px-3 text-utility-red transition duration-100 hover:bg-utility-red hover:text-theme-body"
                  onClick={() => this.controllerCallSignFilter.set('')}
                >
                  X
                </Button>
              </div>
            </TooltipWrapper>

            <Selector
              activeClass="bg-theme-highlight text-theme-body"
              tabs={this.atcTypeOptions.map((option, i) => [
                i,
                option.typeName,
                // TODO: add dynamic tooltip text
                `${t('AirTrafficControl.TT.AtcTypeFilter')} ${option.typeName}`,
              ])}
              activePage={this.controllerTypeFilterIndex}
            />
          </div>

          <ScrollableContainer innerClass="grid grid-cols-2" height={34}>
            <List
              items={MappedSubject.create(
                ([controllers, callSignFilter, typeFilterIndex]) => {
                  const controllerTypeFilter = this.atcTypeOptions[typeFilterIndex].atcType;
                  return controllers.filter((c) => this.filterController(c, controllerTypeFilter, callSignFilter));
                },
                this.props.controllers,
                this.controllerCallSignFilter,
                this.controllerTypeFilterIndex,
              )}
              render={(controller, index) => (
                <FrequencyCard
                  class={`${index && index % 2 !== 0 && 'ml-4'} ${index >= 2 && 'mt-4'}`}
                  callsign={controller.callsign}
                  frequency={controller.frequency}
                  setActive={() => this.props.setActiveFrequency(this.toFrequency(controller.frequency))}
                  setStandby={() => this.props.setStandbyFrequency(this.toFrequency(controller.frequency))}
                  setCurrent={() =>
                    this.props.currentAtc.set(
                      this.props.controllers.get().find((c) => c.frequency === controller.frequency),
                    )
                  }
                />
              )}
            />
          </ScrollableContainer>

          <div
            class={this.props.atcDataPending.map(
              (
                dataPending,
              ) => `absolute inset-0 top-10 flex items-center justify-center rounded-md border-2 border-theme-accent bg-theme-body transition duration-200
                            ${dataPending ? 'opacity-100' : 'pointer-events-none opacity-0'}`,
            )}
          >
            <i class="bi-cloud-arrow-down animate-bounce text-[40px]" />
          </div>
        </div>

        <FrequencyInformation
          currentAtc={this.props.currentAtc}
          displayedActiveFrequency={this.props.displayedActiveFrequency}
          displayedStandbyFrequency={this.props.displayedStandbyFrequency}
        />
      </PageBox>
    );
  }
}

export class ATC extends AbstractUIView {
  private settings = FbwUserSettings.getManager(EFB_EVENT_BUS);

  private controllers = Subject.create<ATCInfoExtended[]>([]);
  private currentAtc = Subject.create<ATCInfoExtended | undefined>(undefined);

  private activeFrequency = Subject.create(SimVar.GetSimVarValue('COM ACTIVE FREQUENCY:1', 'Hz'));
  private standyFrequency = Subject.create(SimVar.GetSimVarValue('COM STANDBY FREQUENCY:1', 'Hz'));
  private currentLatitude = Subject.create(SimVar.GetSimVarValue('GPS POSITION LAT', 'Degrees'));
  private currentLongitude = Subject.create(SimVar.GetSimVarValue('GPS POSITION LON', 'Degrees'));

  private displayedActiveFrequency = Subject.create<string>('');
  private displayedStandbyFrequency = Subject.create<string>('');

  private atisSource = this.settings.getSetting('fbwAtsuAocAtisSource');

  private atcDataPending = Subject.create(true);

  private atcUIContainerRef = FSComponent.createRef<HTMLDivElement>();

  // TODO
  private pageTitle = this.atisSource.map((source) => {
    if (source === AtisSource.IVAO || source === AtisSource.VATSIM) {
      return `${LocalizedString.create('AirTrafficControl.Title')} (${AtisSource[source]})`;
    }

    return LocalizedString.create('AirTrafficControl.Title');
  });

  private fromFrequency(frequency: number): string {
    if (frequency) {
      let converted: string = frequency.toString().replace('.', '');
      converted = `${converted.substring(0, 3)}.${converted.substring(3)}`;
      return parseFloat(converted).toFixed(3);
    }

    return '';
  }

  private loadAtc = async () => {
    if (this.atisSource.get() !== AtisSource.VATSIM && this.atisSource.get() !== AtisSource.IVAO) return;
    const atisSourceReq = AtisSource[this.atisSource.get()].toLowerCase();

    try {
      const atcRes = await apiClient.ATC.get(atisSourceReq);
      if (!atcRes) return;
      let allAtc: ATCInfoExtended[] = atcRes as ATCInfoExtended[];

      allAtc = allAtc.filter((a) => a.callsign.indexOf('_OBS') === -1 && parseFloat(a.frequency) <= 136.975);

      for (const a of allAtc) {
        a.distance = this.getDistanceFromLatLonInNm(
          a.latitude ?? 0,
          a.longitude ?? 0,
          this.currentLatitude.get(),
          this.currentLongitude.get(),
        );
        if (a.visualRange === 0 && a.type === apiClient.AtcType.ATIS) {
          a.visualRange = 100;
        }
      }

      allAtc.sort((a1, a2) => (a1.distance > a2.distance ? 1 : -1));
      allAtc = allAtc.slice(0, 26);
      allAtc.push({
        callsign: 'UNICOM',
        frequency: '122.800',
        type: apiClient.AtcType.RADAR,
        visualRange: 999999,
        distance: 0,
        latitude: 0,
        longitude: 0,
        textAtis: [],
      });

      this.controllers.set(allAtc.filter((a) => a.distance <= a.visualRange));
    } catch (e) {
      // TODO restore notifications
      //   toast.error(e.message);
    }

    this.atcDataPending.set(false);
  };

  private getDistanceFromLatLonInNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2Rad(lat2 - lat1); // deg2Rad below
    const dLon = this.deg2Rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2Rad(lat1)) * Math.cos(this.deg2Rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.5399568; // Distance in nm
  }

  private deg2Rad = (deg: number) => deg * (Math.PI / 180);

  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    const sub = this.bus.getSubscriber<EFBSimvars>();

    sub.on('currentLatitude').handle((latitude) => this.currentLatitude.set(latitude));
    sub.on('currentLongitude').handle((longitude) => this.currentLongitude.set(longitude));
    sub.on('activeFrequency').handle((frequency) => this.activeFrequency.set(frequency));
    sub.on('standbyFrequency').handle((frequency) => this.standyFrequency.set(frequency));

    this.activeFrequency.sub((frequency) => {
      const converted = this.fromFrequency(frequency);
      this.displayedActiveFrequency.set(converted);
      this.currentAtc.set(this.controllers.get().find((c) => c.frequency === converted));
    }, true);

    this.standyFrequency.sub((frequency) => {
      const converted = this.fromFrequency(frequency);
      this.displayedStandbyFrequency.set(converted);
      this.currentAtc.set(this.controllers.get().find((c) => c.frequency === converted));
    }, true);

    this.controllers.sub((controllers) => {
      console.log('controllers', controllers);
      const currentControllerFrequency = this.currentAtc.get()?.frequency;

      if (currentControllerFrequency) {
        const controllerWithFrequency = this.controllers.get()?.find((c) => c.frequency === currentControllerFrequency);

        if (controllerWithFrequency) {
          this.currentAtc.set(controllerWithFrequency);
        }
      }
    });

    this.atisSource.sub((atisSource) => {
      this.loadAtc();

      this.atcUIContainerRef.instance.innerHTML = '';

      if (atisSource === AtisSource.IVAO || atisSource === AtisSource.VATSIM) {
        FSComponent.render(
          <AtcAvailableUI
            atcDataPending={this.atcDataPending}
            controllers={this.controllers}
            currentAtc={this.currentAtc}
            displayedActiveFrequency={this.displayedActiveFrequency}
            displayedStandbyFrequency={this.displayedStandbyFrequency}
            setActiveFrequency={(frequency) => {
              SimVar.SetSimVarValue('K:COM_RADIO_SET_HZ', 'Hz', frequency);
            }}
            setStandbyFrequency={(frequency) => {
              SimVar.SetSimVarValue('K:COM_STBY_RADIO_SET_HZ', 'Hz', frequency);
            }}
          />,
          this.atcUIContainerRef.instance,
        );
      } else {
        FSComponent.render(
          <AtcUnavailableUI
            navigateToAtsuAocSettingsPage={() => {
              /** TODO */
            }}
          />,
          this.atcUIContainerRef.instance,
        );
      }
    }, true);

    setInterval(() => this.loadAtc(), 60_000);
    this.loadAtc();
  }

  render(): VNode {
    return (
      <div ref={this.rootRef}>
        <PageTitle>{t('AirTrafficControl.Title')}</PageTitle>
        <div ref={this.atcUIContainerRef} />
      </div>
    );
  }
}
