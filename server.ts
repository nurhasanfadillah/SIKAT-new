import express from "express";
import path from "path";
import Database from "better-sqlite3";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const app = express();

app.use(express.json());

// Initialize SQLite Database
const db = new Database("local.db", { verbose: console.log });

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS app_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Viewer'
  );

  CREATE TABLE IF NOT EXISTS app_sessions (
    token TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transaksi_kas (
    id TEXT PRIMARY KEY,
    tanggal TEXT NOT NULL,
    jenis TEXT NOT NULL,
    sumber_dana TEXT,
    kategori TEXT,
    keterangan TEXT NOT NULL,
    nominal REAL NOT NULL,
    created_by TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transaksi_talang (
    id TEXT PRIMARY KEY,
    tanggal TEXT NOT NULL,
    akun_talang TEXT NOT NULL,
    akun_tujuan TEXT,
    unit TEXT,
    jenis TEXT NOT NULL,
    keterangan TEXT NOT NULL,
    nominal REAL NOT NULL,
    created_by TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );
`);

// Simple Helper User Session Context Resolution
async function getAuthContext(req: express.Request) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const session = db.prepare("SELECT * FROM app_sessions WHERE token = ?").get(token) as any;
  if (!session) return null;

  // Check Expiry (Sessions last for 30 Days)
  if (session.expiresAt < Date.now()) {
    db.prepare("DELETE FROM app_sessions WHERE token = ?").run(token);
    return null;
  }

  const user = db.prepare("SELECT * FROM app_users WHERE id = ?").get(session.userId) as any;
  if (!user) return null;

  return {
    session: { user: { id: user.id, email: user.email, name: user.name } },
    profile: {
      id: user.id,
      nama: user.name,
      email: user.email,
      role: user.role
    }
  };
}

// REST API Auths Endpoints

// Register custom endpoint
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, dan nama lengkap wajib diisi" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Format email tidak valid" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password minimal harus terdiri dari 6 karakter" });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({ error: "Nama lengkap harus memiliki panjang 2 hingga 100 karakter" });
    }

    const existing = db.prepare("SELECT * FROM app_users WHERE email = ?").get(normalizedEmail) as any;
    if (existing) {
      return res.status(400).json({ error: "Email ini sudah digunakan" });
    }

    const userId = "usr_" + Math.random().toString(36).substring(2, 11);
    const defaultRole = normalizedEmail === "nurhasanfadillah@gmail.com" ? "Super Admin" : "Viewer";

    db.prepare(`
      INSERT INTO app_users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, trimmedName, normalizedEmail, password, defaultRole);

    // Create session
    const token = "tok_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    db.prepare(`
      INSERT INTO app_sessions (token, userId, expiresAt)
      VALUES (?, ?, ?)
    `).run(token, userId, expiresAt);

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, name, email: normalizedEmail, role: defaultRole }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login custom endpoint
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.prepare("SELECT * FROM app_users WHERE email = ?").get(normalizedEmail) as any;
    if (!user || user.password !== password) {
      return res.status(400).json({ error: "Email atau password salah" });
    }

    // Create session
    const token = "tok_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    db.prepare(`
      INSERT INTO app_sessions (token, userId, expiresAt)
      VALUES (?, ?, ?)
    `).run(token, user.id, expiresAt);

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Logout custom endpoint
app.post("/api/auth/logout", (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token) {
      db.prepare("DELETE FROM app_sessions WHERE token = ?").run(token);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Active Session Profile
app.get("/api/user/profile", async (req, res) => {
  try {
    const context = await getAuthContext(req);
    if (!context) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json(context.profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get All User Profiles
app.get("/api/users", async (req, res) => {
  try {
    const context = await getAuthContext(req);
    if (!context) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const profiles = db.prepare("SELECT id, name as nama, email, role FROM app_users").all();
    res.json(profiles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Role (Super Admin only)
app.post("/api/users/role", async (req, res) => {
  try {
    const context = await getAuthContext(req);
    if (!context || context.profile.role !== "Super Admin") {
      return res.status(403).json({ error: "Hanya Super Admin yang dapat mengganti hak akses" });
    }
    const { userId, role } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "ID Pengguna wajib disertakan" });
    }
    if (!role || !["Super Admin", "Bendahara", "Viewer"].includes(role)) {
      return res.status(400).json({ error: "Role tidak valid" });
    }

    // Verify targeted user exists
    const targetUser = db.prepare("SELECT * FROM app_users WHERE id = ?").get(userId) as any;
    if (!targetUser) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    // Integrity constraint: Guard against last Super Admin self-demotion
    if (userId === context.profile.id && role !== "Super Admin") {
      const superAdminCount = db.prepare("SELECT count(*) as count FROM app_users WHERE role = 'Super Admin'").get() as any;
      if (superAdminCount.count <= 1) {
        return res.status(400).json({ error: "Tidak dapat mengubah role karena Anda adalah satu-satunya Super Admin tersisa di sistem" });
      }
    }

    db.prepare("UPDATE app_users SET role = ? WHERE id = ?").run(role, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Transactions (All transactions: Kas + Talang)
app.get("/api/transactions", async (req, res) => {
  try {
    const context = await getAuthContext(req);
    if (!context) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const kas = db.prepare("SELECT * FROM transaksi_kas ORDER BY tanggal DESC").all();
    const talang = db.prepare("SELECT * FROM transaksi_talang ORDER BY tanggal DESC").all();

    res.json({ kas, talang });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add Kas Transaction
app.post("/api/kas", async (req, res) => {
  try {
    const context = await getAuthContext(req);
    if (!context) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Role check: Only Bendahara or Super Admin can create transactions
    const isAuthorized = context.profile.role === "Bendahara" || context.profile.role === "Super Admin";
    if (!isAuthorized) {
      return res.status(403).json({ error: "Hanya Bendahara atau Super Admin yang dapat mencatat transaksi" });
    }

    const { tanggal, jenis, sumber_dana, kategori, keterangan, nominal } = req.body;

    // Validation: Check field presence and formatting
    if (!tanggal || typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
      return res.status(400).json({ error: "Tanggal transaksi tidak valid" });
    }

    if (!jenis || !["Pemasukan", "Pengeluaran"].includes(jenis)) {
      return res.status(400).json({ error: "Jenis transaksi harus 'Pemasukan' atau 'Pengeluaran'" });
    }

    const parsedNominal = Number(nominal);
    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      return res.status(400).json({ error: "Nominal transaksi harus berupa angka positif yang valid (lebih dari 0)" });
    }
    if (parsedNominal > 1000000000000) {
      return res.status(400).json({ error: "Nominal saldo transaksi terlalu besar (maksimal Rp 1 triliun)" });
    }

    const trimmedKeterangan = (keterangan || "").trim();
    if (!trimmedKeterangan) {
      return res.status(400).json({ error: "Keterangan/deskripsi wajib diisi" });
    }
    if (trimmedKeterangan.length > 500) {
      return res.status(400).json({ error: "Keterangan transaksi maksimal berisi 500 karakter" });
    }

    let normalizedSumberDana = null;
    let normalizedKategori = null;

    if (jenis === "Pemasukan") {
      const trimmedSumber = (sumber_dana || "").trim();
      if (!trimmedSumber) {
        return res.status(400).json({ error: "Sumber dana wajib diisi untuk transaksi Pemasukan" });
      }
      if (trimmedSumber.length > 100) {
        return res.status(400).json({ error: "Sumber dana maksimal 100 karakter" });
      }
      normalizedSumberDana = trimmedSumber;
    } else { // Pengeluaran
      const trimmedKategori = (kategori || "").trim();
      if (!trimmedKategori) {
        return res.status(400).json({ error: "Kategori wajib diisi untuk transaksi Pengeluaran" });
      }
      if (trimmedKategori.length > 100) {
        return res.status(400).json({ error: "Kategori Pengeluaran maksimal 100 karakter" });
      }
      normalizedKategori = trimmedKategori;
    }

    const id = "kas_" + Math.random().toString(36).substring(2, 11);
    const createdAt = Date.now();

    db.prepare(`
      INSERT INTO transaksi_kas (id, tanggal, jenis, sumber_dana, kategori, keterangan, nominal, created_by, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, tanggal, jenis, normalizedSumberDana, normalizedKategori, trimmedKeterangan, parsedNominal, context.profile.id, createdAt);

    res.status(201).json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add Talangan Transaction
app.post("/api/talang", async (req, res) => {
  try {
    const context = await getAuthContext(req);
    if (!context) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Role check: Only Bendahara or Super Admin
    const isAuthorized = context.profile.role === "Bendahara" || context.profile.role === "Super Admin";
    if (!isAuthorized) {
      return res.status(403).json({ error: "Hanya Bendahara atau Super Admin yang dapat mencatat transaksi talang" });
    }

    const { tanggal, jenis, akun_talang, akun_tujuan, unit, keterangan, nominal } = req.body;

    // Validation: Check field presence and formatting
    if (!tanggal || typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
      return res.status(400).json({ error: "Tanggal transaksi tidak valid" });
    }

    if (!jenis || !["Baru", "Pelunasan", "Transfer"].includes(jenis)) {
      return res.status(400).json({ error: "Jenis talangan tidak valid (harus Baru, Pelunasan, atau Transfer)" });
    }

    if (!akun_talang || !["Jisoi", "Rakka", "Shae"].includes(akun_talang)) {
      return res.status(400).json({ error: "Akun talang asal tidak valid (harus Jisoi, Rakka, atau Shae)" });
    }

    const parsedNominal = Number(nominal);
    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      return res.status(400).json({ error: "Nominal talangan harus berupa angka positif yang valid (lebih dari 0)" });
    }
    if (parsedNominal > 1000000000000) {
      return res.status(400).json({ error: "Nominal talangan terlalu besar (maksimal Rp 1 triliun)" });
    }

    const trimmedKeterangan = (keterangan || "").trim();
    if (!trimmedKeterangan) {
      return res.status(400).json({ error: "Keterangan/deskripsi wajib diisi" });
    }
    if (trimmedKeterangan.length > 500) {
      return res.status(400).json({ error: "Keterangan talangan maksimal berisi 500 karakter" });
    }

    let normalizedAkunTujuan = null;
    let normalizedUnit = null;

    if (jenis === "Transfer") {
      if (!akun_tujuan || !["Jisoi", "Rakka", "Shae"].includes(akun_tujuan)) {
        return res.status(400).json({ error: "Akun talang tujuan tidak valid untuk aksi Transfer" });
      }
      if (akun_talang === akun_tujuan) {
        return res.status(400).json({ error: "Akun asal dan tujuan tidak boleh sama" });
      }
      normalizedAkunTujuan = akun_tujuan;
    } else if (jenis === "Baru") {
      const trimmedUnit = (unit || "").trim();
      if (!trimmedUnit) {
        return res.status(400).json({ error: "Unit kerja terkait wajib diisi untuk pencatatan pinjaman talangan" });
      }
      if (trimmedUnit.length > 100) {
        return res.status(400).json({ error: "Unit terkait maksimal 100 karakter" });
      }
      normalizedUnit = trimmedUnit;
    }

    const id = "talang_" + Math.random().toString(36).substring(2, 11);
    const createdAt = Date.now();

    // Insert Talangan row
    db.prepare(`
      INSERT INTO transaksi_talang (id, tanggal, akun_talang, akun_tujuan, unit, jenis, keterangan, nominal, created_by, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, tanggal, akun_talang, normalizedAkunTujuan, normalizedUnit, jenis, trimmedKeterangan, parsedNominal, context.profile.id, createdAt);

    // If Pelunasan, automatically log an outgoing entry in Kas Sekolah
    if (jenis === "Pelunasan") {
      const kasId = "kas_" + Math.random().toString(36).substring(2, 11);
      db.prepare(`
        INSERT INTO transaksi_kas (id, tanggal, jenis, sumber_dana, kategori, keterangan, nominal, created_by, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        kasId,
        tanggal,
        "Pengeluaran",
        "-",
        "Pelunasan Dana Talang",
        `Pelunasan dana talang ${akun_talang} - ${trimmedKeterangan}`,
        parsedNominal,
        context.profile.id,
        createdAt
      );
    }

    res.status(201).json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Kas Transaction
app.put("/api/kas/:id", async (req, res) => {
  try {
    const context = await getAuthContext(req);
    if (!context) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isAuthorized = context.profile.role === "Bendahara" || context.profile.role === "Super Admin";
    if (!isAuthorized) {
      return res.status(403).json({ error: "Hanya Bendahara atau Super Admin yang dapat mengubah transaksi" });
    }

    const { id } = req.params;
    const existingKas = db.prepare("SELECT * FROM transaksi_kas WHERE id = ?").get(id) as any;
    if (!existingKas) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    const { tanggal, jenis, sumber_dana, kategori, keterangan, nominal } = req.body;

    if (!tanggal || typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
      return res.status(400).json({ error: "Tanggal transaksi tidak valid" });
    }

    if (!jenis || !["Pemasukan", "Pengeluaran"].includes(jenis)) {
      return res.status(400).json({ error: "Jenis transaksi harus 'Pemasukan' atau 'Pengeluaran'" });
    }

    const parsedNominal = Number(nominal);
    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      return res.status(400).json({ error: "Nominal transaksi harus berupa angka positif yang valid (lebih dari 0)" });
    }

    const trimmedKeterangan = (keterangan || "").trim();
    if (!trimmedKeterangan) {
      return res.status(400).json({ error: "Keterangan/deskripsi wajib diisi" });
    }

    let normalizedSumberDana = null;
    let normalizedKategori = null;

    if (jenis === "Pemasukan") {
      const trimmedSumber = (sumber_dana || "").trim();
      if (!trimmedSumber) {
        return res.status(400).json({ error: "Sumber dana wajib diisi untuk transaksi Pemasukan" });
      }
      normalizedSumberDana = trimmedSumber;
    } else {
      const trimmedKategori = (kategori || "").trim();
      if (!trimmedKategori) {
        return res.status(400).json({ error: "Kategori wajib diisi untuk transaksi Pengeluaran" });
      }
      normalizedKategori = trimmedKategori;
    }

    db.prepare(`
      UPDATE transaksi_kas
      SET tanggal = ?, jenis = ?, sumber_dana = ?, kategori = ?, keterangan = ?, nominal = ?
      WHERE id = ?
    `).run(tanggal, jenis, normalizedSumberDana, normalizedKategori, trimmedKeterangan, parsedNominal, id);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Kas Transaction
app.delete("/api/kas/:id", async (req, res) => {
  try {
    const context = await getAuthContext(req);
    if (!context) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isAuthorized = context.profile.role === "Bendahara" || context.profile.role === "Super Admin";
    if (!isAuthorized) {
      return res.status(403).json({ error: "Hanya Bendahara atau Super Admin yang dapat menghapus transaksi" });
    }

    const { id } = req.params;
    const existingKas = db.prepare("SELECT * FROM transaksi_kas WHERE id = ?").get(id) as any;
    if (!existingKas) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    db.prepare("DELETE FROM transaksi_kas WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Talangan Transaction
app.put("/api/talang/:id", async (req, res) => {
  try {
    const context = await getAuthContext(req);
    if (!context) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isAuthorized = context.profile.role === "Bendahara" || context.profile.role === "Super Admin";
    if (!isAuthorized) {
      return res.status(403).json({ error: "Hanya Bendahara atau Super Admin yang dapat mengubah data talang" });
    }

    const { id } = req.params;
    const existingTalang = db.prepare("SELECT * FROM transaksi_talang WHERE id = ?").get(id) as any;
    if (!existingTalang) {
      return res.status(404).json({ error: "Transaksi talang tidak ditemukan" });
    }

    const { tanggal, jenis, akun_talang, akun_tujuan, unit, keterangan, nominal } = req.body;

    if (!tanggal || typeof tanggal !== "string" || isNaN(Date.parse(tanggal))) {
      return res.status(400).json({ error: "Tanggal transaksi tidak valid" });
    }

    if (!jenis || !["Baru", "Pelunasan", "Transfer"].includes(jenis)) {
      return res.status(400).json({ error: "Jenis talangan tidak valid (harus Baru, Pelunasan, atau Transfer)" });
    }

    if (!akun_talang || !["Jisoi", "Rakka", "Shae"].includes(akun_talang)) {
      return res.status(400).json({ error: "Akun talang asal tidak valid (harus Jisoi, Rakka, atau Shae)" });
    }

    const parsedNominal = Number(nominal);
    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      return res.status(400).json({ error: "Nominal talangan harus berupa angka positif yang valid (lebih dari 0)" });
    }

    const trimmedKeterangan = (keterangan || "").trim();
    if (!trimmedKeterangan) {
      return res.status(400).json({ error: "Keterangan/deskripsi wajib diisi" });
    }

    let normalizedAkunTujuan = null;
    let normalizedUnit = null;

    if (jenis === "Transfer") {
      if (!akun_tujuan || !["Jisoi", "Rakka", "Shae"].includes(akun_tujuan)) {
        return res.status(400).json({ error: "Akun talang tujuan tidak valid untuk aksi Transfer" });
      }
      if (akun_talang === akun_tujuan) {
        return res.status(400).json({ error: "Akun asal dan tujuan tidak boleh sama" });
      }
      normalizedAkunTujuan = akun_tujuan;
    } else if (jenis === "Baru") {
      const trimmedUnit = (unit || "").trim();
      if (!trimmedUnit) {
        return res.status(400).json({ error: "Unit kerja terkait wajib diisi untuk pencatatan pinjaman talangan" });
      }
      normalizedUnit = trimmedUnit;
    }

    // Capture old state for matching automatic Pelunasan Kas update
    const oldJenis = existingTalang.jenis;
    const oldAkunTalang = existingTalang.akun_talang;
    const oldKeterangan = existingTalang.keterangan;
    const oldNominal = existingTalang.nominal;

    db.prepare(`
      UPDATE transaksi_talang
      SET tanggal = ?, akun_talang = ?, akun_tujuan = ?, unit = ?, jenis = ?, keterangan = ?, nominal = ?
      WHERE id = ?
    `).run(tanggal, akun_talang, normalizedAkunTujuan, normalizedUnit, jenis, trimmedKeterangan, parsedNominal, id);

    // If it was or is Pelunasan, we must synchronize with kas:
    const kasDescriptionPrefix = "Pelunasan dana talang";
    const oldDescription = `${kasDescriptionPrefix} ${oldAkunTalang} - ${oldKeterangan}`;

    if (oldJenis === "Pelunasan" && jenis !== "Pelunasan") {
      // Delete matching Kas entry
      db.prepare("DELETE FROM transaksi_kas WHERE kategori = 'Pelunasan Dana Talang' AND keterangan = ? AND nominal = ?").run(oldDescription, oldNominal);
    } else if (oldJenis !== "Pelunasan" && jenis === "Pelunasan") {
      // Create fresh Kas entry
      const kasId = "kas_" + Math.random().toString(36).substring(2, 11);
      db.prepare(`
        INSERT INTO transaksi_kas (id, tanggal, jenis, sumber_dana, kategori, keterangan, nominal, created_by, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        kasId,
        tanggal,
        "Pengeluaran",
        "-",
        "Pelunasan Dana Talang",
        `${kasDescriptionPrefix} ${akun_talang} - ${trimmedKeterangan}`,
        parsedNominal,
        context.profile.id,
        Date.now()
      );
    } else if (oldJenis === "Pelunasan" && jenis === "Pelunasan") {
      // Update existing matching Kas entry
      db.prepare(`
        UPDATE transaksi_kas
        SET tanggal = ?, keterangan = ?, nominal = ?
        WHERE kategori = 'Pelunasan Dana Talang' AND keterangan = ? AND nominal = ?
      `).run(
        tanggal,
        `${kasDescriptionPrefix} ${akun_talang} - ${trimmedKeterangan}`,
        parsedNominal,
        oldDescription,
        oldNominal
      );
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Talangan Transaction
app.delete("/api/talang/:id", async (req, res) => {
  try {
    const context = await getAuthContext(req);
    if (!context) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isAuthorized = context.profile.role === "Bendahara" || context.profile.role === "Super Admin";
    if (!isAuthorized) {
      return res.status(403).json({ error: "Hanya Bendahara atau Super Admin yang dapat menghapus data talang" });
    }

    const { id } = req.params;
    const existingTalang = db.prepare("SELECT * FROM transaksi_talang WHERE id = ?").get(id) as any;
    if (!existingTalang) {
      return res.status(404).json({ error: "Transaksi talang tidak ditemukan" });
    }

    // If Pelunasan, we delete its corresponding Kas entry too!
    if (existingTalang.jenis === "Pelunasan") {
      const matchDesc = `Pelunasan dana talang ${existingTalang.akun_talang} - ${existingTalang.keterangan}`;
      db.prepare("DELETE FROM transaksi_kas WHERE kategori = 'Pelunasan Dana Talang' AND keterangan = ? AND nominal = ?").run(matchDesc, existingTalang.nominal);
    }

    db.prepare("DELETE FROM transaksi_talang WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Seed Initial Admin User if not already present
function seedDefaultUser() {
  try {
    const existing = db.prepare("SELECT count(*) as count FROM app_users WHERE email = ?").get("nurhasanfadillah@gmail.com") as any;
    if (existing.count === 0) {
      console.log("Seeding default Super Admin user...");
      db.prepare(`
        INSERT INTO app_users (id, name, email, password, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        "usr_hasan",
        "Nurhasan Fadillah",
        "nurhasanfadillah@gmail.com",
        "password123",
        "Super Admin"
      );
      console.log("Successfully seeded Super Admin user profile in app_users!");
    }
  } catch (err) {
    console.warn("Seeding process resolved or already completed:", err);
  }
}

async function startServer() {
  // Run user seeding
  seedDefaultUser();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running on http://localhost:${PORT}`);
  });
}

startServer();
