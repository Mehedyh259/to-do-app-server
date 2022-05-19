const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

// verify access token {
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const accessSecret = process.env.TOKEN_SECRET;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, accessSecret, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Access Forbidden' });
        }
        next();
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@to-do-cluster.ckukj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        console.log('DB connected');

        const taskCollection = client.db('todo_app').collection('tasks');

        // genarate access token when login
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.TOKEN_SECRET);
            res.send({ accessToken });
        });


        app.post('/task', verifyToken, async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            if (result) {
                res.status(201).send(result);
            } else {
                res.send({ message: "something error happpend" })
            }
        });

        app.get('/task', verifyToken, async (req, res) => {
            const email = req.query.email;
            const filter = { email: email }
            const tasks = await taskCollection.find(filter).toArray();
            res.status(200).send(tasks);
        });

        app.put('/task/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: { completed: true }
            }
            const result = await taskCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        });

        app.delete('/task/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await taskCollection.deleteOne(filter);

            if (result) {
                res.send(result);
            } else {
                res.send({ message: "something error happpend" })
            }
        })

    } finally {

    }
}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send("To Do App Server");
});

app.listen(port, () => console.log('Server Running port: ', port));
