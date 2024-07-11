import {
  ArraySubject,
  DisplayComponent,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
  VNode,
} from '@microsoft/msfs-sdk';
import { PageTitle } from '../../Components/PageTitle';
import { AbstractUIView } from '../../Shared/UIView';
import { Failure } from '@shared/failures';
import { AtaChapterNumber, AtaChaptersDescription, AtaChaptersTitle } from '@shared/ata';
import { ScrollableContainer } from '../../Components/ScrollableContainer';
import { PageBox } from '../../Components/PageBox';
import { SimpleInput } from '../../Components/SimpleInput';
import { Selector } from '../../Components/Selector';
import { Pages, Switch } from '../Pages';
import { PageEnum } from '../../Shared/common';
import { t } from '../../Components/LocalizedText';
import { LocalizedString } from '../../Shared/translation';
import { List } from '../../Components/List';
import { twMerge } from 'tailwind-merge';

export class Failures extends AbstractUIView {
  private readonly activePage = Subject.create(PageEnum.FailuresPage.Comfort);

  private readonly shownAtaChapter = Subject.create<AtaChapterNumber>(0);

  private readonly allFailures = Subject.create<readonly Failure[]>([]);

  private readonly activeFailures = Subject.create<readonly number[]>([]);

  private readonly changingFailures = Subject.create<readonly number[]>([]);

  private readonly pages: Pages = [
    [
      PageEnum.FailuresPage.Comfort,
      <FailuresComfortView
        onAtaChapterChosen={(ata) => {
          this.activePage.set(PageEnum.FailuresPage.Ata);
          this.shownAtaChapter.set(ata);
        }}
      />,
    ],
    [PageEnum.FailuresPage.Compact, <>{t('Failures.Compact.Title')}</>],
    [
      PageEnum.FailuresPage.Ata,
      <FailuresAtaChapterView
        alLFailures={this.allFailures}
        activeFailures={this.activeFailures}
        changingFailures={this.changingFailures}
        ataChapter={this.shownAtaChapter}
      />,
    ],
  ];

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.client.failuresList.sub((it) => this.allFailures.set(it), true),
      this.client.failuresState.sub(({ active, changing }) => {
        this.activeFailures.set(active);
        this.changingFailures.set(changing);
      }, true),
    );
  }

  private readonly failuresViewModsButtonsPages: Pages = [
    [PageEnum.FailuresPage.Comfort, <>{t('Failures.Comfort.Title')}</>],
    [PageEnum.FailuresPage.Compact, <>{t('Failures.Compact.Title')}</>],
  ];

  private readonly failuresSearchBarPlaceholderText = LocalizedString.create('Failures.Search');

  render(): VNode | null {
    return (
      <div ref={this.rootRef} class="flex flex-col">
        <div class="flex justify-between">
          <PageTitle>{t('Failures.Title')}</PageTitle>

          <div class="flex h-10 flex-row items-center space-x-2 rounded-md bg-yellow-400 px-4 py-1">
            <i class="bi-info-circle-fill text-black" />
            <p class="text-black">{t('Failures.FullSimulationOfTheFailuresBelowIsntYetGuaranteed')}</p>
          </div>
        </div>

        <PageBox class="space-y-4 p-4 pr-6">
          <div class="mt-2 flex w-full shrink-0 space-x-4 pl-2">
            <SimpleInput
              placeholder={this.failuresSearchBarPlaceholderText}
              containerClass="grow"
              class="uppercase"
              value={Subject.create('')}
              // onChange={(value) => dispatch(setSearchQuery(value.toUpperCase()))}
            />

            <Selector tabs={this.failuresViewModsButtonsPages} activePage={Subject.create(0)} />
          </div>

          <ScrollableContainer height={32} class="w-full grow pl-2">
            <Switch pages={this.pages} activePage={this.activePage} />
          </ScrollableContainer>
        </PageBox>
      </div>
    );
  }
}

interface FailuresComfortViewProps {
  onAtaChapterChosen: (ata: AtaChapterNumber) => void;
}

class FailuresComfortView extends AbstractUIView<FailuresComfortViewProps> {
  private allFailures = Subject.create<readonly Readonly<Failure>[]>([]);

  private failures = ArraySubject.create<Failure>([]);

  private readonly failuresSearchBarPlaceholderText = LocalizedString.create('Failures.Search');

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.subscriptions.push(
      this.client.failuresList.sub((list) => {
        this.allFailures.set(list);
        this.failures.set(list);
      }, true),
      this.failuresSearchBarPlaceholderText,
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
            onClick={() => this.props.onAtaChapterChosen(chapter)}
          />,
          this.rootRef.instance,
        );
      }
    }, true);
  }

  render(): VNode {
    return <div ref={this.rootRef} />;
  }
}

