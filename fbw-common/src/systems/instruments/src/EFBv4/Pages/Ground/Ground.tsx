import { DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components';
import { t } from '../../Components';
import { Switch } from '../Pages';
import { GroundState } from '../../State/GroundState';
import { PageEnum } from '../../Shared';
import { Services } from './Pages/Services/Services';
import { Selector } from '../../Components';
import { Fuel } from './Pages/Fuel/Fuel';
import { SimbriefState } from '../../State/NavigationState';

export interface GroundProps {
  groundState: GroundState;
  simbriefState: SimbriefState;
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
            [PageEnum.GroundPage.Fuel, <Fuel simbriefState={this.props.simbriefState} />],
            [PageEnum.GroundPage.Payload, <></>],
            [PageEnum.GroundPage.Pushback, <></>],
          ]}
        />
      </div>
    );
  }
}
