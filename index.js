const express = require('express');
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Influencer Manager Server Running');
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bioniru.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const influencerCollection = client.db("todoDB").collection("influencer");
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/influencer', async(req, res) => {
        const result = await influencerCollection.find().toArray();
        res.send(result);
    })

    app.post('/influencer', async(req, res) => {
      const influencer = req.body;
      const result = await influencerCollection.insertOne(influencer);
      res.send(result);
    })

    app.put('/influencer/:id', async(req, res) => {
        const id = req.params.id;
        const updatedDoc = req.body;
        const query = {_id: new ObjectId(id)};
        const update = { $set: updatedDoc };
        const result = await influencerCollection.updateOne(query, update);
        res.send(result);
    })

    app.get('/influencer/:text', async (req, res) => {
        const searchText = req.params.text;

      const result = await influencerCollection
        .find({
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { instagram: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    })

    app.get('/sorted/:text', async(req, res) => {
        const sortText = req.params.text;
        let sortOption = {};

        if (sortText === 'name') {
          sortOption = { name: 1 };
        } else if (sortText === 'follower') {
          sortOption = { follower: -1 };
        }
    
        const sortedData = await influencerCollection.find().sort(sortOption).toArray();
    
        res.send(sortedData);
    })

    app.delete('/influencer/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await influencerCollection.deleteOne(query);
      res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, (req, res) => {
    console.log(`Server Running on Port: ${port}`)
})