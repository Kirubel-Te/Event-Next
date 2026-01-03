import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Event } from './event.model';

// Booking attributes (input shape)
export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingDocument extends IBooking, Document {}

// Simple RFC-like email validation (concise, rejects most invalid emails)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<BookingDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },

    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => EMAIL_RE.test(v),
        message: 'Invalid email format',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Pre-save: ensure referenced Event exists. Use async/await and throw on error so Mongoose handles the rejection.
// This prevents orphan bookings and avoids mixing `async` with the `next` callback (which causes TypeScript/runtime issues).
bookingSchema.pre<BookingDocument>('save', async function () {
  const exists = await Event.exists({ _id: this.eventId });
  if (!exists) {
    throw new Error('Referenced event does not exist');
  }
});

export const Booking: Model<BookingDocument> =
  (mongoose.models.Booking as Model<BookingDocument>) || mongoose.model<BookingDocument>('Booking', bookingSchema);

export default Booking;
