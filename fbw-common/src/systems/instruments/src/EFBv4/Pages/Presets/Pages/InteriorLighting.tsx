// Copyright (c) 2024 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { FSComponent, MapSubject, Subject, Subscribable, SubscribableMap, VNode } from '@microsoft/msfs-sdk';
import { ScrollableContainer } from '../../../Components/ScrollableContainer';
import { AbstractUIView, LocalizedString } from '../../../Shared';
import { TooltipWrapper } from '../../../Components/Tooltip';
import { SimpleInput } from '../../../Components/SimpleInput';
import { t } from '../../../Components/LocalizedText';
import { Button, ButtonTheme } from '../../../Components/Button';
import {
  ModalKind,
  NotificationKind,
  NotificationLifetimeKind,
  showModal,
  showNotification,
  Toggle,
} from '../../../Components';
import { NXDataStore } from '@shared/persistence';
import { SelectInput, SelectInputChoice } from '../../../Components/SelectInput';

const replacer = (_key: any, value: any[]) => {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  }
  return value;
};

const reviver = (_key: any, value: { dataType: string; value: Iterable<readonly [unknown, unknown]> }) => {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
};

export class InteriorLighting extends AbstractUIView {
  private readonly namesMap = MapSubject.create<number, string>([]);

  private readonly storedNames = Subject.create('');

  private readonly isPowered = Subject.create(false);

  private readonly titleText = LocalizedString.create(
    'Presets.InteriorLighting.SelectAnInteriorLightingPresetToLoadOrSave',
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.isPowered.pipe(this.titleText, (isPowered) =>
        isPowered
          ? 'Presets.InteriorLighting.SelectAnInteriorLightingPresetToLoadOrSave'
          : 'Presets.InteriorLighting.TheAircraftMustBePoweredForInteriorLightingPresets',
      ),
      this.storedNames.sub((storedNames) => {
        this.namesMap.clear();

        try {
          const newValue: Map<number, string> = JSON.parse(storedNames, reviver);

          for (const [key, value] of newValue.entries()) {
            this.namesMap.setValue(key, value);
          }

          this.namesMap.set(newValue);
        } catch {
          // noop
        }
      }),
    );

    // TODO replace with FbwUserSettings
    NXDataStore.getAndSubscribe('LIGHT_PRESET_NAMES', (_key, value) => this.storedNames.set(value));
  }

  render(): VNode | null {
    return (
      <div ref={this.rootRef} class="my-2 h-content-section-reduced rounded-lg border-2 border-theme-accent p-2">
        <div class="mb-3 flex h-16 flex-row items-center justify-center space-x-2 rounded-md border-2 border-theme-accent p-2">
          {this.titleText}
        </div>
        <ScrollableContainer height={48}>
          <div class="grid grid-flow-row grid-cols-1 grid-rows-5 gap-0">
            {/* These the IDs for each row of presets. Add or remove numbers to add or remove rows */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SinglePreset
                presetID={i}
                getPresetName={(presetID) => this.namesMap.getValue(presetID)}
                storePresetName={(presetID: number, name: string) => {
                  this.namesMap.setValue(presetID, name);
                  const tmpJson = JSON.stringify(this.namesMap.get(), replacer);

                  // TODO replace with FbwUserSettings
                  NXDataStore.set('LIGHT_PRESET_NAMES', tmpJson);
                }}
                namesMap={this.namesMap}
                isPowered={this.isPowered}
              />
            ))}
          </div>
          <AutoLoadConfiguration namesMap={this.namesMap} storedNames={this.storedNames} />
        </ScrollableContainer>
      </div>
    );
  }
}

interface SinglePresetProps {
  presetID: number;

  getPresetName: (presetID: number) => string | undefined;

  storePresetName: (presetID: number, value: string) => void;

  namesMap: SubscribableMap<number, string>;

  isPowered: Subscribable<boolean>;
}

class SinglePreset extends AbstractUIView<SinglePresetProps> {
  private readonly presetName = Subject.create('');

  private readonly loadPresetTooltip = LocalizedString.create('Presets.InteriorLighting.TT.LoadThisPreset');

