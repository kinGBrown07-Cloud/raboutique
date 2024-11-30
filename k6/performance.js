import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    'http_req_duration{staticAsset:yes}': ['p(95)<100'], // Static assets should load faster
    errors: ['rate<0.1'], // Error rate should be below 10%
  },
};

const BASE_URL = 'http://localhost:3000';

export function setup() {
  // Login and get token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: 'test@example.com',
    password: 'password123',
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  return {
    token: loginRes.json('token'),
  };
}

export default function(data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
    },
  };

  // Product listing
  const productsRes = http.get(`${BASE_URL}/api/products`, params);
  check(productsRes, {
    'products status 200': (r) => r.status === 200,
    'products load fast': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  sleep(1);

  // Product detail
  const productId = productsRes.json('data.0.id');
  if (productId) {
    const productRes = http.get(`${BASE_URL}/api/products/${productId}`, params);
    check(productRes, {
      'product detail status 200': (r) => r.status === 200,
      'product detail load fast': (r) => r.timings.duration < 200,
    }) || errorRate.add(1);
  }
  sleep(1);

  // Search products
  const searchRes = http.get(`${BASE_URL}/api/products?search=organic`, params);
  check(searchRes, {
    'search status 200': (r) => r.status === 200,
    'search load fast': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);
  sleep(1);

  // Create order (if authenticated)
  if (Math.random() < 0.1) { // 10% of users create orders
    const orderRes = http.post(`${BASE_URL}/api/orders`, {
      product_id: productId,
      quantity: 1,
    }, params);
    check(orderRes, {
      'order creation successful': (r) => r.status === 201,
      'order creation fast': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);
  }
  sleep(2);
}

export function teardown(data) {
  // Cleanup if necessary
  http.post(`${BASE_URL}/api/auth/logout`, {}, {
    headers: {
      'Authorization': `Bearer ${data.token}`,
    },
  });
}
