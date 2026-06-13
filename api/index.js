// server.ts
import express from "express";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";
import { randomBytes } from "crypto";
dotenv.config();
var PORT = 3e3;
var { Pool, types } = pg;
types.setTypeParser(20, (val) => parseInt(val, 10));
var connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL environment variable is required");
async function initDatabase(pool) {
  console.log("Initializing PostgreSQL Tables...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Viewer'
    );

    CREATE TABLE IF NOT EXISTS app_sessions (
      token TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "expiresAt" BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transaksi_kas (
      id TEXT PRIMARY KEY,
      tanggal TEXT NOT NULL,
      jenis TEXT NOT NULL,
      sumber_dana TEXT,
      kategori TEXT,
      keterangan TEXT NOT NULL,
      nominal DOUBLE PRECISION NOT NULL,
      created_by TEXT NOT NULL,
      "createdAt" BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transaksi_talang (
      id TEXT PRIMARY KEY,
      tanggal TEXT NOT NULL,
      akun_talang TEXT NOT NULL,
      akun_tujuan TEXT,
      unit TEXT,
      jenis TEXT NOT NULL,
      keterangan TEXT NOT NULL,
      nominal DOUBLE PRECISION NOT NULL,
      created_by TEXT NOT NULL,
      "createdAt" BIGINT NOT NULL
    );
  `);
  console.log("PostgreSQL Tables verified/created!");
}
async function seedDefaultUser(pool) {
  try {
    const existingRes = await pool.query("SELECT count(*) as count FROM app_users WHERE email = $1", ["nurhasanfadillah@gmail.com"]);
    const existing = existingRes.rows[0];
    const countInteger = parseInt(existing.count || "0", 10);
    if (countInteger === 0) {
      console.log("Seeding default Super Admin user...");
      await pool.query(`
        INSERT INTO app_users (id, name, email, password, role)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        "usr_hasan",
        "Nurhasan Fadillah",
        "nurhasanfadillah@gmail.com",
        "password123",
        "Super Admin"
      ]);
      console.log("Successfully seeded Super Admin user profile in app_users!");
    }
  } catch (err) {
    console.warn("Seeding process resolved or already completed:", err);
  }
}
function createApp() {
  const app2 = express();
  app2.use(express.json());
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  async function getAuthContext(req) {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return null;
    const sessionRes = await pool.query("SELECT * FROM app_sessions WHERE token = $1", [token]);
    const session = sessionRes.rows[0];
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      await pool.query("DELETE FROM app_sessions WHERE token = $1", [token]);
      return null;
    }
    const userRes = await pool.query("SELECT * FROM app_users WHERE id = $1", [session.userId]);
    const user = userRes.rows[0];
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
  async function getSimulatedBalances(newTx) {
    const balances = { Jisoi: 0, Rakka: 0, Shae: 0 };
    const res = await pool.query("SELECT * FROM transaksi_talang");
    const transactions = res.rows;
    const allTxs = transactions.filter((t) => t.id !== newTx.id);
    allTxs.push({
      jenis: newTx.jenis,
      akun_talang: newTx.akun_talang,
      akun_tujuan: newTx.akun_tujuan || null,
      nominal: newTx.nominal
    });
    for (const t of allTxs) {
      if (t.jenis === "Baru") {
        balances[t.akun_talang] = (balances[t.akun_talang] || 0) + t.nominal;
      } else if (t.jenis === "Pelunasan") {
        balances[t.akun_talang] = (balances[t.akun_talang] || 0) - t.nominal;
      } else if (t.jenis === "Transfer") {
        balances[t.akun_talang] = (balances[t.akun_talang] || 0) - t.nominal;
        if (t.akun_tujuan) {
          balances[t.akun_tujuan] = (balances[t.akun_tujuan] || 0) + t.nominal;
        }
      }
    }
    return balances;
  }
  app2.post("/api/auth/register", async (req, res) => {
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
      const existingRes = await pool.query("SELECT * FROM app_users WHERE email = $1", [normalizedEmail]);
      const existing = existingRes.rows[0];
      if (existing) {
        return res.status(400).json({ error: "Email ini sudah digunakan" });
      }
      const userId = "usr_" + randomBytes(6).toString("hex");
      const defaultRole = normalizedEmail === "nurhasanfadillah@gmail.com" ? "Super Admin" : "Viewer";
      await pool.query(`
        INSERT INTO app_users (id, name, email, password, role)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, trimmedName, normalizedEmail, password, defaultRole]);
      const token = "tok_" + randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1e3;
      await pool.query(`
        INSERT INTO app_sessions (token, "userId", "expiresAt")
        VALUES ($1, $2, $3)
      `, [token, userId, expiresAt]);
      res.status(201).json({
        success: true,
        token,
        user: { id: userId, name, email: normalizedEmail, role: defaultRole }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email dan password wajib diisi" });
      }
      const normalizedEmail = email.toLowerCase().trim();
      const userRes = await pool.query("SELECT * FROM app_users WHERE email = $1", [normalizedEmail]);
      const user = userRes.rows[0];
      if (!user || user.password !== password) {
        return res.status(400).json({ error: "Email atau password salah" });
      }
      const token = "tok_" + randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1e3;
      await pool.query(`
        INSERT INTO app_sessions (token, "userId", "expiresAt")
        VALUES ($1, $2, $3)
      `, [token, user.id, expiresAt]);
      res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers["authorization"] || "";
      const token = authHeader.replace(/^Bearer\s+/i, "");
      if (token) {
        await pool.query("DELETE FROM app_sessions WHERE token = $1", [token]);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/user/profile", async (req, res) => {
    try {
      const context = await getAuthContext(req);
      if (!context) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      res.json(context.profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const context = await getAuthContext(req);
      if (!context) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const profilesRes = await pool.query('SELECT id, name as "nama", email, role FROM app_users');
      const profiles = profilesRes.rows;
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/users/role", async (req, res) => {
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
      const targetUserRes = await pool.query("SELECT * FROM app_users WHERE id = $1", [userId]);
      const targetUser = targetUserRes.rows[0];
      if (!targetUser) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan" });
      }
      if (userId === context.profile.id && role !== "Super Admin") {
        const superAdminCountRes = await pool.query("SELECT count(*) as count FROM app_users WHERE role = 'Super Admin'");
        const superAdminCount = superAdminCountRes.rows[0];
        const countInteger = parseInt(superAdminCount.count || "0", 10);
        if (countInteger <= 1) {
          return res.status(400).json({ error: "Tidak dapat mengubah role karena Anda adalah satu-satunya Super Admin tersisa di sistem" });
        }
      }
      await pool.query("UPDATE app_users SET role = $1 WHERE id = $2", [role, userId]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/transactions", async (req, res) => {
    try {
      const context = await getAuthContext(req);
      if (!context) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const kasRes = await pool.query("SELECT * FROM transaksi_kas ORDER BY tanggal DESC");
      const talangRes = await pool.query("SELECT * FROM transaksi_talang ORDER BY tanggal DESC");
      res.json({ kas: kasRes.rows, talang: talangRes.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/kas", async (req, res) => {
    try {
      const context = await getAuthContext(req);
      if (!context) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const isAuthorized = context.profile.role === "Bendahara" || context.profile.role === "Super Admin";
      if (!isAuthorized) {
        return res.status(403).json({ error: "Hanya Bendahara atau Super Admin yang dapat mencatat transaksi" });
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
      if (parsedNominal > 1e12) {
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
      } else {
        const trimmedKategori = (kategori || "").trim();
        if (!trimmedKategori) {
          return res.status(400).json({ error: "Kategori wajib diisi untuk transaksi Pengeluaran" });
        }
        if (trimmedKategori.length > 100) {
          return res.status(400).json({ error: "Kategori Pengeluaran maksimal 100 karakter" });
        }
        normalizedKategori = trimmedKategori;
      }
      const id = "kas_" + randomBytes(6).toString("hex");
      const createdAt = Date.now();
      await pool.query(`
        INSERT INTO transaksi_kas (id, tanggal, jenis, sumber_dana, kategori, keterangan, nominal, created_by, "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [id, tanggal, jenis, normalizedSumberDana, normalizedKategori, trimmedKeterangan, parsedNominal, context.profile.id, createdAt]);
      res.status(201).json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/talang", async (req, res) => {
    try {
      const context = await getAuthContext(req);
      if (!context) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const isAuthorized = context.profile.role === "Bendahara" || context.profile.role === "Super Admin";
      if (!isAuthorized) {
        return res.status(403).json({ error: "Hanya Bendahara atau Super Admin yang dapat mencatat transaksi talang" });
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
      if (parsedNominal > 1e12) {
        return res.status(400).json({ error: "Nominal talangan terlalu besar (maksimal Rp 1 triliun)" });
      }
      if (jenis === "Pelunasan") {
        const kasRes = await pool.query("SELECT jenis, nominal FROM transaksi_kas");
        const currentKasBalance = kasRes.rows.reduce((acc, curr) => {
          return curr.jenis === "Pemasukan" ? acc + curr.nominal : acc - curr.nominal;
        }, 0);
        if (parsedNominal > currentKasBalance) {
          return res.status(400).json({
            error: `Transaksi ditolak karena nominal pelunasan (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(parsedNominal)}) melebihi saldo kas sekolah yang ada (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(currentKasBalance)})!`
          });
        }
      }
      const simulated = await getSimulatedBalances({
        jenis,
        akun_talang,
        akun_tujuan,
        nominal: parsedNominal
      });
      for (const [acc, bal] of Object.entries(simulated)) {
        if (bal < 0) {
          return res.status(400).json({
            error: `Transaksi ditolak karena akan menyebabkan sisa dana talangan akun ${acc} menjadi negatif (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(bal)})!`
          });
        }
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
      const id = "talang_" + randomBytes(6).toString("hex");
      const createdAt = Date.now();
      await pool.query(`
        INSERT INTO transaksi_talang (id, tanggal, akun_talang, akun_tujuan, unit, jenis, keterangan, nominal, created_by, "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [id, tanggal, akun_talang, normalizedAkunTujuan, normalizedUnit, jenis, trimmedKeterangan, parsedNominal, context.profile.id, createdAt]);
      if (jenis === "Pelunasan") {
        const kasId = "kas_" + randomBytes(6).toString("hex");
        await pool.query(`
          INSERT INTO transaksi_kas (id, tanggal, jenis, sumber_dana, kategori, keterangan, nominal, created_by, "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          kasId,
          tanggal,
          "Pengeluaran",
          "-",
          "Pelunasan Dana Talang",
          `Pelunasan dana talang ${akun_talang} - ${trimmedKeterangan}`,
          parsedNominal,
          context.profile.id,
          createdAt
        ]);
      }
      res.status(201).json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/kas/:id", async (req, res) => {
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
      const existingKasRes = await pool.query("SELECT * FROM transaksi_kas WHERE id = $1", [id]);
      const existingKas = existingKasRes.rows[0];
      if (!existingKas) {
        return res.status(404).json({ error: "Transaksi tidak ditemukan" });
      }
      if (existingKas.kategori === "Pelunasan Dana Talang") {
        return res.status(400).json({ error: "Transaksi pelunasan dana talang tidak boleh diedit di halaman kas sekolah. Silakan edit dari halaman Dana Talang." });
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
      await pool.query(`
        UPDATE transaksi_kas
        SET tanggal = $1, jenis = $2, sumber_dana = $3, kategori = $4, keterangan = $5, nominal = $6
        WHERE id = $7
      `, [tanggal, jenis, normalizedSumberDana, normalizedKategori, trimmedKeterangan, parsedNominal, id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/kas/:id", async (req, res) => {
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
      const existingKasRes = await pool.query("SELECT * FROM transaksi_kas WHERE id = $1", [id]);
      const existingKas = existingKasRes.rows[0];
      if (!existingKas) {
        return res.status(404).json({ error: "Transaksi tidak ditemukan" });
      }
      if (existingKas.kategori === "Pelunasan Dana Talang") {
        return res.status(400).json({ error: "Transaksi pelunasan dana talang tidak boleh dihapus di halaman kas sekolah. Silakan hapus dari halaman Dana Talang." });
      }
      await pool.query("DELETE FROM transaksi_kas WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/talang/:id", async (req, res) => {
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
      const existingTalangRes = await pool.query("SELECT * FROM transaksi_talang WHERE id = $1", [id]);
      const existingTalang = existingTalangRes.rows[0];
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
      if (jenis === "Pelunasan") {
        const kasRes = await pool.query("SELECT jenis, nominal FROM transaksi_kas");
        const currentKasBalance = kasRes.rows.reduce((acc, curr) => {
          return curr.jenis === "Pemasukan" ? acc + curr.nominal : acc - curr.nominal;
        }, 0);
        const refNominal = existingTalang.jenis === "Pelunasan" ? existingTalang.nominal : 0;
        const simulatedKasBalance = currentKasBalance + refNominal - parsedNominal;
        if (simulatedKasBalance < 0) {
          return res.status(400).json({
            error: `Perubahan ditolak karena nominal pelunasan (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(parsedNominal)}) melebihi saldo kas sekolah yang ada (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(currentKasBalance + refNominal)})!`
          });
        }
      }
      const simulated = await getSimulatedBalances({
        id,
        jenis,
        akun_talang,
        akun_tujuan,
        nominal: parsedNominal
      });
      for (const [acc, bal] of Object.entries(simulated)) {
        if (bal < 0) {
          return res.status(400).json({
            error: `Perubahan ditolak karena akan menyebabkan sisa dana talangan akun ${acc} menjadi negatif (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(bal)})!`
          });
        }
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
      const oldJenis = existingTalang.jenis;
      const oldAkunTalang = existingTalang.akun_talang;
      const oldKeterangan = existingTalang.keterangan;
      const oldNominal = existingTalang.nominal;
      await pool.query(`
        UPDATE transaksi_talang
        SET tanggal = $1, akun_talang = $2, akun_tujuan = $3, unit = $4, jenis = $5, keterangan = $6, nominal = $7
        WHERE id = $8
      `, [tanggal, akun_talang, normalizedAkunTujuan, normalizedUnit, jenis, trimmedKeterangan, parsedNominal, id]);
      const kasDescriptionPrefix = "Pelunasan dana talang";
      const oldDescription = `${kasDescriptionPrefix} ${oldAkunTalang} - ${oldKeterangan}`;
      if (oldJenis === "Pelunasan" && jenis !== "Pelunasan") {
        await pool.query("DELETE FROM transaksi_kas WHERE kategori = 'Pelunasan Dana Talang' AND keterangan = $1 AND nominal = $2", [oldDescription, oldNominal]);
      } else if (oldJenis !== "Pelunasan" && jenis === "Pelunasan") {
        const kasId = "kas_" + randomBytes(6).toString("hex");
        await pool.query(`
          INSERT INTO transaksi_kas (id, tanggal, jenis, sumber_dana, kategori, keterangan, nominal, created_by, "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          kasId,
          tanggal,
          "Pengeluaran",
          "-",
          "Pelunasan Dana Talang",
          `${kasDescriptionPrefix} ${akun_talang} - ${trimmedKeterangan}`,
          parsedNominal,
          context.profile.id,
          Date.now()
        ]);
      } else if (oldJenis === "Pelunasan" && jenis === "Pelunasan") {
        await pool.query(`
          UPDATE transaksi_kas
          SET tanggal = $1, keterangan = $2, nominal = $3
          WHERE kategori = 'Pelunasan Dana Talang' AND keterangan = $4 AND nominal = $5
        `, [
          tanggal,
          `${kasDescriptionPrefix} ${akun_talang} - ${trimmedKeterangan}`,
          parsedNominal,
          oldDescription,
          oldNominal
        ]);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/talang/:id", async (req, res) => {
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
      const existingTalangRes = await pool.query("SELECT * FROM transaksi_talang WHERE id = $1", [id]);
      const existingTalang = existingTalangRes.rows[0];
      if (!existingTalang) {
        return res.status(404).json({ error: "Transaksi talang tidak ditemukan" });
      }
      if (existingTalang.jenis === "Pelunasan") {
        const matchDesc = `Pelunasan dana talang ${existingTalang.akun_talang} - ${existingTalang.keterangan}`;
        await pool.query("DELETE FROM transaksi_kas WHERE kategori = 'Pelunasan Dana Talang' AND keterangan = $1 AND nominal = $2", [matchDesc, existingTalang.nominal]);
      }
      await pool.query("DELETE FROM transaksi_talang WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  return { app: app2, pool };
}
async function startServer() {
  const { app: app2, pool } = createApp();
  await initDatabase(pool);
  await seedDefaultUser(pool);
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app2.use(express.static(distPath));
    app2.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app2.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully running on http://localhost:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}

// api-handler.ts
var app = null;
async function getApp() {
  if (app) return app;
  const { app: expressApp, pool } = createApp();
  await initDatabase(pool);
  await seedDefaultUser(pool);
  app = expressApp;
  return app;
}
var api_handler_default = async (req, res) => {
  try {
    const handler = await getApp();
    handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message || "Server initialization failed" });
  }
};
export {
  api_handler_default as default
};