  private readonly savePresetTooltip = LocalizedString.create(
    'Presets.InteriorLighting.TT.SaveTheCurrentLightingLevels',
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.props.isPowered.pipe(this.loadPresetTooltip, (isPowered) =>
        isPowered ? 'Presets.InteriorLighting.TT.LoadThisPreset' : 'Presets.InteriorLighting.TT.AircraftMustBePowered',
      ),
      this.props.isPowered.pipe(this.savePresetTooltip, (isPowered) =>
        isPowered
          ? 'Presets.InteriorLighting.TT.SaveTheCurrentLightingLevels'
          : 'Presets.InteriorLighting.TT.AircraftMustBePowered',
      ),
      this.props.namesMap.sub(() => {
        const tmp = this.props.getPresetName(this.props.presetID);

        this.presetName.set(tmp ?? LocalizedString.translate('Presets.InteriorLighting.NoName') ?? '');
      }),
    );
  }

  private readonly handleChangePresetName = (oldName: string, newName: string): void => {
    if (oldName === newName) {
      return;
    }

    this.props.storePresetName(this.props.presetID, newName);
    this.presetName.set(newName);

    showModal({
      kind: ModalKind.Prompt,
      title: LocalizedString.translate('Presets.InteriorLighting.NewNameConfirmationDialogMsg') ?? '',
      bodyText: `${oldName} => ${newName}`,
      onReject: () => {
        this.presetName.set(oldName);
        this.props.storePresetName(this.props.presetID, oldName);
      },
    });
  };

  private readonly handleLoadPreset = (presetID: number) => {
    // loading of presets only allowed when aircraft is powered (also the case in the wasm)
    if (this.props.isPowered.get()) {
      SimVar.SetSimVarValue('L:A32NX_LIGHTING_PRESET_LOAD', 'number', presetID);

      showNotification({
        kind: NotificationKind.Success,
        text: `${LocalizedString.translate('Presets.InteriorLighting.LoadingPreset') ?? ''}: ${presetID}: ${this.presetName.get()}`,
        lifetime: {
          kind: NotificationLifetimeKind.Definite,
          naturalLifeSpan: 250,
        },
      });
    } else {
      showNotification({
        kind: NotificationKind.Info,
        text: LocalizedString.translate('Presets.InteriorLighting.AircraftNeedsToBePoweredToLoadPresets') ?? '',
        lifetime: {
          kind: NotificationLifetimeKind.Definite,
          naturalLifeSpan: 1000,
        },
      });
    }
  };

  private readonly handleSavePreset = (presetID: number) => {
    // Saving of presets only allowed when aircraft is powered (also the case in the wasm)
    if (this.props.isPowered.get()) {
      showModal({
        kind: ModalKind.Prompt,
        title: this.presetName.get(),
        bodyText: `${LocalizedString.translate('Presets.InteriorLighting.PleaseConfirmSavingPreset') ?? ''} ${presetID}: ${this.presetName.get()}`,
        onConfirm: () => {
          SimVar.SetSimVarValue('L:A32NX_LIGHTING_PRESET_SAVE', 'number', this.props.presetID);

          showNotification({
            kind: NotificationKind.Success,
            text: `${LocalizedString.translate('Presets.InteriorLighting.SavingPreset') ?? ''}: ${presetID}: ${this.presetName.get()}`,
            lifetime: {
              kind: NotificationLifetimeKind.Definite,
              naturalLifeSpan: 250,
            },
          });
        },
      });
    } else {
      showNotification({
        kind: NotificationKind.Error,
        text: LocalizedString.translate('Presets.InteriorLighting.AircraftNeedsToBePoweredToSavePresets') ?? '',
        lifetime: {
          kind: NotificationLifetimeKind.Definite,
          naturalLifeSpan: 1000,
        },
      });
    }
  };

  render(): VNode | null {
    return (
      <div ref={this.rootRef} class="my-2 flex flex-row justify-between">
        <div class="flex w-24 items-center justify-center">{this.props.presetID.toString()}</div>

        <div class="mx-4 flex h-16 items-center justify-center rounded-md border-2 border-theme-accent bg-theme-accent text-theme-text">
          <TooltipWrapper text={LocalizedString.create('Presets.InteriorLighting.TT.ClickTextToChangeThePresetsName')}>
            <div>
              <SimpleInput
                class="w-80 text-center text-2xl font-medium"
                placeholder={LocalizedString.create('Presets.InteriorLighting.NoName')}
                value={this.presetName}
                onBlur={(value) => this.handleChangePresetName(this.presetName.get(), value)}
                maxLength={16}
              />
            </div>
          </TooltipWrapper>
        </div>

        <TooltipWrapper text={this.loadPresetTooltip}>
          <Button
            theme={ButtonTheme.Neutral}
            class="mr-4 grow"
            disabled={this.props.isPowered.map((it) => !it)}
            onClick={() => this.handleLoadPreset(this.props.presetID)}
          >
            {t('Presets.InteriorLighting.LoadPreset')}
          </Button>
        </TooltipWrapper>

        <TooltipWrapper text={this.savePresetTooltip}>
          <Button
            theme={ButtonTheme.Neutral}
            class="grow"
            disabled={this.props.isPowered.map((it) => !it)}
            onClick={() => this.handleSavePreset(this.props.presetID)}
          >
            {t('Presets.InteriorLighting.SavePreset')}
          </Button>
        </TooltipWrapper>
      </div>
    );
  }
}

interface AutoLoadConfigurationprops {
  namesMap: SubscribableMap<number, string>;
  storedNames: Subscribable<string>;
}

