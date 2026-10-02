export const EMAIL_TEMPLATE_RENDERER = Symbol('EMAIL_TEMPLATE_RENDERER');

export interface EmailTemplateRenderer {
  render<TVariables>(template: string, variables: TVariables): Promise<string>;
}
