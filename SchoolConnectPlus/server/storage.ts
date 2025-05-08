import { 
  users, User, InsertUser,
  students, Student, InsertStudent,
  notices, Notice, InsertNotice,
  gallery, Gallery, InsertGallery,
  achievements, Achievement, InsertAchievement,
  admissionInquiries, AdmissionInquiry, InsertInquiry,
  fees, Fee, InsertFee,
  feePayments, FeePayment, InsertFeePayment,
  academicRecords, AcademicRecord, InsertAcademicRecord,
  contactMessages, ContactMessage, InsertContactMessage,
  siteSettings, SiteSetting, InsertSiteSetting
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { and, eq, desc } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Site Settings operations
  getSetting(key: string): Promise<SiteSetting | undefined>;
  getAllSettings(): Promise<SiteSetting[]>;
  createSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  updateSetting(key: string, value: string): Promise<SiteSetting | undefined>;
  deleteSetting(id: number): Promise<boolean>;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Student operations
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;
  getStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;

  // Notice operations
  getNotice(id: number): Promise<Notice | undefined>;
  getNotices(): Promise<Notice[]>;
  getRecentNotices(limit: number): Promise<Notice[]>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  updateNotice(id: number, notice: Partial<Notice>): Promise<Notice | undefined>;
  deleteNotice(id: number): Promise<boolean>;

  // Gallery operations
  getGalleryItem(id: number): Promise<Gallery | undefined>;
  getGallery(): Promise<Gallery[]>;
  createGalleryItem(item: InsertGallery): Promise<Gallery>;
  updateGalleryItem(id: number, item: Partial<Gallery>): Promise<Gallery | undefined>;
  deleteGalleryItem(id: number): Promise<boolean>;

  // Achievement operations
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, achievement: Partial<Achievement>): Promise<Achievement | undefined>;
  deleteAchievement(id: number): Promise<boolean>;

  // Admission Inquiry operations
  getInquiry(id: number): Promise<AdmissionInquiry | undefined>;
  getInquiries(): Promise<AdmissionInquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<AdmissionInquiry>;
  updateInquiry(id: number, inquiry: Partial<AdmissionInquiry>): Promise<AdmissionInquiry | undefined>;
  deleteInquiry(id: number): Promise<boolean>;

  // Fee operations
  getFee(id: number): Promise<Fee | undefined>;
  getFeesByStudentId(studentId: number): Promise<Fee[]>;
  createFee(fee: InsertFee): Promise<Fee>;
  updateFee(id: number, fee: Partial<Fee>): Promise<Fee | undefined>;
  deleteFee(id: number): Promise<boolean>;

  // Fee Payment operations
  getFeePayment(id: number): Promise<FeePayment | undefined>;
  getFeePaymentsByFeeId(feeId: number): Promise<FeePayment[]>;
  createFeePayment(payment: InsertFeePayment): Promise<FeePayment>;
  deleteFeePayment(id: number): Promise<boolean>;

  // Academic Record operations
  getAcademicRecord(id: number): Promise<AcademicRecord | undefined>;
  getAcademicRecordsByStudentId(studentId: number): Promise<AcademicRecord[]>;
  createAcademicRecord(record: InsertAcademicRecord): Promise<AcademicRecord>;
  updateAcademicRecord(id: number, record: Partial<AcademicRecord>): Promise<AcademicRecord | undefined>;
  deleteAcademicRecord(id: number): Promise<boolean>;

  // Contact Message operations
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: number, message: Partial<ContactMessage>): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;

  // Session store
  sessionStore: any; // Use any type to avoid the session.SessionStore error
}

export class MemStorage implements IStorage {
  private siteSettings: Map<number, SiteSetting>;
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private notices: Map<number, Notice>;
  private gallery: Map<number, Gallery>;
  private achievements: Map<number, Achievement>;
  private inquiries: Map<number, AdmissionInquiry>;
  private fees: Map<number, Fee>;
  private feePayments: Map<number, FeePayment>;
  private academicRecords: Map<number, AcademicRecord>;
  private contactMessages: Map<number, ContactMessage>;

  private siteSettingIdCounter: number;
  private userIdCounter: number;
  private studentIdCounter: number;
  private noticeIdCounter: number;
  private galleryIdCounter: number;
  private achievementIdCounter: number;
  private inquiryIdCounter: number;
  private feeIdCounter: number;
  private feePaymentIdCounter: number;
  private academicRecordIdCounter: number;
  private contactMessageIdCounter: number;

