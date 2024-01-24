const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// mongo url


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dnqomnb.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    const  usersCollection = client.db('house_hunter').collection('users');
    const  LoginCollection = client.db('house_hunter').collection('login');
    // jwt api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '2d'
      });
      res.send({ token })
    })

    
     // verify token
     const verifyToken = (req, res, next) => {
      console.log('verify token ', req.headers.authorization)
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Unauthorized access' })
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
          return res.status(401).send({ message: 'Unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    app.get('/users', async (req, res) => {
      const corsor = usersCollection.find();
        const result = await corsor.toArray();
        res.send(result);
  })



  app.post('/users', async (req, res) => {
    const user = req.body;
    const query = { email: user.email };
    const existing = await usersCollection.findOne(query);
    if (existing) {
      res.send({ message: 'user already exist', insertedId: null })
    }
    else {
      const result = await usersCollection.insertOne(user);
      res.send(result);
    }


  })

app.post('/login',async (req,res)=>{
  const body=  req.body
const user =await LoginCollection.findOne({email:body.email})
if(!user){
return "user nai bro"
}

if(user.password !== body.password){
return res.send({match:false})
}

if(user.email !== body.email){
return res.send({found: false})
}
res.send(user)
})

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('House hunter is running')
})

app.listen(port, () => {
    console.log(`House hunter Server is running on port ${port}`)
})