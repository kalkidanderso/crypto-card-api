import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Wallets (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let walletId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Create a test user and get access token
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `testwallets${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'Wallet',
        lastName: 'Tester',
      });

    accessToken = registerResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/wallets (POST)', () => {
    it('should create a new BTC wallet', () => {
      return request(app.getHttpServer())
        .post('/api/v1/wallets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ cryptoType: 'BTC' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('cryptoType', 'BTC');
          expect(res.body).toHaveProperty('address');
          expect(res.body).toHaveProperty('balance', 0);
          expect(res.body.address).toMatch(/^1[a-zA-Z0-9]{25,34}$/);
          walletId = res.body.id;
        });
    });

    it('should create a new ETH wallet', () => {
      return request(app.getHttpServer())
        .post('/api/v1/wallets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ cryptoType: 'ETH' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('cryptoType', 'ETH');
          expect(res.body.address).toMatch(/^0x[a-f0-9]{40}$/i);
        });
    });

    it('should fail to create duplicate wallet', () => {
      return request(app.getHttpServer())
        .post('/api/v1/wallets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ cryptoType: 'BTC' })
        .expect(400);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/wallets')
        .send({ cryptoType: 'BTC' })
        .expect(401);
    });
  });

  describe('/wallets (GET)', () => {
    it('should get all user wallets', () => {
      return request(app.getHttpServer())
        .get('/api/v1/wallets')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/wallets/:id (GET)', () => {
    it('should get wallet by id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/wallets/${walletId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', walletId);
          expect(res.body).toHaveProperty('cryptoType');
        });
    });

    it('should fail to get non-existent wallet', () => {
      return request(app.getHttpServer())
        .get('/api/v1/wallets/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/wallets/:id/deposit (POST)', () => {
    it('should deposit funds successfully', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/wallets/${walletId}/deposit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ amount: 1.5 })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Deposit successful');
          expect(res.body).toHaveProperty('transaction');
          expect(res.body).toHaveProperty('newBalance');
          expect(res.body.newBalance).toBe(1.5);
        });
    });

    it('should fail to deposit negative amount', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/wallets/${walletId}/deposit`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ amount: -1 })
        .expect(400);
    });
  });

  describe('/wallets/:id/withdraw (POST)', () => {
    it('should withdraw funds successfully', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/wallets/${walletId}/withdraw`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 0.5,
          toAddress: '1TestWithdrawAddress123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Withdrawal initiated');
          expect(res.body).toHaveProperty('transaction');
          expect(res.body).toHaveProperty('newBalance');
        });
    });

    it('should fail to withdraw more than balance', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/wallets/${walletId}/withdraw`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 1000,
          toAddress: '1TestWithdrawAddress123',
        })
        .expect(400);
    });
  });
});
