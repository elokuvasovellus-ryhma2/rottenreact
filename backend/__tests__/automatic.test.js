import request from 'supertest';
import app from '../app.js';
import { createUser, deleteUserById } from '../modules/auth/authModel.js';
import { hash } from 'bcrypt';


describe('KIRJAUTUMINEN - POST /users/signin', () => {
  let testUserId;

  beforeAll(async () => {
    // Create a test user before running tests
    const testEmail = 'test@example.com';
    const testPassword = 'CorrectPassword123!';
    const passwordHash = await hash(testPassword, 10);
    
    const user = await createUser(testEmail, passwordHash);
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up test user after tests
    if (testUserId) {
      await deleteUserById(testUserId);
    }
  });

  it('Should return 200 with valid credentials', async () => {
    const res = await request(app)
      .post('/users/signin')
      .send({
        user: {
          email: 'test@example.com',
          password: 'CorrectPassword123!'
        }
      });
    
    expect(res.statusCode).toBe(200);

  });

  it('should return 401 when credentials are invalid', async () => {
    const res = await request(app)
      .post('/users/signin')
      .send({
        user: {
          email: 'test@example.com',
          password: 'WrongPassword123!'
        }
      });
    
    expect(res.statusCode).toBe(401);
 
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/users/signin')
      .send({
        user: {
          password: 'TestPassword123!'
        }
      });
    
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post('/users/signin')
      .send({
        user: {
          email: 'test@example.com'
        }
      });
    
    expect(res.statusCode).toBe(400);
  });
});

describe('REKISTERÖITYMINEN - POST /users/signup', () => {
  let testUserId;
  
  afterAll(async () => {
    // Clean up test user after tests
    if (testUserId) {
      await deleteUserById(testUserId);
    }
  });

  it('Should return 201 if user is created', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({
        user: {
          email: 'automaattitesti@example.com',
          password: 'Automaattitesti123!'
        }
      });
    
    expect(res.statusCode).toBe(201);
    
    // Capture the user ID for cleanup
    testUserId = res.body.id;
  });

  it('Should return 409 if user already exists', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({
        user: {
          email: 'user1@example.com',
          password: 'Automaattitesti123!'
        }
      });
    
    expect(res.statusCode).toBe(409);
  });


it('Should return 400 if email is missing', async () => {
  const res = await request(app)
    .post('/users/signup')
    .send({
      user: {
        password: 'Automaattitesti123!'
      }
    });
    
    expect(res.statusCode).toBe(400);
});



it('Should return 400 if password is missing', async () => {
  const res = await request(app)
    .post('/users/signup')
    .send({
      user: {
        email: 'automaattitesti@example.com'
      }
    });
    
    expect(res.statusCode).toBe(400);
});

});


describe('REKISTERÖITYMISEN POISTO - DELETE /users/delete/:id', () => {
  let testUserId;

  beforeAll(async () => {
    // Create test user once for all tests
    const testEmail = 'poistotesti@example.com';
    const testPassword = 'CorrectPassword123!';
    const passwordHash = await hash(testPassword, 10);
    
    const user = await createUser(testEmail, passwordHash);
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup - try to delete if user still exists
    if (testUserId) {
      try {
        await deleteUserById(testUserId);
      } catch (err) {
        // User might already be deleted, ignore error
      }
    }
  });

  it('Should return 200 when user is successfully deleted', async () => {
    const res = await request(app)
      .delete(`/users/delete/${testUserId}`);
    
    expect(res.statusCode).toBe(200);
 
  });

  it('Should return 404 when user does not exist', async () => {
    const res = await request(app)
      .delete('/users/delete/123e4567-e89b-12d3-a456-426614174000');
    
    expect(res.statusCode).toBe(404);
    
  });

  it('Should return 404 when route does not exist', async () => {
    const res = await request(app)
      .delete('/users/delete/');
    
    expect(res.statusCode).toBe(404);
  });

  it('Should return 500 when user ID is not valid with db connection', async () => {
    const res = await request(app)
      .delete('/users/delete/invalid-uuid-format');
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  });


describe('ARVOSTELUJEN SELAAMINEN - GET /api/reviews', () => {

  it('Should return 200 and array of reviews', async () => {
    const res = await request(app)
      .get('/api/reviews');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });


  it('Should return 200 with correct movieId filter 603', async () => {
    const res = await request(app)
      .get('/api/reviews')
      .query({
        limit: 1,
        sort: 'created_at.desc',
        movieId: '603'
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // If there are reviews for movie 603, test the structure
    if (res.body.length > 0) {
      const review = res.body[0];
      expect(review.movie_id).toBe('603');
    }
  });

  it('Should return 200 and empty array for non-existent movie', async () => {
    const res = await request(app)
      .get('/api/reviews')
      .query({
        movieId: '999999'
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});

describe('BACKEND TOIMINNASSA - GET /health', () => {

  it('Should return 200 and server status ok', async () => {
    const res = await request(app)
      .get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
 
  });

  it('Performance test for speed of health check', async () => {
    const startTime = Date.now();
    const res = await request(app)
      .get('/health');
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(3); // Should respond in under 3ms
  });
})
