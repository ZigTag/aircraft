import { ArraySubject, FSComponent, MathUtils, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { AbstractUIView } from '../shared/UIView';
import { EFB_EVENT_BUS } from 'instruments/src/EFBv4/EfbV4FsInstrument';
import { FlypadControlEvents } from 'instruments/src/EFBv4/FlypadControlEvents';
import { List } from 'instruments/src/EFBv4/Components/List';
import { v4 } from 'uuid';

export enum NotificationKind {
  Error,
  Info,
  Success,
}

export type Notification = {
  kind: NotificationKind;
  text: string;
};

enum NotificationLifetimeKind {
  Indefinite,
  Definite,
}

type IndefiniteLifetime = { kind: NotificationLifetimeKind.Indefinite };
type DefiniteLifetime = {
  kind: NotificationLifetimeKind.Definite;
  naturalLifeSpan: number;
  timeRemaining: Subscribable<number>;
  paused: boolean;
};
type NotificationLifetime = IndefiniteLifetime | DefiniteLifetime;

type NotificationInfo = {
  notification: Notification;
  lifetime: NotificationLifetime;
  id: string;
};

export const showNotification = (notification: Notification) =>
  EFB_EVENT_BUS.getPublisher<FlypadControlEvents>().pub('show_notification', notification);

interface NotificationComponentProps {
  kind: NotificationKind;
  text: string;
  lifetime: NotificationLifetime;
  dismissSelf: () => any;
  pauseSelf: () => any;
  unpauseSelf: () => any;
}

class NotificationComponent extends AbstractUIView<NotificationComponentProps> {
  private bodyRef = FSComponent.createRef<HTMLButtonElement>();

  getAccentStyle(): string {
    switch (this.props.kind) {
      case NotificationKind.Error:
        return 'text-red-600';
      case NotificationKind.Info:
        return 'text-blue-600';
      case NotificationKind.Success:
        return 'text-green-600';
    }
  }

  getIconClass(): string {
    switch (this.props.kind) {
      case NotificationKind.Error:
        return 'bi-exclamation-triangle-fill';
      case NotificationKind.Info:
        return 'bi-info-circle-fill';
      case NotificationKind.Success:
        return 'bi-check-circle-fill';
    }
  }

  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.bodyRef.instance.addEventListener('click', this.props.dismissSelf);
    this.bodyRef.instance.addEventListener('mouseenter', this.props.pauseSelf);
    this.bodyRef.instance.addEventListener('mouseleave', this.props.unpauseSelf);
  }

  render(): VNode | null {
    return (
      <button
        type="button"
        class="pointer-events-auto relative w-5/12 shrink-0 overflow-hidden rounded-lg border-2 border-theme-accent bg-theme-body p-6"
        ref={this.bodyRef}
      >
        <div class="flex flex-row items-center space-x-4">
          <i class={`${this.getIconClass()} ${this.getAccentStyle()} text-[30px]`} /> <p>{this.props.text}</p>
        </div>

        {this.props.lifetime.kind === NotificationLifetimeKind.Definite && (
          <div
            class={`absolute bottom-0 left-0 h-1 ${this.getAccentStyle()} bg-current`}
            style={this.props.lifetime.timeRemaining.map((timeRemaining) => {
              const percentageOfLifetimeRemaining =
                (timeRemaining / (this.props.lifetime as DefiniteLifetime).naturalLifeSpan) * 100;

              return `width:${percentageOfLifetimeRemaining}%`;
            })}
          />
        )}
      </button>
    );
  }
}

export class NotificationContainer extends AbstractUIView {
  private notifications = ArraySubject.create<NotificationInfo>();

  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    const handleShowNotification = (notification: Notification) => {
      this.notifications.insert({
        notification: notification,
        lifetime: {
          kind: NotificationLifetimeKind.Definite,
          naturalLifeSpan: 10_000,
          timeRemaining: Subject.create(10_000),
          paused: false,
        },
        id: v4(),
      });
    };

    EFB_EVENT_BUS.getSubscriber<FlypadControlEvents>().on('show_notification').handle(handleShowNotification);

    let lastUpdate = Date.now();
    setInterval(() => {
      const now = Date.now();
      this.updateNotificationLifetimes(now - lastUpdate);
      lastUpdate = now;
    }, 1);
  }

  private updateNotificationLifetimes(deltaTimeMs: number) {
    for (const { lifetime } of this.notifications.getArray()) {
      if (lifetime.kind === NotificationLifetimeKind.Definite && !lifetime.paused) {
        const updatedRemainingTime = MathUtils.clamp(
          lifetime.timeRemaining.get() - deltaTimeMs,
          0,
          lifetime.naturalLifeSpan,
        );

        (lifetime.timeRemaining as Subject<number>).set(updatedRemainingTime);
      }
    }

    this.dismissCompletedNotifications();
  }

  private dismissCompletedNotifications() {
    const completedNotifications = this.notifications.getArray().filter(({ lifetime }) => {
      if (lifetime.kind === NotificationLifetimeKind.Definite) {
        return lifetime.timeRemaining.get() === 0;
      }

      return false;
    });

    for (const completedNotification of completedNotifications) {
      this.dismissNotification(completedNotification.id);
    }
  }

  private setNotificationLifetimePause(notificationId: string, isPaused: boolean) {
    const pausedNotification = this.notifications.getArray().find(({ id }) => id === notificationId);

    if (pausedNotification === undefined) return;

    (pausedNotification.lifetime as DefiniteLifetime).paused = isPaused;
  }

  private dismissNotification(dismissedNotificationId: string) {
    this.notifications.set(this.notifications.getArray().filter(({ id }) => id !== dismissedNotificationId));
  }

  render(): VNode | null {
    return (
      <div class="pointer-events-none fixed inset-0 z-50 flex justify-center p-8" ref={this.rootRef}>
        <List
          class="flex w-full flex-col items-center space-y-4"
          items={this.notifications}
          render={({ notification, lifetime, id }) => (
            <NotificationComponent
              kind={notification.kind}
              text={notification.text}
              lifetime={lifetime}
              dismissSelf={() => this.dismissNotification(id)}
              pauseSelf={() => this.setNotificationLifetimePause(id, true)}
              unpauseSelf={() => this.setNotificationLifetimePause(id, false)}
            />
          )}
        />
      </div>
    );
  }
}
