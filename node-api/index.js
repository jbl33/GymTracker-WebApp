const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { promisify } = require('util');

const app = express();
const port = 3000;

// Setup rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: 'Too many registration attempts, please try again later' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: 'Too many login attempts, please try again later' }
});

// Parsing request bodies (urlencoded or json)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001' // Allow requests from port 3001 (React app)
}));

// Load OpenAI Auth key from file 'openai-Auth-key.txt'
let openai;
try {
  openai = fs.readFileSync('openai-bearer.txt', 'utf8').trim();
}
catch (err) {
  console.error('Failed to read OpenAI Auth key:', err);
}

// Connecting to the SQLite database
const dbPath = path.resolve('gymtracker.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to SQLite database:', err);
    throw err;
  }
  console.log('GymTracker: Connected to the SQLite database.');

  // Initialize tables
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      auth_key TEXT NOT NULL UNIQUE,
      auth_key_expiry DATETIME NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      public BOOLEAN NOT NULL,
      user_id INTEGER NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS template_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      reps INTEGER,
      weight REAL,
      order_index INTEGER,
      FOREIGN KEY (template_id) REFERENCES templates(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      workout_id INTEGER NOT NULL UNIQUE,
      rpe INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS workout_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      reps INTEGER NOT NULL,
      weight REAL NOT NULL,
      FOREIGN KEY (workout_id) REFERENCES workouts(id)
    )`);

    const exercises = [
["Dumbbell Bench Press", "Targets chest muscles for strength and definition."],
["Incline Dumbbell Bench Press", "Focuses on upper chest muscles."],
["Decline Dumbbell Bench Press", "Emphasizes lower part of the chest."],
["Dumbbell Flyes", "Stretches and builds the pectoral muscles."],
["Dumbbell Pullover", "Works the chest and lats."],
["Dumbbell Shoulder Press", "Develops shoulder strength and definition."],
["Dumbbell Lateral Raise", "Isolates the lateral deltoids."],
["Dumbbell Front Raise", "Targets the anterior shoulder muscles."],
["Dumbbell Rear Delt Fly", "Strengthens the rear shoulder muscles."],
["Dumbbell Shrugs", "Targets the trapezius for increased shoulder mass."],
["Dumbbell Bicep Curl", "Builds bicep muscle size and strength."],
["Hammer Curl", "Engages the biceps and forearms."],
["Concentration Curl", "Isolates the biceps for focused development."],
["Dumbbell Tricep Extension", "Targets the triceps for arm strength."],
["Dumbbell Tricep Kickback", "Isolates tricep muscles effectively."],
["Dumbbell Squats", "Strengthens the lower body and core."],
["Goblet Squat", "Works the quads and glutes using a dumbbell."],
["Dumbbell Lunges", "Targets quads, hamstrings, and glutes."],
["Dumbbell Step-Ups", "Improves lower body strength and stability."],
["Dumbbell Deadlift", "Works the entire posterior chain."],
["Dumbbell Romanian Deadlift", "Targets hamstrings and glutes."],
["Dumbbell Calf Raise", "Develops calf muscle size and endurance."],
["Dumbbell Bent Over Row", "Engages the upper back and lats."],
["One Arm Dumbbell Row", "Works the lats and upper back unilaterally."],
["Renegade Row", "Combines rows with a core strengthening plank."],
["Dumbbell Thruster", "Full body workout targeting quads and shoulders."],
["Dumbbell Swing", "Explosive movement that targets the hips and core."],
["Turkish Get-Up", "Enhances full body strength and stability."],
["Man Makers", "Complex dumbbell exercise for full body conditioning."],
["Dumbbell Around the World", "Circular path works shoulders and chest."],
["Side Bend", "Targets oblique muscles for core stability."],
["Dead Bug", "Improves core strength and coordination."],
["Arnold Press", "Engages shoulder muscles with a rotating press."],
["Dumbbell High Pull", "Activates the traps and shoulders dynamically."],
["Dumbbell Woodchop", "Rotational movement targeting core muscles."],
["Reverse Lunge with Dumbbell Curl", "Combines lower body and arm training."],
["Single Leg Deadlift", "Improves balance and targets hamstrings."],
["Dumbbell Russian Twist", "Enhances oblique strength."],
["Dumbbell Side Lunge", "Targets inner thighs, quads, and glutes."],
["Box Step-Up with Press", "Targets legs and shoulders in one movement."],
["Single Arm Dumbbell Snatch", "Full body power movement."],
["Dumbbell Push Press", "Combines shoulder and lower body strength."],
["Alternating Dumbbell Curl", "Isolates biceps alternately."],
["Cross Body Curl", "Targets forearms and biceps."],
["Zottman Curl", "Combines standard and reverse bicep curls."],
["Dumbbell Skull Crusher", "Targets tricep muscles effectively."],
["Dumbbell Upright Row", "Engages shoulders and traps."],
["Rear Delt Rotate", "Targets rear deltoid muscles."],
["Barbell Bench Press", "Primary exercise for chest development."],
["Incline Barbell Bench Press", "Focuses on upper chest growth."],
["Decline Barbell Bench Press", "Targets lower chest muscles."],
["Military Press", "Develops shoulder and upper body strength."],
["Barbell Push Press", "Dynamic movement for shoulder power."],
["Barbell Squats", "Fundamental movement for leg strength."],
["Front Squat", "Emphasizes quads and core stability."],
["Lower Back Squats", "Targets lower back with barbell support."],
["Overhead Squat", "Enhances overall body coordination and strength."],
["Barbell Deadlift", "Full body exercise for strength and power."],
["Sumo Deadlift", "Targets inner thighs and posterior chain."],
["Barbell Row", "Develops upper back and lat muscles."],
["Pendlay Row", "Strengthens back with a heavy barbell pull."],
["Barbell Shrugs", "Builds trapezius muscle size."],
["Zercher Squat", "Front-loaded squat for core and legs."],
["Clean and Jerk", "Olympic lift targeting full body strength."],
["Snatch", "Olympic movement for speed and strength."],
["Barbell Curl", "Builds bicep size and strength."],
["Barbell Tricep Extension", "Targets tricep development."],
["Skull Crushers", "Isolates triceps with lying extension."],
["Barbell Lunges", "Strengthens lower body muscles."],
["Good Mornings", "Works lower back and hamstrings."],
["Hang Clean", "Develops explosive strength and coordination."],
["Power Clean", "Improves total body power and speed."],
["Floor Press", "Targets chest and triceps from the ground."],
["Glute Bridge with Barbell", "Strengthens glutes and hamstrings."],
["Landmine Press", "Focuses on shoulder and chest with barbell pivot."],
["Landmine Row", "Activates back muscles using barbell pivot."],
["Barbell Hack Squat", "Squat variation targeting quads."],
["Reverse Grip Bent Over Row", "Targets upper back with grip change."],
["Split Jerk", "Advanced move for explosive power and speed."],
["Hip Thrust", "Isolates and strengthens glute muscles."],
["Seated Overhead Press", "Builds shoulder muscles with seated press."],
["Barbell Calf Raise", "Targets calf development using a barbell."],
["Dead Row", "Combines row with a deadlift movement."],
["Bent Press", "Complex lift involving multiple muscle groups."],
["Jefferson Squat", "Unique squat variation for leg strength."],
["Cuban Press", "Targets rotator cuffs and shoulder stability."],
["Bradford Press", "Alternates press behind and in front of head."],
["Isometric Deadlift", "Static hold targeting core and grip."],
["Muscle Snatch", "Explosive lift for complete body engagement."],
["Pause Squat", "Develops strength and stability in squat posture."],
["Squat and Press", "Combines squat and overhead press."],
["Bear Complex", "Intense full body barbell circuit."],
["Curl Bar Bicep Curl", "Effective curl for bicep growth."],
["Close Grip Curl", "Targets inner part of the biceps."],
["Reverse Grip Curl", "Engages biceps and forearm through reverse motion."],
["Preacher Curl", "Isolates biceps for strengthened focus."],
["Curl Bar Skull Crusher", "Addresses tricep development lying down."],
["Overhead Tricep Extension", "Press target for triceps focused elongation."],
["Barbell Preacher Curl", "Stabilizes and builds bicep mass."],
["Spider Curl", "Bicep isolation to improve muscle peak."],
["Drag Curl", "Engages biceps through altered movement path."],
["Standing Tricep Extension", "Targets triceps through overhead motion."],
["Incline Curl", "Enhanced bicep focus on inclined support."],
["Incline Tricep Extension", "Diffuses load on triceps with incline aid."],
["Squat Rack Squats", "Standardized lifting for enhanced leg strength."],
["Front Rack Position Squat", "Builds quads and supports core."],
["Squat Rack Overhead Press", "Targets shoulders and upper body."],
["Rack Pulls", "Partial deadlift to focus on upper body strength."],
["Half Rack Deadlift", "Targets the lower half without full elevation."],
["Shrug from Squat Rack", "Centered on trap development."],
["Box Squats", "Controlled squats for lower leg development."],
["Push Press from Squat Rack", "Dynamic lift from squat rack for power."],
["Anderson Squats", "Produces leg strength from a stationary position."],
["Dumbbell Pullovers", "Expands chest and lat muscle groups."],
["Preacher Curl", "Targeted bicep isolation movement."],
["Single Arm Preacher Curl", "Unilateral bicep isolation exercise."],
["Reverse Preacher Curl", "Enhances brachialis muscle beneath biceps."],
["Hammer Curl on Preacher", "Combines grip with isolated curl movement."],
["One-Arm Dumbbell Preacher Curl", "Targets single arm bicep isolation."],
["Decline Bench Dumbbell Curl", "Supports bicep curls on decline support."],
["Wide Grip Preacher Curl", "Utilizes wide grip for enhanced muscle activation."],
["Resistance Band Squats", "Leg strengthening using tension band aids."],
["Resistance Band Lunges", "Dynamic lunge with resistance band aid."],
["Resistance Band Deadlifts", "Posture improvement for hamstring strength."],
["Resistance Band Push Up", "Chest workout with band aid."],
["Resistance Band Chest Press", "Improves chest strength through acceleration."],
["Cable Pulldown", "Develops upper back through cable motion."],
["Cable Row", "Enhances upper back through seated cable draw."],
["Cable Crossover", "Pectoral isolation motion with cable extension."],
["Cable Shoulder Press", "Stable pressing option through pulley system."],
["Cable Fly", "Chest focus with maintained cable resistance."],
["Cable Lateral Raise", "Shoulder work with cable-centered tension."],
["Cable Front Raise", "Enlarges anterior deltoid strength."],
["Cable Reverse Fly", "Stabilizes rear delts with extended cable motion."],
["Cable Tricep Pushdown", "Enhances tricep muscles through cable use."],
["Face Pull", "Pulling motion to balance shoulder development."],
["Cable Woodchop", "Rotational motion improves core strength."],
["Cable Kickbacks", "Elongate focused routines for triceps."],
["Cable Pull-Through", "Activates glutes and hamstrings through cable help."],
["Medicine Ball Slam", "Powerful full throw for core strength."],
["Medicine Ball Chest Pass", "Dynamic upper body strength through toss."],
["Medicine Ball Russian Twist", "Increases obliques through rotational movement."],
["Medicine Ball Overhead Throw", "Rotational strength and agility exercise."],
["Medicine Ball Sit-Up", "Intensifies core work with medicine ball support."],
["Medicine Ball V-Up", "Integrates core strength with ball lift."],
["Medicine Ball Mountain Climbers", "Combination of cardio and core work."],
["Kettlebell Swing", "Center piece for use-it-all functional training."],
["Kettlebell Snatch", "Single burst build powerhouse move."],
["Kettlebell Clean", "Form-heavy movement for advanced shoulder work."],
["Kettlebell Press", "Shoulder press executed with kettlebell weight."],
["Kettlebell Goblet Squat", "Kettlebell hoisted for multifaceted squat boost."],
["Kettlebell Full Pistol Squat", "One-legged posture and weight-focused squat."]
    ];

    // Adds exercises to the database if the table is empty
    db.get(`SELECT COUNT(*) AS count FROM exercises`, (err, row) => {
      if (err) {
        console.error('Error checking exercises table:', err);
        throw err;
      }
      if (row.count === 0) {
        for (const [name, description] of exercises) {
          db.run(`INSERT INTO exercises (name, description) VALUES (?, ?)`, [name, description]);
        }
      }
    });
  });
});

// Ensure all database calls return only once, by including conditional checks
function safeCallback(err, res, next) {
  if (err) {
    console.error('Error executing query:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
    return next(err);
  }
}

// Function to hash & salt a password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// Function to generate a random key, used for generating the authKey for the user
function generateRandomKey(length) {
  return crypto.randomBytes(length).toString('hex');
}

// Validate email
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Rotate authKey periodically every 7 days
const rotateAuthKey = async () => {
  try {
    const getUsers = promisify(db.all).bind(db);
    const users = await getUsers(`SELECT * FROM users WHERE auth_key_expiry < ?`, [new Date()]);

    users.forEach((user) => {
      const newAuthKey = generateRandomKey(16); // Generate a new auth key
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7); // Set expiry date to 7 days from now

      db.run(`UPDATE users SET auth_key = ?, auth_key_expiry = ? WHERE id = ?`, [newAuthKey, newExpiryDate, user.id]); // Update the auth key and expiry date
    });
  } catch (error) {
    console.error('Error rotating auth keys:', error);
  }
};

// Rotate auth keys every day at midnight
setInterval(rotateAuthKey, 24 * 60 * 60 * 1000);

// Registration endpoint
app.post('/register', registerLimiter, async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!/^(?=.*\d)(?=.*[A-Z])[A-Za-z\d!@#$%^&*()\-+=]{8,}$/.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long and contain a number and a cAuthtal letter'
    });
  }

  try {
    const hashedPassword = await hashPassword(password); // Hashing the password before storing it
    const authKey = generateRandomKey(16); // Generating a random key
    const authKeyExpiry = new Date();
    authKeyExpiry.setDate(authKeyExpiry.getDate() + 7); // Auth key expires in 7 days

    db.run(
      `INSERT INTO users (firstName, lastName, email, password, auth_key, auth_key_expiry) VALUES (?, ?, ?, ?, ?, ?)`, // Inserting the user into the database
      [firstName, lastName, email, hashedPassword, authKey, authKeyExpiry],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'Email address already in use' });
          }
          return safeCallback(err, res, next);
        }
        if (!res.headersSent) {
          res.status(201).json({ message: 'User registered successfully' });
        }
      }
    );
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error during registration' });
    }
  }
});

// Endpoint to update password
app.post('/updatePassword', async (req, res, next) => {
  const { authKey, oldPassword, newPassword } = req.body;

  if (!authKey || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!/^(?=.*\d)(?=.*[A-Z])[A-Za-z\d!@#$%^&*()\-+=]{8,}$/.test(newPassword)) {
    return res.status(400).json({
      message: 'New password must be at least 8 characters long and contain a number and a cAuthtal letter'
    });
  }

  try {
    db.get(`SELECT * FROM users WHERE auth_key = ?`, [authKey], async (err, user) => {
      if (safeCallback(err, res, next)) return;
      if (!user) {
        return res.status(401).json({ message: 'Invalid Auth key' });
      }
      const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Old password is incorrect' });
      }
      const hashedNewPassword = await hashPassword(newPassword);
      db.run(`UPDATE users SET password = ? WHERE auth_key = ?`, [hashedNewPassword, authKey], function(err) {
        if (safeCallback(err, res, next)) return;
        if (!res.headersSent) {
          res.status(200).json({ message: 'Password updated successfully' });
        }
      });
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error during password update' });
    }
  }
});

// Login route
app.post('/login', loginLimiter, async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
      if (safeCallback(err, res, next)) return;
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        // Check auth_key expiry date
        const now = new Date();
        if (new Date(user.auth_key_expiry) < now) {
          const newAuthKey = generateRandomKey(16);
          const newExpiryDate = new Date();
          newExpiryDate.setDate(newExpiryDate.getDate() + 7);
          db.run(`UPDATE users SET auth_key = ?, auth_key_expiry = ? WHERE id = ?`, 
            [newAuthKey, newExpiryDate, user.id], 
            (err) => {
              if (err) {
                console.error('Error updating auth key:', err);
                return res.status(500).json({ message: 'Error during login' });
              }
              userWithoutPassword.auth_key = newAuthKey;
              userWithoutPassword.auth_key_expiry = newExpiryDate;
              if (!res.headersSent) {
                res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
              }
            });
        } else {
          if (!res.headersSent) {
            res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
          }
        }
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error during login' });
    }
  }
});

// Endpoint for uploading workout templates to the database
app.post('/insertTemplate', async (req, res, next) => {
  const { name, description, publicMode, sets, userID } = req.body;
  if (!name || !sets || !userID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  db.run(`INSERT INTO templates (name, description, public, user_id) VALUES (?, ?, ?, ?)`, [name, description, publicMode, userID], function(err) {
    if (safeCallback(err, res, next)) return;
    const templateId = this.lastID;
    sets.forEach((set, index) => {
      db.run(`INSERT INTO template_sets (template_id, exercise_name, reps, weight, order_index) VALUES (?, ?, ?, ?, ?)`,
        [templateId, set.exerciseName, set.reps, set.weight, index]);
    });
    if (!res.headersSent) {
      res.status(201).json({ message: 'Template created successfully', templateId });
    }
  });
});

// Endpoint for grabbing private templates saved by the user
app.get('/getPrivateTemplates', (req, res, next) => {
  const userID = req.query.userID;
  db.all(`SELECT * FROM templates WHERE user_id = ? AND public = 0`, [userID], (err, results) => {
    if (safeCallback(err, res, next)) return;
    if (!res.headersSent) {
      res.status(200).json({ templates: results });
    }
  });
});

// Endpoint to grab all public workout templates
app.get('/getTemplates', (req, res, next) => {
  db.all(`SELECT * FROM templates WHERE public = 1`, (err, results) => {
    if (safeCallback(err, res, next)) return;
    if (!res.headersSent) {
      res.status(200).json({ templates: results });
    }
  });
});

// Endpoint to grab all of the sets included in a specific template
app.get('/getTemplateSets', (req, res, next) => {
  const templateID = req.query.templateID;
  db.all(`SELECT * FROM template_sets WHERE template_id = ?`, [templateID], (err, results) => {
    if (safeCallback(err, res, next)) return;
    if (!res.headersSent) {
      res.status(200).json({ sets: results });
    }
  });
});

// Returns all exercise names from the database
app.get('/getExercises', (req, res, next) => {
  db.all(`SELECT DISTINCT name FROM exercises ORDER BY name ASC`, (err, results) => {
    if (safeCallback(err, res, next)) return;
    if (!res.headersSent) {
      res.status(200).json({ exercises: results });
    }
  });
});

// Endpoint used to grab a user's ID number based on their Auth key
app.get('/getUserID', (req, res, next) => {
  const authKey = req.query.authKey;
  db.get(`SELECT id FROM users WHERE auth_key = ?`, [authKey], (err, user) => {
    if (safeCallback(err, res, next)) return;
    if (!user) {
      return res.status(401).json({ message: 'Invalid Auth key' });
    }
    if (!res.headersSent) {
      res.status(200).json({ userId: user.id });
    }
  });
});

// Endpoint to insert a new workout entity into the database
app.post('/insertWorkout', (req, res, next) => {
  let { userID, date, workoutID, authKey, rpe } = req.body;
  if(!rpe) {
    rpe = 0;
  }
  db.get(`SELECT id FROM users WHERE auth_key = ?`, [authKey], (err, user) => {
    if (safeCallback(err, res, next)) return;
    if (!user) {
      return res.status(401).json({ message: 'Invalid Auth key' });
    }
    if (user.id !== userID) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    db.run(`INSERT INTO workouts (user_id, date, workout_id, rpe) VALUES (?, ?, ?, ?)`, [userID, date, workoutID, rpe], function(err) {
      if (safeCallback(err, res, next)) return;
      if (!res.headersSent) {
        res.status(201).json({ message: 'Workout logged successfully', workoutId: this.lastID });
      }
    });
  });
});

// Endpoint to insert a new set into a workout
app.post('/insertWorkoutSet', (req, res, next) => {
  const { workoutID, exerciseName, reps, weight } = req.body;
  db.run(`INSERT INTO workout_sets (workout_id, exercise_name, reps, weight) VALUES (?, ?, ?, ?)`, [workoutID, exerciseName, reps, weight], function(err) {
    if (safeCallback(err, res, next)) return;
    if (!res.headersSent) {
      res.status(201).json({ message: 'Workout set logged successfully', setId: this.lastID });
    }
  });
});

// Endpoint to grab all of the workouts saved by a user
app.get('/getUserWorkouts', (req, res, next) => {
  const userID = req.query.userID;
  db.all(`SELECT * FROM workouts WHERE user_id = ? ORDER BY id DESC`, [userID], (err, results) => {
    if (safeCallback(err, res, next)) return;
    if (!res.headersSent) {
      res.status(200).json({ exercises: results });
    }
  });
});

// Endpoint to grab all of the sets saved by a user
app.get('/getAllUserSets', (req, res, next) => {
  const authKey = req.query.authKey;
  const exerciseType = req.query.exerciseType;
  if (!authKey) {
    return res.status(404).json({ message: 'Auth key is required' });
  }
  db.get(`SELECT id FROM users WHERE auth_key = ?`, [authKey], (err, user) => {
    if (safeCallback(err, res, next)) return;
    if (!user) {
      return res.status(401).json({ message: 'Invalid Auth key' });
    }
    const userId = user.id;
    let query = `
      SELECT ws.id, ws.workout_id, ws.exercise_name, ws.reps, ws.weight, w.date as workoutDate
      FROM workout_sets ws
      JOIN workouts w ON ws.workout_id = w.workout_id
      WHERE w.user_id = ?`;
    const params = [userId];
    if (exerciseType) {
      query += ` AND ws.exercise_name = ?`;
      params.push(exerciseType);
    }
    db.all(query, params, (err, results) => {
      if (safeCallback(err, res, next)) return;
      if (!res.headersSent) {
        res.status(200).json({ sets: results });
      }
    });
  });
});

// Endpoint to grab all of the sets saved by a user for a specific workout
app.get('/getWorkoutSets', (req, res, next) => {
  const workoutID = req.query.workoutID;
  const authKey = req.query.authKey;
  if (!workoutID) {
    return res.status(400).json({ message: 'Workout ID is required' });
  }
  db.get(`SELECT user_id FROM workouts WHERE workout_id = ?`, [workoutID], (err, workout) => {
    if (safeCallback(err, res, next)) return;
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    db.get(`SELECT id FROM users WHERE auth_key = ?`, [authKey], (err, user) => {
      if (safeCallback(err, res, next)) return;
      if (!user) {
        return res.status(401).json({ message: 'Invalid Auth key' });
      }
      if (user.id !== workout.user_id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      db.all(`SELECT * FROM workout_sets WHERE workout_id = ?`, [workoutID], (err, results) => {
        if (safeCallback(err, res, next)) return;
        if (!res.headersSent) {
          res.status(200).json({ sets: results });
        }
      });
    });
  });
});

// Endpoint to grab user information based on authKey
app.get('/getUser', (req, res, next) => {
  const authKey = req.query.authKey;
  db.get(`SELECT * FROM users WHERE auth_key = ?`, [authKey], (err, user) => {
    if (safeCallback(err, res, next)) return;
    if (!user) {
      return res.status(401).json({ message: 'Invalid Auth key' });
    }

    delete user.password; // Removing the password from the user object before sending it in the response
    if (!res.headersSent) {
      res.status(200).json({ user });
    }
  });
});

// Endpoint to update an old workout set
app.post('/updateWorkoutSet', (req, res, next) => {
  const { authKey, setID, weight, reps } = req.body;
  if (!authKey || !setID || weight === undefined || reps === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  db.get(`SELECT ws.id, w.user_id FROM workout_sets ws JOIN workouts w ON ws.workout_id = w.workout_id WHERE ws.id = ?`, [setID], (err, workoutSet) => {
    if (safeCallback(err, res, next)) return;
    if (!workoutSet) {
      return res.status(404).json({ message: 'Workout set not found' });
    }
    db.get(`SELECT id FROM users WHERE auth_key = ?`, [authKey], (err, user) => {
      if (safeCallback(err, res, next)) return;
      if (!user) {
        return res.status(401).json({ message: 'Invalid Auth key' });
      }
      if (user.id !== workoutSet.user_id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      db.run(`UPDATE workout_sets SET weight = ?, reps = ? WHERE id = ?`, [weight, reps, setID], function(err) {
        if (safeCallback(err, res, next)) return;
        if (!res.headersSent) {
          res.status(200).json({ message: 'Workout set updated successfully' });
        }
      });
    });
  });
});

// Endpoint to delete a workout set
app.post('/deleteWorkout', (req, res, next) => {
  const { authKey, workoutID } = req.body;
  db.get('SELECT id FROM users WHERE auth_key = ?', [authKey], (err, user) => {
    if (safeCallback(err, res, next)) return;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = user.id;
    db.get('SELECT * FROM workouts WHERE workout_id = ? AND user_id = ?', [workoutID, userId], (err, workout) => {
      if (safeCallback(err, res, next)) return;
      if (!workout) {
        return res.status(404).json({ message: 'Workout not found or does not belong to the user' });
      }
      db.run('DELETE FROM workouts WHERE workout_id = ?', [workoutID], function(err) {
        if (safeCallback(err, res, next)) return;
        if (!res.headersSent) {
          res.status(200).json({ message: 'Workout deleted successfully' });
        }
      });
    });
  });
});

// Fun little endpoint that uses AI to generate a workout
app.post("/getSuggestedWorkout", async (req, res, next) => {
  const { workoutTypes, equipment, numberOfSets } = req.body; 
  try {
    const formattedWorkoutTypes = workoutTypes.join(", ");
    const response = await axios.post(
      "https://Auth.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a fitness AI generating structured workout plans.",
          },
          {
            role: "user",
            content: `
              Generate a workout plan in JSON format targeting the following muscle groups: ${formattedWorkoutTypes}, 
              using the available equipment: ${equipment}.
              Make the workout exactly ${numberOfSets} sets long. 
              Do not include any exercises that aren't targetting the selected muscle groups.
              For example, if the user selects back and biceps, don't include bench press, leg press, barbell shrugs, etc... A chest and tricep workout should never have curls.
              The JSON should be an array of objects where each object includes: 
              - "order": the sequence of the exercise, 
              - "name": the exercise name, 
              - "group": the target muscle group. Be specific such as "Overall Chest" or "Upper Back" or "Shoulders: Front Deltoids", etc. Do this for every exercise.
              If it is a compound exercise, list all muscle groups targeted.
              Ensure compatibility of exercises with the provided equipment. Ex) Rear Delt Flyes must be done with dumbbells.
              Do not list an exercise without repeating at least 3 sets of it minimum in a row, unless the number of sets doesn't allow for it.
              In that case, list the exercise once or twice and move on to the next exercise.
              For example, a chest workout with barbells, a bench, and dumbbells may have an exercise of
              order 1 barbell bench press, order 2 barbell bench press, order 3 barbell bench press,
              order 4 barbell bench press, order 5 dumbbell flyes, order 6 dumbbell flyes, etc.
              Try to work each muscle group seperately. I mean if they want chest and triceps work all the chest exercises first then the exercises specifically targetting the triceps next.
              Target every head of the selected muscle groups. For example, if you select shoulders, include exercises for the front, side, and rear deltoids.
              If you select chest, pick exercises that target the upper, lower, and middle chest. For legs, target quads, hamstrings, and calves. etc...
              Here is a full list of possible exercise names, do not include any exercises not specifically mentioned on this list.:
              Dumbbell Bench Press, Incline Dumbbell Bench Press, Decline Dumbbell Bench Press, Dumbbell Flyes, Dumbbell Pullover, Dumbbell Shoulder Press, Dumbbell Lateral Raise, Dumbbell Front Raise, Dumbbell Rear Delt Fly, Dumbbell Shrugs, Dumbbell Bicep Curl, Hammer Curl, Concentration Curl, Dumbbell Tricep Extension, Dumbbell Tricep Kickback, Dumbbell Squats, Goblet Squat, Dumbbell Lunges, Dumbbell Step-Ups, Dumbbell Deadlift, Dumbbell Romanian Deadlift, Dumbbell Calf Raise, Dumbbell Bent Over Row, One Arm Dumbbell Row, Renegade Row, Dumbbell Thruster, Dumbbell Swing, Turkish Get-Up, Man Makers, Dumbbell Around the World, Side Bend, Dead Bug, Arnold Press, Dumbbell High Pull, Dumbbell Woodchop, Reverse Lunge with Dumbbell Curl, Single Leg Deadlift, Dumbbell Russian Twist, Dumbbell Side Lunge, Box Step-Up with Press, Single Arm Dumbbell Snatch, Dumbbell Push Press, Alternating Dumbbell Curl, Cross Body Curl, Zottman Curl, Dumbbell Skull Crusher, Dumbbell Upright Row, Rear Delt Rotate, Barbell Bench Press, Incline Barbell Bench Press, Decline Barbell Bench Press, Military Press, Barbell Push Press, Barbell Squats, Front Squat, Lower Back Squats, Overhead Squat, Barbell Deadlift, Sumo Deadlift, Barbell Row, Pendlay Row, Barbell Shrugs, Zercher Squat, Clean and Jerk, Snatch, Barbell Curl, Barbell Tricep Extension, Skull Crushers, Barbell Lunges, Good Mornings, Hang Clean, Power Clean, Floor Press, Glute Bridge with Barbell, Landmine Press, Landmine Row, Barbell Hack Squat, Reverse Grip Bent Over Row, Split Jerk, Hip Thrust, Seated Overhead Press, Barbell Calf Raise, Dead Row, Bent Press, Jefferson Squat, Cuban Press, Bradford Press, Isometric Deadlift, Muscle Snatch, Pause Squat, Squat and Press, Bear Complex, Curl Bar Bicep Curl, Close Grip Curl, Reverse Grip Curl, Preacher Curl, Curl Bar Skull Crusher, Overhead Tricep Extension, Barbell Preacher Curl, Spider Curl, Drag Curl, Standing Tricep Extension, Incline Curl, Incline Tricep Extension, Squat Rack Squats, Front Rack Position Squat, Squat Rack Overhead Press, Rack Pulls, Half Rack Deadlift, Shrug from Squat Rack, Box Squats, Push Press from Squat Rack, Anderson Squats, Dumbbell Pullovers, Single Arm Preacher Curl, Reverse Preacher Curl, Hammer Curl on Preacher, One-Arm Dumbbell Preacher Curl, Decline Bench Dumbbell Curl, Wide Grip Preacher Curl, Resistance Band Squats, Resistance Band Lunges, Resistance Band Deadlifts, Resistance Band Push Up, Resistance Band Chest Press, Cable Pulldown, Cable Row, Cable Crossover, Cable Shoulder Press, Cable Fly, Cable Lateral Raise, Cable Front Raise, Cable Reverse Fly, Cable Tricep Pushdown, Face Pull, Cable Woodchop, Cable Kickbacks, Cable Pull-Through, Medicine Ball Slam, Medicine Ball Chest Pass, Medicine Ball Russian Twist, Medicine Ball Overhead Throw, Medicine Ball Sit-Up, Medicine Ball V-Up, Medicine Ball Mountain Climbers, Kettlebell Swing, Kettlebell Snatch, Kettlebell Clean, Kettlebell Press, Kettlebell Goblet Squat, Kettlebell Full Pistol Squat
            `,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ` + openai,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!res.headersSent) {
      const workoutPlan = extractJSON(response.data.choices[0].message.content);
      res.json({ exercises: workoutPlan });
    }
  } catch (error) {
    console.error("Error fetching workout plan from OpenAI API", error);
    if (!res.headersSent) {
      res.status(500).send("Something went wrong.");
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Function to extract JSON safely from Auth response
const extractJSON = (responseContent) => {
  try {
    const cleanContent = responseContent.replace(/```json\s*|```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Error parsing workout JSON response", error);
    throw new Error("Invalid JSON format from Auth response");
  }
};

module.exports = app;