class AutoLoadConfiguration extends AbstractUIView<AutoLoadConfigurationprops> {
  private readonly autoLoadPreset = Subject.create(0);
  private readonly autoLoadPresetDay = Subject.create(0);
  private readonly autoLoadPresetDawnDusk = Subject.create(0);
  private readonly autoLoadPresetNight = Subject.create(0);

  private readonly autoLoadPresetValid = this.autoLoadPreset.map((it) => !!it);

  private readonly presetSelectionOptions = Subject.create<SelectInputChoice<number>[]>([
    [0, LocalizedString.translate('Presets.InteriorLighting.AutoLoadNoneSelection') ?? ''],
  ]);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    // TODO replace with FbwUserSettings
    NXDataStore.getAndSubscribe('LIGHT_PRESET_AUTOLOAD', (_key, value) => this.autoLoadPreset.set(parseInt(value)));
    NXDataStore.getAndSubscribe('LIGHT_PRESET_AUTOLOAD_DAY', (_key, value) =>
      this.autoLoadPresetDay.set(parseInt(value)),
    );
    NXDataStore.getAndSubscribe('LIGHT_PRESET_AUTOLOAD_DAWNDUSK', (_key, value) =>
      this.autoLoadPresetDawnDusk.set(parseInt(value)),
    );
    NXDataStore.getAndSubscribe('LIGHT_PRESET_AUTOLOAD_NIGHT', (_key, value) =>
      this.autoLoadPresetNight.set(parseInt(value)),
    );

    this.subscriptions.push(
      this.autoLoadPresetValid,
      this.props.namesMap.sub(() => {
        this.presetSelectionOptions.set(this.generatePresetSelectionOptions());
      }),
      this.props.storedNames.sub(() => {
        this.presetSelectionOptions.set(this.generatePresetSelectionOptions());
      }),
    );

    this.presetSelectionOptions.set(this.generatePresetSelectionOptions());
  }

  private readonly handleSetAutoLoadPreset = (value: number) => {
    // TODO replace with FbwUserSettings
    NXDataStore.set('LIGHT_PRESET_AUTOLOAD', value.toString());
  };

  private readonly handleSetAutoLoadPresetDay = (value: number) => {
    // TODO replace with FbwUserSettings
    NXDataStore.set('LIGHT_PRESET_AUTOLOAD_DAY', value.toString());
  };

  private readonly handleSetAutoLoadPresetDawnDusk = (value: number) => {
    // TODO replace with FbwUserSettings
    NXDataStore.set('LIGHT_PRESET_AUTOLOAD_DAWNDUSK', value.toString());
  };

  private readonly handleSetAutoLoadPresetNight = (value: number) => {
    // TODO replace with FbwUserSettings
    NXDataStore.set('LIGHT_PRESET_AUTOLOAD_NIGHT', value.toString());
  };

  private readonly generatePresetSelectionOptions = () => {
    const options: SelectInputChoice<number>[] = [
      [0, LocalizedString.create('Presets.InteriorLighting.AutoLoadNoneSelection')],
    ];

    for (const [key, value] of this.props.namesMap.get().entries()) {
      options.push([key, value]);
    }

    return options;
  };

  render(): VNode | null {
    return (
      <div class="mt-2 rounded-md border-2 border-theme-accent px-4 py-2">
        <div class="flex h-10 flex-row items-center">
          <div class="pr-3">{t('Presets.InteriorLighting.AutoLoadLightingPreset')}</div>
          <Toggle value={this.autoLoadPresetValid} onToggle={(value) => this.handleSetAutoLoadPreset(value ? 1 : 0)} />
        </div>
        <div class="mt-3 flex flex-row items-center justify-start space-x-4">
          <div>{t('Presets.InteriorLighting.AutoLoadDay')}</div>
          <SelectInput
            class="h-12 w-72"
            choices={this.presetSelectionOptions}
            value={this.autoLoadPresetDay}
            dropdownOnTop
            onChange={(newPreset) => this.handleSetAutoLoadPresetDay(newPreset as number)}
          />
          <div>{t('Presets.InteriorLighting.AutoLoadDawnDusk')}</div>
          <SelectInput
            class="h-12 w-72"
            choices={this.presetSelectionOptions}
            value={this.autoLoadPresetDawnDusk}
            dropdownOnTop
            onChange={(newPreset) => this.handleSetAutoLoadPresetDawnDusk(newPreset as number)}
          />
          <div>{t('Presets.InteriorLighting.AutoLoadNight')}</div>
          <SelectInput
            class="h-12 w-72"
            choices={this.presetSelectionOptions}
            value={this.autoLoadPresetNight}
            dropdownOnTop
            onChange={(newPreset) => this.handleSetAutoLoadPresetNight(newPreset as number)}
          />
        </div>
      </div>
    );
  }
}
