import { FSComponent, NodeReference, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';
import { PageEnum } from '../../shared/common';
import { AbstractUIView } from '../../shared/UIView';
import { Pages, Switch } from '../Pages';
import { Button } from '../../Components/Button';
import { SettingsAboutPage } from './SettingsAboutPage';
import { SettingsAudioPage } from './SettingsAudioPage';
import { FbwUserSettings, FbwUserSettingsDefs } from '../../FbwUserSettings';
import { EFB_EVENT_BUS } from '../../EfbV4FsInstrument';
import { SettingsAircraftOptionsPinProgramsPage } from './SettingsAircraftOptionsPinProgramsPage';
import { PageBox } from '../../Components/PageBox';
import { SettingsSimOptionsPage } from './SettingsSimOptionsPage';
import { SettingsRealismPage } from './SettingsRealismPage';
import { SettingsThirdPartyOptionsPage } from './SettingsThirdPartyOptionsPage';
import { SettingsAtsuAocPage } from './SettingsAtsuAocPage';
import { SettingsFlyPadPage } from './SettingsFlyPadPage';

export class Settings extends AbstractUIView {
  private readonly settings = FbwUserSettings.getManager(EFB_EVENT_BUS);

  private readonly activePage = Subject.create<PageEnum.SettingsPage>(PageEnum.SettingsPage.Index);

  private readonly activePageSetter = this.activePage.set.bind(this.activePage);

  private readonly pages: Pages = [
    [PageEnum.SettingsPage.Index, <SettingsIndex onPageSelected={this.activePageSetter} />],
    [
      PageEnum.SettingsPage.AircraftOptionsPinPrograms,
      <SettingsAircraftOptionsPinProgramsPage
        settings={this.settings}
        return_home={() => this.activePageSetter(PageEnum.SettingsPage.Index)}
      />,
    ],
    [
      PageEnum.SettingsPage.SimOptions,
      <SettingsSimOptionsPage return_home={() => this.activePageSetter(PageEnum.SettingsPage.Index)} />,
    ],
    [
      PageEnum.SettingsPage.Realism,
      <SettingsRealismPage return_home={() => this.activePageSetter(PageEnum.SettingsPage.Index)} />,
    ],
    [
      PageEnum.SettingsPage.ThirdPartyOptions,
      <SettingsThirdPartyOptionsPage return_home={() => this.activePageSetter(PageEnum.SettingsPage.Index)} />,
    ],
    [
      PageEnum.SettingsPage.AtsuAoc,
      <SettingsAtsuAocPage return_home={() => this.activePageSetter(PageEnum.SettingsPage.Index)} />,
    ],
    [
      PageEnum.SettingsPage.Audio,
      <SettingsAudioPage
        settings={this.settings}
        return_home={() => this.activePageSetter(PageEnum.SettingsPage.Index)}
      />,
    ],
    [
      PageEnum.SettingsPage.flyPad,
      <SettingsFlyPadPage return_home={() => this.activePageSetter(PageEnum.SettingsPage.Index)} />,
    ],
    [
      PageEnum.SettingsPage.About,
      <SettingsAboutPage return_home={() => this.activePageSetter(PageEnum.SettingsPage.Index)} />,
    ],
  ];

  resume() {
    super.resume();
    this.activePage.set(PageEnum.SettingsPage.Index);
  }

  render(): VNode {
    return <Switch ref={this.rootRef} pages={this.pages} activePage={this.activePage} />;
  }
}

interface SettingsIndexProps {
  onPageSelected: (page: PageEnum.SettingsPage) => void;
}

class SettingsIndex extends AbstractUIView<SettingsIndexProps> {
  private readonly items = [
    [PageEnum.SettingsPage.AircraftOptionsPinPrograms, t('Settings.AircraftOptionsPinPrograms.Title')],
    [PageEnum.SettingsPage.SimOptions, t('Settings.SimOptions.Title')],
    [PageEnum.SettingsPage.Realism, t('Settings.Realism.Title')],
    [PageEnum.SettingsPage.ThirdPartyOptions, t('Settings.ThirdPartyOptions.Title')],
    [PageEnum.SettingsPage.AtsuAoc, t('Settings.AtsuAoc.Title')],
    [PageEnum.SettingsPage.Audio, t('Settings.Audio.Title')],
    [PageEnum.SettingsPage.flyPad, t('Settings.flyPad.Title')],
    [PageEnum.SettingsPage.About, t('Settings.About.Title')],
  ] as const;

  render(): VNode | null {
    return (
      <div ref={this.rootRef}>
        <PageTitle>{t('Settings.Title')}</PageTitle>

        <div class="space-y-6">
          {this.items.map(([page, title]) => (
            <Button
              class="page flex justify-between rounded-md border-2 border-transparent bg-theme-accent p-6 transition duration-100 hover:border-theme-highlight"
              onClick={() => this.props.onPageSelected(page)}
            >
              <p class="text-2xl">{title}</p>
              <i class={`bi-chevron-right text-[30px] text-inherit`} />
            </Button>
          ))}
        </div>
      </div>
    );
  }
}

export interface SettingsPageProps {
  return_home: () => any;
  title: VNode;
  ref: NodeReference<HTMLElement>;
}

export class SettingsPage extends AbstractUIView<SettingsPageProps> {
  render(): VNode | null {
    return (
      <div ref={this.props.ref}>
        <Button onClick={this.props.return_home} class="bg-inherit hover:text-theme-highlight" unstyled>
          <PageTitle>
            {t('Settings.Title')}
            {' &gt; '}
            {this.props.title}
          </PageTitle>
        </Button>
        <PageBox>{this.props.children}</PageBox>
      </div>
    );
  }
}
