import { DisplayComponent, FSComponent, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { t } from '../../Components/LocalizedText';
import { Pages, Switch } from '../Pages';
import { PageEnum } from '../../Shared';
import { Takeoff } from './Pages/Takeoff';
import { FbwUserSettingsDefs } from '../../FbwUserSettings';
import { SimbriefState } from '../../State/NavigationState';
import { PerformanceCalculators } from '@shared/performance';

export interface PerformanceProps {
  settings: UserSettingManager<FbwUserSettingsDefs>;

  simbriefState: SimbriefState;

  calculators: PerformanceCalculators;
}

export class Performance extends DisplayComponent<PerformanceProps> {
  private readonly activePage = Subject.create(PageEnum.PerformancePage.Takeoff);

  private readonly pages: Pages = [
    [
      PageEnum.PerformancePage.Takeoff,
      <Takeoff
        settings={this.props.settings}
        simbriefState={this.props.simbriefState}
        calculators={this.props.calculators}
      />,
    ],
  ];

  render(): VNode {
    return (
      <div>
        <PageTitle>{t('Performance.Title')}</PageTitle>

        <Switch pages={this.pages} activePage={this.activePage} />
      </div>
    );
  }
}
