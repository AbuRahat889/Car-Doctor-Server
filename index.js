const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ServerSession,
} = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middlewar
app.use(
  cors({
    origin: ["http://localhost:5173", 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h8jmnni.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db("carsDoctor").collection("servicess");
    const checkoutCollection = client
      .db("carsDoctor")
      .collection("checkOutInfo");

    //auth info jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    //services info
    //find all data
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //find data for a single _id details page
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const qurary = { _id: new ObjectId(id) };
      const coursor = await serviceCollection.findOne(qurary);
      res.send(coursor);
    });

    //checkout info

    //post data in server
    app.post("/checkout", async (req, res) => {
      const checkout = req.body;
      console.log("checkout", checkout);
      const result = await checkoutCollection.insertOne(checkout);
      res.send(result);
    });

    //finding user for email cart page
    app.get("/checkout", async (req, res) => {
      console.log(req.query.email);
      console.log("token is : ", req.cookies.token);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await checkoutCollection.find(query).toArray();
      res.send(result);
    });

    //delete data from cart page
    app.delete("/checkout/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await checkoutCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("doctor is running on backend");
});

app.listen(port, () => {
  console.log(`car doctor is running${port}`);
});
