import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { 
  insertNoticeSchema, 
  insertGallerySchema, 
  insertAchievementSchema, 
  insertInquirySchema,
  insertFeeSchema,
  insertFeePaymentSchema,
  insertAcademicRecordSchema,
  insertContactMessageSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Middleware for authentication checks
  // Check if user is authenticated and has admin role
  const ensureAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  };

  // Check if user is authenticated
  const ensureAuthenticated = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };
  
  // Public API routes
  
  // Site Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      console.log("Fetching all settings...");
      const settings = await storage.getAllSettings();
      console.log("Settings:", settings);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });
  
  // Admin - Site Settings Management
  app.post("/api/admin/settings", ensureAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      
      if (!key || !value) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      
      // Check if setting already exists
      const existingSetting = await storage.getSetting(key);
      if (existingSetting) {
        return res.status(400).json({ message: "Setting already exists" });
      }
      
      const setting = await storage.createSetting({ key, value });
      res.status(201).json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to create setting" });
    }
  });
  
  app.put("/api/admin/settings/:key", ensureAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      const setting = await storage.updateSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });
  
  app.delete("/api/admin/settings/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSetting(id);
      
      if (!success) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete setting" });
    }
  });
  
  // Get recent notices
  app.get("/api/notices/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const notices = await storage.getRecentNotices(limit);
      res.json(notices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent notices" });
    }
  });

  // Get all notices
  app.get("/api/notices", async (req, res) => {
    try {
      const notices = await storage.getNotices();
      res.json(notices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  // Get gallery items
  app.get("/api/gallery", async (req, res) => {
    try {
      const gallery = await storage.getGallery();
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  // Get achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Submit admission inquiry
  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      res.status(201).json(inquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit inquiry" });
    }
  });

  // Submit contact message
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Protected API routes - Admin

  // Admin - Notice Management
  app.post("/api/admin/notices", ensureAdmin, async (req, res) => {
    try {
      const validatedData = insertNoticeSchema.parse(req.body);
      const notice = await storage.createNotice(validatedData);
      res.status(201).json(notice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notice" });
    }
  });

  app.put("/api/admin/notices/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notice = await storage.getNotice(id);
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }
      
      const validatedData = insertNoticeSchema.parse(req.body);
      const updatedNotice = await storage.updateNotice(id, validatedData);
      res.json(updatedNotice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update notice" });
    }
  });

  app.delete("/api/admin/notices/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNotice(id);
      if (!success) {
        return res.status(404).json({ message: "Notice not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notice" });
    }
  });

  // Admin - Gallery Management
  app.post("/api/admin/gallery", ensureAdmin, async (req, res) => {
    try {
      const validatedData = insertGallerySchema.parse(req.body);
      const item = await storage.createGalleryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create gallery item" });
    }
  });

  app.put("/api/admin/gallery/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getGalleryItem(id);
      if (!item) {
        return res.status(404).json({ message: "Gallery item not found" });
      }
      
      const validatedData = insertGallerySchema.parse(req.body);
      const updatedItem = await storage.updateGalleryItem(id, validatedData);
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update gallery item" });
    }
  });

  app.delete("/api/admin/gallery/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGalleryItem(id);
      if (!success) {
        return res.status(404).json({ message: "Gallery item not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery item" });
    }
  });

  // Admin - Achievement Management
  app.post("/api/admin/achievements", ensureAdmin, async (req, res) => {
    try {
      const validatedData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(validatedData);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create achievement" });
    }
  });

  app.put("/api/admin/achievements/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const achievement = await storage.getAchievement(id);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      const validatedData = insertAchievementSchema.parse(req.body);
      const updatedAchievement = await storage.updateAchievement(id, validatedData);
      res.json(updatedAchievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update achievement" });
    }
  });

  app.delete("/api/admin/achievements/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAchievement(id);
      if (!success) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete achievement" });
    }
  });

  // Admin - Inquiry Management
  app.get("/api/admin/inquiries", ensureAdmin, async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.put("/api/admin/inquiries/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.getInquiry(id);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      
      const updatedInquiry = await storage.updateInquiry(id, {
        status: req.body.status
      });
      res.json(updatedInquiry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inquiry" });
    }
  });

  app.delete("/api/admin/inquiries/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInquiry(id);
      if (!success) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inquiry" });
    }
  });

  // Admin - Contact Message Management
  app.get("/api/admin/contact-messages", ensureAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.put("/api/admin/contact-messages/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.getContactMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      
      const updatedMessage = await storage.updateContactMessage(id, {
        status: req.body.status
      });
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contact message" });
    }
  });

  app.delete("/api/admin/contact-messages/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContactMessage(id);
      if (!success) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });

  // Admin - Student Fee Management
  app.post("/api/admin/fees", ensureAdmin, async (req, res) => {
    try {
      const validatedData = insertFeeSchema.parse(req.body);
      const fee = await storage.createFee(validatedData);
      res.status(201).json(fee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create fee" });
    }
  });

  app.put("/api/admin/fees/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fee = await storage.getFee(id);
      if (!fee) {
        return res.status(404).json({ message: "Fee not found" });
      }
      
      const updatedFee = await storage.updateFee(id, req.body);
      res.json(updatedFee);
    } catch (error) {
      res.status(500).json({ message: "Failed to update fee" });
    }
  });

  // Admin - Academic Record Management
  app.post("/api/admin/academic-records", ensureAdmin, async (req, res) => {
    try {
      const validatedData = insertAcademicRecordSchema.parse(req.body);
      const record = await storage.createAcademicRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create academic record" });
    }
  });

  app.put("/api/admin/academic-records/:id", ensureAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getAcademicRecord(id);
      if (!record) {
        return res.status(404).json({ message: "Academic record not found" });
      }
      
      const updatedRecord = await storage.updateAcademicRecord(id, req.body);
      res.json(updatedRecord);
    } catch (error) {
      res.status(500).json({ message: "Failed to update academic record" });
    }
  });

  // Student APIs
  
  // Get student profile
  app.get("/api/student/profile", ensureAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });

  // Get student academic records
  app.get("/api/student/academic-records", ensureAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const records = await storage.getAcademicRecordsByStudentId(student.id);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch academic records" });
    }
  });

  // Get student fees
  app.get("/api/student/fees", ensureAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      const fees = await storage.getFeesByStudentId(student.id);
      
      // For each fee, get payment details
      const feesWithPayments = await Promise.all(
        fees.map(async (fee) => {
          const payments = await storage.getFeePaymentsByFeeId(fee.id);
          return { ...fee, payments };
        })
      );
      
      res.json(feesWithPayments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  // Process fee payment
  app.post("/api/student/fees/:id/pay", ensureAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Not authorized" });
      }

      const feeId = parseInt(req.params.id);
      const fee = await storage.getFee(feeId);
      
      if (!fee) {
        return res.status(404).json({ message: "Fee not found" });
      }
      
      const student = await storage.getStudentByUserId(req.user.id);
      if (!student || fee.studentId !== student.id) {
        return res.status(403).json({ message: "Not authorized to pay this fee" });
      }
      
      if (fee.status === "paid") {
        return res.status(400).json({ message: "Fee already paid" });
      }
      
      const validatedData = insertFeePaymentSchema.parse({
        ...req.body,
        feeId,
        amount: fee.amount
      });
      
      const payment = await storage.createFeePayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
