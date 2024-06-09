import { ArraySubject, DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { AbstractUIView } from '../../shared/UIView';
import { Failure } from '@shared/failures';
import { AtaChapterNumber, AtaChaptersDescription, AtaChaptersTitle } from '@shared/ata';
import { ScrollableContainer } from '../Dashboard/Dashboard';
import { PageBox } from '../../Components/PageBox';
import { SimpleInput } from '../../Components/SimpleInput';
import { Selector } from '../../Components/Selector';
import { Pages } from '../Pages';
import { PageEnum } from '../../shared/common';
import { t } from '../../Components/LocalizedText';
import { LocalizedString } from '../../shared/translation';

export class Failures extends AbstractUIView {
  private readonly ataChapterContainerRef = FSComponent.createRef<HTMLSpanElement>();

  private allFailures = Subject.create<readonly Readonly<Failure>[]>([]);

  private readonly ataChapters = this.allFailures.map((it) => {
    return Array.from(new Set(it.map((it) => it.ata))).sort((a, b) => a - b);
  });

  private failures = ArraySubject.create<Failure>([]);

  private readonly failuresViewModesPages: Pages = [
    [PageEnum.FailuresPage.Comfort, <>{t('Failures.Comfort.Title')}</>],
    [PageEnum.FailuresPage.Compact, <>{t('Failures.Compact.Title')}</>],
  ];

  private readonly failuresSearchBarPlaceholderText = LocalizedString.create('Failures.Search');

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.client.failuresList.sub((list) => {
        this.allFailures.set(list);
        this.failures.set(list);
      }, true),
    );

    this.allFailures.sub((failures) => {
      const chapters: AtaChapterNumber[] = Array.from(new Set(failures.map((it) => it.ata))).sort((a, b) => a - b);

      for (const chapter of chapters) {
        FSComponent.render(
          <AtaChapterCard
            ataNumber={chapter}
            ataTitle={AtaChaptersTitle[chapter]}
            ataDescription={
              chapter in AtaChaptersDescription
                ? AtaChaptersDescription[chapter as keyof typeof AtaChaptersDescription]
                : ''
            }
            hasActiveFailure={Subject.create(false)}
          />,
          this.ataChapterContainerRef.instance,
        );
      }
    }, true);
  }

  render(): VNode {
    return (
      <div ref={this.rootRef}>
        <div class="flex justify-between">
          <PageTitle>Failures</PageTitle>

          <div class="flex h-10 flex-row items-center space-x-2 rounded-md bg-yellow-400 px-4 py-1">
            <i class="bi-info-circle-fill text-black" />
            <p class="text-black">{t('Failures.FullSimulationOfTheFailuresBelowIsntYetGuaranteed')}</p>
          </div>
        </div>

        <PageBox class="space-y-4 p-4">
          <div class="mt-2 flex w-full space-x-4 px-2">
            <SimpleInput
              placeholder={this.failuresSearchBarPlaceholderText}
              containerClass="grow"
              class="uppercase"
              value={Subject.create('')}
              // onChange={(value) => dispatch(setSearchQuery(value.toUpperCase()))}
            />

            <Selector tabs={this.failuresViewModesPages} activePage={Subject.create(0)} />
          </div>

          <ScrollableContainer height={48}>
            <span ref={this.ataChapterContainerRef} />
          </ScrollableContainer>
        </PageBox>
      </div>
    );
  }
}

interface AtaChapterCardprops {
  ataNumber: AtaChapterNumber;

  ataTitle: string;

  ataDescription: string;

  hasActiveFailure: Subscribable<boolean>;
}

class AtaChapterCard extends DisplayComponent<AtaChapterCardprops> {
  render(): VNode | null {
    return (
      <div class="flex h-36 flex-row items-stretch space-x-4 rounded-md border-2 border-transparent bg-transparent p-2 transition duration-100 hover:border-theme-highlight">
        <div class="flex h-full w-1/5 items-center justify-center rounded-md bg-theme-accent font-title text-5xl font-bold">
          {`ATA ${this.props.ataNumber}`}

          <div class="relative -right-7 bottom-16 inline-block size-0 fill-current text-utility-red">
            <svg
              style={{
                width: '30px',
                height: '30px',
                visibility: this.props.hasActiveFailure.map((it) => (it ? 'visible' : 'hidden')),
              }}
              viewBox="0 0 20 20"
            >
              <circle cx={10} cy={10} r={5} />
            </svg>
          </div>
        </div>

        <div class="w-3/4 space-y-2">
          <h1 class="font-bold">{this.props.ataTitle}</h1>
          <p>{this.props.ataDescription}</p>
        </div>
      </div>
    );
  }
}
