# Gym Tracker — Backend + Frontend

This repository contains the Gym Tracker backend (Express + Mongoose) and a React frontend. The backend exposes a REST API under `/api/*` and uses MongoDB for persistence. This README explains how to clone the repo, run a MongoDB server (local or Atlas), run the backend, import a Postman collection, and run the React frontend.

---

## Prerequisites

- Git
- Node.js >= 14 and npm (or Yarn)
- MongoDB (local mongod) OR MongoDB Atlas account
- Postman (optional, for API testing)

---

## 1) Clone the repository

```bash
git clone https://github.com/Pac-Lorenzo/Gym-Tracker-Database.git
cd "Gym-Tracker-Database"
```

---

## 2) Configure environment variables (.env)

Create a `.env` file in the project root with your MongoDB connection string and a PORT for the backend. You can create it quickly using `cat` like this (copy and paste into your shell):

```bash
cat > .env <<'EOF'
MONGO_URI=mongodb://localhost:xxxxx/gymtracker
PORT=3000
EOF
```

Change `MONGO_URI` to your Atlas connection string if you're using Atlas, for example:

```
MONGO_URI="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/gymtracker?retryWrites=true&w=majority"
PORT=3000
```

Notes:
- If you run the React frontend locally it defaults to port `3000` as well; start the frontend with an alternate port (see frontend section).

---

## 3) Running MongoDB

Option A — Local MongoDB (recommended for development):

- If you installed MongoDB via Homebrew (macOS), start it with:

```bash
brew services start mongodb-community
# or, to run without installing as a service:
# mongod --dbpath /path/to/your/db --port 27017
```

- Verify it is running:

```bash
mongosh --eval "db.stats()"
```

Option B — MongoDB Atlas (managed cloud):

- Create a cluster on Atlas and get the connection string.
- Replace `MONGO_URI` in your `.env` with the Atlas connection string (see examples above).
- Make sure your IP is whitelisted or you allow access from your dev IP.

---

## 3.5) Seed the database (prepopulate)

This project includes a seeding script at `scripts/seed.js` that will clear several main collections and insert a curated starter dataset (global exercises, a demo user, templates, a sample workout, and PRs).

How to run the seed script:

1. Ensure your `.env` `MONGO_URI` points to the database you want to populate. WARNING: the seed script deletes documents — run only against a development or disposable DB.

2. From the project root run:

```bash
# install dependencies if you haven't already
npm install

# run the seed script
node scripts/seed.js
```

What the script does:

- Connects to the `MONGO_URI` configured in your `.env`.
- Calls `deleteMany({})` on `exercises`, `users`, `templates`, `workouts`, and `personalrecords`.
- Inserts a library of global exercises, creates a demo user, sample templates, a workout, and PR records.

Warnings and tips:

- If you want to preserve existing data, edit `scripts/seed.js` and comment out the `deleteMany` calls or adapt the script to perform upserts.
- After the script finishes it prints `Seed complete` and the created IDs to the console.


## 4) Install and run the backend

From the project root (where `server.js` sits):

```bash
# install dependencies
npm install

# start the backend
npm start
```

What to expect:
- The server will read `MONGO_URI` and `PORT` from `.env`.
- On success you should see a console message like `💾 Connected to MongoDB` and `🚀 Server running on port 3000`.

If `npm start` is not available or your environment uses a direct node command, you can run:

```bash
node server.js
```

Troubleshooting:
- If the shell says `npm: command not found`, install Node.js and npm (see below).
- If port `3000` is already in use, change `PORT` in `.env` (e.g., `3001`) or stop the process using that port:
* NOTE: if you change the port ensure the postman collection base_url is updated accordingly
```bash
lsof -i :3000 -t | xargs -r kill -9
```

---

## 5) Postman / API testing

Open Postman and create an environment variable named `base_url` with the value `http://localhost:3000/api` (or adjust the port if you changed it).

Suggested environment variables:
- `base_url` — e.g. `http://localhost:3000/api`
- `userId`, `exerciseId`, `workoutId`, `templateId` — placeholders you can set dynamically when running requests.

https://pacochelorenzo-2563759.postman.co/workspace/Pakich17's-Workspace~c30fe611-7edf-4dc8-8219-9c70b0df83a3/collection/49808271-0570db0b-14a3-4340-b29d-c9132946871e?action=share&creator=49808271&active-environment=49808271-3ae32544-a137-4bc9-aedf-6853b01e79dd

---

## 6) Run the React frontend

The React app lives in the `frontend/` folder.

```bash
cd frontend
npm install
npm start
```

By default the React dev server starts on port `3000`. If your backend uses port `3000`, React will prompt to use another port (e.g., `3001`) or you can explicitly set the frontend port when starting:

```bash
# start frontend on port 3001
PORT=3001 npm start
```

Frontend notes:
- The frontend uses `src/api.js` to call the backend; ensure the `base_url` value in Postman or in the frontend's runtime config points to your backend's port (points to 3000 by default).

---

## 7) Install Node.js / npm (if missing)

macOS (Homebrew):

```bash
brew update
brew install node
```

Or download the installer from https://nodejs.org and follow the instructions.

Verify install:

```bash
node -v
npm -v
```

---

## 8) Common commands

From repo root:

```bash
# start backend
npm start

# run backend with nodemon for auto-reload (if installed globally)
nodemon server.js

# run frontend
cd frontend
npm start
```

---

## 9) Mongo Shell Testing Quieries

- Use `mongosh` to inspect data while testing. Example:

```bash
mongosh
use gymtracker
db.users.find()

db.users.findOne({ _id: ObjectId("69260d15161bf3fb3623b819") })


db.users.updateOne(
  { _id: ObjectId("69260d15161bf3fb3623b819") },
  { $set: { weight_lbs: 190 } }
)

		
db.workouts.insertOne({
  user_id: ObjectId("69260d15161bf3fb3623b819"),
  total_time_minutes: 80,
  exercises: [
    {
      exercise_id: "ex001",
      name: "Bench Press",
      is_custom: false,
      sets: [
        { set_id: "S1", weight: 185, reps: 5, difficulty: 8 },
        { set_id: "S2", weight: 185, reps: 5, difficulty: 9 }
      ]
    }
  ]
})


db.personalrecords.find({
  user_id: ObjectId("69260d15161bf3fb3623b819"),
})

db.personalrecords.find({
  	user_id: ObjectId("69260d15161bf3fb3623b819"),
  	best_weight: { $gt: 150 }
})

```

- If you change the `.env` file while the server is running, restart the server to pick up changes.

---



