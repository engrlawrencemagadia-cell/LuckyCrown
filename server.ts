/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import db, { initDatabase } from "./src/db.js";

// Load environment variables from .env file and override process.env
dotenv.config({ override: true });

// Initialize the SQLite database schemas and pre-seeds
initDatabase();

// Lazy-initialized nodemailer transporter
let emailTransporter: any = null;
let lastSmtpConfigStr = "";

function getEmailTransporter() {
  let host = process.env.SMTP_HOST;
  let port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  let user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const currentConfigStr = `${host}:${port}:${user}:${pass}`;

  if (!emailTransporter || currentConfigStr !== lastSmtpConfigStr) {
    lastSmtpConfigStr = currentConfigStr;
    emailTransporter = null; // reset

    // Smart auto-correction: If SMTP_HOST is misconfigured as an email address (very common mistake)
    if (host && host.includes("@")) {
      const emailDomain = host.split("@")[1]?.toLowerCase();
      if (!user) {
        user = host;
      }
      
      if (emailDomain === "gmail.com") {
        host = "smtp.gmail.com";
        port = 587;
      } else if (emailDomain === "outlook.com" || emailDomain === "hotmail.com") {
        host = "smtp-mail.outlook.com";
        port = 587;
      } else if (emailDomain === "yahoo.com") {
        host = "smtp.mail.yahoo.com";
        port = 465;
      }
      console.log(`[SMTP SMART FIX] Automatically re-routed email host to standard server: ${host}:${port}`);
    }

    if (host && user && pass) {
      emailTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        connectionTimeout: 5000, // 5 seconds connection timeout
        greetingTimeout: 5000,   // 5 seconds greeting timeout
        socketTimeout: 5000,     // 5 seconds socket inactivity timeout
        tls: {
          rejectUnauthorized: false // Prevents standard SSL/TLS certification issues
        },
        auth: {
          user,
          pass,
        },
      });
      console.log(`Email Transporter configured with SMTP: ${host}:${port} (${user})`);
    }
  }
  return emailTransporter;
}

// Helper to send email
async function sendOTPEmail(toEmail: string, username: string, otpCode: string): Promise<boolean> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@luckycrown.com";
  const transporter = getEmailTransporter();

  const textContent = `Hello ${username},\n\nYour Admin login OTP code for Lucky Crown is: ${otpCode}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nLucky Crown Team`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #f59e0b; text-transform: uppercase; letter-spacing: 0.1em; font-size: 20px;">Lucky Crown Control Panel</h2>
      <p style="font-size: 14px; color: #374151;">Hello <strong>${username}</strong>,</p>
      <p style="font-size: 14px; color: #374151;">You are attempting to log in to the Lucky Crown Administrative Control Panel. Please use the following One-Time Password (OTP) to complete your verification:</p>
      <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 16px; text-align: center; border-radius: 6px; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 0.2em; color: #111827; font-family: 'Courier New', monospace;">${otpCode}</span>
      </div>
      <p style="font-size: 12px; color: #6b7280;">This verification code is valid for <strong>10 minutes</strong>. If you did not request this code, please secure your credentials immediately.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 10px; color: #9ca3af; text-align: center;">Lucky Crown Construction & Trading Manila</p>
    </div>
  `;

  console.log(`[OTP EMAIL BURST] Sending OTP ${otpCode} to ${toEmail}`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to: toEmail,
        subject: `[LCCT OTP] ${otpCode} is your Lucky Crown verification code`,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[OTP EMAIL SUCCESS] Successfully sent OTP email to ${toEmail}`);
      return true;
    } catch (err) {
      console.error("[OTP EMAIL ERROR] Failed to send email via SMTP:", err);
      return false;
    }
  } else {
    console.log(`[OTP DEV FALLBACK] SMTP is not fully configured. Code generated: ${otpCode}`);
    return false;
  }
}

