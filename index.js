const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express()
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.guhcu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
  try{
    await client.connect();
    const database = client.db('carHub');
    const carCollection = database.collection('cars');
    const buyCollection = database.collection('buy');
    const usersCollection = database.collection('users');
    const reviewCollection = database.collection('review');

    // Get Cars API

    app.get('/cars', async(req, res) =>{
      const cursor = carCollection.find({});
      const cars = await cursor.toArray();
      res.send(cars);
    }),

    // Reviews Api 

    app.get('/review', async(req, res) =>{
      const cursor = reviewCollection.find({});
      const customerReviews = await cursor.toArray();
      res.send(customerReviews);
    }),

    // Buy Detials API

    app.get('/buy', async(req, res) =>{
      const email = req.query.email;
      const query = {email: email}
      const cursor = buyCollection.find(query);
      const cars = await cursor.toArray();
      res.send(cars);
    }),

    // Make A Admin 

    app.get('/users/:email', async(req, res) =>{
      const email = req.params.email;
      const query = {email: email};
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if(user?.role === 'admin'){
        isAdmin = true;
      }
      res.json({admin: isAdmin});
    }),

    // Buyers Information and Product Details 

    app.post('/buy', async(req, res)=>{
      const customer = req.body;
      const result = await buyCollection.insertOne(customer);
      console.log(result);
      res.json(result)
    });

    // Revviews Send to data base 

    app.post('/review', async(req, res) =>{
      const customerReview = req.body;
      console.log("POST", customerReview);
      const result = await reviewCollection.insertOne(customerReview);
      res.json(result);
    })

    // Users Informaton send to data base 

    app.post('/users', async(req, res) =>{
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result)
    }),

    // Delete Api in order List

    app.delete('/buy/:id', async(req, res) =>{
      const id = req.params.id;
      const  query = {_id: ObjectId(id)};
      const result = await buyCollection.deleteOne(query);

      console.log("deleting buy id", result);
      res.json(result);
    })

    // Users Modifiy/Update in Data Base to make admin

    app.put('/users/admin', async(req, res) =>{
      const user = req.body;
      console.log("put", user);
      const filter = {email: user.email};
      const updateDoc = {$set: {role: 'admin'}}
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })

  }
  finally{
    // await client.close();
  }
}

run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})