CREATE TABLE IF NOT EXISTS channel_records (
  id TEXT PRIMARY KEY,
  bulan INTEGER NOT NULL,
  tahun INTEGER NOT NULL,
  channel TEXT NOT NULL,
  totalInteraksi REAL NOT NULL,
  responseTime REAL,
  aht REAL,
  scr REAL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS produk_records (
  id TEXT PRIMARY KEY,
  bulan INTEGER NOT NULL,
  tahun INTEGER NOT NULL,
  produk TEXT NOT NULL,
  totalInteraksi REAL NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
