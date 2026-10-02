export const NOTIFICATION_SENDER = Symbol('NOTIFICATION_SENDER');

export type NotificationRecipientOptions =
  | {
      type: 'customer';
      id: string;
    }
  | {
      type: 'email';
      email: string;
    };

export interface SendNotificationProps {
  recipient: NotificationRecipientOptions;
  subject: string;
  template: string;
  variables: Record<string, unknown>;
}

export interface NotificationSender {
  send(props: SendNotificationProps): Promise<void>;
}
