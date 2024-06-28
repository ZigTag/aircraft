import { Subject, VNode } from '@microsoft/msfs-sdk';
import { AbstractUIView } from 'instruments/src/EFBv4/shared/UIView';
import { FSComponent } from '@microsoft/msfs-sdk';
import { EFB_EVENT_BUS } from 'instruments/src/EFBv4/EfbV4FsInstrument';
import { FlypadControlEvents } from 'instruments/src/EFBv4/FlypadControlEvents';
import { t } from '../Components/LocalizedText';

export enum ModalKind {
  Prompt,
  Alert,
}

interface BaseModalProps {
  kind: ModalKind;
  title: string;
  bodyText: string;
}

interface PromptModalProps extends BaseModalProps {
  kind: ModalKind.Prompt;
  onConfirm?: () => any;
  onReject?: () => any;
  confirmText?: string;
  rejectText?: string;
}

interface AlertModalProps extends BaseModalProps {
  kind: ModalKind.Alert;
  onAcknowledge?: () => any;
  acknowledgeText?: string;
}

export type Modal = PromptModalProps | AlertModalProps;

export const showModal = (modal: Modal) => EFB_EVENT_BUS.getPublisher<FlypadControlEvents>().pub('show_modal', modal);
export const popModal = () => EFB_EVENT_BUS.getPublisher<FlypadControlEvents>().pub('pop_modal', {});

class PromptModal extends AbstractUIView<PromptModalProps> {
  private readonly declineButtonRef = FSComponent.createRef<HTMLButtonElement>();
  private readonly confirmButtonRef = FSComponent.createRef<HTMLButtonElement>();

  private handleDecline(): void {
    this.props.onReject?.();
    popModal();
    this.destroy();
  }

  private handleConfirm(): void {
    this.props.onConfirm?.();
    popModal();
    this.destroy();
  }

  onAfterRender(): void {
    this.declineButtonRef.instance.addEventListener('click', this.handleDecline.bind(this));
    this.confirmButtonRef.instance.addEventListener('click', this.handleConfirm.bind(this));
  }

  render(): VNode | null {
    return (
      <div class="w-5/12 rounded-xl border-2 border-theme-accent bg-theme-body p-8">
        <h1 class="font-bold">{this.props.title}</h1>
        <p class="mt-4">{this.props.bodyText}</p>

        <div class="mt-8 flex flex-row space-x-4">
          <button
            ref={this.declineButtonRef}
            type="button"
            class="flex w-full items-center justify-center rounded-md border-2 border-theme-accent bg-theme-accent px-8 py-2 text-center text-theme-text transition duration-100 hover:border-theme-highlight hover:bg-theme-body hover:text-theme-highlight"
          >
            {this.props.rejectText ?? t('Modals.Cancel')}
          </button>
          <button
            ref={this.confirmButtonRef}
            type="button"
            class="flex w-full items-center justify-center rounded-md border-2 border-theme-highlight bg-theme-highlight px-8 py-2 text-center text-theme-body transition duration-100 hover:bg-theme-body hover:text-theme-highlight"
          >
            {this.props.confirmText ?? t('Modals.Confirm')}
          </button>
        </div>
      </div>
    );
  }
}

class AlertModal extends AbstractUIView<AlertModalProps> {
  private readonly acknowledgeButtonRef = FSComponent.createRef<HTMLButtonElement>();

  private handleAcknowledge(): void {
    this.props.onAcknowledge?.();
    popModal();
  }

  onAfterRender(): void {
    this.acknowledgeButtonRef.instance.addEventListener('click', this.handleAcknowledge);
  }

  render(): VNode | null {
    return (
      <div class="w-5/12 rounded-xl border-2 border-theme-accent bg-theme-body p-8">
        <h1 class="font-bold">{this.props.title}</h1>
        <p class="mt-4">{this.props.bodyText}</p>
        <button
          ref={this.acknowledgeButtonRef}
          type="button"
          class="mt-8 flex w-full items-center justify-center rounded-md border-2 border-theme-highlight bg-theme-highlight px-8 py-2 text-center text-theme-body transition duration-100 hover:bg-theme-body hover:text-theme-highlight"
        >
          {this.props.acknowledgeText ?? t('Modals.Okay')}
        </button>
      </div>
    );
  }
}

export class ModalContainer extends AbstractUIView {
  private readonly modalParentRef = FSComponent.createRef<HTMLDivElement>();
  private modalContainerOpen = Subject.create(false);

  private getModalComponent(modal: Modal | null): VNode {
    if (!modal) return <></>;

    switch (modal.kind) {
      case ModalKind.Alert:
        return <AlertModal {...modal} />;
      case ModalKind.Prompt:
        return <PromptModal {...modal} />;
    }
  }

  onAfterRender(): void {
    EFB_EVENT_BUS.getSubscriber<FlypadControlEvents>()
      .on('show_modal')
      .handle((modal) => {
        this.modalContainerOpen.set(true);

        FSComponent.render(this.getModalComponent(modal), this.modalParentRef.instance);
      });

    EFB_EVENT_BUS.getSubscriber<FlypadControlEvents>()
      .on('pop_modal')
      .handle(() => {
        this.modalContainerOpen.set(false);

        const child = this.modalParentRef.instance.firstChild;

        if (child) {
          this.modalParentRef.instance.removeChild(child);
        }
      });
  }

  render(): VNode | null {
    return (
      <div
        class={this.modalContainerOpen.map(
          (open) =>
            `fixed inset-0 z-50 transition duration-200 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`,
        )}
      >
        <div class="absolute inset-0 size-full bg-theme-body opacity-75" />
        <div ref={this.modalParentRef} class="absolute inset-0 flex flex-col items-center justify-center" />
      </div>
    );
  }
}
