import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// ✅ MongoDB connection
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

    // Collections
    const courseCollection = db.collection("courses");
    const instructorCollection = db.collection("instructors");

    // ----------------------------------
    // 🟢 COURSE ROUTES (Full CRUD)
    // ----------------------------------

    // ✅ Create Course
    app.post("/courses", async (req, res) => {
      const newCourse = req.body; // { title, image, price, duration, category, description }
      const result = await courseCollection.insertOne(newCourse);
      res.send(result);
    });

    // ✅ Get All Courses
    app.get("/courses", async (req, res) => {
      const result = await courseCollection.find().toArray();
      res.send(result);
    });

    // ✅ Get Single Course by ID
    app.get("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const course = await courseCollection.findOne({ _id: new ObjectId(id) });
      res.send(course);
    });

    // ✅ Update Course
    app.put("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCourse = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: updatedCourse };
      const result = await courseCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // ✅ Delete Course
    app.delete("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await courseCollection.deleteOne(query);
      res.send(result);
    });

    // ✅ My Added Courses (Filter by Instructor Email)
    app.get("/my-courses/:email", async (req, res) => {
      const email = req.params.email;
      const result = await courseCollection.find({ instructorEmail: email }).toArray();
      res.send(result);
    });

    // ✅ My Enrolled Courses (Filter by User Email)
    app.get("/enrolled-courses/:email", async (req, res) => {
      const email = req.params.email;
      const result = await courseCollection.find({ enrolledUsers: email }).toArray();
      res.send(result);
    });

    // ----------------------------------
    // 🟣 INSTRUCTOR ROUTES (Full CRUD)
    // ----------------------------------

    // ✅ Add Instructor
    app.post("/instructors", async (req, res) => {
      const newInstructor = req.body; // { name, skill, email, image }
      const result = await instructorCollection.insertOne(newInstructor);
      res.send(result);
    });

    // ✅ Get All Instructors
    app.get("/instructors", async (req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    });

    // ✅ Get Single Instructor
    app.get("/instructors/:id", async (req, res) => {
      const id = req.params.id;
      const instructor = await instructorCollection.findOne({ _id: new ObjectId(id) });
      res.send(instructor);
    });

    // ✅ Update Instructor
    app.put("/instructors/:id", async (req, res) => {
      const id = req.params.id;
      const updatedInstructor = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: updatedInstructor };
      const result = await instructorCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // ✅ Delete Instructor
    app.delete("/instructors/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await instructorCollection.deleteOne(query);
      res.send(result);
    });

    // ----------------------------------
    // ✅ Root Route
    // ----------------------------------
    app.get("/", (req, res) => {
      res.send("Learning Server is running successfully!");
    });

    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Learning Server running on port ${port}`);
});
