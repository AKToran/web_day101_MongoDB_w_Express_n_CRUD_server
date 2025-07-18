const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

//middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://toranbd:${process.env.db_password}@cluster0.cjjjauk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
    await client.connect();

    const database = client.db('usersdb');
    const usersCollection = database.collection('users')

    app.get('/users', async(req, res)=>{
      const cursor = usersCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    })

    app.get('/users/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id : new ObjectId(id)}
      const result = await usersCollection.findOne(query);
      res.send(result);
    })
    
    app.post('/users', async (req, res)=>{
      console.log("data in the server", req.body);
      const result = await usersCollection.insertOne(req.body);

      res.send(result);
    })

    app.put('/users/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)};
      const user = req.body;

      console.log("user data form PUT API: ",user);

      const updatedDoc = {
        $set: {
          name: user.name,
          email: user.email
        }
      }
      const options = { upsert : true }

      const result = await usersCollection.updateOne(filter, updatedDoc, options);

      res.send(result);

    })


    app.delete('/users/:id', async(req, res)=>{
      const id = req.params.id;
      // find the specific obj to delete.
      // _id is an ObjectId in the database.
      const query = { _id: new ObjectId(id)}
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  finally {
    
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
  res.send('server running.....');
})

app.listen(port, ()=>{
  console.log('simple crud server running on ', port);
})