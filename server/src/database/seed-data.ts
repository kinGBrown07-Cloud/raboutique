import pool from '../config/database';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database, starting seed process...\n');

    // Nettoyer les tables existantes
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['users', 'listings', 'subscription_plans', 'subscriptions', 
                   'promotions', 'lease_applications', 'lease_contracts', 
                   'transactions', 'metrics'];
    
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`Cleared table: ${table}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. Créer des utilisateurs
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userInserts = [
      ['Admin User', 'admin@remag.com', hashedPassword, 'admin'],
      ['John Doe', 'john@example.com', hashedPassword, 'user'],
      ['Marie Dubois', 'marie@example.com', hashedPassword, 'user'],
      ['Pierre Martin', 'pierre@example.com', hashedPassword, 'user']
    ];

    const [userResults] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES ?',
      [userInserts]
    );
    console.log('Created users');

    // 2. Créer des plans d'abonnement
    const planInserts = [
      ['Basic', 'Plan de base pour débutants', 29.99, 1, 5, JSON.stringify(['5 annonces', 'Support email'])],
      ['Pro', 'Plan professionnel', 99.99, 1, 20, JSON.stringify(['20 annonces', 'Support prioritaire', 'Statistiques avancées'])],
      ['Enterprise', 'Plan entreprise', 299.99, 1, -1, JSON.stringify(['Annonces illimitées', 'Support 24/7', 'API access'])]
    ];

    await connection.query(
      'INSERT INTO subscription_plans (name, description, price, duration_months, max_listings, features) VALUES ?',
      [planInserts]
    );
    console.log('Created subscription plans');

    // 3. Créer des annonces
    const listingTypes = ['product', 'business', 'event'];
    const listingInserts = [];

    for (let i = 1; i <= 20; i++) {
      const type = listingTypes[Math.floor(Math.random() * listingTypes.length)];
      const userId = Math.floor(Math.random() * 3) + 2; // Skip admin
      const price = Math.floor(Math.random() * 100000) + 1000;
      
      listingInserts.push([
        userId,
        `Annonce Test ${i}`,
        `Description détaillée de l'annonce ${i}. Ceci est une annonce de test avec toutes les caractéristiques nécessaires.`,
        price,
        'active',
        type
      ]);
    }

    await connection.query(
      'INSERT INTO listings (user_id, title, description, price, status, type) VALUES ?',
      [listingInserts]
    );
    console.log('Created listings');

    // 4. Créer des promotions
    const promoInserts = [
      ['WELCOME2024', 'Code de bienvenue', 20, null, '2024-01-01', '2024-12-31', 100, 0],
      ['SUMMER50', 'Promotion été', 50, null, '2024-06-01', '2024-08-31', 50, 0]
    ];

    await connection.query(
      'INSERT INTO promotions (code, description, discount_percent, discount_amount, valid_from, valid_until, max_uses, current_uses) VALUES ?',
      [promoInserts]
    );
    console.log('Created promotions');

    // 5. Créer des abonnements
    const subscriptionInserts = [];
    for (let userId = 2; userId <= 4; userId++) {
      const planId = Math.floor(Math.random() * 3) + 1;
      subscriptionInserts.push([userId, planId]);
    }

    await connection.query(
      'INSERT INTO subscriptions (user_id, plan_id) VALUES ?',
      [subscriptionInserts]
    );
    console.log('Created subscriptions');

    // 6. Créer des candidatures aux baux
    const applicationInserts = [];
    for (let i = 1; i <= 5; i++) {
      const userId = Math.floor(Math.random() * 3) + 2;
      const listingId = Math.floor(Math.random() * 20) + 1;
      applicationInserts.push([
        listingId,
        userId,
        ['pending', 'reviewing', 'approved', 'rejected'][Math.floor(Math.random() * 4)],
        '/uploads/cv_' + i + '.pdf',
        '/uploads/business_plan_' + i + '.pdf',
        '/uploads/certifications_' + i + '.pdf',
        '/uploads/financial_' + i + '.pdf',
        'Notes pour la candidature ' + i
      ]);
    }

    await connection.query(
      'INSERT INTO lease_applications (listing_id, user_id, status, cv_path, business_plan_path, certifications_path, financial_plan_path, notes) VALUES ?',
      [applicationInserts]
    );
    console.log('Created lease applications');

    // 7. Créer des transactions
    const transactionInserts = [];
    const transactionTypes = ['subscription', 'lease', 'listing_sale'];
    const paymentMethods = ['card', 'paypal', 'bank_transfer'];

    for (let i = 1; i <= 10; i++) {
      const userId = Math.floor(Math.random() * 3) + 2;
      const type = transactionTypes[Math.floor(Math.random() * 3)];
      const amount = Math.floor(Math.random() * 1000) + 100;
      
      transactionInserts.push([
        userId,
        type,
        i,
        amount,
        'EUR',
        'completed',
        paymentMethods[Math.floor(Math.random() * 3)],
        JSON.stringify({
          transaction_id: 'TR' + Math.random().toString(36).substr(2, 9),
          payment_date: new Date().toISOString()
        })
      ]);
    }

    await connection.query(
      'INSERT INTO transactions (user_id, type, reference_id, amount, currency, status, payment_method, payment_details) VALUES ?',
      [transactionInserts]
    );
    console.log('Created transactions');

    // 8. Créer des métriques
    const metricInserts = [];
    const metricNames = ['visits', 'sales', 'revenue', 'active_users'];
    
    for (let i = 0; i < 30; i++) {
      for (const metric of metricNames) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        metricInserts.push([
          metric,
          Math.floor(Math.random() * 1000),
          date.toISOString().split('T')[0],
          JSON.stringify({
            source: 'system',
            category: metric
          })
        ]);
      }
    }

    await connection.query(
      'INSERT INTO metrics (metric_name, metric_value, timestamp, metadata) VALUES ?',
      [metricInserts]
    );
    console.log('Created metrics');

    console.log('\nDatabase seeding completed successfully!');
    connection.release();
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
}

seedDatabase();
