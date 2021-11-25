const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is running");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ux6rs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("timezone");
    const watches_collection = database.collection("watches");
    const reviews_collection = database.collection("reviews");
    const orders_collection = database.collection("orders");
    const users_collection = database.collection("users");

    // GET ALL WATHCES
    app.get("/watches", async (req, res) => {
      const cursor = watches_collection.find({});
      watches = await cursor.toArray();
      res.json(watches);
    });

    // GET A SINGLE WATCH
    app.get("/watches/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const watch = await watches_collection.findOne(query);
      res.json(watch);
    });

    // PURCHASE A WATCH
    app.post("/orders", async (req, res) => {
      const watch = req.body;
      const orderedWatch = await orders_collection.insertOne(watch);
      res.json(orderedWatch);
    });

    // GET MY ORDERS
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const myOrders = await orders_collection.find(query).toArray();
      res.json(myOrders);
    });

    // GET ALL REVIEWS
    app.get("/reviews", async (req, res) => {
      const cursor = reviews_collection.find({});
      reviews = await cursor.toArray();
      res.json(reviews);
    });

    // ADD USER TO DB
    app.post("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await users_collection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // POST A REVIEW
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviews_collection.insertOne(review);
      res.json(result);
    });

    // REMOVE MY ORDER
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deletedOrder = await orders_collection.deleteOne(query);
      res.json(deletedOrder);
    });

    // CHECK IF USER IS ADMIN
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await users_collection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // ADD A PRODUCT
    app.post("/watches", async (req, res) => {
      const watch = req.body;
      const result = await watches_collection.insertOne(watch);
      res.json(result);
    });

    // DELETE A PRODUCT
    app.delete("/watches/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deletedProduct = await watches_collection.deleteOne(query);
      res.json(deletedProduct);
    });

    // ADD ADMIN
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await users_collection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // GET ALL ORDERS
    app.get("/orders", async (req, res) => {
      const cursor = orders_collection.find({});
      orders = await cursor.toArray();
      res.json(orders);
    });

    // DELETE ANY ORDER
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deletedOrder = await orders_collection.deleteOne(query);
      res.json(deletedOrder);
    });

    // EDIT ANY BOOKING
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };
      const result = await orders_collection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Timezone Server");
});

app.listen(port, () => {
  console.log("Server Is Running On PORT:", port);
});