// Helper to send registration approval email to host
async function sendApprovalEmail(
  newUsername: string,
  newEmail: string,
  approvalToken: string,
  appUrl: string
): Promise<boolean> {
  const hostEmail = process.env.SMTP_USER || "luckycrownwebsite@gmail.com";
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@luckycrown.com";
  const transporter = getEmailTransporter();

  const approvalUrl = `${appUrl}/api/admin/approve-signup?token=${approvalToken}`;
  const rejectionUrl = `${appUrl}/api/admin/reject-signup?token=${approvalToken}`;

  const textContent = `Hello Host Admin,\n\nA new admin registration request has been submitted for Lucky Crown:\n- Username: ${newUsername}\n- Email: ${newEmail}\n\nApprove: ${approvalUrl}\nReject: ${rejectionUrl}\n\nBest regards,\nLucky Crown Server`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #f59e0b; text-transform: uppercase; letter-spacing: 0.1em; font-size: 20px; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">Lucky Crown Control Panel Authorization</h2>
      <p style="font-size: 14px; color: #374151; margin-top: 16px;">Hello <strong>Host Administrator</strong>,</p>
      <p style="font-size: 14px; color: #374151;">A new user has requested access to the Lucky Crown Administrative Control Panel with the following details:</p>
      
      <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 16px; border-radius: 6px; margin: 24px 0;">
        <p style="margin: 4px 0; font-size: 13px; color: #374151;"><strong>Username:</strong> ${newUsername}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #374151;"><strong>Email:</strong> ${newEmail}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #374151;"><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p style="font-size: 14px; color: #374151;">Please authorize or decline this administrative signup request using the secure options below:</p>
      
      <div style="margin: 24px 0; text-align: center;">
        <a href="${approvalUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 14px; margin-right: 12px;">Approve Request</a>
        <a href="${rejectionUrl}" style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 14px;">Reject Request</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 10px; color: #9ca3af; text-align: center;">Lucky Crown Construction & Trading Manila</p>
    </div>
  `;

  console.log(`[APPROVAL EMAIL BURST] Initiating signup authorization for ${newUsername} (${newEmail}) to host ${hostEmail}`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to: hostEmail,
        subject: `[LCCT ACTION REQUIRED] Authorize Sign-Up Request: ${newUsername}`,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[APPROVAL EMAIL SUCCESS] Sent approval authorization email to host ${hostEmail}`);
      return true;
    } catch (err) {
      console.error("[APPROVAL EMAIL ERROR] Failed to send authorization email via SMTP:", err);
      return false;
    }
  } else {
    console.log(`[APPROVAL DEV FALLBACK] SMTP not fully configured.\nApproval link: ${approvalUrl}\nRejection link: ${rejectionUrl}`);
    return false;
  }
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Ensure static uploads directory on disk always exists
const uploadsPath = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve /uploads statically from Express
app.use("/uploads", express.static(uploadsPath));

// Helper: Decode and save base64 pictures to solid file assets in uploads/
function saveBase64Image(base64String: string): string {
  if (!base64String || base64String.startsWith("/uploads") || base64String.startsWith("http://") || base64String.startsWith("https://")) {
    return base64String;
  }

  try {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64String;
    }

    const imageType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    let extension = "png";
    if (imageType.includes("jpeg") || imageType.includes("jpg")) {
      extension = "jpg";
    } else if (imageType.includes("gif")) {
      extension = "gif";
    } else if (imageType.includes("webp")) {
      extension = "webp";
    } else if (imageType.includes("svg")) {
      extension = "svg";
    }

    const filename = `${crypto.randomUUID()}.${extension}`;
    fs.writeFileSync(path.join(uploadsPath, filename), buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Failed to save base64 image asset:", error);
    return base64String;
  }
}

// Body parser configurations supporting heavy high-quality base64 image uploads (50mb limit)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Express TypeScript custom request payload typing
interface AuthenticatedRequest extends Request {
  adminId?: number;
  adminUsername?: string;
}

// ----------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// ----------------------------------------------------
const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized access: Bearer token is missing." });
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    res.status(401).json({ error: "Unauthorized access: Bearer token is invalid." });
    return;
  }

  try {
    const session = db.prepare(`
      SELECT s.token, s.admin_id, s.expires_at, a.username 
      FROM sessions s 
      JOIN admins a ON s.admin_id = a.id 
      WHERE s.token = ?
    `).get(token) as { token: string; admin_id: number; expires_at: string; username: string } | undefined;

    if (!session) {
      res.status(401).json({ error: "Session expired or invalid token." });
      return;
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
      res.status(401).json({ error: "Session has expired. Please log in again." });
      return;
    }

    req.adminId = session.admin_id;
    req.adminUsername = session.username;
    next();
  } catch (error: any) {
    res.status(500).json({ error: "Server authentication error: " + error.message });
  }
};

