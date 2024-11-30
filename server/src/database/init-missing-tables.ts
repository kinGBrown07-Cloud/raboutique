import pool from '../config/database';

const missingTableQueries = `
-- Table pour les types d'abonnements
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_months INT NOT NULL,
    max_listings INT NOT NULL,
    features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table pour les promotions
CREATE TABLE IF NOT EXISTS promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_percent INT,
    discount_amount DECIMAL(10,2),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    max_uses INT,
    current_uses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table pour les candidatures aux baux ruraux
CREATE TABLE IF NOT EXISTS lease_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    listing_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'reviewing', 'approved', 'rejected') DEFAULT 'pending',
    cv_path VARCHAR(255),
    business_plan_path VARCHAR(255),
    certifications_path VARCHAR(255),
    financial_plan_path VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table pour les baux signés
CREATE TABLE IF NOT EXISTS lease_contracts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    listing_id INT NOT NULL,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    contract_pdf_path VARCHAR(255),
    certificate_pdf_path VARCHAR(255),
    status ENUM('active', 'terminated', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES lease_applications(id),
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table pour les transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('subscription', 'lease', 'listing_sale') NOT NULL,
    reference_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table pour les métriques et prédictions
CREATE TABLE IF NOT EXISTS metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    timestamp DATETIME NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function initMissingTables() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database, creating missing tables...\n');
    
    // Split queries and execute them one by one
    const queries = missingTableQueries.split(';').filter(query => query.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        await connection.query(query);
        console.log('Successfully executed query:', query.split('\n')[0]);
      }
    }
    
    console.log('\nAll missing tables created successfully!');
    connection.release();
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    process.exit();
  }
}

initMissingTables();
