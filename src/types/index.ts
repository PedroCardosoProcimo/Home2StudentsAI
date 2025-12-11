import { Timestamp } from 'firebase/firestore';

// Firestore types (with Timestamp)
export interface Residence {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  amenities: string[];
  active: boolean;
  startingPrice: number;
  minStay: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RoomType {
  id: string;
  residenceId: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Booking {
  id: string;
  residenceId: string;
  roomTypeId?: string;
  checkIn: Timestamp;
  checkOut: Timestamp;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Settings {
  minimumStayMonths: 1 | 6 | 10;
  updatedAt: Timestamp;
  updatedBy: string;
}

// Form types (with Date objects for easier form handling)
export interface BookingFormData {
  residenceId: string;
  roomTypeId?: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes?: string;
  termsAccepted: boolean;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
}

export interface AdminUser {
  email: string;
  isAuthenticated: boolean;
}
