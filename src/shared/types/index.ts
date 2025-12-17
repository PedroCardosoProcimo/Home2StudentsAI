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
  startingPrice: number | null;
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
  area: number;
  floorPlanUrl: string;
  imagesUrl: string[];
  minStay: number;
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
  studentId?: string; // Link to student account (set when booking approved)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Student {
  id: string;
  email: string;
  name: string;
  phone: string;
  residenceId: string;
  bookingId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RegulationAcceptance {
  id: string;
  studentId: string;
  regulationId: string;
  regulationVersion: string;
  residenceId: string;
  acceptedAt: Timestamp;
  ipAddress?: string; // Optional: track IP for legal compliance
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

// Re-export regulation types
export type {
  Regulation,
  CreateRegulationInput,
  UpdateRegulationInput,
  RegulationAuditAction,
  RegulationAuditLog,
  CreateAuditLogInput,
  AuditLogFilters,
} from './regulation';
