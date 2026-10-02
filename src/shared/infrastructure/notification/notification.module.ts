import { Global, Module } from '@nestjs/common';
import { MailModule } from './email/mail.module.js';
import { NOTIFICATION_RECIPEIENT_RESOLVER } from '@/shared/application/notification/notification-resolver.port.js';
import { NotificationRecipientResolverAdapter } from './adapters/notification-resolver.adapter.js';
import { NOTIFICATION_SENDER } from '@/shared/application/notification/notification-sender.port.js';
import { NodemailerEmailSender } from './email/adapters/nodemailer.adapter.js';
import { CustomerModule } from '@/modules/customer/customer.module.js';

@Global()
@Module({
  imports: [CustomerModule, MailModule],
  providers: [
    {
      provide: NOTIFICATION_RECIPEIENT_RESOLVER,
      useClass: NotificationRecipientResolverAdapter,
    },
    {
      provide: NOTIFICATION_SENDER,
      useClass: NodemailerEmailSender,
    },
  ],
  exports: [NOTIFICATION_SENDER],
})
export class NotificationModule {}
