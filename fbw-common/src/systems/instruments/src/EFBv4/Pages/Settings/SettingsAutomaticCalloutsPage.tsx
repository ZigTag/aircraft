import { FSComponent, MappedSubject, UserSetting, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from '../../Pages/Settings/Settings';
import { AbstractUIView } from '../../shared/UIView';
import { t } from '../../Components/LocalizedText';
import { DEFAULT_RADIO_AUTO_CALL_OUTS, RadioAutoCallOutFlags } from '@flybywiresim/fbw-sdk';
import { SettingsItem } from './Components/SettingItem';
import { Button } from '../../Components/Button';
import { Toggle } from '../../Components/Toggle';

interface SettingsAutomaticCalloutsPageProps {
  returnHome: () => any;
  autoCallOuts: UserSetting<number>;
}

export class SettingsAutomaticCalloutsPage extends AbstractUIView<SettingsAutomaticCalloutsPageProps> {
  private readonly majorCallOutOptions: [flag: RadioAutoCallOutFlags, name: string][] = [
    [RadioAutoCallOutFlags.TwoThousandFiveHundred, 'Two Thousand Five Hundred'],
    [RadioAutoCallOutFlags.TwentyFiveHundred, 'Twenty Five Hundred'],
    [RadioAutoCallOutFlags.TwoThousand, 'Two Thousand'],
    [RadioAutoCallOutFlags.OneThousand, 'One Thousand'],
    [RadioAutoCallOutFlags.FiveHundred, 'Five Hundred'],
    [RadioAutoCallOutFlags.FiveHundredGlide, 'Five Hundred'],
    [RadioAutoCallOutFlags.FourHundred, 'Four Hundred'],
    [RadioAutoCallOutFlags.ThreeHundred, 'Three Hundred'],
    [RadioAutoCallOutFlags.TwoHundred, 'Two Hundred'],
    [RadioAutoCallOutFlags.OneHundred, 'One Hundred'],
  ];

  private readonly minorCallOutOptions: [flag: RadioAutoCallOutFlags, name: string][] = [
    [RadioAutoCallOutFlags.Fifty, 'Fifty'],
    [RadioAutoCallOutFlags.Forty, 'Forty'],
    [RadioAutoCallOutFlags.Thirty, 'Thirty'],
    [RadioAutoCallOutFlags.Twenty, 'Twenty'],
    [RadioAutoCallOutFlags.Ten, 'Ten'],
    [RadioAutoCallOutFlags.Five, 'Five'],
  ];

  private toggleRadioAcoFlag(flag: RadioAutoCallOutFlags): void {
    let newFlags = this.props.autoCallOuts.get();

    if ((this.props.autoCallOuts.get() & flag) > 0) {
      newFlags &= ~flag;
    } else {
      newFlags |= flag;
    }

    // two-thousand-five-hundred and twenty-five-hundred are exclusive
    const both2500s = RadioAutoCallOutFlags.TwoThousandFiveHundred | RadioAutoCallOutFlags.TwentyFiveHundred;
    if ((newFlags & both2500s) === both2500s) {
      if (flag === RadioAutoCallOutFlags.TwentyFiveHundred) {
        newFlags &= ~RadioAutoCallOutFlags.TwoThousandFiveHundred;
      } else {
        newFlags &= ~RadioAutoCallOutFlags.TwentyFiveHundred;
      }
    }

    // one of five-hundred or four-hundred is mandatory
    const fiveHundredFourHundred = RadioAutoCallOutFlags.FiveHundred | RadioAutoCallOutFlags.FourHundred;
    if ((newFlags & fiveHundredFourHundred) === 0) {
      // Airbus basic config is four hundred so prefer that if it wasn't just de-selected
      if (flag === RadioAutoCallOutFlags.FourHundred) {
        newFlags |= RadioAutoCallOutFlags.FiveHundred;
      } else {
        newFlags |= RadioAutoCallOutFlags.FourHundred;
      }
    }

    // can't have 500 glide without 500
    if ((newFlags & RadioAutoCallOutFlags.FiveHundred) === 0) {
      newFlags &= ~RadioAutoCallOutFlags.FiveHundredGlide;
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
          <Button onClick={() => this.props.autoCallOuts.set(DEFAULT_RADIO_AUTO_CALL_OUTS)}>
            {t('Settings.AutomaticCallOuts.Reset')}
          </Button>
        </SettingsItem>
      </SettingsPage>
    );
  }
}
