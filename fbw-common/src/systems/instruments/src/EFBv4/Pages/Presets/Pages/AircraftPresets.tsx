// Copyright (c) 2024 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import {
  ConsumerSubject,
  EventBus,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
  VNode,
} from '@microsoft/msfs-sdk';
import { AbstractUIView, LocalizedString, UIVIew } from '../../../Shared';
import { ScrollableContainer } from '../../../Components/ScrollableContainer';
import { Button, ButtonTheme, ModalKind, showModal, t, Toggle } from '../../../Components';
import { EFBSimvars } from '../../../EFBSimvarPublisher';
import { SwitchIf } from '../../Pages';

export interface AircraftPresetsProps {
  bus: EventBus;
}

export class AircraftPresets extends AbstractUIView<AircraftPresetsProps> {
  // These need to align with the IDs in the Presets C++ WASM.
  // WASM: src/presets/src/Aircraft/AircraftProcedures.h
  private readonly AircraftPresetsList: { index: number; name: Subscribable<string> }[] = [
    { index: 1, name: LocalizedString.create('Presets.AircraftStates.ColdDark') },
    { index: 2, name: LocalizedString.create('Presets.AircraftStates.Powered') },
    { index: 3, name: LocalizedString.create('Presets.AircraftStates.ReadyPushback') },
    { index: 4, name: LocalizedString.create('Presets.AircraftStates.ReadyTaxi') },
    { index: 5, name: LocalizedString.create('Presets.AircraftStates.ReadyTakeoff') },
  ];

  private listener: ViewListener.ViewListener | null = null;

  private readonly loadPreset = ConsumerSubject.create(this.props.bus.getSubscriber<EFBSimvars>().on('loadPreset'), -1);

  private readonly loadPresetsExpedite = ConsumerSubject.create(
    this.props.bus.getSubscriber<EFBSimvars>().on('loadPresetsExpedite'),
    false,
  );

  private readonly simOnGround = ConsumerSubject.create(
    this.props.bus.getSubscriber<EFBSimvars>().on('simOnGround'),
    false,
  );

  private readonly loadPresetProgress = Subject.create(0);

  private readonly currentStepDescription = Subject.create('');

  private readonly messageText = LocalizedString.create('Presets.AircraftStates.SelectAPresetToLoad');
  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.loadPreset,
      this.loadPresetsExpedite,
      this.simOnGround,
      this.messageText,
      this.simOnGround.sub((simOnGround) =>
        this.messageText.set(
          simOnGround
            ? 'Presets.AircraftStates.SelectAPresetToLoad'
            : 'Presets.AircraftStates.TheAircraftMustBeOnTheGroundToLoadAPreset',
        ),
      ),
    );

    this.listener = RegisterViewListener('JS_LISTENER_COMM_BUS', () => {
      this.listener?.on('AIRCRAFT_PRESET_WASM_CALLBACK', this.onProgressUpdateFromWasm);
    });
  }

  private readonly onProgressUpdateFromWasm = (data: string) => {
    const [progressPercentage, currentStep] = data.split(';');
    this.loadPresetProgress.set(parseFloat(progressPercentage));
    this.currentStepDescription.set(currentStep);
  };

  private readonly handleLoadPreset = (presetID: number) => {
    showModal({
      kind: ModalKind.Prompt,
      title: this.AircraftPresetsList[presetID - 1].name.get(),
      bodyText: LocalizedString.translate('Presets.AircraftStates.ConfirmationDialogMsg') ?? '',
      onConfirm: () => SimVar.SetSimVarValue('L:A32NX_AIRCRAFT_PRESET_LOAD', 'number', presetID),
    });
  };

  private readonly handleCancel = () => {
    SimVar.SetSimVarValue('L:A32NX_AIRCRAFT_PRESET_LOAD', 'number', 0);
  };

  private readonly handleSetLoadPresetsExpedite = (value: boolean) => {
    SimVar.SetSimVarValue('L:A32NX_AIRCRAFT_PRESET_LOAD_EXPEDITE', 'number', value);
  };

  render(): VNode | null {
    return (
      <div
        ref={this.rootRef}
        class="mt-4 h-content-section-reduced space-y-4 rounded-lg border-2 border-theme-accent p-4"
      >
        <div class="flex h-20 items-center justify-center rounded-md border-2 border-theme-accent p-2">
          <SwitchIf
            condition={this.loadPreset.map((it) => !!it)}
            on={
              <div class="flex size-full items-center justify-center space-x-2">
                <div class="size-full content-center justify-center overflow-hidden rounded-md bg-theme-accent">
                  <span class="h-1/2 pl-3 pt-1 text-xl">
                    {t('Presets.AircraftStates.CurrentProcedureStep')}: {this.currentStepDescription}
                  </span>
                  <div
                    class="h-1/2 bg-theme-highlight"
                    style={{
                      width: this.loadPresetProgress.map((it) => `${it * 100}%`),
                      transition: 'width 0.1s ease',
                    }}
                  />
                </div>

                <Button onClick={this.handleCancel}>{t('Presets.AircraftStates.Cancel')}</Button>
              </div>
            }
            off={<span>{this.messageText}</span>}
          />
        </div>

        <ScrollableContainer innerClass="space-y-4" height={42}>
          {this.AircraftPresetsList.map(({ index, name }) => {
            const className = MappedSubject.create(
              ([simOnGround, loadPreset]) => !simOnGround || (loadPreset > 0 && loadPreset !== index),
              this.simOnGround,
              this.loadPreset,
            );

            this.subscriptions.push(className);

            return (
              <Button
                theme={ButtonTheme.Neutral}
                class="h-24 w-full"
                disabled={className}
                onClick={() => this.handleLoadPreset(index)}
              >
                {name}
              </Button>
            );
          })}
        </ScrollableContainer>

        <div class="mt-14 rounded-md border-2 border-theme-accent px-4 py-1">
          <div class="flex h-10 flex-row items-center">
            <div class="pr-3">{t('Presets.AircraftStates.ExpediteLoading')}</div>
            <Toggle value={this.loadPresetsExpedite} onToggle={(value) => this.handleSetLoadPresetsExpedite(value)} />
          </div>
        </div>
      </div>
    );
  }

  destroy(childFilter?: (child: UIVIew) => boolean) {
    super.destroy(childFilter);

    this.listener?.off('AIRCRAFT_PRESET_WASM_CALLBACK', this.onProgressUpdateFromWasm);
    this.listener?.unregister();
  }
}
