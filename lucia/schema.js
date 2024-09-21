import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/pg-core";

// Users table (Bounty Posters and Hunters)
export const userTable = pgTable("users", {
  id: uuid("id").primaryKey(),
  firstName: varchar("first_name", { length: 256 }),
  lastName: varchar("last_name", { length: 256 }),
  email: varchar("email", { length: 256 }).notNull().unique(),
  hashedPassword: varchar("hashed_password", { length: 256 }),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roleTable.id), // Foreign Key referencing role
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  profilePicture: varchar("profile_picture", { length: 512 }), // Profile picture URL
  lastLogin: timestamp("last_login"), // Last login timestamp
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

// Roles table (Hunter or Bounty Poster)
export const roleTable = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 128 }).notNull(), // 'bounty_poster', 'hunter'
  permission: text("permission"),
});

// Bounties table (posted by Bounty Posters)
export const bountyTable = pgTable("bounties", {
  id: uuid("id").primaryKey(),
  posterId: uuid("poster_id").references(() => userTable.id, {
    onDelete: "cascade",
  }), // FK to users table (Bounty Poster)
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  tags: text("tags")
    .array()
    .default(sql`ARRAY[]::text[]`), // Array of tags for categorization
  budget: integer("budget").notNull(),
  status: varchar("status", { length: 128 }).default("open"), // 'open', 'accepted', 'completed', etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deadline: timestamp("deadline"), // Optional deadline for the bounty
  communicationMethod: varchar("communication_method", { length: 128 }).default(
    "chat",
  ), // Default communication method
});

// Hunter profiles (fields of expertise, rates)
export const hunterProfileTable = pgTable("hunter_profiles", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }), // FK to users table (Hunter)
  fieldOfExpertise: text("field_of_expertise")
    .array()
    .default(sql`ARRAY[]::text[]`), // Example: 'Law', 'Finance', 'Tech'
  pricingPerMinute: integer("pricing_per_minute").notNull(),
  pricingPerHour: integer("pricing_per_hour").notNull(),
  bio: text("bio"), // Short description or bio of the hunter
  verified: boolean("verified").default(false).notNull(), // Verification status for hunter
  availability: text("availability"), // JSON or text to store the hunter's availability schedule
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bounty Acceptance (linking Bounties and Hunters)
export const bountyAcceptanceTable = pgTable("bounty_acceptance", {
  id: uuid("id").primaryKey(),
  bountyId: uuid("bounty_id")
    .references(() => bountyTable.id)
    .notNull(), // FK to bounties table
  hunterId: uuid("hunter_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(), // FK to users (Hunters)
  acceptedAt: timestamp("accepted_at").defaultNow().notNull(),
  status: varchar("status", { length: 128 }).default("pending").notNull(), // 'pending', 'accepted', 'completed'
  hunterMessage: text("hunter_message"), // Optional message from the hunter to the poster
});

// Notifications (for both Bounty Posters and Hunters)
export const notificationTable = pgTable("notifications", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(), // FK to users table
  message: text("message").notNull(),
  type: varchar("type", { length: 128 }).default("info"), // 'info', 'warning', 'success', 'error'
  read: boolean("read").default(false).notNull(), // Whether the notification has been read
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Consultation sessions between Bounty Posters and Hunters
export const consultationSessionTable = pgTable("consultation_sessions", {
  id: uuid("id").primaryKey(),
  bountyId: uuid("bounty_id")
    .references(() => bountyTable.id)
    .notNull(),
  hunterId: uuid("hunter_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(), // FK to Hunter's user ID
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  communicationMethod: varchar("communication_method", {
    length: 128,
  }).notNull(), // 'video', 'audio', 'chat', 'screen sharing'
  totalCost: integer("total_cost"), // Calculated from time spent and rate
  completed: boolean("completed").default(false).notNull(), // Whether the consultation is completed
  recordingUrl: varchar("recording_url", { length: 512 }), // URL to the session recording if applicable
  duration: integer("duration"), // Duration of the session in minutes
});

// Payments made after the consultation session
export const paymentTable = pgTable("payments", {
  id: uuid("id").primaryKey(),
  sessionId: uuid("session_id")
    .references(() => consultationSessionTable.id)
    .notNull(), // FK to consultation sessions
  posterId: uuid("poster_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(), // FK to Bounty Poster
  hunterId: uuid("hunter_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(), // FK to Hunter
  amount: integer("amount").notNull(),
  paymentStatus: varchar("payment_status", { length: 128 })
    .default("pending")
    .notNull(), // 'pending', 'completed', 'failed'
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  paymentMethod: varchar("payment_method", { length: 128 }), // 'credit_card', 'paypal', etc.
});

// Reviews after a consultation session
export const reviewTable = pgTable("reviews", {
  id: uuid("id").primaryKey(),
  bountyId: uuid("bounty_id")
    .references(() => bountyTable.id, { onDelete: "cascade" })
    .notNull(),
  reviewerId: uuid("reviewer_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(), // FK to Users (either Bounty Poster or Hunter)
  revieweeId: uuid("reviewee_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(), // FK to Users (Hunter or Bounty Poster)
  rating: integer("rating").notNull(), // Rating from 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Disputes (if a session leads to a dispute)
export const disputeTable = pgTable("disputes", {
  id: uuid("id").primaryKey(),
  sessionId: uuid("session_id")
    .references(() => consultationSessionTable.id)
    .notNull(), // FK to consultation sessions
  posterId: uuid("poster_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(), // FK to Bounty Poster
  hunterId: uuid("hunter_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(), // FK to Hunter
  reason: text("reason").notNull(), // Reason for the dispute
  status: varchar("status", { length: 128 }).default("open").notNull(), // 'open', 'resolved', 'closed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const currencyTable = pgTable("currencies", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const languageTable = pgTable("languages", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tagTable = pgTable("tags", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  popularity: integer("popularity").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
