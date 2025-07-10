-- Initialize database schema for crypto banking platform

-- Cryptocurrency prices table
CREATE TABLE IF NOT EXISTS crypto_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coin_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    current_price REAL NOT NULL,
    market_cap REAL,
    volume_24h REAL,
    price_change_24h REAL,
    price_change_percentage_24h REAL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bank exchange rates table
CREATE TABLE IF NOT EXISTS bank_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_name TEXT NOT NULL,
    currency_pair TEXT NOT NULL,
    buy_rate REAL NOT NULL,
    sell_rate REAL NOT NULL,
    spread REAL NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash TEXT UNIQUE NOT NULL,
    blockchain TEXT NOT NULL,
    tx_type TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL,
    price_usd REAL NOT NULL,
    from_address TEXT,
    to_address TEXT,
    block_height INTEGER,
    confirmations INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scraper status and logs table
CREATE TABLE IF NOT EXISTS scraper_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scraper_name TEXT NOT NULL,
    scraper_type TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    records_processed INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_run DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Watched addresses for transaction monitoring
CREATE TABLE IF NOT EXISTS watched_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT UNIQUE NOT NULL,
    blockchain TEXT NOT NULL,
    label TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coin_id TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- 'above', 'below'
    target_price REAL NOT NULL,
    current_price REAL,
    is_triggered BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    triggered_at DATETIME
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON crypto_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_timestamp ON crypto_prices(last_updated);
CREATE INDEX IF NOT EXISTS idx_bank_rates_pair ON bank_rates(currency_pair);
CREATE INDEX IF NOT EXISTS idx_bank_rates_timestamp ON bank_rates(last_updated);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_scraper_logs_name ON scraper_logs(scraper_name);
CREATE INDEX IF NOT EXISTS idx_scraper_logs_timestamp ON scraper_logs(last_run);

-- Insert sample data for testing
INSERT OR IGNORE INTO watched_addresses (address, blockchain, label) VALUES
('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'bitcoin', 'Genesis Block Address'),
('0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', 'ethereum', 'Ethereum Foundation'),
('0x8894E0a0c962CB723c1976a4421c95949bE2D4E3', 'ethereum', 'Binance Hot Wallet');

-- Insert sample price alerts
INSERT OR IGNORE INTO price_alerts (coin_id, alert_type, target_price) VALUES
('bitcoin', 'above', 50000.00),
('ethereum', 'below', 2000.00),
('binancecoin', 'above', 400.00);
