import { AbstractUIView } from '../../shared/UIView';
import { DisplayComponent, FSComponent, MappedSubject, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';
import { NavigraphAuthState, Pages, Switch } from '../Pages';
import { PageEnum } from '../../shared/common';
import { SettingsItem, ToggleSettingsItem } from './Components/SettingItem';
import { Button, ButtonTheme } from '../../Components/Button';
import { FbwUserSettingsDefs } from '../../FbwUserSettings';
import { LocalizedString } from '../../shared/translation';
import { DeviceFlowParams } from 'navigraph/auth';
import { twMerge } from 'tailwind-merge';
import { QRCodeSVG } from '@akamfoad/qrcode';

import navigraphLogo from '../../Assets/navigraph-logo-alone.svg';

export interface SettingsThirdPartyOptionsPageProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;

  navigraphAuthState: NavigraphAuthState;

  returnHome: () => any;
}

export class SettingsThirdPartyOptionsPage extends AbstractUIView<SettingsThirdPartyOptionsPageProps> {
  private readonly pages: Pages = [
    [
      PageEnum.ThirdPartySettingsPage.Index,
      <SettingsThirdPartyOptionsIndex
        settings={this.props.settings}
        navigraphAuthState={this.props.navigraphAuthState}
      />,
    ],
  ];

  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.ThirdPartyOptions.Title')} returnHome={this.props.returnHome} ref={this.rootRef}>
        <Switch pages={this.pages} activePage={Subject.create(PageEnum.ThirdPartySettingsPage.Index)} />
      </SettingsPage>
    );
  }
}

interface SettingsThirdPartyOptionsIndexProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;

  navigraphAuthState: NavigraphAuthState;
}

class SettingsThirdPartyOptionsIndex extends DisplayComponent<SettingsThirdPartyOptionsIndexProps> {
  private readonly deviceFlowParams = Subject.create<DeviceFlowParams | null>(null);

  private readonly deviceFlowOverlayVisible = Subject.create(false);

  private readonly deviceFlowQrCode = this.deviceFlowParams.map((params) => {
    if (!params) {
      return null;
    }

    const code = new QRCodeSVG(params.verification_uri_complete);

    return code.toDataUrl();
  });

