import { Global, Module } from '@nestjs/common';
import { MjmlEmailTemplateRenderer } from './renderer/mjml.renderer.js';
import { EMAIL_TEMPLATE_RENDERER } from '@/shared/application/notification/email/email-template-renderer.port.js';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: EMAIL_TEMPLATE_RENDERER,
      useClass: MjmlEmailTemplateRenderer,
    },
  ],
  exports: [EMAIL_TEMPLATE_RENDERER],
})
export class MailModule {}