// ----------------------------------------------------
// PUBLIC API ENDPOINTS
// ----------------------------------------------------

// GET: Products list with optional Category and Search filters
app.get("/api/products", (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let queryStr = "SELECT * FROM products";
    const params: any[] = [];
    const clauses: string[] = [];

    if (category) {
      clauses.push("category = ?");
      params.push(category);
    }

    if (search) {
      clauses.push("(name LIKE ? OR description LIKE ? OR specifications LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (clauses.length > 0) {
      queryStr += " WHERE " + clauses.join(" AND ");
    }

    queryStr += " ORDER BY created_at DESC";

    const products = db.prepare(queryStr).all(...params) as any[];

    // Fetch associated images for each product
    for (const prod of products) {
      const imgs = db.prepare("SELECT image_url FROM product_images WHERE product_id = ?").all(prod.id) as any[];
      prod.images = imgs.map((ig) => ig.image_url);
    }

    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve products: " + err.message });
  }
});

// GET: Single product details
app.get("/api/products/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as any;

    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    const imgs = db.prepare("SELECT image_url FROM product_images WHERE product_id = ?").all(id) as any[];
    product.images = imgs.map((ig) => ig.image_url);

    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load product details: " + err.message });
  }
});

// GET: Services list
app.get("/api/services", (req: Request, res: Response) => {
  try {
    const services = db.prepare("SELECT * FROM services ORDER BY created_at ASC").all() as any[];

    // Fetch images
    for (const svc of services) {
      const imgs = db.prepare("SELECT image_url FROM service_images WHERE service_id = ?").all(svc.id) as any[];
      svc.images = imgs.map((ig) => ig.image_url);
    }

    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve services: " + err.message });
  }
});

// GET: Single service details
app.get("/api/services/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as any;

    if (!service) {
      res.status(404).json({ error: "Service not found." });
      return;
    }

    const imgs = db.prepare("SELECT image_url FROM service_images WHERE service_id = ?").all(id) as any[];
    service.images = imgs.map((ig) => ig.image_url);

    res.json(service);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load service details: " + err.message });
  }
});

// GET: Projects/Portfolio list
app.get("/api/projects", (req: Request, res: Response) => {
  try {
    const projects = db.prepare("SELECT * FROM projects ORDER BY date DESC").all() as any[];

    for (const proj of projects) {
      const imgs = db.prepare("SELECT image_url FROM project_images WHERE project_id = ?").all(proj.id) as any[];
      proj.images = imgs.map((ig) => ig.image_url);
    }

    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve portfolio: " + err.message });
  }
});

// GET: Single project details
app.get("/api/projects/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as any;

    if (!project) {
      res.status(404).json({ error: "Project not found." });
      return;
    }

    const imgs = db.prepare("SELECT image_url FROM project_images WHERE project_id = ?").all(id) as any[];
    project.images = imgs.map((ig) => ig.image_url);

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve project: " + err.message });
  }
});

// GET: FAQs list
app.get("/api/faqs", (req: Request, res: Response) => {
  try {
    const faqs = db.prepare("SELECT * FROM faqs ORDER BY id ASC").all();
    res.json(faqs);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve FAQs: " + err.message });
  }
});

// GET: Dynamic Product Categories
app.get("/api/categories/products", (req: Request, res: Response) => {
  try {
    const results = db.prepare("SELECT DISTINCT category FROM products").all() as { category: string }[];
    const categories = results.map((r) => r.category);
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve categories: " + err.message });
  }
});

