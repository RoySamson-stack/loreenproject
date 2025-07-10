import requests
import json
import time
import sqlite3
from datetime import datetime
import random
import hashlib

class TransactionMonitor:
    def __init__(self):
        self.db_path = "transaction_data.db"
        self.init_database()
        
        # Bitcoin and Ethereum API endpoints
        self.bitcoin_api = "https://blockstream.info/api"
        self.ethereum_api = "https://api.etherscan.io/api"
        
        # Mock API key - replace with real Etherscan API key
        self.etherscan_api_key = "YourEtherscanAPIKey"
    
    def init_database(self):
        """Initialize SQLite database for storing transaction data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tx_hash TEXT UNIQUE,
                blockchain TEXT,
                tx_type TEXT,
                amount REAL,
                currency TEXT,
                price_usd REAL,
                from_address TEXT,
                to_address TEXT,
                block_height INTEGER,
                confirmations INTEGER,
                status TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS address_watch (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                address TEXT UNIQUE,
                blockchain TEXT,
                label TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def fetch_bitcoin_transactions(self, limit=10):
        """Fetch recent Bitcoin transactions"""
        try:
            # Get recent blocks
            url = f"{self.bitcoin_api}/blocks"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            blocks = response.json()
            transactions = []
            
            # Get transactions from the latest block
            if blocks:
                latest_block = blocks[0]['id']
                tx_url = f"{self.bitcoin_api}/block/{latest_block}/txs"
                tx_response = requests.get(tx_url, timeout=30)
                tx_response.raise_for_status()
                
                block_txs = tx_response.json()
                
                for tx in block_txs[:limit]:
                    # Calculate total input/output amounts
                    total_input = sum(vin.get('prevout', {}).get('value', 0) for vin in tx.get('vin', []))
                    total_output = sum(vout.get('value', 0) for vout in tx.get('vout', []))
                    
                    # Convert satoshis to BTC
                    amount_btc = total_output / 100000000
                    
                    transactions.append({
                        'tx_hash': tx['txid'],
                        'blockchain': 'bitcoin',
                        'tx_type': 'transfer',
                        'amount': amount_btc,
                        'currency': 'BTC',
                        'price_usd': amount_btc * 43000,  # Mock BTC price
                        'from_address': tx.get('vin', [{}])[0].get('prevout', {}).get('scriptpubkey_address', 'Unknown'),
                        'to_address': tx.get('vout', [{}])[0].get('scriptpubkey_address', 'Unknown'),
                        'block_height': blocks[0]['height'],
                        'confirmations': 1,
                        'status': 'confirmed'
                    })
            
            return transactions
            
        except requests.exceptions.RequestException as e:
            self.log_error(f"Bitcoin API request failed: {str(e)}")
            return []
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            self.log_error(f"Bitcoin data parsing error: {str(e)}")
            return []
    
    def generate_mock_transactions(self, count=15):
        """Generate mock transactions for demonstration"""
        currencies = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'AVAX']
        types = ['buy', 'sell', 'transfer']
        statuses = ['confirmed', 'pending', 'failed']
        
        transactions = []
        
        for i in range(count):
            currency = random.choice(currencies)
            tx_type = random.choice(types)
            status = random.choice(statuses)
            amount = random.uniform(0.001, 10)
            
            # Mock price based on currency
            price_multipliers = {
                'BTC': 43000, 'ETH': 2650, 'BNB': 315,
                'SOL': 98, 'ADA': 0.48, 'AVAX': 36
            }
            price_usd = amount * price_multipliers.get(currency, 1000)
            
            # Generate random hash
            hash_input = f"{currency}{amount}{time.time()}{i}"
            tx_hash = hashlib.sha256(hash_input.encode()).hexdigest()
            
            transactions.append({
                'tx_hash': tx_hash,
                'blockchain': 'ethereum' if currency == 'ETH' else 'binance',
                'tx_type': tx_type,
                'amount': amount,
                'currency': currency,
                'price_usd': price_usd,
                'from_address': f"0x{''.join(random.choices('0123456789abcdef', k=40))}",
                'to_address': f"0x{''.join(random.choices('0123456789abcdef', k=40))}",
                'block_height': random.randint(18000000, 19000000),
                'confirmations': random.randint(1, 100) if status == 'confirmed' else 0,
                'status': status
            })
        
        return transactions
    
    def save_transactions(self, transactions):
        """Save transactions to database"""
        if not transactions:
            return False
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            saved_count = 0
            for tx in transactions:
                try:
                    cursor.execute('''
                        INSERT OR IGNORE INTO transactions 
                        (tx_hash, blockchain, tx_type, amount, currency, price_usd,
                         from_address, to_address, block_height, confirmations, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        tx['tx_hash'],
                        tx['blockchain'],
                        tx['tx_type'],
                        tx['amount'],
                        tx['currency'],
                        tx['price_usd'],
                        tx['from_address'],
                        tx['to_address'],
                        tx['block_height'],
                        tx['confirmations'],
                        tx['status']
                    ))
                    
                    if cursor.rowcount > 0:
                        saved_count += 1
                        
                except sqlite3.IntegrityError:
                    # Transaction already exists
                    continue
            
            conn.commit()
            conn.close()
            
            self.log_success(f"Saved {saved_count} new transactions to database")
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
    
    def run_monitor(self, interval=30):
        """Run the transaction monitor continuously"""
        print(f"Starting transaction monitor with {interval}s interval...")
        
        while True:
            try:
                print(f"\n[INFO] {datetime.now()}: Monitoring transactions...")
                
                # Try to fetch real Bitcoin transactions
                bitcoin_txs = self.fetch_bitcoin_transactions(5)
                
                # Generate mock transactions for other currencies
                mock_txs = self.generate_mock_transactions(10)
                
                all_transactions = bitcoin_txs + mock_txs
                
                if all_transactions:
                    success = self.save_transactions(all_transactions)
                    
                    if success:
                        print(f"[INFO] Processed {len(all_transactions)} transactions")
                    else:
                        print("[ERROR] Failed to save transactions")
                else:
                    print("[WARNING] No transactions found")
                
                # Wait for next iteration
                print(f"[INFO] Waiting {interval} seconds until next check...")
                time.sleep(interval)
                
            except KeyboardInterrupt:
                print("\n[INFO] Transaction monitor stopped by user")
                break
            except Exception as e:
                self.log_error(f"Unexpected error: {str(e)}")
                time.sleep(60)
    
    def get_recent_transactions(self, limit=20):
        """Get recent transactions from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT tx_hash, blockchain, tx_type, amount, currency, 
                       price_usd, from_address, to_address, status, timestamp
                FROM transactions 
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
    """Main function to run the transaction monitor"""
    monitor = TransactionMonitor()
    
    # Run a single monitoring cycle for testing
    print("Running single monitoring test...")
    
    # Generate and save mock transactions
    mock_txs = monitor.generate_mock_transactions(5)
    monitor.save_transactions(mock_txs)
    
    # Display recent transactions
    recent_txs = monitor.get_recent_transactions(5)
    print(f"\nRecent {len(recent_txs)} transactions:")
    for tx in recent_txs:
        print(f"  {tx[4]} - {tx[3]:.6f} {tx[4]} (${tx[5]:.2f}) - {tx[8]}")
    
    print("Test completed successfully!")
    
    # Uncomment the line below to run continuous monitoring
    # monitor.run_monitor(interval=30)  # Check every 30 seconds

if __name__ == "__main__":
    main()
