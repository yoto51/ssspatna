import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Site Settings schema
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).pick({
  key: true,
  value: true,
});

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  fullName: true,
  email: true,
  phone: true,
  address: true,
});

// Students schema
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  class: text("class").notNull(),
  section: text("section"),
  rollNumber: text("roll_number"),
  parentName: text("parent_name"),
  dob: text("dob"),
  gender: text("gender"),
  admissionDate: timestamp("admission_date").defaultNow(),
  previousSchool: text("previous_school"),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  userId: true,
  class: true,
  section: true,
  rollNumber: true,
  parentName: true,
  dob: true,
  gender: true,
  previousSchool: true,
});

// Notices schema
export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  important: boolean("important").default(false),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertNoticeSchema = createInsertSchema(notices).pick({
  title: true,
  content: true,
  category: true,
  important: true,
  attachmentUrl: true,
  attachmentType: true,
  isActive: true,
});

// Gallery schema
export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  category: text("category"),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertGallerySchema = createInsertSchema(gallery).pick({
  title: true,
  description: true,
  imageUrl: true,
  category: true,
  isActive: true,
});

// Achievements schema
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  achievementDate: timestamp("achievement_date").defaultNow(),
  category: text("category"),
  value: text("value"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  title: true,
  description: true,
  category: true,
  value: true,
  imageUrl: true,
  isActive: true,
});

// Admission Inquiries schema
export const admissionInquiries = pgTable("admission_inquiries", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  dob: text("dob").notNull(),
  gender: text("gender").notNull(),
  applyingForClass: text("applying_for_class").notNull(),
  previousSchool: text("previous_school"),
  parentName: text("parent_name").notNull(),
  relationship: text("relationship").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  referenceSource: text("reference_source"),
  reason: text("reason"),
  specialNeeds: text("special_needs"),
  status: text("status").default("pending"),
  inquiryDate: timestamp("inquiry_date").defaultNow().notNull(),
});

export const insertInquirySchema = createInsertSchema(admissionInquiries).pick({
  studentName: true,
  dob: true,
  gender: true,
  applyingForClass: true,
  previousSchool: true,
  parentName: true,
  relationship: true,
  email: true,
  phone: true,
  address: true,
  referenceSource: true,
  reason: true,
  specialNeeds: true,
});

// Fees schema
export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  term: text("term").notNull(),
  amount: doublePrecision("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeeSchema = createInsertSchema(fees).pick({
  studentId: true,
  term: true,
  amount: true,
  dueDate: true,
  status: true,
});

// Fee Payments schema
export const feePayments = pgTable("fee_payments", {
  id: serial("id").primaryKey(),
  feeId: integer("fee_id").references(() => fees.id).notNull(),
  amount: doublePrecision("amount").notNull(),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  receipt: text("receipt"),
});

export const insertFeePaymentSchema = createInsertSchema(feePayments).pick({
  feeId: true,
  amount: true,
  paymentMethod: true,
  transactionId: true,
  receipt: true,
});

// Academic Records schema
export const academicRecords = pgTable("academic_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  subject: text("subject").notNull(),
  term: text("term").notNull(),
  grade: text("grade"),
  marks: doublePrecision("marks"),
  maxMarks: doublePrecision("max_marks"),
  remarks: text("remarks"),
  recordDate: timestamp("record_date").defaultNow().notNull(),
});

export const insertAcademicRecordSchema = createInsertSchema(academicRecords).pick({
  studentId: true,
  subject: true,
  term: true,
  grade: true,
  marks: true,
  maxMarks: true,
  remarks: true,
});

// Contact Messages schema
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

// Type exports
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingsSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Notice = typeof notices.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;

export type Gallery = typeof gallery.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type AdmissionInquiry = typeof admissionInquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

export type Fee = typeof fees.$inferSelect;
export type InsertFee = z.infer<typeof insertFeeSchema>;

export type FeePayment = typeof feePayments.$inferSelect;
export type InsertFeePayment = z.infer<typeof insertFeePaymentSchema>;

export type AcademicRecord = typeof academicRecords.$inferSelect;
export type InsertAcademicRecord = z.infer<typeof insertAcademicRecordSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
