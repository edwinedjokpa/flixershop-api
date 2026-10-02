import { GetCustomerHandler } from './get-customer/get-customer.handler.js';
import { ListCustomersHandler } from './list-customers/list-customers.handler.js';

export const QueryHandlers = [ListCustomersHandler, GetCustomerHandler];
