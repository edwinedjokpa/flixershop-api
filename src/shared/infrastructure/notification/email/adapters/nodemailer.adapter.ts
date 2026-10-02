import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
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
export class NodemailerEmailSender implements NotificationSender {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly logger = new Logger(NodemailerEmailSender.name);

  constructor(
    @Inject(NOTIFICATION_RECIPEIENT_RESOLVER)
    private readonly recipientResolver: NotificationRecipientResolverPort,
    @Inject(EMAIL_TEMPLATE_RENDERER)
    private readonly renderer: EmailTemplateRenderer,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: this.configService.getOrThrow<number>('SMTP_PORT'),
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASSWORD'),
      },
    });
    this.from = this.configService.getOrThrow<string>('SMTP_FROM');
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

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: recipient.email,
        subject: props.subject,
        html,
      });

      this.logger.log({
        event: 'notification.email.sent',
        provider: 'smtp',
        recipientId: recipient.id,
        recipient: recipient.email,
        subject: props.subject,
      });
    } catch (error) {
      this.logger.error({
        event: 'notification.email.failed',
        provider: 'smtp',
        recipientId: recipient.id,
        recipient: recipient.email,
        subject: props.subject,
        error,
      });

      throw error;
    }
  }
}
