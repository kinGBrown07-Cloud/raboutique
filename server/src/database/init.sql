CREATE DATABASE IF NOT EXISTS remag_db;
USE remag_db;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(191) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  status ENUM('draft', 'pending', 'active', 'rejected') DEFAULT 'draft',
  type ENUM('product', 'business', 'event', 'travel', 'voucher') NOT NULL,
  stock INT DEFAULT NULL,
  last_renewal_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Table pour les abonnements utilisateurs
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    promotion_id INT,
    original_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
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

-- Table pour les promotions
CREATE TABLE IF NOT EXISTS promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_percentage INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    promo_code VARCHAR(20) UNIQUE,
    min_subscription_months INT DEFAULT 1,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table pour les transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('subscription', 'lease', 'listing_sale') NOT NULL,
    reference_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('paypal', 'crypto') AFTER amount,
    payment_details JSON AFTER payment_method,
    fee_amount DECIMAL(10, 2) AFTER payment_details,
    fee_currency VARCHAR(10) DEFAULT 'EUR' AFTER fee_amount,
    crypto_amount DECIMAL(18, 8) NULL AFTER fee_currency,
    crypto_currency VARCHAR(10) NULL AFTER crypto_amount,
    commission_rate DECIMAL(4,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Table pour les configurations de paiement
CREATE TABLE IF NOT EXISTS payment_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider VARCHAR(50) NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_provider_key (provider, config_key)
);

-- Table pour les taux de conversion
CREATE TABLE IF NOT EXISTS exchange_rates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(18, 8) NOT NULL,
    source VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_currency_pair (from_currency, to_currency)
);

-- Table pour les logs système
CREATE TABLE IF NOT EXISTS system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSON,
    user_id INT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index pour les logs
CREATE INDEX idx_logs_level ON system_logs(level);
CREATE INDEX idx_logs_category ON system_logs(category);
CREATE INDEX idx_logs_user ON system_logs(user_id);
CREATE INDEX idx_logs_created ON system_logs(created_at);

-- Tables pour le monitoring et les alertes
CREATE TABLE IF NOT EXISTS system_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cpu_usage FLOAT,
    memory_usage FLOAT,
    active_connections INT,
    request_rate FLOAT,
    error_rate FLOAT,
    response_time FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    active_users INT,
    transaction_volume INT,
    conversion_rate FLOAT,
    revenue DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    threshold FLOAT NOT NULL,
    time_window INT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    notification_channels JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    details JSON,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index pour les métriques et alertes
CREATE INDEX idx_metrics_timestamp ON system_metrics(created_at);
CREATE INDEX idx_business_metrics_timestamp ON business_metrics(created_at);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_created ON alerts(created_at);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);

-- Tables pour les prédictions et anomalies
CREATE TABLE IF NOT EXISTS metric_predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    timestamp DATETIME NOT NULL,
    predicted_value FLOAT NOT NULL,
    confidence_lower FLOAT NOT NULL,
    confidence_upper FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_predictions_metric (metric_name, timestamp)
);

CREATE TABLE IF NOT EXISTS anomalies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    timestamp DATETIME NOT NULL,
    value FLOAT NOT NULL,
    score FLOAT NOT NULL,
    is_anomaly BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_anomalies_metric (metric_name, timestamp)
);

-- Tables pour les rapports personnalisés
CREATE TABLE IF NOT EXISTS report_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('system', 'business', 'combined') NOT NULL,
    metrics JSON NOT NULL,
    filters JSON,
    schedule VARCHAR(100),
    format ENUM('excel', 'pdf') NOT NULL,
    recipients JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_report_templates_name (name)
);

CREATE TABLE IF NOT EXISTS generated_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'completed', 'failed') NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES report_templates(id) ON DELETE CASCADE,
    INDEX idx_generated_reports_template (template_id, created_at)
);

-- Tables pour les tableaux de bord personnalisés
CREATE TABLE IF NOT EXISTS dashboards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner INT NOT NULL,
    shared_with JSON NOT NULL,
    widgets JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_dashboards_owner (owner)
);

-- Tables pour les intégrations externes
CREATE TABLE IF NOT EXISTS integrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('slack', 'email', 'webhook', 'sms', 'teams') NOT NULL,
    config JSON NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_integrations_type (type, enabled)
);

CREATE TABLE IF NOT EXISTS notification_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    integration_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('info', 'warning', 'error', 'critical') NOT NULL,
    data JSON,
    status ENUM('pending', 'sent', 'failed') NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE,
    INDEX idx_notification_history_integration (integration_id, created_at)
);

INSERT INTO subscription_plans (name, description, price, duration_months, max_listings, features) VALUES
('Basic', 'Pour les petits vendeurs', 9.99, 1, 10, '{"featured_listings": 0, "priority_support": false}'),
('Pro', 'Pour les vendeurs réguliers', 29.99, 1, 50, '{"featured_listings": 5, "priority_support": true}'),
('Business', 'Pour les grandes entreprises', 99.99, 1, 200, '{"featured_listings": 20, "priority_support": true}');

-- Ajout des promotions de lancement
INSERT INTO promotions (name, description, discount_percentage, start_date, end_date, promo_code, min_subscription_months) VALUES
('Black Friday 2024', 'Profitez de -50% sur tous nos abonnements', 50, '2024-11-29', '2024-11-30', 'BLACK50', 3),
('Noël 2024', '-30% sur les abonnements de 6 mois ou plus', 30, '2024-12-20', '2024-12-26', 'NOEL30', 6),
('Lancement Printemps', '-25% sur tous les abonnements', 25, '2024-03-20', '2024-04-20', 'SPRING25', 1);

-- Données initiales pour payment_configs
INSERT INTO payment_configs (provider, config_key, config_value) VALUES
('paypal', 'commission_rate', '0.029'),
('paypal', 'fixed_fee', '0.30'),
('crypto', 'commission_rate', '0.01'),
('crypto', 'network_fee', '0.001'),
('general', 'supported_cryptocurrencies', '["BTC","ETH","USDT","BNB"]');

-- Données initiales pour les règles d'alerte
INSERT INTO alert_rules (name, condition, threshold, time_window, severity, notification_channels) VALUES
('High Error Rate', 'error_rate', 50, 5, 'high', '["email", "websocket"]'),
('Payment Failures', 'payment_failure', 10, 15, 'critical', '["email", "websocket"]'),
('High Refund Rate', 'high_refund', 20, 60, 'medium', '["email", "websocket"]'),
('System Overload', 'system_load', 1000, 5, 'high', '["email", "websocket"]');
