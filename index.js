import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.psactc0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("learningDB");
    const courseCollection = db.collection("courses");
    const instructorCollection = db.collection("instructors");

    // ---------- Courses Routes ----------
    app.post('/courses', async (req, res) => {
      const newCourse = req.body;
      const result = await courseCollection.insertOne(newCourse);
      res.send(result);
    });

    app.delete('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await courseCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/courses', async (req, res) => {
      const result = await courseCollection.find().toArray();
      res.send(result);
    });

    // ---------- Instructors Routes ----------
    app.post('/instructors', async (req, res) => {
      const newInstructor = req.body;
      const result = await instructorCollection.insertOne(newInstructor);
      res.send(result);
    });

    app.get('/instructors', async (req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    });

    // Root route
    app.get("/", (req, res) => {
      res.send("Learning Server is running");
    });

    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Learning Server running on port ${port}`);
});
