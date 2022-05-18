const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const run = async () => {
    try {

    } finally {

    }
}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send("To Do App Server");
});

app.listen(port, () => console.log('Server Running port: ', port));