// POST: Add new customer inquiry from Contact form
app.post("/api/inquiries", (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: "Please enter your Name, Email, and Message." });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO inquiries (name, email, phone, message, status)
      VALUES (?, ?, ?, ?, 'Pending')
    `);
    const result = stmt.run(name, email, phone || "", message);

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: "Your inquiry has been successfully sent. Our support crew will get back to you soon!",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to submit inquiry: " + err.message });
  }
});

// ----------------------------------------------------
// ADMIN AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

// POST: Admin Login
app.post("/api/admin/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required." });
      return;
    }

    const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username) as any;
    if (!admin) {
      res.status(401).json({ error: "Invalid username or password." });
      return;
    }

    if (admin.status === "pending") {
      const hostDisplayEmail = process.env.SMTP_USER || "luckycrownwebsite@gmail.com";
      res.status(403).json({ error: `Your account is currently PENDING approval by the host administrator (${hostDisplayEmail}). You will receive an email once authorized.` });
      return;
    }

    if (admin.status === "rejected") {
      res.status(403).json({ error: "Your registration request has been rejected by the host administrator. Please contact them for authorization." });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid username or password." });
      return;
    }

    // Auto-backfill default email if empty, null, or old developer email
    let adminEmail = admin.email;
    if (!adminEmail || adminEmail === "lawrencemagadia04@gmail.com") {
      adminEmail = process.env.SMTP_USER || "luckycrownwebsite@gmail.com";
      db.prepare("UPDATE admins SET email = ? WHERE id = ?").run(adminEmail, admin.id);
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    db.prepare(`
      UPDATE admins 
      SET otp_code = ?, otp_expires_at = ?
      WHERE id = ?
    `).run(otpCode, otpExpiresAt, admin.id);

    // Send OTP email asynchronously
    const emailSent = await sendOTPEmail(adminEmail, admin.username, otpCode);

    // Save the OTP to a local file in the secure workspace for developer visibility
    try {
      fs.writeFileSync(
        path.join(process.cwd(), "otp_code.txt"),
        `Latest OTP for ${admin.username} (${adminEmail}): ${otpCode}\nGenerated at: ${new Date().toLocaleString()}\n`
      );
    } catch (e: any) {
      console.error("Failed to write otp_code.txt:", e);
    }

    const isProduction = process.env.NODE_ENV === "production";
    const isDeveloper = !isProduction && (
      adminEmail.toLowerCase() === "lawrencemagadia04@gmail.com" ||
      adminEmail.toLowerCase() === "luckycrownwebsite@gmail.com"
    );

    if (!emailSent && !isDeveloper) {
      res.status(500).json({
        error: "SMTP Delivery failed. The system could not dispatch your security code. Please contact the administrator to verify mail server settings."
      });
      return;
    }

    res.json({
      requiresOtp: true,
      username: admin.username,
      email: adminEmail,
      message: emailSent
        ? "A verification code has been sent to your registered email address. If you do not receive it shortly, please check your Spam/Junk folders."
        : "SMTP dispatch failed. Developer fallback active: check 'otp_code.txt' in your files, or use '123456'.",
      devOtp: (isDeveloper && !emailSent) ? otpCode : undefined,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// POST: Verify Admin OTP and issue Session Token
app.post("/api/admin/verify-otp", (req: Request, res: Response) => {
  try {
    const { username, otpCode } = req.body;
    if (!username || !otpCode) {
      res.status(400).json({ error: "Username and OTP code are required." });
      return;
    }

    const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username) as any;
    if (!admin) {
      res.status(401).json({ error: "Authentication failed. Admin profile not found." });
      return;
    }

    if (!admin.otp_code || !admin.otp_expires_at) {
      res.status(400).json({ error: "No OTP code request found. Please login again." });
      return;
    }

    // Check code expiration
    if (new Date(admin.otp_expires_at) < new Date()) {
      res.status(400).json({ error: "The verification code has expired. Please trigger a new login." });
      return;
    }

    // Check code match (Allow '123456' as master developer bypass code ONLY in development mode)
    const isProduction = process.env.NODE_ENV === "production";
    const isDeveloper = !isProduction && admin.email && (
      admin.email.toLowerCase() === "lawrencemagadia04@gmail.com" ||
      admin.email.toLowerCase() === "luckycrownwebsite@gmail.com"
    );
    const suppliedCode = otpCode.trim();
    const isMatch = (admin.otp_code === suppliedCode) || (isDeveloper && suppliedCode === "123456");

    if (!isMatch) {
      res.status(401).json({ error: "Invalid verification code. Please check and try again." });
      return;
    }

    // Reset OTP columns upon successful verification to avoid replay
    db.prepare("UPDATE admins SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?").run(admin.id);

    // Generate session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 Days expire

    db.prepare(`
      INSERT INTO sessions (token, admin_id, expires_at)
      VALUES (?, ?, ?)
    `).run(token, admin.id, expiresAt);

    res.json({
      token,
      username: admin.username,
      message: "Verification successful! Welcome to Lucky Crown.",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Verification failed: " + err.message });
  }
});

// POST: Secure signup for new admins as requested in specs! (Restricted to logged-in admins only)
app.post("/api/admin/signup", authenticateAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      res.status(400).json({ error: "Username, password, and email address are required." });
      return;
    }

    if (password.length < 5) {
      res.status(400).json({ error: "Password must be at least 5 characters long." });
      return;
    }

    const existing = db.prepare("SELECT * FROM admins WHERE username = ?").get(username);
    if (existing) {
      res.status(400).json({ error: "Username is already taken by another admin." });
      return;
    }

    const hash = bcrypt.hashSync(password, 10);
    // Directly pre-approve this administrator because they are created inside the dashboard by an authorized admin
    const result = db.prepare(`
      INSERT INTO admins (username, password_hash, email, status, approval_token) 
      VALUES (?, ?, ?, 'approved', NULL)
    `).run(username, hash, email);

    res.status(201).json({
      success: true,
      message: `Administrator account '${username}' has been successfully created and approved! They can now log in directly.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});

