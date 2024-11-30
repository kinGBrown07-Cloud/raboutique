import mysql from 'mysql2/promise';
import { faker } from '@faker-js/faker/locale/fr';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const USERS_COUNT = 50;
const LISTINGS_PER_USER_MIN = 1;
const LISTINGS_PER_USER_MAX = 10;
const TRANSACTIONS_COUNT = 50;

async function seedRealisticData() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Connecté à la base de données');

        // Nettoyage des tables
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        const tables = ['users', 'listings', 'subscriptions', 'subscription_plans', 
                       'promotions', 'lease_applications', 'lease_contracts', 
                       'transactions', 'metrics'];
        
        for (const table of tables) {
            await connection.query(`TRUNCATE TABLE ${table}`);
            console.log(`✅ Table ${table} vidée`);
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Création des plans d'abonnement
        const subscriptionPlans = [
            ['Basic', 'Plan de base', 5, 0],
            ['Pro', 'Plan professionnel', 20, 29.99],
            ['Enterprise', 'Plan entreprise', 100, 99.99]
        ];

        await connection.query(`
            INSERT INTO subscription_plans (name, description, max_listings, price)
            VALUES ?
        `, [subscriptionPlans]);
        console.log('✅ Plans d\'abonnement créés');

        // Création des utilisateurs
        const users = [];
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Admin user
        users.push([
            'admin@remag.com',
            hashedPassword,
            'Admin',
            'admin'
        ]);

        // Regular users
        for (let i = 0; i < USERS_COUNT; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            users.push([
                faker.internet.email({firstName, lastName}),
                hashedPassword,
                `${firstName} ${lastName}`,
                'user'
            ]);
        }

        await connection.query(`
            INSERT INTO users (email, password, name, role)
            VALUES ?
        `, [users]);
        console.log('✅ Utilisateurs créés');

        // Création des abonnements
        const [userRows]: any = await connection.query('SELECT id FROM users WHERE role = ?', ['user']);
        const [planRows]: any = await connection.query('SELECT id FROM subscription_plans');
        
        const subscriptions = userRows.map((user: any) => {
            const plan = planRows[Math.floor(Math.random() * planRows.length)];
            const startDate = faker.date.past({years: 1});
            const endDate = faker.date.future({years: 1, refDate: startDate});
            return [user.id, plan.id, startDate, endDate, 'active'];
        });

        await connection.query(`
            INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status)
            VALUES ?
        `, [subscriptions]);
        console.log('✅ Abonnements créés');

        // Création des annonces
        const listingTypes = ['product', 'business', 'event'];
        const listings = [];

        // Récupérer les limites de listings par utilisateur
        const [userSubscriptions]: any = await connection.query(`
            SELECT u.id as user_id, sp.max_listings
            FROM users u
            JOIN subscriptions s ON u.id = s.user_id
            JOIN subscription_plans sp ON s.plan_id = sp.id
            WHERE u.role = 'user'
        `);

        for (const subscription of userSubscriptions) {
            const listingsCount = Math.min(
                faker.number.int({
                    min: LISTINGS_PER_USER_MIN,
                    max: Math.min(subscription.max_listings, LISTINGS_PER_USER_MAX)
                }),
                subscription.max_listings
            );

            for (let i = 0; i < listingsCount; i++) {
                const type = listingTypes[Math.floor(Math.random() * listingTypes.length)];
                const price = faker.number.float({min: 100, max: 100000});
                const createdAt = faker.date.past({years: 1});

                listings.push([
                    subscription.user_id,
                    faker.commerce.productName(),
                    faker.commerce.productDescription(),
                    price,
                    faker.helpers.arrayElement(['active', 'pending', 'sold']),
                    type,
                    createdAt
                ]);
            }
        }

        await connection.query(`
            INSERT INTO listings (user_id, title, description, price, status, type, created_at)
            VALUES ?
        `, [listings]);
        console.log('✅ Annonces créées');

        // Création des promotions
        const promotions = [];
        const promoDescriptions = [
            'Profitez de nos offres de printemps !',
            'Offres spéciales pour l\'été !',
            'Réductions exceptionnelles Black Friday !',
            'Promotions de fin d\'année !'
        ];

        for (let i = 0; i < promoDescriptions.length; i++) {
            const startDate = faker.date.future();
            const endDate = faker.date.future({ refDate: startDate });
            promotions.push([
                faker.string.alphanumeric({ length: 8, casing: 'upper' }),
                promoDescriptions[i],
                faker.number.int({ min: 5, max: 50 }),
                null, // discount_amount
                startDate,
                endDate,
                faker.number.int({ min: 50, max: 200 }), // max_uses
                0 // current_uses
            ]);
        }

        await connection.query(`
            INSERT INTO promotions (
                code, description, discount_percent, discount_amount,
                valid_from, valid_until, max_uses, current_uses
            )
            VALUES ?
        `, [promotions]);
        console.log('✅ Promotions créées');

        // Création des transactions
        const transactions = [];
        const transactionTypes = ['subscription', 'lease', 'listing_sale'];
        const paymentMethods = ['card', 'paypal', 'bank_transfer'];
        const statuses = ['pending', 'completed', 'failed', 'refunded'];

        for (let i = 0; i < TRANSACTIONS_COUNT; i++) {
            const userId = Math.floor(Math.random() * userRows.length) + 1;
            const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
            const amount = faker.number.float({ min: 10, max: 1000, fractionDigits: 2 });
            
            transactions.push([
                userId,
                type,
                faker.number.int({ min: 1, max: 100 }), // reference_id
                amount,
                'EUR',
                faker.helpers.arrayElement(statuses),
                faker.helpers.arrayElement(paymentMethods),
                JSON.stringify({
                    transaction_id: faker.string.uuid(),
                    payment_provider: faker.helpers.arrayElement(['stripe', 'paypal', 'adyen'])
                })
            ]);
        }

        await connection.query(`
            INSERT INTO transactions (
                user_id, type, reference_id, amount, currency,
                status, payment_method, payment_details
            )
            VALUES ?
        `, [transactions]);
        console.log('✅ Transactions créées');

        // Création des métriques
        const metrics = [];
        const metricTypes = ['visits', 'signups', 'new_listings', 'revenue'];
        let date = new Date();
        date.setDate(date.getDate() - 30);

        for (let i = 0; i < 30; i++) {
            for (const metricType of metricTypes) {
                metrics.push([
                    metricType,
                    metricType === 'revenue' 
                        ? faker.number.float({min: 1000, max: 5000, fractionDigits: 2})
                        : faker.number.int({min: 10, max: 200}),
                    date,
                    JSON.stringify({
                        source: faker.helpers.arrayElement(['web', 'mobile', 'api']),
                        region: faker.location.city()
                    })
                ]);
            }
            date.setDate(date.getDate() + 1);
        }

        await connection.query(`
            INSERT INTO metrics (metric_name, metric_value, timestamp, metadata)
            VALUES ?
        `, [metrics]);
        console.log('✅ Métriques créées');

        await connection.end();
        console.log('\n✅ Données de test créées avec succès !');

    } catch (err) {
        const error = err as Error;
        console.error('❌ Erreur lors de la création des données :', error.message);
        process.exit(1);
    }
}

seedRealisticData();
