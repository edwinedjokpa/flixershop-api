export class CustomerResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}
