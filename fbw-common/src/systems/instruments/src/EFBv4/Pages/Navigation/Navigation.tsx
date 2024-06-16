import { DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { PageBox } from '../../Components/PageBox';
import { t } from '../../Components/LocalizedText';
import { Selector } from '../../Components/Selector';
import { Pages } from '../Pages';
import { PageEnum } from '../../shared/common';

export class Navigation extends DisplayComponent<any> {
  private readonly tabs: Pages = [
    [PageEnum.NavigationPage.Navigraph, <>{t('NavigationAndCharts.Navigraph.Title')}</>],
    [PageEnum.NavigationPage.LocalFiles, <>{t('NavigationAndCharts.LocalFiles.Title')}</>],
    [PageEnum.NavigationPage.PinnedCharts, <>{t('NavigationAndCharts.PinnedCharts.Title')}</>],
  ];

  render(): VNode {
    return (
      <div>
        <div class="flex justify-between">
          <PageTitle>{t('NavigationAndCharts.Title')}</PageTitle>
          <Selector tabs={this.tabs} activePage={Subject.create(0)} />
        </div>
        {/*<Pager*/}
      </div>
    );
  }
}
