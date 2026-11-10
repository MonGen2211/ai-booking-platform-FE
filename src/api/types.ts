export interface User { id: string; email: string; createdAt: string }
export interface Doctor { id: string; name: string; specialty: string; introduction: string; qualifications: string; experienceYears: number; consultationFee: string; address: string; averageRating: number | null; reviewCount: number }
export interface Page<T> { items: T[]; total: number; page: number; pageSize: number; totalPages: number }
export interface Slot { id: string; startsAt: string; endsAt: string }
export interface Availability { items: Slot[]; timezone: string; policy: { leadHours: number; horizonDays: number; changeHours: number; slotMinutes: number } }
export interface ProfileInput { kind: 'SELF' | 'RELATIVE'; fullName: string; birthDate: string; phone: string; relationship: string | null }
export interface Profile extends ProfileInput { id: string }
export interface Attachment { id: string; originalName: string; verifiedMime: string; size: number; expiresAt?: string }
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export interface Appointment { id: string; code: string; status: AppointmentStatus; version: number; doctorId: string; doctorName: string; address: string; consultationFee: string; startsAt: string; endsAt?: string; timezone?: string; patient: ProfileInput; reason: string; symptoms: string | null; cancelDeadline: string; rescheduleDeadline: string; allowedActions?: Record<string, boolean>; attachments?: Attachment[] }
export interface BookingInput { slotId: string; profileId: string; reason: string; symptoms: string | null; attachmentIds: string[]; acceptedDetails: { consultationFee: string; address: string } }
export interface Rebook { doctor: { id: string; name: string }; patientProfile: { id: string; fullName: string; birthDate: string } }
export interface ApiError { code: string; message: string; status?: number; suggestions?: Slot[] }
export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
