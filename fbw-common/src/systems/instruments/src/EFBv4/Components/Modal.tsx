import { Subject, VNode } from '@microsoft/msfs-sdk';
import { AbstractUIView } from 'instruments/src/EFBv4/shared/UIView';
import { FSComponent } from '@microsoft/msfs-sdk';
import { EFB_EVENT_BUS } from 'instruments/src/EFBv4/EfbV4FsInstrument';
import { FlypadControlEvents } from 'instruments/src/EFBv4/FlypadControlEvents';
import { Button } from './Button';
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
  declineText?: string;
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
  private handleDecline = () => {
    this.props.onReject?.();
    popModal();
  };

  private handleConfirm = () => {
    this.props.onConfirm?.();
    popModal();
  };

  render(): VNode | null {
    return (
      <div class="pointer-events-auto w-5/12 rounded-xl border-2 border-theme-accent bg-theme-body p-8">
        <h1 class="font-bold">{this.props.title}</h1>
        <p class="mt-4">{this.props.bodyText}</p>

        <div class="mt-8 flex flex-row space-x-4">
          <Button
            class="w-full border-theme-accent bg-theme-accent text-theme-text hover:border-theme-highlight"
            onClick={this.handleDecline}
          >
            {this.props.declineText ?? t('Modals.Cancel')}
          </Button>
          <Button class="w-full" onClick={this.handleConfirm}>
            {this.props.confirmText ?? t('Modals.Confirm')}
          </Button>
        </div>
      </div>
    );
  }
}

class AlertModal extends AbstractUIView<AlertModalProps> {
  private handleAcknowledge = () => {
    this.props.onAcknowledge?.();
    popModal();
  };

  render(): VNode | null {
    return (
      <div class="pointer-events-auto w-5/12 rounded-xl border-2 border-theme-accent bg-theme-body p-8">
        <h1 class="font-bold">{this.props.title}</h1>
        <p class="mt-4">{this.props.bodyText}</p>
        <Button class="mt-8 w-full" onClick={this.handleAcknowledge}>
          {this.props.acknowledgeText ?? t('Modals.Okay')}
        </Button>
      </div>
    );
  }
}

export class ModalContainer extends AbstractUIView {
  private readonly modalParentRef = FSComponent.createRef<HTMLDivElement>();
  private readonly backgroundRef = FSComponent.createRef<HTMLDivElement>();
  private isModalContainerOpen = Subject.create(false);

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
    const handlePopModal = () => {
      this.isModalContainerOpen.set(false);

      const child = this.modalParentRef.instance.firstChild;

      if (child) {
        this.modalParentRef.instance.removeChild(child);
      }
    };

    const handleShowModal = (modal: Modal) => {
      this.isModalContainerOpen.set(true);

      FSComponent.render(this.getModalComponent(modal), this.modalParentRef.instance);
    };

    EFB_EVENT_BUS.getSubscriber<FlypadControlEvents>().on('show_modal').handle(handleShowModal);

    EFB_EVENT_BUS.getSubscriber<FlypadControlEvents>().on('pop_modal').handle(handlePopModal);
    this.backgroundRef.instance.addEventListener('click', handlePopModal);
  }

  render(): VNode | null {
    return (
      <div
        class={this.isModalContainerOpen.map(
          (isOpen) =>
            `fixed inset-0 z-50 transition duration-200 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`,
        )}
      >
        <div ref={this.backgroundRef} class="absolute inset-0 size-full bg-theme-body opacity-75" />
        <div
          ref={this.modalParentRef}
          class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        />
      </div>
    );
  }
}