interface AtaChapterCardProps {
  ataNumber: AtaChapterNumber;

  ataTitle: string;

  ataDescription: string;

  hasActiveFailure: Subscribable<boolean>;

  onClick: () => void;
}

class AtaChapterCard extends DisplayComponent<AtaChapterCardProps> {
  private readonly ref = FSComponent.createRef<HTMLDivElement>();

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.ref.instance.addEventListener('click', this.props.onClick);
  }

  render(): VNode | null {
    return (
      <div
        ref={this.ref}
        class="flex h-36 flex-row items-stretch space-x-4 rounded-md border-2 border-transparent bg-transparent p-2 transition duration-100 hover:border-theme-highlight"
      >
        <div class="flex h-full w-1/5 items-center justify-center rounded-md bg-theme-accent font-title text-5xl font-bold">
          {`ATA ${this.props.ataNumber}`}

          <div class="size-0 relative -right-7 bottom-16 inline-block fill-current text-utility-red">
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

interface FailuresAtaChapterViewProps {
  alLFailures: Subscribable<readonly Failure[]>;

  activeFailures: Subscribable<readonly number[]>;

  changingFailures: Subscribable<readonly number[]>;

  ataChapter: Subscribable<AtaChapterNumber>;
}

class FailuresAtaChapterView extends AbstractUIView<FailuresAtaChapterViewProps> {
  private readonly filteredFailures = MappedSubject.create(
    ([allFailures, ataChapter]) => {
      return allFailures.filter((it) => it.ata === ataChapter);
    },
    this.props.alLFailures,
    this.props.ataChapter,
  );

  private onFailureClicked(failure: Failure): void {
    const isChanging = this.props.changingFailures.get().find((it) => it === failure.identifier);

    if (isChanging) {
      return;
    }

    const isActive = this.props.activeFailures.get().find((it) => it === failure.identifier);

    if (isActive) {
      this.client.deactivateFailure(failure);
    } else {
      this.client.activateFailure(failure);
    }
  }

  render(): VNode | null {
    return (
      <div ref={this.rootRef}>
        <List
          class="grid auto-rows-auto grid-cols-4 overflow-y-scroll"
          items={this.filteredFailures}
          render={(failure, index) => (
            <FailureCard
              failure={failure}
              isActive={this.props.activeFailures.map((it) => it.includes(failure.identifier))}
              isChanging={this.props.changingFailures.map((it) => it.includes(failure.identifier))}
              highlightedTerm={Subject.create('')} // TODO restore functionality
              onClick={() => this.onFailureClicked(failure)}
              class={`${index && index % 4 !== 0 && 'ml-4'} ${index >= 4 && 'mt-4'} h-36`}
            />
          )}
        />
      </div>
    );
  }
}

interface FailureCardProps {
  failure: Failure;

  highlightedTerm: Subscribable<string>;

  isActive: Subscribable<boolean>;

  isChanging: Subscribable<boolean>;

  onClick: () => void;

  class: string;
}

class FailureCard extends DisplayComponent<FailureCardProps> {
  private readonly ref = FSComponent.createRef<HTMLButtonElement>();

  private readonly isChanging = Subject.create(false);

  private readonly class = MappedSubject.create(
    ([isActive, isChanging]) => {
      let color = 'border-0';
      if (!isChanging) {
        color = isActive ? 'border-utility-red' : 'border-utility-green';
      }

      return twMerge(`flex rounded-md border-t-4 bg-theme-accent px-2 pb-2 pt-3 text-left`, color, this.props.class);
    },
    this.props.isActive,
    this.props.isChanging,
  );

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    this.ref.instance.addEventListener('click', this.props.onClick);
  }

  destroy() {
    super.destroy();

    this.ref.instance.removeEventListener('click', this.props.onClick);
  }

  render(): VNode | null {
    return (
      <button ref={this.ref} type="button" class={this.class}>
        <h2 class={{ 'view-hidden': this.props.highlightedTerm.map((it) => it !== '') }}>
          {this.props.highlightedTerm.map((it) =>
            this.props.failure.name.substring(0, this.props.failure.name.indexOf(it)),
          )}
          <span class="text-2xl underline">{this.props.highlightedTerm}</span>
          {this.props.highlightedTerm.map((it) =>
            this.props.failure.name.substring(this.props.failure.name.indexOf(it) + it.length),
          )}
        </h2>
        <h2 class={{ 'view-hidden': this.props.highlightedTerm.map((it) => it === '') }}>{this.props.failure.name}</h2>
      </button>
    );
  }
}
