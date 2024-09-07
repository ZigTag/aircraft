import { DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';
import { Pages, Switch } from '../Pages';
import { PageEnum } from '../../Shared';
import { Selector } from '../../Components';
import { InteriorLighting } from './Pages/InteriorLighting';

export class Presets extends DisplayComponent<any> {
  private readonly activePage = Subject.create(PageEnum.PresetsPage.InteriorLighting);

  private readonly tabs: Pages = [
    [PageEnum.PresetsPage.InteriorLighting, <>{t('Presets.InteriorLighting.Title')}</>],
    [PageEnum.PresetsPage.AircraftStates, <>{t('Presets.AircraftStates.Title')}</>],
  ];

  render(): VNode {
    return (
      <div>
        <div class="flex items-start justify-between">
          <PageTitle>{t('Presets.Title')}</PageTitle>
          <Selector tabs={this.tabs} activePage={this.activePage} />
        </div>

        <Switch
          activePage={this.activePage}
          pages={[
            [PageEnum.PresetsPage.InteriorLighting, <InteriorLighting />],
            [PageEnum.PresetsPage.AircraftStates, <></>],
          ]}
        />
      </div>
    );
  }
}
