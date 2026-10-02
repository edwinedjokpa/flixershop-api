import { Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { ConfirmOrderCommand } from '../commands/confirm-order/confirm-order.command.js';
import { PaymentCompletedEvent } from '@/modules/payment/domain/event/payment-completed.event.js';

@Injectable()
export class OrderFulfillmentSaga {
  @Saga()
  paymentCompleted = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(PaymentCompletedEvent),
      map((event) => new ConfirmOrderCommand({ orderId: event.props.orderId })),
    );
  };
}
