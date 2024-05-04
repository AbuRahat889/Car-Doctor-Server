const express = require("express");
const cors = require("cors");
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
app.use(cors());
app.use(express.json());

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

    //find data for a single id for check out
    // app.get('/services/:id', async(req, res)=>{
    //     const id = req.params.id;
    //     const qurary = {_id: new ObjectId(id)}
    //     const options = {
    //         projection: { title: 1, title: 1, price:1 },
    //       };
    //     const coursor = await ServerSession.findOne(qurary, options);
    //     res.send(coursor);
    // })

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
