import { DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { AbstractUIView } from '../../shared/UIView';
import { AircraftGithubVersionChecker, BuildInfo } from '@flybywiresim/fbw-sdk';
import { EFBSimvars } from '../../EFBSimvarPublisher';

import FbwTail from '../../Assets/FBW-Tail.svg';
import { SettingsPage } from './Settings';
import { t } from '../../Components/LocalizedText';

interface CommunityPanelPlayerData {
  bCanSignOut: boolean;
  bDisable: boolean;
  sAvatar: string;
  sBuildVersion: string;
  sMoney: string;
  sCurrency: string;
  sName: string;
  sRichPresence: string;
  sStatus: string;
}

export interface SettingsAboutPageProps {
  return_home: () => any;
}

export class SettingsAboutPage extends AbstractUIView<SettingsAboutPageProps> {
  private readonly title = Subject.create<string | null>(null);

  private readonly version = Subject.create<string | null>(null);

  private readonly buildInfo = Subject.create<BuildInfo | null>(null);

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    if (process.env.AIRCRAFT_PROJECT_PREFIX) {
      AircraftGithubVersionChecker.getBuildInfo(process.env.AIRCRAFT_PROJECT_PREFIX).then((info) =>
        this.buildInfo.set(info),
      );
    }

    this.bus
      .getSubscriber<EFBSimvars>()
      .on('title')
      .whenChanged()
      .handle((it) => this.title.set(it));

    const listener = RegisterViewListener('JS_LISTENER_COMMUNITY');

    listener.on('SetGamercardInfo', (data: CommunityPanelPlayerData) => {
      this.version.set(data.sBuildVersion);
    });
  }

  render(): VNode | null {
    return (
      <SettingsPage title={t('Settings.About.Title')} return_home={this.props.return_home} ref={this.rootRef}>
        <div ref={this.rootRef} class="pointer-events-none inset-y-0 my-auto flex flex-col justify-center px-16">
          <div class="flex flex-row items-center">
            <div class="flex flex-col">
              <div class="flex flex-row items-center">
                <img class="w-[36px]" src={FbwTail} alt="" />
                <h1 class="font-manrope ml-4 text-4xl font-bold">flyPadOS</h1>
                <h1 class="font-manrope text-cyan ml-2 text-4xl font-bold">4</h1>
              </div>

              <p class="mt-3 text-2xl">
                Made with love by contributors in Québec, Germany, the United States, Singapore, Indonesia, New Zealand,
                Australia, Spain, the United Kingdom, France, the Netherlands, Sweden, and Switzerland!
              </p>
            </div>
          </div>
          <div class="mt-8 flex flex-col justify-center">
            <p>&copy; 2020-2024 FlyByWire Simulations and its contributors, all rights reserved.</p>
            <p>Licensed under the GNU General Public License Version 3</p>
          </div>

          <div class="mt-16">
            <h1 class="font-bold">Build Info</h1>
            <div class="mt-4">
              <BuildInfoEntry title="Sim Version" value={this.version} />
              <BuildInfoEntry title="Aircraft Version" value={this.buildInfo?.map((it) => it?.version ?? '')} />
              <BuildInfoEntry title="Livery Title" value={this.title} />
              <BuildInfoEntry title="Built" value={this.buildInfo?.map((it) => it?.built ?? '')} />
              <BuildInfoEntry title="Ref" value={this.buildInfo?.map((it) => it?.ref ?? '')} />
              <BuildInfoEntry title="SHA" value={this.buildInfo?.map((it) => it?.sha ?? '')} underline={8} />
              <BuildInfoEntry title="Event Name" value={this.buildInfo?.map((it) => it?.eventName ?? '')} />
              <BuildInfoEntry
                title="Pretty Release Name"
                value={this.buildInfo?.map((it) => it?.prettyReleaseName ?? '')}
              />
              {/*{sentryEnabled === SentryConsentState.Given && (*/}
              {/*  <BuildInfoEntry title="Sentry Session ID" value={sessionId} />*/}
              {/*)}*/}
            </div>
          </div>
        </div>
      </SettingsPage>
    );
  }
}

const SPACE_BETWEEN = 28;

interface BuildInfoEntryProps {
  title: string;

  value: Subscribable<string | null>;

  underline?: number;
}

class BuildInfoEntry extends DisplayComponent<BuildInfoEntryProps> {
  private readonly first = this.props.value.map((it) => it?.substring(0, this.props.underline ?? 0));

  private readonly last = this.props.value.map((it) => it?.substring(this.props.underline ?? 0));

  render(): VNode | null {
    return (
      <div class="mt-2 flex flex-row font-mono">
        <p>{this.props.title + '\u00A0'.repeat(Math.abs(SPACE_BETWEEN - this.props.title.length))}</p>
        <p class="ml-4">
          <span class="text-theme-highlight underline">{this.first}</span>
          {this.last}
        </p>
      </div>
    );
  }
}
