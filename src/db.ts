/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "lcct.db");
const db = new Database(dbPath);

// Enable WAL mode for optimal performance
db.pragma("journal_mode = WAL");

export function initDatabase() {
  // 1. Admins Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
      otp_code TEXT,
      otp_expires_at DATETIME,
      status TEXT DEFAULT 'approved',
      approval_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate existing tables if they don't have these columns yet
  try {
    db.exec("ALTER TABLE admins ADD COLUMN email TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE admins ADD COLUMN otp_code TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE admins ADD COLUMN otp_expires_at DATETIME;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE admins ADD COLUMN status TEXT DEFAULT 'approved';");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE admins ADD COLUMN approval_token TEXT;");
  } catch (e) {}

  // 2. Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      specifications TEXT NOT NULL,
      price REAL NOT NULL,
      availability TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Product Images Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  // 4. Services Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      pricing TEXT NOT NULL,
      availability TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Service Images Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );
  `);

  // 6. Projects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client TEXT NOT NULL,
      location TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Project Images Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // 8. FAQs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Inquiries Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. Sessions Table for Bulletproof Cookie-Free Auth in Iframes
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      admin_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    );
  `);

  // Seed default admin if none exist
  const adminCheck = db.prepare("SELECT count(*) as count FROM admins").get() as { count: number };
  if (adminCheck.count === 0) {
    const defaultPasswordHash = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO admins (username, password_hash, email) VALUES (?, ?, ?)").run("admin", defaultPasswordHash, "luckycrownwebsite@gmail.com");
    console.log("Database Seed: Default admin created (admin / admin123) with email luckycrownwebsite@gmail.com");
  } else {
    // Backfill default admin or existing admin with empty email or old email
    db.prepare("UPDATE admins SET email = 'luckycrownwebsite@gmail.com' WHERE username = 'admin' AND (email IS NULL OR email = '' OR email = 'lawrencemagadia04@gmail.com')").run();
  }

  // Seed Products if none exist
  const productCheck = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
  if (productCheck.count === 0) {
    seedDefaultData();
    console.log("Database Seed: Standard corporate construction & furniture data injected");
  }
}

