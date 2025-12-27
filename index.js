import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// ------------------------------
// CORS Configuration
// ------------------------------
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true                // allow cookies/auth headers
}));

app.use(express.json());

const port = process.env.PORT || 3000;

// ------------------------------
// MongoDB Connection
// ------------------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.psactc0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
  try {
    await client.connect();
    const db = client.db("learningDB");

    const usersCollection = db.collection("users");
    const coursesCollection = db.collection("courses");
    const instructorsCollection = db.collection("instructors");

    // ------------------------------
    // COURSE ROUTES
    // ------------------------------

    // Create Course
    app.post("/courses", async (req, res) => {
      try {
        const newCourse = req.body;
        const result = await coursesCollection.insertOne(newCourse);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Get all courses
    app.get("/courses", async (req, res) => {
      try {
        const courses = await coursesCollection.find().toArray();
        res.send(courses);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Get course by ID
    app.get("/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const course = await coursesCollection.findOne({ _id: new ObjectId(id) });
        res.send(course);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Update course
    app.put("/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedCourse = req.body;
        const result = await coursesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedCourse }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Delete course
    app.delete("/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await coursesCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Get courses added by instructor
    app.get("/my-courses/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const courses = await coursesCollection.find({ "instructor.email": email }).toArray();
        res.send(courses);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Get courses enrolled by user
    app.get("/enrolled-courses/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const courses = await coursesCollection.find({ enrolledUsers: email }).toArray();
        res.send(courses);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // ------------------------------
    // INSTRUCTOR ROUTES
    // ------------------------------

    // Create instructor
    app.post("/instructors", async (req, res) => {
      try {
        const newInstructor = req.body;
        const result = await instructorsCollection.insertOne(newInstructor);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Get all instructors
    app.get("/instructors", async (req, res) => {
      try {
        const instructors = await instructorsCollection.find().toArray();
        res.send(instructors);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Get instructor by ID
    app.get("/instructors/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const instructor = await instructorsCollection.findOne({ _id: new ObjectId(id) });
        res.send(instructor);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Update instructor
    app.put("/instructors/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedInstructor = req.body;
        const result = await instructorsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedInstructor }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Delete instructor
    app.delete("/instructors/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await instructorsCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    // Root route
    app.get("/", (req, res) => {
      res.send("Learning Server is running successfully!");
    });

    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Learning Server running on port ${port}`);
});
