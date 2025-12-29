const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const serviceAccount = require("./learning-hub-firebase-admin-key.json");

const app = express();
const port = process.env.PORT || 3000;

// ------------------------------
// Middleware
// ------------------------------
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ------------------------------
// Firebase Admin
// ------------------------------
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ------------------------------
// Firebase Token Verify Middleware
// ------------------------------
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.tokenEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).send({ message: "Unauthorized" });
  }
};

// ------------------------------
// MongoDB
// ------------------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.psactc0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected");

    const db = client.db("learningDB");
    const usersCollection = db.collection("users");
    const coursesCollection = db.collection("courses");
    const enrollCollection = db.collection("enroll");
    const instructorsCollection = db.collection("instructors");

    // ------------------------------
    // USERS
    // ------------------------------
    app.post("/users", async (req, res) => {
      const user = req.body;
      const exists = await usersCollection.findOne({ email: user.email });
      if (exists) return res.send({ message: "User already exists" });
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // ------------------------------
    // COURSES
    // ------------------------------
    app.post("/courses", verifyFirebaseToken, async (req, res) => {
      const course = req.body;
      const result = await coursesCollection.insertOne(course);
      res.send(result);
    });

    app.get("/courses", async (req, res) => {
      const courses = await coursesCollection.find().toArray();
      res.send(courses);
    });

    app.get("/courses/:id", async (req, res) => {
      const course = await coursesCollection.findOne({ _id: new ObjectId(req.params.id) });
      res.send(course);
    });

    app.put("/courses/:id", verifyFirebaseToken, async (req, res) => {
      const result = await coursesCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      res.send(result);
    });

    app.delete("/courses/:id", verifyFirebaseToken, async (req, res) => {
      const result = await coursesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    // ------------------------------
    // ENROLLMENTS
    // ------------------------------
    app.post("/enroll", verifyFirebaseToken, async (req, res) => {
      const result = await enrollCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/enroll", verifyFirebaseToken, async (req, res) => {
      const email = req.query.email;
      if (email !== req.tokenEmail) return res.status(403).send({ message: "Forbidden" });
      const result = await enrollCollection.find({ email }).toArray();
      res.send(result);
    });

    // ------------------------------
    // INSTRUCTORS
    // ------------------------------
    // app.post("/instructors", async (req, res) => {
    //   const result = await instructorsCollection.insertOne(req.body);
    //   res.send(result);
    // });

    // app.get("/instructors", async (req, res) => {
    //   const instructors = await instructorsCollection.find().toArray();
    //   res.send(instructors);
    // });

     // POST: Save Instructor
    // =============================
    app.post("/instructors", async (req, res) => {
      const instructor = req.body;

      // prevent duplicate email
      const existing = await instructorsCollection.findOne({
        email: instructor.email,
      });

      if (existing) {
        return res.send({ message: "Instructor already exists" });
      }

      const result = await instructorsCollection.insertOne({
        ...instructor,
        role: "instructor",
        createdAt: new Date(),
      });

      res.send(result);
    });

    // =============================
    // GET: All Instructors
    // =============================
    app.get("/instructors", async (req, res) => {
      const result = await instructorsCollection.find().toArray();
      res.send(result);
    });

    // =============================
    // GET: Single Instructor by Email
    // =============================
    app.get("/instructors/:email", async (req, res) => {
      const email = req.params.email;
      const result = await instructorsCollection.findOne({ email });
      res.send(result);
    });
    // ------------------------------
    // ROOT
    // ------------------------------
    app.get("/", (req, res) => {
      res.send("🚀 Learning Server running");
    });
  } catch (err) {
    console.error(err);
  }
}

run();

// ------------------------------
// Start Server
// ------------------------------
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