function seedDefaultData() {
  // Helper to insert and add mock image markers
  // Since we are using standard SVGs or placeholders in development when no real uploads have happened,
  // we will seed high-quality construction graphics placeholders.
  
  // SEED PRODUCTS
  const insertProduct = db.prepare(`
    INSERT INTO products (name, category, description, specifications, price, availability)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const insertProductImg = db.prepare(`
    INSERT INTO product_images (product_id, image_url)
    VALUES (?, ?)
  `);

  // Product 1: Modular Office Workstation
  let res = insertProduct.run(
    "ErgoSpace Modular Quad-Workstation",
    "Office & Residential Furniture",
    "Heavy-duty premium melamine finish modular face-to-face quad divider workstation desk perfect for call centers and standard corporate office floors.",
    "Dimensions: 2400mm x 1200mm x 750mm\nPartition High-Quality Acrylic with Aluminum Trim\nPass-through wire management pre-drilled grommets\nScratch-resistant 25mm thick table top",
    48500,
    "Order on Demand"
  );
  insertProductImg.run(Number(res.lastInsertRowid), "office_workstation");

  // Product 2: Ergonomic Boardroom Mesh Chair
  res = insertProduct.run(
    "AeroMesh High-Back Executive Chair",
    "Office & Residential Furniture",
    "Fully adjustable high-back ergonomic mesh chair with 3D armrests, dynamic lumbar support, and heavy-duty chrome base designed for extended boardroom comfort.",
    "Breathable premium fiber Korean mesh\nClass 4 heavy duty gas lift cylinder\nMulti-angle lock-tilt mechanism\nWarranty: 2 Years comprehensive structural warranty",
    8900,
    "In Stock"
  );
  insertProductImg.run(Number(res.lastInsertRowid), "exec_chair");

  // Product 3: Walnut Veneer Executive Desk
  res = insertProduct.run(
    "Verona Luxury Executive Writing Table",
    "Office & Residential Furniture",
    "Elegant walnut wood veneer office table featuring integrated side return drawers, premium brown leather writing pad overlay, and sophisticated drawer locks.",
    "Dimensions: 1800mm x 900mm x 760mm\nFinish: Premium Multi-layered Walnut Polish Veneer\nSide return console with 3-drawer lockable system\nBuilt-in 20W Qi Wireless charging pad on tabletop",
    32000,
    "In Stock"
  );
  insertProductImg.run(Number(res.lastInsertRowid), "walnut_desk");

  // Product 4: Accent Lounge Armchair
  res = insertProduct.run(
    "Chroma Accent Reception Armchair",
    "Office & Residential Furniture",
    "Classic single seater high-quality velvet-padded designer lounge chair with steel gold accent legs. Great for corporate lobbies and executive lounges.",
    "Fabric: High-grade Velvet Upholstery\nFrame: Solid Eucalyptus Wood Structure\nLegs: Rust-proof Titanium Gold Electroplated Metal\nLoad Capacity: Up to 150kg",
    12500,
    "In Stock"
  );
  insertProductImg.run(Number(res.lastInsertRowid), "lounge_chair");

  // SEED SERVICES
  const insertService = db.prepare(`
    INSERT INTO services (name, description, pricing, availability)
    VALUES (?, ?, ?, ?)
  `);
  
  const insertServiceImg = db.prepare(`
    INSERT INTO service_images (service_id, image_url)
    VALUES (?, ?)
  `);

  // Service 1: Fit Out Construction
  res = insertService.run(
    "Fit Out Construction & Refurbishment",
    "We provide turn-key fit-out solutions for commercial offices, retail outlets, banks, and premium residential spaces. From structural framing, partitions, drywall installations, dynamic acoustic ceilings, down to high-performance flooring finishes.",
    "Php 12,000 to Php 25,000 per sqm",
    "Active"
  );
  insertServiceImg.run(Number(res.lastInsertRowid), "fitout_service");

  // Service 2: Interior Design & Space Planning
  res = insertService.run(
    "Creative Interior Design & 3D Visualization",
    "Collaborative design consultation leveraging high-fidelity multi-angle 3D renders, physical color/finish boards, detail architectural draftings, and dynamic spatial zoning analyses to maximize and inspire productivity in your workplace or comfort in your home.",
    "Php 1,500 per sqm (Design Fees Only)",
    "Active"
  );
  insertServiceImg.run(Number(res.lastInsertRowid), "interior_service");

  // Service 3: General Construction
  res = insertService.run(
    "General Construction & Civil Works",
    "Full-scale structural building, concrete works, steel fabrication, roofing configurations, civil earthworks, plumbing/drainage systems, and complex electrical engineering installations for residential housings and commercial complexes.",
    "Custom Quote based on Bill of Quantities (BOQ)",
    "Active"
  );
  insertServiceImg.run(Number(res.lastInsertRowid), "general_service");

  // SEED PROJECTS
  const insertProject = db.prepare(`
    INSERT INTO projects (name, client, location, date, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertProjectImg = db.prepare(`
    INSERT INTO project_images (project_id, image_url)
    VALUES (?, ?)
  `);

  // Project 1
  res = insertProject.run(
    "InnovateHub Co-Working Environment",
    "Innovate Venture Group PH",
    "Ortigas Center, Pasig City",
    "2024-03-10",
    "Complete fit-out and furniture supply of a 450 sqm coworking workspace. Features integrated high-tech acoustic discussion pods, exposed raw polished concrete themes, customized ergonomic modular call center desks, and bright collaborative breakout pantries."
  );
  insertProjectImg.run(Number(res.lastInsertRowid), "project_coworking");

  // Project 2
  res = insertProject.run(
    "Minimalist Penthouse Sanctuary",
    "Private Residence",
    "Bonifacio Global City (BGC), Taguig",
    "2023-11-05",
    "Luxury high-rise interior design and customized bedroom furniture cabinetry. Handpicked natural oakwood paneling walls, dynamic hidden lighting recesses, high-end stone tile bathrooms, and sophisticated custom wardrobes matching local climate conditions."
  );
  insertProjectImg.run(Number(res.lastInsertRowid), "project_penthouse");

  // Project 3
  res = insertProject.run(
    "Apex Tech Corporate HQ",
    "Apex Global Tech Corporation",
    "Makati Central Business District",
    "2024-05-20",
    "Corporate headquarter fit-out for over 180 engineering staff. Features soundproof partition drywall sheets, full-floor carpet tile floorings, highly efficient cable tray layouts across all tables, custom premium boardroom finishes, and specialized secure server room configurations."
  );
  insertProjectImg.run(Number(res.lastInsertRowid), "project_corporate");

  // SEED FAQS
  const insertFAQ = db.prepare(`
    INSERT INTO faqs (question, answer)
    VALUES (?, ?)
  `);

  insertFAQ.run(
    "What services does Lucky Crown Construction supply?",
    "Lucky Crown specializes in: (1) Office and Commercial Fit-outs, (2) Architectural & Interior Space Design, (3) General Building Construction & Civil/Electrical Works, and (4) Customized Office and Home Furniture supplies."
  );
  insertFAQ.run(
    "Do you offer free estimates and initial site visits?",
    "Yes, we conduct free site visits and ocular inspections within Metro Manila. We then compile and present a detailed preliminary estimate and spatial proposal without initial fees."
  );
  insertFAQ.run(
    "How long does a typical office fit-out construction project take?",
    "A standard commercial fit-out space between 100 sqm to 300 sqm generally spans 30 to 45 calendar days. Timelines rely on approved design templates, materials procurement, and building permit clearances."
  );
  insertFAQ.run(
    "Do you customize furniture dimensions?",
    "Definitely. Our dedicated furniture division specializes in bespoke dimension sizing, custom color matching, high-pressure laminate selection, and unique layout designs tailored for office chairs, tables, storage systems, and residential cabinets."
  );
}

export default db;
