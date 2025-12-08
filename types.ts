export interface Guest {
  id: string;
  name: string;
  email: string;
  instagram?: string;
  status: 'pending' | 'approved' | 'rejected' | 'checked_in';
  registrationDate: string;
}