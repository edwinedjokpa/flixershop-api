import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

import {
  SendNotificationProps,
  NotificationSender,
} from '@/shared/application/notification/notification-sender.port.js';
import {
  EMAIL_TEMPLATE_RENDERER,
  type EmailTemplateRenderer,
} from '@/shared/application/notification/email/email-template-renderer.port.js';
import {
  NOTIFICATION_RECIPEIENT_RESOLVER,
  type NotificationRecipientResolverPort,
} from '@/shared/application/notification/notification-resolver.port.js';
import { appConfig } from '@/config/app-config.js';

@Injectable()
export class ResendEmailSender implements NotificationSender {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(ResendEmailSender.name);

  constructor(
    @Inject(NOTIFICATION_RECIPEIENT_RESOLVER)
    private readonly recipientResolver: NotificationRecipientResolverPort,
    @Inject(EMAIL_TEMPLATE_RENDERER)
    private readonly renderer: EmailTemplateRenderer,
    private readonly configService: ConfigService,
  ) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );

    this.from = this.configService.getOrThrow<string>('RESEND_FROM');
  }

  async send(props: SendNotificationProps): Promise<void> {
    const recipient = await this.recipientResolver.resolve(props.recipient);

    const variables = {
      ...props.variables,
      ...(recipient.firstName ? { firstName: recipient.firstName } : {}),
      appName: appConfig.appName,
      year: new Date().getUTCFullYear(),
    };

    const html = await this.renderer.render(props.template, variables);

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: recipient.email,
      subject: props.subject,
      html,
    });

    if (error) {
      this.logger.error({
        event: 'notification.email.failed',
        provider: 'resend',
        recipientId: recipient.id,
        recipient: recipient.email,
        subject: props.subject,
        error,
      });

      throw error;
    }

    this.logger.log({
      event: 'notification.email.sent',
      provider: 'resend',
      recipientId: recipient.id,
      recipient: recipient.email,
      subject: props.subject,
    });
  }
}
