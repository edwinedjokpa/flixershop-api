import { NotificationRecipientOptions } from './notification-sender.port.js';

export const NOTIFICATION_RECIPEIENT_RESOLVER = Symbol(
  'NOTIFICATION_RECIPIENT_RESOLVER',
);

export interface NotificationRecipient {
  email: string;
  firstName?: string;
  id?: string;
}

export interface NotificationRecipientResolverPort {
  resolve(
    recipient: NotificationRecipientOptions,
  ): Promise<NotificationRecipient>;
}
