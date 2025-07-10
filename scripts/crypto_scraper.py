import requests
import json
import time
import sqlite3
from datetime import datetime
import os

class CryptoScraper:
    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
        self.db_path = "crypto_data.db"
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database for storing crypto data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS crypto_prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                coin_id TEXT,
                symbol TEXT,
                name TEXT,
                current_price REAL,
                market_cap REAL,
                volume_24h REAL,
                price_change_24h REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scraper_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scraper_name TEXT,
                status TEXT,
                message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def fetch_crypto_data(self, coins="bitcoin,ethereum,binancecoin,solana,cardano,avalanche-2"):
        """Fetch cryptocurrency data from CoinGecko API"""
        try:
            url = f"{self.base_url}/coins/markets"
            params = {
                'vs_currency': 'usd',
                'ids': coins,
                'order': 'market_cap_desc',
                'per_page': 100,
                'page': 1,
                'sparkline': False
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            return response.json()
        
        except requests.exceptions.RequestException as e:
            self.log_error(f"API request failed: {str(e)}")
            return None
        except json.JSONDecodeError as e:
            self.log_error(f"JSON decode error: {str(e)}")
            return None
    
    def save_to_database(self, crypto_data):
        """Save cryptocurrency data to SQLite database"""
        if not crypto_data:
            return False
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for coin in crypto_data:
                cursor.execute('''
                    INSERT INTO crypto_prices 
                    (coin_id, symbol, name, current_price, market_cap, volume_24h, price_change_24h)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    coin['id'],
                    coin['symbol'],
                    coin['name'],
                    coin['current_price'],
                    coin['market_cap'],
                    coin['total_volume'],
                    coin['price_change_percentage_24h']
                ))
            
            conn.commit()
            conn.close()
            
            self.log_success(f"Saved {len(crypto_data)} crypto records to database")
            return True
            
        except sqlite3.Error as e:
            self.log_error(f"Database error: {str(e)}")
            return False
    
    def log_success(self, message):
        """Log successful operations"""
        self.log_to_database("crypto_scraper", "success", message)
        print(f"[SUCCESS] {datetime.now()}: {message}")
    
    def log_error(self, message):
        """Log error messages"""
        self.log_to_database("crypto_scraper", "error", message)
        print(f"[ERROR] {datetime.now()}: {message}")
    
    def log_to_database(self, scraper_name, status, message):
        """Log scraper activity to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO scraper_logs (scraper_name, status, message)
                VALUES (?, ?, ?)
            ''', (scraper_name, status, message))
            
            conn.commit()
            conn.close()
        except sqlite3.Error:
            pass  # Avoid infinite recursion if logging fails
    
    def run_scraper(self, interval=300):
        """Run the scraper continuously with specified interval (seconds)"""
        print(f"Starting crypto scraper with {interval}s interval...")
        
        while True:
            try:
                print(f"\n[INFO] {datetime.now()}: Fetching crypto data...")
                
                # Fetch data from API
                crypto_data = self.fetch_crypto_data()
                
                if crypto_data:
                    # Save to database
                    success = self.save_to_database(crypto_data)
                    
                    if success:
                        print(f"[INFO] Successfully processed {len(crypto_data)} cryptocurrencies")
                    else:
                        print("[ERROR] Failed to save data to database")
                else:
                    print("[ERROR] Failed to fetch crypto data")
                
                # Wait for next iteration
                print(f"[INFO] Waiting {interval} seconds until next scrape...")
                time.sleep(interval)
                
            except KeyboardInterrupt:
                print("\n[INFO] Scraper stopped by user")
                break
            except Exception as e:
                self.log_error(f"Unexpected error: {str(e)}")
                print(f"[ERROR] Unexpected error: {str(e)}")
                time.sleep(60)  # Wait 1 minute before retrying
    
    def get_latest_data(self, limit=10):
        """Get latest cryptocurrency data from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT coin_id, symbol, name, current_price, market_cap, 
                       volume_24h, price_change_24h, timestamp
                FROM crypto_prices 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (limit,))
            
            results = cursor.fetchall()
            conn.close()
            
            return results
        except sqlite3.Error as e:
            self.log_error(f"Database query error: {str(e)}")
            return []

def main():
    """Main function to run the crypto scraper"""
    scraper = CryptoScraper()
    
    # Run a single scrape for testing
    print("Running single scrape test...")
    crypto_data = scraper.fetch_crypto_data()
    
    if crypto_data:
        scraper.save_to_database(crypto_data)
        print(f"Test completed successfully! Scraped {len(crypto_data)} coins.")
        
        # Display latest data
        latest_data = scraper.get_latest_data(5)
        print("\nLatest 5 records:")
        for record in latest_data:
            print(f"  {record[2]} ({record[1].upper()}): ${record[3]:.2f}")
    else:
        print("Test failed - could not fetch crypto data")
    
    # Uncomment the line below to run continuous scraping
    # scraper.run_scraper(interval=300)  # Scrape every 5 minutes

if __name__ == "__main__":
    main()