// GET: List all administrators (Restricted to authorized admins)
app.get("/api/admin/accounts", authenticateAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  try {
    const admins = db.prepare(`
      SELECT id, username, email, status, created_at 
      FROM admins 
      ORDER BY created_at DESC
    `).all();
    res.json(admins);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load administrator accounts: " + err.message });
  }
});

// DELETE: Revoke/delete an administrator account (Restricted to authorized admins)
app.delete("/api/admin/accounts/:id", authenticateAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) {
      res.status(400).json({ error: "Invalid administrator ID." });
      return;
    }

    // Protect against self-deletion
    if (targetId === req.adminId) {
      res.status(400).json({ error: "You cannot revoke your own administrator account while logged in." });
      return;
    }

    // Protect the root 'admin' profile
    const targetAdmin = db.prepare("SELECT * FROM admins WHERE id = ?").get(targetId) as any;
    if (!targetAdmin) {
      res.status(404).json({ error: "Administrator account not found." });
      return;
    }

    if (targetAdmin.username === "admin") {
      res.status(400).json({ error: "The primary master administrator account ('admin') cannot be deleted." });
      return;
    }

    // Perform deletion
    db.prepare("DELETE FROM admins WHERE id = ?").run(targetId);
    // Clean up any open sessions of that admin
    db.prepare("DELETE FROM sessions WHERE admin_id = ?").run(targetId);

    res.json({
      success: true,
      message: `Administrator account '${targetAdmin.username}' has been successfully revoked.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete administrator: " + err.message });
  }
});

// GET: Approve Admin Sign-Up Request
app.get("/api/admin/approve-signup", (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Authorization Failed</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-950 text-slate-100 font-sans min-h-screen flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mb-6 border border-rose-500/20">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">Invalid Token</h1>
            <p class="text-sm text-zinc-400 mt-3 leading-relaxed">
              No authorization token was supplied or the request is missing parameters.
            </p>
            <div class="mt-8">
              <a href="/" class="inline-block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest text-xs py-3 rounded transition font-mono">Back to Site</a>
            </div>
          </div>
        </body>
        </html>
      `);
      return;
    }

    const admin = db.prepare("SELECT * FROM admins WHERE approval_token = ?").get(token) as any;
    if (!admin) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Authorization Failed</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-950 text-slate-100 font-sans min-h-screen flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mb-6 border border-rose-500/20">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h1 class="text-xl font-bold text-white tracking-tight uppercase">Request Not Found</h1>
            <p class="text-sm text-zinc-400 mt-3 leading-relaxed">
              This sign-up request could not be found. It may have already been approved, rejected, or cleared from the system.
            </p>
            <div class="mt-8">
              <a href="/" class="inline-block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest text-xs py-3 rounded transition font-mono">Back to Site</a>
            </div>
          </div>
        </body>
        </html>
      `);
      return;
    }

    // Approve the admin
    db.prepare("UPDATE admins SET status = 'approved', approval_token = NULL WHERE id = ?").run(admin.id);

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Lucky Crown Control Panel - Approved</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-950 text-slate-100 font-sans min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 border border-emerald-500/20">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight uppercase">Access Authorized</h1>
          <p class="text-sm text-zinc-400 mt-3 leading-relaxed">
            You have successfully approved the registration of <strong>${admin.username}</strong> (${admin.email}).
          </p>
          <p class="text-xs text-zinc-500 mt-2">
            They can now log in to the admin section and receive their multi-factor OTP code.
          </p>
          <div class="mt-8">
            <a href="/" class="inline-block w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-widest text-xs py-3 rounded transition font-mono">Go to Control Panel</a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send("An error occurred during approval: " + err.message);
  }
});

// GET: Reject Admin Sign-Up Request
app.get("/api/admin/reject-signup", (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token) {
      res.status(400).send("No approval token was supplied.");
      return;
    }

    const admin = db.prepare("SELECT * FROM admins WHERE approval_token = ?").get(token) as any;
    if (!admin) {
      res.status(404).send("This sign-up request could not be found or has already been handled.");
      return;
    }

    // Delete the pending admin so they can try again or clear database noise
    db.prepare("DELETE FROM admins WHERE id = ?").run(admin.id);

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Lucky Crown Control Panel - Rejected</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-950 text-slate-100 font-sans min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mb-6 border border-rose-500/20">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight uppercase">Access Rejected</h1>
          <p class="text-sm text-zinc-400 mt-3 leading-relaxed">
            The registration request for <strong>${admin.username}</strong> (${admin.email}) has been rejected.
          </p>
          <p class="text-xs text-zinc-500 mt-2">
            The account request records have been securely cleared from the database.
          </p>
          <div class="mt-8">
            <a href="/" class="inline-block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest text-xs py-3 rounded transition font-mono">Back to Home</a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send("An error occurred during rejection: " + err.message);
  }
});

// POST: Admin Logout
app.post("/api/admin/logout", (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "").trim();
      db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    }
    res.json({ success: true, message: "Logged out successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Logout failed: " + err.message });
  }
});

// GET: Validate Session Token
app.get("/api/admin/session", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    authorized: true,
    username: req.adminUsername,
    adminId: req.adminId,
  });
});

// ----------------------------------------------------
// PROTECTED API ENDPOINTS (CMS MANAGEMENT)
// ----------------------------------------------------

// GET: Admin dashboard statistics overview
app.get("/api/admin/dashboard", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalProdResult = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
    const totalSvcResult = db.prepare("SELECT count(*) as count FROM services").get() as { count: number };
    const totalProjResult = db.prepare("SELECT count(*) as count FROM projects").get() as { count: number };
    const totalFAQResult = db.prepare("SELECT count(*) as count FROM faqs").get() as { count: number };
    const totalInquiries = db.prepare("SELECT count(*) as count FROM inquiries").get() as { count: number };

    // Get recently added items (limit 5)
    const recentProducts = db.prepare("SELECT * FROM products ORDER BY created_at DESC LIMIT 5").all() as any[];
    for (const r of recentProducts) {
      const imgs = db.prepare("SELECT image_url FROM product_images WHERE product_id = ?").all(r.id) as any[];
      r.images = imgs.map((ig) => ig.image_url);
    }

    const recentServices = db.prepare("SELECT * FROM services ORDER BY created_at DESC LIMIT 5").all() as any[];
    for (const r of recentServices) {
      const imgs = db.prepare("SELECT image_url FROM service_images WHERE service_id = ?").all(r.id) as any[];
      r.images = imgs.map((ig) => ig.image_url);
    }

    const recentProjects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC LIMIT 5").all() as any[];
    for (const r of recentProjects) {
      const imgs = db.prepare("SELECT image_url FROM project_images WHERE project_id = ?").all(r.id) as any[];
      r.images = imgs.map((ig) => ig.image_url);
    }

    res.json({
      totalProducts: totalProdResult.count,
      totalServices: totalSvcResult.count,
      totalProjects: totalProjResult.count,
      totalFAQs: totalFAQResult.count,
      totalInquiries: totalInquiries.count,
      recentProducts,
      recentServices,
      recentProjects,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to retrieve dashboard stats: " + err.message });
  }
});

// GET: View all inquiries
app.get("/api/admin/inquiries", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const inquiries = db.prepare("SELECT * FROM inquiries ORDER BY created_at DESC").all();
    res.json(inquiries);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch inquiries: " + err.message });
  }
});

// PUT: Update inquiry status
app.put("/api/admin/inquiries/:id/status", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Pending' | 'Responded' | 'Archived'

    db.prepare("UPDATE inquiries SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true, message: `Inquiry status updated to ${status}.` });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update status: " + err.message });
  }
});

// DELETE: Delete inquiry
app.delete("/api/admin/inquiries/:id", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM inquiries WHERE id = ?").run(id);
    res.json({ success: true, message: "Inquiry deleted successfully from records." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete inquiry: " + err.message });
  }
});

// PRODUCTS CRUD
app.post("/api/admin/products", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, description, specifications, price, availability, images } = req.body;
    if (!name || !category || !description || price === undefined) {
      res.status(400).json({ error: "Please enter name, category, description, and price." });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO products (name, category, description, specifications, price, availability)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      category,
      description,
      specifications || "",
      Number(price),
      availability || "In Stock"
    );

    const productId = Number(result.lastInsertRowid);

    // Save images (save base64 strings to disk and insert path or placeholders)
    if (images && Array.isArray(images)) {
      const imgStmt = db.prepare("INSERT INTO product_images (product_id, image_url) VALUES (?, ?)");
      for (const imgUrl of images) {
        if (imgUrl && String(imgUrl).trim()) {
          const savedUrl = saveBase64Image(imgUrl);
          imgStmt.run(productId, savedUrl);
        }
      }
    }

    res.status(201).json({ success: true, id: productId, message: "Product added successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create product: " + err.message });
  }
});

app.put("/api/admin/products/:id", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, description, specifications, price, availability, images } = req.body;

    if (!name || !category || !description || price === undefined) {
      res.status(400).json({ error: "Please enter name, category, description, and price." });
      return;
    }

    db.prepare(`
      UPDATE products 
      SET name = ?, category = ?, description = ?, specifications = ?, price = ?, availability = ?
      WHERE id = ?
    `).run(name, category, description, specifications || "", Number(price), availability, id);

    // Overwrite images if provided (save base64 strings to disk and insert path)
    if (images && Array.isArray(images)) {
      db.prepare("DELETE FROM product_images WHERE product_id = ?").run(id);
      const imgStmt = db.prepare("INSERT INTO product_images (product_id, image_url) VALUES (?, ?)");
      for (const imgUrl of images) {
        if (imgUrl && String(imgUrl).trim()) {
          const savedUrl = saveBase64Image(imgUrl);
          imgStmt.run(id, savedUrl);
        }
      }
    }

    res.json({ success: true, id: Number(id), message: "Product updated successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to edit product: " + err.message });
  }
});

app.delete("/api/admin/products/:id", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    db.prepare("DELETE FROM product_images WHERE product_id = ?").run(id);
    res.json({ success: true, message: "Product and gallery images deleted." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete product: " + err.message });
  }
});

// SERVICES CRUD
app.post("/api/admin/services", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, pricing, availability, images } = req.body;
    if (!name || !description || !pricing) {
      res.status(400).json({ error: "Please provide Name, Description, and Pricing guidance." });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO services (name, description, pricing, availability)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(name, description, pricing, availability || "Active");
    const serviceId = Number(result.lastInsertRowid);

    if (images && Array.isArray(images)) {
      const imgStmt = db.prepare("INSERT INTO service_images (service_id, image_url) VALUES (?, ?)");
      for (const imgUrl of images) {
        if (imgUrl && String(imgUrl).trim()) {
          const savedUrl = saveBase64Image(imgUrl);
          imgStmt.run(serviceId, savedUrl);
        }
      }
    }

    res.status(201).json({ success: true, id: serviceId, message: "Service created successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create service: " + err.message });
  }
});

app.put("/api/admin/services/:id", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, pricing, availability, images } = req.body;

    if (!name || !description || !pricing) {
      res.status(400).json({ error: "Please enter Name, Description, and Pricing guidance." });
      return;
    }

    db.prepare(`
      UPDATE services 
      SET name = ?, description = ?, pricing = ?, availability = ?
      WHERE id = ?
    `).run(name, description, pricing, availability, id);

    if (images && Array.isArray(images)) {
      db.prepare("DELETE FROM service_images WHERE service_id = ?").run(id);
      const imgStmt = db.prepare("INSERT INTO service_images (service_id, image_url) VALUES (?, ?)");
      for (const imgUrl of images) {
        if (imgUrl && String(imgUrl).trim()) {
          const savedUrl = saveBase64Image(imgUrl);
          imgStmt.run(id, savedUrl);
        }
      }
    }

    res.json({ success: true, id: Number(id), message: "Service updated successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to edit service: " + err.message });
  }
});

app.delete("/api/admin/services/:id", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM services WHERE id = ?").run(id);
    db.prepare("DELETE FROM service_images WHERE service_id = ?").run(id);
    res.json({ success: true, message: "Service and associated images deleted." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete service: " + err.message });
  }
});

// PROJECTS CRUD
app.post("/api/admin/projects", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, client, location, date, description, images } = req.body;
    if (!name || !client || !location || !date || !description) {
      res.status(400).json({ error: "Please fill out project Name, Client, Location, Date, and Description." });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO projects (name, client, location, date, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, client, location, date, description);
    const projectId = Number(result.lastInsertRowid);

    if (images && Array.isArray(images)) {
      const imgStmt = db.prepare("INSERT INTO project_images (project_id, image_url) VALUES (?, ?)");
      for (const imgUrl of images) {
        if (imgUrl && String(imgUrl).trim()) {
          const savedUrl = saveBase64Image(imgUrl);
          imgStmt.run(projectId, savedUrl);
        }
      }
    }

    res.status(201).json({ success: true, id: projectId, message: "Portfolio project added successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create project record: " + err.message });
  }
});

app.put("/api/admin/projects/:id", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, client, location, date, description, images } = req.body;

    if (!name || !client || !location || !date || !description) {
      res.status(400).json({ error: "Please fill out project Name, Client, Location, Date, and Description." });
      return;
    }

    db.prepare(`
      UPDATE projects 
      SET name = ?, client = ?, location = ?, date = ?, description = ?
      WHERE id = ?
    `).run(name, client, location, date, description, id);

    if (images && Array.isArray(images)) {
      db.prepare("DELETE FROM project_images WHERE project_id = ?").run(id);
      const imgStmt = db.prepare("INSERT INTO project_images (project_id, image_url) VALUES (?, ?)");
      for (const imgUrl of images) {
        if (imgUrl && String(imgUrl).trim()) {
          const savedUrl = saveBase64Image(imgUrl);
          imgStmt.run(id, savedUrl);
        }
      }
    }

    res.json({ success: true, id: Number(id), message: "Portfolio project updated successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to edit project: " + err.message });
  }
});

app.delete("/api/admin/projects/:id", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    db.prepare("DELETE FROM project_images WHERE project_id = ?").run(id);
    res.json({ success: true, message: "Project and images deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete project: " + err.message });
  }
});

// FAQS CRUD
app.post("/api/admin/faqs", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      res.status(400).json({ error: "Please supply both the FAQ Question and Answer." });
      return;
    }

    const result = db.prepare("INSERT INTO faqs (question, answer) VALUES (?, ?)").run(question, answer);
    res.status(201).json({ success: true, id: Number(result.lastInsertRowid), message: "FAQ created successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create FAQ: " + err.message });
  }
});

app.put("/api/admin/faqs/:id", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    if (!question || !answer) {
      res.status(400).json({ error: "Please enter both the FAQ Question and Answer." });
      return;
    }

    db.prepare("UPDATE faqs SET question = ?, answer = ? WHERE id = ?").run(question, answer, id);
    res.json({ success: true, id: Number(id), message: "FAQ entry updated successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update FAQ: " + err.message });
  }
});

app.delete("/api/admin/faqs/:id", authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM faqs WHERE id = ?").run(id);
    res.json({ success: true, message: "FAQ deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete FAQ: " + err.message });
  }
});

// ----------------------------------------------------
// SYSTEM MIDDLEWARE & ASSET SERVING (VITE / DIST)
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Integrate Vite inside our Express instance for dev hot-module matching (HMR off is handled by vite.config)
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev-server middleware attached.");
  } else {
    // Serve client static production bundles in dist/
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
    console.log("Production static distribution assets attached.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lucky Crown Server listening securely at http://localhost:${PORT}`);
  });
}

startServer();
