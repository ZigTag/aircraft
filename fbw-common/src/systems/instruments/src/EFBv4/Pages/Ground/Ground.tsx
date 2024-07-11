import { DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';
import { GroundState, Switch } from '../Pages';
import { PageEnum } from '../../shared/common';
import { Services } from './Pages/Services';
import { Selector } from '../../Components/Selector';

export interface GroundProps {
  groundState: GroundState;
}

export class Ground extends DisplayComponent<GroundProps> {
  private readonly activePage = Subject.create(PageEnum.GroundPage.Services);

  render(): VNode {
    return (
      <div class="relative">
        <div class="flex flex-row justify-between">
          <PageTitle>{t('Ground.Title')}</PageTitle>
          <Selector
            class="absolute right-0 top-0"
            tabs={[
              [PageEnum.GroundPage.Services, t('Ground.Services.Title')],
              [PageEnum.GroundPage.Fuel, t('Ground.Fuel.Title')],
              [PageEnum.GroundPage.Payload, t('Ground.Payload.Title')],
              [PageEnum.GroundPage.Pushback, t('Ground.Pushback.Title')],
            ]}
            activePage={this.activePage}
          />
        </div>
        <Switch
          activePage={this.activePage}
          pages={[
            [PageEnum.GroundPage.Services, <Services groundState={this.props.groundState} />],
            [PageEnum.GroundPage.Fuel, <></>],
            [PageEnum.GroundPage.Payload, <></>],
            [PageEnum.GroundPage.Pushback, <></>],
          ]}
        />
      </div>
    );
  }
}