  private readonly deviceFlowOverlayClass = this.deviceFlowOverlayVisible.map((visible) => {
    return twMerge(
      'pointer-events-none absolute inset-0 flex items-center justify-center bg-theme-body/80 opacity-0 transition-all duration-150',
      visible && 'opacity-1 pointer-events-auto',
    );
  });

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    MappedSubject.create(
      ([deviceFlowParams, user]) => [deviceFlowParams, user],
      this.deviceFlowParams,
      this.props.navigraphAuthState.user,
    ).sub(([deviceFlowParams, user]) => {
      if (deviceFlowParams && !user) {
        this.deviceFlowOverlayVisible.set(true);
      }
    });
  }

  render(): VNode | null {
    return (
      <div>
        <div class="divide-y-2 divide-theme-accent">
          <NavigraphAccountLinkSettingsItem
            navigraphAuthState={this.props.navigraphAuthState}
            onShowDeviceFlowParams={(params) => this.deviceFlowParams.set(params)}
            onLoginComplete={() => this.deviceFlowParams.set(null)}
          />

          <ToggleSettingsItem
            setting={this.props.settings.getSetting('fbwGsxFuelSyncEnabled')}
            settingName={t('Settings.ThirdPartyOptions.GsxFuelEnabled')}
          />
          <ToggleSettingsItem
            setting={this.props.settings.getSetting('fbwGsxPayloadSyncEnabled')}
            settingName={t('Settings.ThirdPartyOptions.GsxPayloadEnabled')}
          />
          <ToggleSettingsItem
            setting={this.props.settings.getSetting('fbwAutomaticallyImportSimbriefData')}
            settingName={t('Settings.AtsuAoc.AutomaticallyImportSimBriefData')}
          />
        </div>

        <div class={this.deviceFlowOverlayClass}>
          <div class="flex flex-col items-center space-y-6">
            <img src={navigraphLogo} class="w-20" />

            <h2 class="font-semibold">{t('Settings.ThirdPartyOptions.NavigraphAccountLink.LoginPage.Title')}</h2>

            <span class="max-w-prose text-center">
              {t('NavigationAndCharts.Navigraph.ScanTheQrCodeOrOpen')}{' '}
              <span class="text-theme-highlight">
                {this.deviceFlowParams.map((it) => it?.verification_uri ?? '(URL not yet Available)')}
              </span>{' '}
              {t('NavigationAndCharts.Navigraph.IntoYourBrowserAndEnterTheCodeBelow')}
            </span>

            <span class="rounded-md border-2 border-theme-accent bg-theme-secondary px-2 py-1.5 font-mono text-3xl">
              {this.deviceFlowParams.map((it) => it?.user_code ?? '????????')}
            </span>

            <img src={this.deviceFlowQrCode} class="w-60 rounded-md border-4 border-theme-accent" />

            <Button class={'!mt-16 w-full'} onClick={() => this.deviceFlowOverlayVisible.set(false)}>
              {t('Modals.Cancel')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

interface NavigraphAccountLinkSettingsItemProps {
  navigraphAuthState: NavigraphAuthState;

  onShowDeviceFlowParams: (params: DeviceFlowParams) => void;

  onLoginComplete: () => void;
}

class NavigraphAccountLinkSettingsItem extends AbstractUIView<NavigraphAccountLinkSettingsItemProps> {
  private readonly buttonText = LocalizedString.create('Settings.ThirdPartyOptions.NavigraphAccountLink.Link');

  private readonly subscriptionText = LocalizedString.create(
    `Settings.ThirdPartyOptions.NavigraphAccountLink.SubscriptionStatus.Unknown`,
  );

  private readonly buttonTheme = Subject.create(ButtonTheme.Highlight);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(this.buttonText);

    this.subscriptions.push(
      this.props.navigraphAuthState.user.sub((user) => {
        this.subscriptionText.set(
          ['charts', 'fmsdata'].every((it) => user?.subscriptions.includes(it))
            ? 'Settings.ThirdPartyOptions.NavigraphAccountLink.SubscriptionStatus.Unlimited'
            : 'Settings.ThirdPartyOptions.NavigraphAccountLink.SubscriptionStatus.None',
        );
        this.buttonText.set(
          user
            ? 'Settings.ThirdPartyOptions.NavigraphAccountLink.Unlink'
            : 'Settings.ThirdPartyOptions.NavigraphAccountLink.Link',
        );
        this.buttonTheme.set(user ? ButtonTheme.Danger : ButtonTheme.Highlight);
      }),
    );
  }

  private async handleButtonClicked(): Promise<void> {
    const loggedIn = !!this.props.navigraphAuthState.user.get();

    if (loggedIn) {
      await this.props.navigraphAuthState.logout();
    } else {
      await this.props.navigraphAuthState.login(this.props.onShowDeviceFlowParams);

      this.props.onLoginComplete();
    }
  }

  render(): VNode | null {
    return (
      <SettingsItem settingName={t('Settings.ThirdPartyOptions.NavigraphAccountLink.SettingTitle')}>
        <div class="flex grow items-center space-x-4">
          <span
            class="flex grow space-x-2"
            style={{ visibility: this.props.navigraphAuthState.user.map((it) => (it ? 'visible' : 'hidden')) }}
          >
            <span>{this.props.navigraphAuthState.user.map((it) => it?.preferred_username ?? '')}</span>
            <img src={navigraphLogo} class="mt-px size-6" />
            <span>{this.subscriptionText}</span>
          </span>

          <Button theme={this.buttonTheme} onClick={() => this.handleButtonClicked()}>
            {this.buttonText}
          </Button>
        </div>
      </SettingsItem>
    );
  }
}
