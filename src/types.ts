export type Role = 'Super Admin' | 'Bendahara' | 'Viewer';

export interface UserProfile {
  id?: string;
  nama: string;
  email: string;
  role: Role;
}

export type JenisKas = 'Pemasukan' | 'Pengeluaran';

export interface TransaksiKas {
  id?: string;
  tanggal: string;
  jenis: JenisKas;
  sumber_dana?: string;
  kategori?: string;
  keterangan: string;
  nominal: number;
  lampiran?: string;
  created_by: string;
  createdAt?: number;
}

export type AkunTalang = 'Jisoi' | 'Rakka' | 'Shae';
export type JenisTalang = 'Baru' | 'Pelunasan' | 'Transfer';

export interface TransaksiTalang {
  id?: string;
  tanggal: string;
  akun_talang: AkunTalang;
  akun_tujuan?: AkunTalang;
  unit?: string;
  jenis: JenisTalang;
  keterangan: string;
  nominal: number;
  created_by: string;
  createdAt?: number;
}

export interface AuditLog {
  id?: string;
  user_id: string;
  aktivitas: string;
  tabel?: string;
  data_lama?: string;
  data_baru?: string;
  waktu: string;
}
