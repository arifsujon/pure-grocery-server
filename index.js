const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

const port = process.env.PORT || 5055;

app.use(cors());
app.use(bodyParser.json());

// console.log(process.env.DB_USER);

app.get('/', (req, res) => {
  res.send('Hello World!')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v0opz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  //   console.log('connection err', err);
  const productsCollection = client.db("grocery").collection("products");
  

  app.get('/products', (req, res) => {
    productsCollection.find()
      .toArray((err, items) => {
        res.send(items)
        // console.log('from database', items);
      })
  })

  const ObjectID = require('mongodb').ObjectID
  app.delete('/deleteProduct/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    console.log('delete this');
    productsCollection.deleteOne({ _id: id })
      .then((err, documents) => res.send(documents))
  })

  app.post('/addProduct', (req, res) => {
    const newProduct = req.body;
    console.log('adding new product: ', newProduct);
    productsCollection.insertOne(newProduct)
      .then(result => {
        console.log('inserted count: ', result.insertedCount);
        res.send(result.insertedCount > 0)
      })

  })

  const ordersCollection = client.db("grocery").collection("orders");
  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    console.log('adding new order: ', newOrder);
    ordersCollection.insertOne(newOrder)
    .then(result => {
      console.log('inserted count: ', result.insertedCount);
      res.send(result.insertedCount > 0)
    })
  })

  // get order list from database
  app.get('/orders', (req, res) => {
    console.log(req.query.email);
    ordersCollection.find({email: req.query.email})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  //   console.log('Database connected successfully');
  //   client.close();
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})