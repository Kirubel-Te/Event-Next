import mongoose, { Document, Model, Schema } from 'mongoose';

// Event attributes (input shape)
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO date (YYYY-MM-DD)
  time: string; // stored as HH:MM (24h)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Document interface (includes mongoose Document props)
export interface EventDocument extends IEvent, Document {}

// Simple slug generator: lowercase, alphanumerics and dashes only
function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with '-'
    .replace(/^-+|-+$/g, ''); // trim leading/trailing '-'
}

// Normalize time to HH:MM 24-hour format. Accepts inputs like "9:30 AM", "21:00", "9.30", etc.
function normalizeTime(value: string): string {
  if (!value) throw new Error('Time is required');
  const trimmed = value.trim();

  // Try to parse common formats using Date parsing of a base date
  // We append a base date so Date can parse times alone in many environments.
  const parsed = new Date(`1970-01-01T${trimmed}`);
  if (!isNaN(parsed.getTime())) {
    const hh = String(parsed.getUTCHours()).padStart(2, '0');
    const mm = String(parsed.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // Fallback to manual parsing e.g., "9:30 AM"
  const m = trimmed.match(/^(\d{1,2})(?::|\.|h)?(\d{2})?\s*(AM|PM|am|pm)?$/);
  if (!m) throw new Error('Invalid time format');

  let hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  const ampm = m[3];
  if (ampm) {
    const a = ampm.toLowerCase();
    if (a === 'pm' && hour < 12) hour += 12;
    if (a === 'am' && hour === 12) hour = 0;
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) throw new Error('Invalid time value');

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Ensure date is stored in ISO YYYY-MM-DD format
function normalizeDate(value: string): string {
  if (!value) throw new Error('Date is required');
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) throw new Error('Invalid date');
  return parsed.toISOString().slice(0, 10); // YYYY-MM-DD
}

const eventSchema = new Schema<EventDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: (v: string) => typeof v === 'string' && v.trim().length > 0,
        message: 'Title cannot be empty',
      },
    },

    // unique slug used in URLs
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: { type: String, required: [true, 'Description is required'], trim: true },
    overview: { type: String, required: [true, 'Overview is required'], trim: true },
    image: { type: String, required: [true, 'Image is required'], trim: true },
    venue: { type: String, required: [true, 'Venue is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },

    // date stored as ISO date string (YYYY-MM-DD)
    date: { type: String, required: [true, 'Date is required'], trim: true },

    // time stored as HH:MM
    time: { type: String, required: [true, 'Time is required'], trim: true },

    mode: { type: String, required: [true, 'Mode is required'], trim: true },
    audience: { type: String, required: [true, 'Audience is required'], trim: true },

    // required non-empty array of strings
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },

    organizer: { type: String, required: [true, 'Organizer is required'], trim: true },

    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Tags must contain at least one tag',
      },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt are added automatically
    strict: true,
  }
);

// Add an index for slug to enforce uniqueness at the DB level
eventSchema.index({ slug: 1 }, { unique: true });

// Pre-save hook: generate slug (only when title changes) and normalize date/time
// Use async/throw style to avoid mixing `async` with the `next` callback (avoids runtime/type issues)
eventSchema.pre<EventDocument>('save', async function () {
  // Generate slug only when title is new or changed
  if (this.isModified('title') || !this.slug) {
    this.slug = generateSlug(this.title);
  }

  // Normalize date if changed
  if (this.isModified('date')) {
    this.date = normalizeDate(this.date);
  }

  // Normalize time if changed
  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
  }
});

// Use existing model if it exists (prevents OverwriteModelError in dev/hot-reload)
export const Event: Model<EventDocument> =
  (mongoose.models.Event as Model<EventDocument>) || mongoose.model<EventDocument>('Event', eventSchema);

export default Event;
