import { FSComponent, MappedSubject, UserSetting, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from '../../Pages/Settings/Settings';
import { AbstractUIView } from '../../shared/UIView';
import { t } from '../../Components/LocalizedText';
import { A32NX_DEFAULT_RADIO_AUTO_CALL_OUTS, A32NXRadioAutoCallOutFlags } from '@a32nx/shared/AutoCallOuts';
import { SettingsItem } from './Components/SettingItem';
import { Button } from '../../Components/Button';
import { Toggle } from '../../Components/Toggle';
import { ModalKind, showModal } from '../../Components/Modal';

interface SettingsAutomaticCalloutsPageProps {
  returnHome: () => any;
  autoCallOuts: UserSetting<number>;
}

export class SettingsAutomaticCalloutsPage extends AbstractUIView<SettingsAutomaticCalloutsPageProps> {
  private readonly majorCallOutOptions: [flag: A32NXRadioAutoCallOutFlags, name: string][] = [
    [A32NXRadioAutoCallOutFlags.TwoThousandFiveHundred, 'Two Thousand Five Hundred'],
    [A32NXRadioAutoCallOutFlags.TwentyFiveHundred, 'Twenty Five Hundred'],
    [A32NXRadioAutoCallOutFlags.TwoThousand, 'Two Thousand'],
    [A32NXRadioAutoCallOutFlags.OneThousand, 'One Thousand'],
    [A32NXRadioAutoCallOutFlags.FiveHundred, 'Five Hundred'],
    [A32NXRadioAutoCallOutFlags.FiveHundredGlide, 'Five Hundred'],
    [A32NXRadioAutoCallOutFlags.FourHundred, 'Four Hundred'],
    [A32NXRadioAutoCallOutFlags.ThreeHundred, 'Three Hundred'],
    [A32NXRadioAutoCallOutFlags.TwoHundred, 'Two Hundred'],
    [A32NXRadioAutoCallOutFlags.OneHundred, 'One Hundred'],
  ];

  private readonly minorCallOutOptions: [flag: A32NXRadioAutoCallOutFlags, name: string][] = [
    [A32NXRadioAutoCallOutFlags.Fifty, 'Fifty'],
    [A32NXRadioAutoCallOutFlags.Forty, 'Forty'],
    [A32NXRadioAutoCallOutFlags.Thirty, 'Thirty'],
    [A32NXRadioAutoCallOutFlags.Twenty, 'Twenty'],
    [A32NXRadioAutoCallOutFlags.Ten, 'Ten'],
    [A32NXRadioAutoCallOutFlags.Five, 'Five'],
  ];

  private toggleRadioAcoFlag(flag: A32NXRadioAutoCallOutFlags): void {
    let newFlags = this.props.autoCallOuts.get();

    if ((this.props.autoCallOuts.get() & flag) > 0) {
      newFlags &= ~flag;
    } else {
      newFlags |= flag;
    }

    // two-thousand-five-hundred and twenty-five-hundred are exclusive
    const both2500s = A32NXRadioAutoCallOutFlags.TwoThousandFiveHundred | A32NXRadioAutoCallOutFlags.TwentyFiveHundred;
    if ((newFlags & both2500s) === both2500s) {
      if (flag === A32NXRadioAutoCallOutFlags.TwentyFiveHundred) {
        newFlags &= ~A32NXRadioAutoCallOutFlags.TwoThousandFiveHundred;
      } else {
        newFlags &= ~A32NXRadioAutoCallOutFlags.TwentyFiveHundred;
      }
    }

    // one of five-hundred or four-hundred is mandatory
    const fiveHundredFourHundred = A32NXRadioAutoCallOutFlags.FiveHundred | A32NXRadioAutoCallOutFlags.FourHundred;
    if ((newFlags & fiveHundredFourHundred) === 0) {
      // Airbus basic config is four hundred so prefer that if it wasn't just de-selected
      if (flag === A32NXRadioAutoCallOutFlags.FourHundred) {
        newFlags |= A32NXRadioAutoCallOutFlags.FiveHundred;
      } else {
        newFlags |= A32NXRadioAutoCallOutFlags.FourHundred;
      }
    }

    // can't have 500 glide without 500
    if ((newFlags & A32NXRadioAutoCallOutFlags.FiveHundred) === 0) {
      newFlags &= ~A32NXRadioAutoCallOutFlags.FiveHundredGlide;
    }

    this.props.autoCallOuts.set(newFlags);
  }

  render(): VNode | null {
    return (
      <SettingsPage returnHome={this.props.returnHome} title={<>Automatic Call Outs</>} ref={this.rootRef}>
        <div class={'flex flex-row justify-center space-x-6'}>
          <div class={'flex w-full flex-col divide-y-2 divide-theme-accent'}>
            {this.majorCallOutOptions.map(([flag, name]) => (
              <SettingsItem settingName={name}>
                <Toggle
                  value={MappedSubject.create(([autoCallOuts]) => (autoCallOuts & flag) > 0, this.props.autoCallOuts)}
                  onToggle={() => this.toggleRadioAcoFlag(flag)}
                />
              </SettingsItem>
            ))}
          </div>

          <div class={'flex w-full flex-col divide-y-2 divide-theme-accent'}>
            {this.minorCallOutOptions.map(([flag, name]) => (
              <SettingsItem settingName={name}>
                <Toggle
                  value={MappedSubject.create(([autoCallOuts]) => (autoCallOuts & flag) > 0, this.props.autoCallOuts)}
                  onToggle={() => this.toggleRadioAcoFlag(flag)}
                />
              </SettingsItem>
            ))}
          </div>
        </div>

        <SettingsItem settingName={t('Settings.AutomaticCallOuts.ResetStandardConfig')}>
          <Button
            onClick={() => {
              showModal({
                kind: ModalKind.Prompt,
                title: 'Automatic Call Out Configuration Reset',
                bodyText:
                  'Are you sure that you want to reset your current configuration for automatic call outs to its standard configuration? This action is irreversible.',
                onConfirm: () => this.props.autoCallOuts.set(A32NX_DEFAULT_RADIO_AUTO_CALL_OUTS),
              });
            }}
          >
            {t('Settings.AutomaticCallOuts.Reset')}
          </Button>
        </SettingsItem>
      </SettingsPage>
    );
  }
}