  sessionStore: session.SessionStore;

  constructor() {
    this.siteSettings = new Map();
    this.users = new Map();
    this.students = new Map();
    this.notices = new Map();
    this.gallery = new Map();
    this.achievements = new Map();
    this.inquiries = new Map();
    this.fees = new Map();
    this.feePayments = new Map();
    this.academicRecords = new Map();
    this.contactMessages = new Map();

    this.siteSettingIdCounter = 1;
    this.userIdCounter = 1;
    this.studentIdCounter = 1;
    this.noticeIdCounter = 1;
    this.galleryIdCounter = 1;
    this.achievementIdCounter = 1;
    this.inquiryIdCounter = 1;
    this.feeIdCounter = 1;
    this.feePaymentIdCounter = 1;
    this.academicRecordIdCounter = 1;
    this.contactMessageIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Create default site settings
    this.createSetting({ key: "schoolName", value: "St. Stephen School" });
    this.createSetting({ key: "schoolTagline", value: "Excellence in Education" });
    this.createSetting({ key: "schoolAddress", value: "Bailey Road, Patna, Bihar, India" });
    this.createSetting({ key: "schoolEmail", value: "contact@ststephen.edu" });
    this.createSetting({ key: "schoolPhone", value: "+91 612 222 3333" });
    this.createSetting({ key: "admissionOpen", value: "true" });
    this.createSetting({ key: "facebookUrl", value: "https://facebook.com/ststephenschool" });
    this.createSetting({ key: "twitterUrl", value: "https://twitter.com/ststephenschool" });
    this.createSetting({ key: "instagramUrl", value: "https://instagram.com/ststephenschool" });
    this.createSetting({ key: "youtubeUrl", value: "https://youtube.com/ststephenschool" });
    this.createSetting({ key: "heroTitle", value: "Welcome to St. Stephen School" });
    this.createSetting({ key: "heroSubtitle", value: "Nurturing Excellence, Building Character" });
    this.createSetting({ key: "aboutIntro", value: "St. Stephen School is a prestigious institution with a rich legacy of academic excellence and character building." });
    this.createSetting({ key: "aboutMission", value: "Our mission is to provide quality education that nurtures intellectual, physical, emotional, and spiritual growth while instilling values of integrity, compassion, and resilience." });
    this.createSetting({ key: "aboutVision", value: "To be a leading educational institution that develops future leaders committed to positive social change and global citizenship." });
    this.createSetting({ key: "foundedYear", value: "1978" });
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$PsUF7SNmwqFkKgmm5YOBx.LcS.ZpxAnxUR/vD/p7mHcNa5J5a5uK2", // "admin123"
      role: "admin",
      fullName: "System Admin",
      email: "admin@trinity.edu",
      phone: "9876543210",
      address: "Trinity School Campus"
    });

    // Create student user
    const studentUser = this.createUser({
      username: "student",
      password: "$2b$10$jXpWy0LuDjmLDxmrn5Xspu56fbUQT0shMsR3MDjUsnNs2/EZi8.4a", // "student123"
      role: "student",
      fullName: "John Smith",
      email: "student@example.com",
      phone: "9876543211",
      address: "123 Student Lane"
    });

    // Create student profile
    this.createStudent({
      userId: studentUser.id,
      class: "10",
      section: "A",
      rollNumber: "1001",
      parentName: "David Smith",
      dob: "2005-05-15",
      gender: "male",
      previousSchool: "Primary School"
    });

    // Create sample notices
    this.createNotice({
      title: "Final Examination Schedule",
      content: "The final examination for all classes will commence from June 5th, 2023. The detailed schedule is now available.",
      category: "Academic",
      important: true,
    });

    this.createNotice({
      title: "Annual Sports Day",
      content: "The Annual Sports Day will be held on May 20th, 2023. All students are requested to participate enthusiastically.",
      category: "Event",
      important: false,
    });

    this.createNotice({
      title: "Fee Payment Reminder",
      content: "This is a gentle reminder for parents to clear the pending fee payments for the current academic term by May 25th, 2023.",
      category: "Administrative",
      important: true,
    });

    // Create sample gallery items
    this.createGalleryItem({
      title: "Modern Science Labs",
      description: "Hands-on learning experiences",
      imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      category: "Facilities"
    });

    this.createGalleryItem({
      title: "Cultural Celebrations",
      description: "Nurturing talents beyond academics",
      imageUrl: "https://images.unsplash.com/photo-1560260240-c6ef90a163a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      category: "Events"
    });

    this.createGalleryItem({
      title: "Sports Excellence",
      description: "Promoting physical fitness and teamwork",
      imageUrl: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      category: "Sports"
    });

    // Create sample achievements
    this.createAchievement({
      title: "Board Exam Results",
      description: "Average Pass Rate in Board Examinations",
      category: "Academic",
      value: "98%"
    });

    this.createAchievement({
      title: "Sports Championships",
      description: "State-Level Sports Championships",
      category: "Sports",
      value: "25+"
    });

    this.createAchievement({
      title: "Years of Excellence",
      description: "Years of Academic Excellence",
      category: "Academic",
      value: "15+"
    });

    this.createAchievement({
      title: "University Admissions",
      description: "Students in Top Universities",
      category: "Academic",
      value: "100+"
    });

    // Create sample fees for the student
    const fee1 = this.createFee({
      studentId: 1,
      term: "Term 1 2023",
      amount: 25000,
      dueDate: new Date("2023-05-15"),
      status: "paid"
    });

    const fee2 = this.createFee({
      studentId: 1,
      term: "Term 2 2023",
      amount: 25000,
      dueDate: new Date("2023-08-15"),
      status: "pending"
    });

    // Create payment for paid fee
    this.createFeePayment({
      feeId: fee1.id,
      amount: 25000,
      paymentMethod: "Online Transfer",
      transactionId: "TXN123456",
      receipt: "receipt_123.pdf"
    });

    // Create academic records for the student
    this.createAcademicRecord({
      studentId: 1,
      subject: "Mathematics",
      term: "Term 1 2023",
      grade: "A",
      marks: 92,
      maxMarks: 100,
      remarks: "Excellent performance"
    });

    this.createAcademicRecord({
      studentId: 1,
      subject: "Science",
      term: "Term 1 2023",
      grade: "A",
      marks: 88,
      maxMarks: 100,
      remarks: "Very good performance"
    });

    this.createAcademicRecord({
      studentId: 1,
      subject: "English",
      term: "Term 1 2023",
      grade: "B+",
      marks: 85,
      maxMarks: 100,
      remarks: "Good performance"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Student operations
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.userId === userId,
    );
  }

  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.studentIdCounter++;
    const admissionDate = new Date();
    const newStudent: Student = { ...student, id, admissionDate };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: number, studentData: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;

    const updatedStudent = { ...student, ...studentData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  // Site Settings operations
  async getSetting(key: string): Promise<SiteSetting | undefined> {
    return Array.from(this.siteSettings.values()).find(setting => setting.key === key);
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    return Array.from(this.siteSettings.values());
  }

  async createSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const id = this.siteSettingIdCounter++;
    const updatedAt = new Date();
    const newSetting: SiteSetting = { ...setting, id, updatedAt };
    this.siteSettings.set(id, newSetting);
    return newSetting;
  }

  async updateSetting(key: string, value: string): Promise<SiteSetting | undefined> {
    const setting = Array.from(this.siteSettings.values()).find(s => s.key === key);
    
    if (!setting) {
      // Create if it doesn't exist
      return this.createSetting({ key, value });
    }
    
    const updatedSetting = { ...setting, value, updatedAt: new Date() };
    this.siteSettings.set(setting.id, updatedSetting);
    return updatedSetting;
  }

  async deleteSetting(id: number): Promise<boolean> {
    return this.siteSettings.delete(id);
  }

  // Notice operations
  async getNotice(id: number): Promise<Notice | undefined> {
    return this.notices.get(id);
  }

  async getNotices(): Promise<Notice[]> {
    return Array.from(this.notices.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getRecentNotices(limit: number): Promise<Notice[]> {
    return Array.from(this.notices.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createNotice(notice: InsertNotice): Promise<Notice> {
    const id = this.noticeIdCounter++;
    const date = new Date();
    const newNotice: Notice = { ...notice, id, date };
    this.notices.set(id, newNotice);
    return newNotice;
  }

  async updateNotice(id: number, noticeData: Partial<Notice>): Promise<Notice | undefined> {
    const notice = this.notices.get(id);
    if (!notice) return undefined;

    const updatedNotice = { ...notice, ...noticeData };
    this.notices.set(id, updatedNotice);
    return updatedNotice;
  }

  async deleteNotice(id: number): Promise<boolean> {
    return this.notices.delete(id);
  }

  // Gallery operations
  async getGalleryItem(id: number): Promise<Gallery | undefined> {
    return this.gallery.get(id);
  }

  async getGallery(): Promise<Gallery[]> {
    return Array.from(this.gallery.values()).sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }

  async createGalleryItem(item: InsertGallery): Promise<Gallery> {
    const id = this.galleryIdCounter++;
    const uploadDate = new Date();
    const newItem: Gallery = { ...item, id, uploadDate };
    this.gallery.set(id, newItem);
    return newItem;
  }

  async updateGalleryItem(id: number, itemData: Partial<Gallery>): Promise<Gallery | undefined> {
    const item = this.gallery.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...itemData };
    this.gallery.set(id, updatedItem);
    return updatedItem;
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    return this.gallery.delete(id);
  }

  // Achievement operations
  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementIdCounter++;
    const achievementDate = new Date();
    const newAchievement: Achievement = { ...achievement, id, achievementDate };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async updateAchievement(id: number, achievementData: Partial<Achievement>): Promise<Achievement | undefined> {
    const achievement = this.achievements.get(id);
    if (!achievement) return undefined;

    const updatedAchievement = { ...achievement, ...achievementData };
    this.achievements.set(id, updatedAchievement);
    return updatedAchievement;
  }

  async deleteAchievement(id: number): Promise<boolean> {
    return this.achievements.delete(id);
  }

  // Admission Inquiry operations
  async getInquiry(id: number): Promise<AdmissionInquiry | undefined> {
    return this.inquiries.get(id);
  }

  async getInquiries(): Promise<AdmissionInquiry[]> {
    return Array.from(this.inquiries.values()).sort((a, b) => 
      new Date(b.inquiryDate).getTime() - new Date(a.inquiryDate).getTime()
    );
  }

  async createInquiry(inquiry: InsertInquiry): Promise<AdmissionInquiry> {
    const id = this.inquiryIdCounter++;
    const inquiryDate = new Date();
    const status = "pending";
    const newInquiry: AdmissionInquiry = { ...inquiry, id, status, inquiryDate };
    this.inquiries.set(id, newInquiry);
    return newInquiry;
  }

  async updateInquiry(id: number, inquiryData: Partial<AdmissionInquiry>): Promise<AdmissionInquiry | undefined> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) return undefined;

    const updatedInquiry = { ...inquiry, ...inquiryData };
    this.inquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }

  async deleteInquiry(id: number): Promise<boolean> {
    return this.inquiries.delete(id);
  }

  // Fee operations
  async getFee(id: number): Promise<Fee | undefined> {
    return this.fees.get(id);
  }

  async getFeesByStudentId(studentId: number): Promise<Fee[]> {
    return Array.from(this.fees.values())
      .filter(fee => fee.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createFee(fee: InsertFee): Promise<Fee> {
    const id = this.feeIdCounter++;
    const createdAt = new Date();
    const newFee: Fee = { ...fee, id, createdAt };
    this.fees.set(id, newFee);
    return newFee;
  }

  async updateFee(id: number, feeData: Partial<Fee>): Promise<Fee | undefined> {
    const fee = this.fees.get(id);
    if (!fee) return undefined;

    const updatedFee = { ...fee, ...feeData };
    this.fees.set(id, updatedFee);
    return updatedFee;
  }

  async deleteFee(id: number): Promise<boolean> {
    return this.fees.delete(id);
  }

  // Fee Payment operations
  async getFeePayment(id: number): Promise<FeePayment | undefined> {
    return this.feePayments.get(id);
  }

  async getFeePaymentsByFeeId(feeId: number): Promise<FeePayment[]> {
    return Array.from(this.feePayments.values())
      .filter(payment => payment.feeId === feeId)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }

  async createFeePayment(payment: InsertFeePayment): Promise<FeePayment> {
    const id = this.feePaymentIdCounter++;
    const paymentDate = new Date();
    const newPayment: FeePayment = { ...payment, id, paymentDate };
    this.feePayments.set(id, newPayment);
    
    // Update the corresponding fee status to paid
    const fee = await this.getFee(payment.feeId);
    if (fee) {
      await this.updateFee(fee.id, { status: "paid" });
    }
    
    return newPayment;
  }

  async deleteFeePayment(id: number): Promise<boolean> {
    return this.feePayments.delete(id);
  }

  // Academic Record operations
  async getAcademicRecord(id: number): Promise<AcademicRecord | undefined> {
    return this.academicRecords.get(id);
  }

  async getAcademicRecordsByStudentId(studentId: number): Promise<AcademicRecord[]> {
    return Array.from(this.academicRecords.values())
      .filter(record => record.studentId === studentId)
      .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
  }

  async createAcademicRecord(record: InsertAcademicRecord): Promise<AcademicRecord> {
    const id = this.academicRecordIdCounter++;
    const recordDate = new Date();
    const newRecord: AcademicRecord = { ...record, id, recordDate };
    this.academicRecords.set(id, newRecord);
    return newRecord;
  }

  async updateAcademicRecord(id: number, recordData: Partial<AcademicRecord>): Promise<AcademicRecord | undefined> {
    const record = this.academicRecords.get(id);
    if (!record) return undefined;

    const updatedRecord = { ...record, ...recordData };
    this.academicRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteAcademicRecord(id: number): Promise<boolean> {
    return this.academicRecords.delete(id);
  }

  // Contact Message operations
  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageIdCounter++;
    const createdAt = new Date();
    const status = "unread";
    const newMessage: ContactMessage = { ...message, id, status, createdAt };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }

  async updateContactMessage(id: number, messageData: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    const message = this.contactMessages.get(id);
    if (!message) return undefined;

    const updatedMessage = { ...message, ...messageData };
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    return this.contactMessages.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: true
    });
  }

  // Site Settings operations
  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async createSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const [newSetting] = await db.insert(siteSettings).values(setting).returning();
    return newSetting;
  }

  async updateSetting(key: string, value: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    
    if (!setting) {
      // Create if it doesn't exist
      return this.createSetting({ key, value });
    }
    
    const [updatedSetting] = await db
      .update(siteSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteSettings.key, key))
      .returning();
    
    return updatedSetting;
  }

  async deleteSetting(id: number): Promise<boolean> {
    const result = await db.delete(siteSettings).where(eq(siteSettings.id, id));
    return result.count > 0;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.count > 0;
  }

  // Student operations
  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: number, studentData: Partial<Student>): Promise<Student | undefined> {
    const [updatedStudent] = await db
      .update(students)
      .set(studentData)
      .where(eq(students.id, id))
      .returning();
    
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return result.count > 0;
  }

  // Notice operations
  async getNotice(id: number): Promise<Notice | undefined> {
    const [notice] = await db.select().from(notices).where(eq(notices.id, id));
    return notice;
  }

  async getNotices(): Promise<Notice[]> {
    return await db.select().from(notices).orderBy(desc(notices.date));
  }

  async getActiveNotices(): Promise<Notice[]> {
    return await db
      .select()
      .from(notices)
      .where(eq(notices.isActive, true))
      .orderBy(desc(notices.date));
  }

  async getRecentNotices(limit: number): Promise<Notice[]> {
    return await db
      .select()
      .from(notices)
      .where(eq(notices.isActive, true))
      .orderBy(desc(notices.date))
      .limit(limit);
  }

  async createNotice(notice: InsertNotice): Promise<Notice> {
    const [newNotice] = await db.insert(notices).values(notice).returning();
    return newNotice;
  }

  async updateNotice(id: number, noticeData: Partial<Notice>): Promise<Notice | undefined> {
    const [updatedNotice] = await db
      .update(notices)
      .set(noticeData)
      .where(eq(notices.id, id))
      .returning();
    
    return updatedNotice;
  }

  async deleteNotice(id: number): Promise<boolean> {
    const result = await db.delete(notices).where(eq(notices.id, id));
    return result.count > 0;
  }

  // Gallery operations
  async getGalleryItem(id: number): Promise<Gallery | undefined> {
    const [item] = await db.select().from(gallery).where(eq(gallery.id, id));
    return item;
  }

  async getGallery(): Promise<Gallery[]> {
    return await db.select().from(gallery).orderBy(desc(gallery.uploadDate));
  }

  async getActiveGallery(): Promise<Gallery[]> {
    return await db
      .select()
      .from(gallery)
      .where(eq(gallery.isActive, true))
      .orderBy(desc(gallery.uploadDate));
  }

  async createGalleryItem(item: InsertGallery): Promise<Gallery> {
    const [newItem] = await db.insert(gallery).values(item).returning();
    return newItem;
  }

  async updateGalleryItem(id: number, itemData: Partial<Gallery>): Promise<Gallery | undefined> {
    const [updatedItem] = await db
      .update(gallery)
      .set(itemData)
      .where(eq(gallery.id, id))
      .returning();
    
    return updatedItem;
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    const result = await db.delete(gallery).where(eq(gallery.id, id));
    return result.count > 0;
  }

  // Achievement operations
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }

  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getActiveAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }

  async updateAchievement(id: number, achievementData: Partial<Achievement>): Promise<Achievement | undefined> {
    const [updatedAchievement] = await db
      .update(achievements)
      .set(achievementData)
      .where(eq(achievements.id, id))
      .returning();
    
    return updatedAchievement;
  }

  async deleteAchievement(id: number): Promise<boolean> {
    const result = await db.delete(achievements).where(eq(achievements.id, id));
    return result.count > 0;
  }

  // Admission Inquiry operations
  async getInquiry(id: number): Promise<AdmissionInquiry | undefined> {
    const [inquiry] = await db.select().from(admissionInquiries).where(eq(admissionInquiries.id, id));
    return inquiry;
  }

  async getInquiries(): Promise<AdmissionInquiry[]> {
    return await db.select().from(admissionInquiries).orderBy(desc(admissionInquiries.inquiryDate));
  }

  async createInquiry(inquiry: InsertInquiry): Promise<AdmissionInquiry> {
    const [newInquiry] = await db.insert(admissionInquiries).values(inquiry).returning();
    return newInquiry;
  }

  async updateInquiry(id: number, inquiryData: Partial<AdmissionInquiry>): Promise<AdmissionInquiry | undefined> {
    const [updatedInquiry] = await db
      .update(admissionInquiries)
      .set(inquiryData)
      .where(eq(admissionInquiries.id, id))
      .returning();
    
    return updatedInquiry;
  }

  async deleteInquiry(id: number): Promise<boolean> {
    const result = await db.delete(admissionInquiries).where(eq(admissionInquiries.id, id));
    return result.count > 0;
  }

  // Fee operations
  async getFee(id: number): Promise<Fee | undefined> {
    const [fee] = await db.select().from(fees).where(eq(fees.id, id));
    return fee;
  }

  async getFeesByStudentId(studentId: number): Promise<Fee[]> {
    return await db.select().from(fees).where(eq(fees.studentId, studentId));
  }

  async createFee(fee: InsertFee): Promise<Fee> {
    const [newFee] = await db.insert(fees).values(fee).returning();
    return newFee;
  }

  async updateFee(id: number, feeData: Partial<Fee>): Promise<Fee | undefined> {
    const [updatedFee] = await db
      .update(fees)
      .set(feeData)
      .where(eq(fees.id, id))
      .returning();
    
    return updatedFee;
  }

  async deleteFee(id: number): Promise<boolean> {
    const result = await db.delete(fees).where(eq(fees.id, id));
    return result.count > 0;
  }

  // Fee Payment operations
  async getFeePayment(id: number): Promise<FeePayment | undefined> {
    const [payment] = await db.select().from(feePayments).where(eq(feePayments.id, id));
    return payment;
  }

  async getFeePaymentsByFeeId(feeId: number): Promise<FeePayment[]> {
    return await db.select().from(feePayments).where(eq(feePayments.feeId, feeId));
  }

  async createFeePayment(payment: InsertFeePayment): Promise<FeePayment> {
    const [newPayment] = await db.insert(feePayments).values(payment).returning();
    return newPayment;
  }

  async deleteFeePayment(id: number): Promise<boolean> {
    const result = await db.delete(feePayments).where(eq(feePayments.id, id));
    return result.count > 0;
  }

  // Academic Record operations
  async getAcademicRecord(id: number): Promise<AcademicRecord | undefined> {
    const [record] = await db.select().from(academicRecords).where(eq(academicRecords.id, id));
    return record;
  }

  async getAcademicRecordsByStudentId(studentId: number): Promise<AcademicRecord[]> {
    return await db.select().from(academicRecords).where(eq(academicRecords.studentId, studentId));
  }

  async createAcademicRecord(record: InsertAcademicRecord): Promise<AcademicRecord> {
    const [newRecord] = await db.insert(academicRecords).values(record).returning();
    return newRecord;
  }

  async updateAcademicRecord(id: number, recordData: Partial<AcademicRecord>): Promise<AcademicRecord | undefined> {
    const [updatedRecord] = await db
      .update(academicRecords)
      .set(recordData)
      .where(eq(academicRecords.id, id))
      .returning();
    
    return updatedRecord;
  }

  async deleteAcademicRecord(id: number): Promise<boolean> {
    const result = await db.delete(academicRecords).where(eq(academicRecords.id, id));
    return result.count > 0;
  }

  // Contact Message operations
  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async updateContactMessage(id: number, messageData: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set(messageData)
      .where(eq(contactMessages.id, id))
      .returning();
    
    return updatedMessage;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return result.count > 0;
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
