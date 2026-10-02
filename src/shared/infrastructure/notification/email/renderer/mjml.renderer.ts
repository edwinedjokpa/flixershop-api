import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import mjml2html from 'mjml';
import type { EmailTemplateRenderer } from '@/shared/application/notification/email/email-template-renderer.port.js';

@Injectable()
export class MjmlEmailTemplateRenderer implements EmailTemplateRenderer {
  private readonly templatesPath = join(
    process.cwd(),
    'dist/shared/infrastructure/notification/email/templates',
  );

  async render<TVariables>(
    template: string,
    variables: TVariables,
  ): Promise<string> {
    const templatePath = join(this.templatesPath, `${template}.mjml`);

    let source = await readFile(templatePath, 'utf8');

    source = this.interpolate(source, variables);

    const result = await mjml2html(source);

    if (result.errors.length > 0) {
      throw new Error(`Failed to render email template "${template}"`);
    }

    return result.html;
  }

  private interpolate<TVariables>(
    template: string,
    variables: TVariables,
  ): string {
    return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) => {
      const value = this.getValue(variables, key);

      return value === undefined || value === null ? '' : String(value);
    });
  }

  private getValue(object: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
      if (current !== null && typeof current === 'object') {
        return (current as Record<string, unknown>)[key];
      }

      return undefined;
    }, object);
  }
}
