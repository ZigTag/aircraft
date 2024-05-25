import { DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';
import { PageEnum } from '../../shared/common';
import { AbstractUIView } from '../../shared/UIVIew';
import { Pages, Switch } from '../Pages';
import { Button } from '../../Components/Button';
import { SettingsAboutPage } from './SettingsAboutPage';
import SettingsPage = PageEnum.SettingsPage;

export class Settings extends AbstractUIView {
  private readonly activePage = Subject.create<PageEnum.SettingsPage>(PageEnum.SettingsPage.Index);

  private readonly activePageSetter = this.activePage.set.bind(this.activePage);

  private readonly pages: Pages = [
    [PageEnum.SettingsPage.Index, <SettingsIndex onPageSelected={this.activePageSetter} />],
    [PageEnum.SettingsPage.SimOptions, <span />],
    [PageEnum.SettingsPage.Realism, <span />],
    [PageEnum.SettingsPage.ThirdPartyOptions, <span />],
    [PageEnum.SettingsPage.AtsuAoc, <span />],
    [PageEnum.SettingsPage.Audio, <span />],
    [PageEnum.SettingsPage.flyPad, <span />],
    [PageEnum.SettingsPage.About, <SettingsAboutPage />],
  ];

  resume() {
    this.activePage.set(SettingsPage.Index);
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
    [PageEnum.SettingsPage.Index, t('Settings.SimOptions.Title')],
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
