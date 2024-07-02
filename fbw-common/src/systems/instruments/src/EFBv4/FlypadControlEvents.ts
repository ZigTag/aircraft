import { Notification } from './Components/Notification';
import { Modal } from './Components/Modal';

export interface FlypadControlEvents {
  set_tooltip: { id: string | null; shown: boolean; text: string };
  show_modal: Modal;
  pop_modal: {};
  show_notification: Notification;
}
