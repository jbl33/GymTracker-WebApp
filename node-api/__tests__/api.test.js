const request = require('supertest');
const express = require('express');
const app = require('../index.js');

describe('API Endpoints', () => {

  const authKey = '982c040f722c7beff6637435e5e8910f';
  // Registration Endpoint
  describe('POST /register', () => {
    it('should register a new user', async () => {
        // Gen random number up to 5 digits
        const randNum = Math.floor(Math.random() * 100000);
      const response = await request(app).post('/register').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe' + randNum + '@example.com',
        password: 'Password1!'
      });
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
    });

    // Test for existing email
    it('should not register a user with an existing email', async () => {
      const response = await request(app).post('/register').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jd@gmail.com',
        password: 'Password1!'
      });
      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email address already in use');
    });
  });


  // Login Endpoint
  describe('POST /login', () => {
    it('should successfully log in a user with correct details', async () => {
      const response = await request(app).post('/login').send({
        email: 'jd@gmail.com',
        password: 'Example123'
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
    });
  });

  // Insert Template
  describe('POST /insertTemplate', () => {
    it('should insert a new workout template', async () => {
      const response = await request(app).post('/insertTemplate').send({
        name: 'Template ' + Math.floor(Math.random * 50000),
        description: 'Test Description 123',
        publicMode: false,
        sets: [{ exerciseName: 'Dumbbell Bench Press', reps: 10, weight: 50 }],
        userID: 4
      });
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Template created successfully');
    });
  });

  // Get Private Templates
  describe('GET /getPrivateTemplates', () => {
    it('should retrieve all private templates for a user', async () => {
      const response = await request(app).get('/getPrivateTemplates').query({ userID: 4 });
      expect(response.status).toBe(200);
      expect(response.body.templates).toBeInstanceOf(Array);
    });
  });

  // Get Public Templates
  describe('GET /getTemplates', () => {
    it('should retrieve all public templates', async () => {
      const response = await request(app).get('/getTemplates');
      expect(response.status).toBe(200);
      expect(response.body.templates).toBeInstanceOf(Array);
    });
  });

  // Get Template Sets
  describe('GET /getTemplateSets', () => {
    it('should retrieve all sets for a given template', async () => {
      const response = await request(app).get('/getTemplateSets').query({ templateID: 1 });
      expect(response.status).toBe(200);
      expect(response.body.sets).toBeInstanceOf(Array);
    });
  });

  // Get Exercises
  describe('GET /getExercises', () => {
    it('should retrieve all exercises', async () => {
      const response = await request(app).get('/getExercises');
      expect(response.status).toBe(200);
      expect(response.body.exercises).toBeInstanceOf(Array);
    });
  });

  // Get UserID by AuthKey
  describe('GET /getUserID', () => {
    it('should return user ID for a valid auth key', async () => {
      const response = await request(app).get('/getUserID').query({ authKey: authKey });
      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(7);
    });
  });

   random = Math.floor(Math.random() * 1000000);

  // Insert Workout
  describe('POST /insertWorkout', () => {
    it('should insert a new workout entry', async () => {
      const response = await request(app).post('/insertWorkout').send({
        userID: 7,
        date: '2023-12-02',
        workoutID: random,
        authKey: authKey,
        rpe: 7
      });
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Workout logged successfully');
    });
  });

  // Insert Workout Set
  describe('POST /insertWorkoutSet', () => {
    it('should insert a new workout set entry', async () => {
      const response = await request(app).post('/insertWorkoutSet').send({
        workoutID: random,
        exerciseName: 'Dumbbell Bench Press',
        reps: 10,
        weight: 25
      });
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Workout set logged successfully');
    });
  });

  // Get User Workouts
  describe('GET /getUserWorkouts', () => {
    it('should retrieve all workouts for a user', async () => {
      const response = await request(app).get('/getUserWorkouts').query({ userID: 4 });
      expect(response.status).toBe(200);
      expect(response.body.exercises).toBeInstanceOf(Array);
    });
  });

  // Get All User Sets
  describe('GET /getAllUserSets', () => {
    it('should retrieve all sets for a user by auth key', async () => {
      const response = await request(app).get('/getAllUserSets').query({ authKey: '7c4de65c1c45520258e5925753328793' });
      expect(response.status).toBe(200);
      expect(response.body.sets).toBeInstanceOf(Array);
    });
  });

  // Get Workout Sets by WorkoutID
  describe('GET /getWorkoutSets', () => {
    it('should get all sets for a workout given a workoutID', async () => {
      const response = await request(app).get('/getWorkoutSets').query({ authKey: '7c4de65c1c45520258e5925753328793', workoutID: 4298520822948 });
      expect(response.status).toBe(200);
      expect(response.body.sets).toBeInstanceOf(Array);
    });
  });

  // Get User Info
  describe('GET /getUser', () => {
    it('should return user info for a valid auth key', async () => {
      const response = await request(app).get('/getUser').query({ authKey: '7c4de65c1c45520258e5925753328793' });
      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id');
    });
  });

  // Update Workout Set
  describe('POST /updateWorkoutSet', () => {
    it('should update the information of an existing workout set', async () => {
      const response = await request(app).post('/updateWorkoutSet').send({
        authKey: '7c4de65c1c45520258e5925753328793',
        setID: 9,
        weight: 50,
        reps: 12
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Workout set updated successfully');
    });
  });

  // Delete Workout
  describe('POST /addWeightEntry', () => {
    it('should add a new weight entry for a user', async () => {
      const response = await request(app).post('/addWeightEntry').send({
        authKey: authKey,
        date: '2023-12-02',
        weight: 70
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Weight entry added successfully');
    });

  describe('GET /getWeightEntries', () => {
    it('should retrieve all weight entries for a user', async () => {
      const response = await request(app).get('/getWeightEntries').query({
        authKey: authKey
      });
      expect(response.status).toBe(200);
      expect(response.body.weightEntries).toBeInstanceOf(Array);
    });

    it('should not retrieve weight entries with an invalid auth key', async () => {
      const response = await request(app).get('/getWeightEntries').query({
        authKey: 'invalid_auth_key'
      });
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Unauthorized');
    });
  });
  });
});