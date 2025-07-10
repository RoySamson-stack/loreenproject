import requests
import json
import time
import sqlite3
from datetime import datetime
import random

class BankRateScraper:
    def __init__(self):
        self.db_path = "banking_data.db"
        self.init_database()
        
        # Mock bank APIs - replace with real bank API endpoints
        self.bank_apis = {
            "JPMorgan Chase": "https://api.chase.com/rates",  # Mock URL
            "Bank of America": "https://api.bankofamerica.com/rates",  # Mock URL
            "Wells Fargo": "https://api.wellsfargo.com/rates",  # Mock URL
            "Citibank": "https://api.citi.com/rates",  # Mock URL
            "HSBC": "https://api.hsbc.com/rates",  # Mock URL
            "TD Bank": "https://api.td.com/rates"  # Mock URL
        }
        
        self.currency_pairs = [
            "USD/EUR", "USD/GBP", "USD/JPY", "USD/CAD", 
            "USD/AUD", "USD/CHF", "EUR/GBP", "GBP/JPY"
        ]
    
    def init_database(self):
        """Initialize SQLite database for storing bank rate data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bank_rates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bank_name TEXT,
                currency_pair TEXT,
                buy_rate REAL,
                sell_rate REAL,
                spread REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rate_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bank_name TEXT,
                currency_pair TEXT,
                rate REAL,
                rate_type TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def fetch_exchange_rates_api(self):
        """Fetch real exchange rates from a free API as base rates"""
        try:
            # Using exchangerate-api.com (free tier)
            url = "https://api.exchangerate-api.com/v4/latest/USD"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return data['rates']
        
        except requests.exceptions.RequestException as e:
            self.log_error(f"Exchange rate API request failed: {str(e)}")
            return None
    
    def generate_bank_rates(self, base_rates):
        """Generate mock bank rates based on real exchange rates"""
        if not base_rates:
            return []
        
        bank_rates = []
        
        for bank_name in self.bank_apis.keys():
            for pair in self.currency_pairs:
                try:
                    base_currency, quote_currency = pair.split('/')
                    
                    if quote_currency in base_rates:
                        base_rate = base_rates[quote_currency]
                        
                        # Add bank spread (typically 1-3%)
                        spread_percentage = random.uniform(0.01, 0.03)
                        spread_amount = base_rate * spread_percentage
                        
                        buy_rate = base_rate + (spread_amount / 2)
                        sell_rate = base_rate - (spread_amount / 2)
                        
                        # Add some random variation
                        variation = random.uniform(-0.001, 0.001)
                        buy_rate += variation
                        sell_rate += variation
                        
                        bank_rates.append({
                            'bank_name': bank_name,
                            'currency_pair': pair,
                            'buy_rate': round(buy_rate, 4),
                            'sell_rate': round(sell_rate, 4),
                            'spread': round(abs(buy_rate - sell_rate), 4)
                        })
                
                except (ValueError, KeyError) as e:
                    self.log_error(f"Error processing {pair} for {bank_name}: {str(e)}")
                    continue
        
        return bank_rates
    
    def save_to_database(self, bank_rates):
        """Save bank rate data to SQLite database"""
        if not bank_rates:
            return False
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for rate in bank_rates:
                # Save current rates
                cursor.execute('''
                    INSERT INTO bank_rates 
                    (bank_name, currency_pair, buy_rate, sell_rate, spread)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    rate['bank_name'],
                    rate['currency_pair'],
                    rate['buy_rate'],
                    rate['sell_rate'],
                    rate['spread']
                ))
                
                # Save to history for buy rate
                cursor.execute('''
                    INSERT INTO rate_history 
                    (bank_name, currency_pair, rate, rate_type)
                    VALUES (?, ?, ?, ?)
                ''', (
                    rate['bank_name'],
                    rate['currency_pair'],
                    rate['buy_rate'],
                    'buy'
                ))
                
                # Save to history for sell rate
                cursor.execute('''
                    INSERT INTO rate_history 
                    (bank_name, currency_pair, rate, rate_type)
                    VALUES (?, ?, ?, ?)
                ''', (
                    rate['bank_name'],
                    rate['currency_pair'],
                    rate['sell_rate'],
                    'sell'
                ))
            
            conn.commit()
            conn.close()
            
            self.log_success(f"Saved {len(bank_rates)} bank rate records to database")
            return True
            
        except sqlite3.Error as e:
            self.log_error(f"Database error: {str(e)}")
            return False
    
    def log_success(self, message):
        """Log successful operations"""
        print(f"[SUCCESS] {datetime.now()}: {message}")
    
    def log_error(self, message):
        """Log error messages"""
        print(f"[ERROR] {datetime.now()}: {message}")
    
    def run_scraper(self, interval=600):
        """Run the bank rate scraper continuously with specified interval (seconds)"""
        print(f"Starting bank rate scraper with {interval}s interval...")
        
        while True:
            try:
                print(f"\n[INFO] {datetime.now()}: Fetching bank rates...")
                
                # Fetch base exchange rates
                base_rates = self.fetch_exchange_rates_api()
                
                if base_rates:
                    # Generate bank-specific rates
                    bank_rates = self.generate_bank_rates(base_rates)
                    
                    if bank_rates:
                        # Save to database
                        success = self.save_to_database(bank_rates)
                        
                        if success:
                            print(f"[INFO] Successfully processed {len(bank_rates)} bank rates")
                        else:
                            print("[ERROR] Failed to save bank rates to database")
                    else:
                        print("[ERROR] Failed to generate bank rates")
                else:
                    print("[ERROR] Failed to fetch base exchange rates")
                
                # Wait for next iteration
                print(f"[INFO] Waiting {interval} seconds until next scrape...")
                time.sleep(interval)
                
            except KeyboardInterrupt:
                print("\n[INFO] Bank rate scraper stopped by user")
                break
            except Exception as e:
                self.log_error(f"Unexpected error: {str(e)}")
                print(f"[ERROR] Unexpected error: {str(e)}")
                time.sleep(60)  # Wait 1 minute before retrying
    
    def get_latest_rates(self, limit=10):
        """Get latest bank rates from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT bank_name, currency_pair, buy_rate, sell_rate, spread, timestamp
                FROM bank_rates 
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
    """Main function to run the bank rate scraper"""
    scraper = BankRateScraper()
    
    # Run a single scrape for testing
    print("Running single scrape test...")
    base_rates = scraper.fetch_exchange_rates_api()
    
    if base_rates:
        bank_rates = scraper.generate_bank_rates(base_rates)
        scraper.save_to_database(bank_rates)
        print(f"Test completed successfully! Generated {len(bank_rates)} bank rates.")
        
        # Display latest data
        latest_rates = scraper.get_latest_rates(5)
        print("\nLatest 5 bank rates:")
        for rate in latest_rates:
            print(f"  {rate[0]} - {rate[1]}: Buy {rate[2]:.4f}, Sell {rate[3]:.4f}")
    else:
        print("Test failed - could not fetch base exchange rates")
    
    # Uncomment the line below to run continuous scraping
    # scraper.run_scraper(interval=600)  # Scrape every 10 minutes

if __name__ == "__main__":
    main()
