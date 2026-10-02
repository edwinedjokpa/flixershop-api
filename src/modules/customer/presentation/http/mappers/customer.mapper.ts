import { Customer } from '@/modules/customer/domain/entities/customer.entity.js';
import { CustomerResponseDto } from '../dto/customer-response.dto.js';

export class CustomerMapper {
  static toResponse(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id.value,
      email: customer.email.value,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: customer.fullName,
      phone: customer.phone,
      isActive: customer.isActive,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }

  static toResponseList(customers: Customer[]): CustomerResponseDto[] {
    return customers.map(CustomerMapper.toResponse);
  }
}
