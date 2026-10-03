import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PinoLogger } from 'nestjs-pino';

import { CustomerRegisteredEvent } from '@/modules/customer/domain/events/customer-registered.event.js';
import { WalletAlreadyExistsException } from '../../domain/exceptions/wallet.exception.js';
import { ConfigService } from '@nestjs/config';
import { OpenWalletCommand } from '../commands/open-wallet/open-wallet.command.js';

@EventsHandler(CustomerRegisteredEvent)
export class OpenWalletHandlerOnCustomerRegisteredHandler implements IEventHandler<CustomerRegisteredEvent> {
  private defaultCurrency: string;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.defaultCurrency = this.configService.getOrThrow<string>('CURRENCY');
    logger.setContext(OpenWalletHandlerOnCustomerRegisteredHandler.name);
  }

  async handle(event: CustomerRegisteredEvent): Promise<void> {
    const { props } = event;

    const customerId = props.customerId;
    const currency = event.props.currency ?? this.defaultCurrency;

    try {
      await this.commandBus.execute(
        new OpenWalletCommand({ customerId, currency }),
      );
    } catch (error) {
      if (error instanceof WalletAlreadyExistsException) return;

      this.logger.error({
        message: 'Failed to open wallet',
        event: CustomerRegisteredEvent.name,
        customerId,
        currency,
        error:
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error,
      });

      throw error;
    }
  }
}
