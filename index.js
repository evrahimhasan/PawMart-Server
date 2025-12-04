const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const cors = require('cors')
require('dotenv').config();
const port = 3000;


const app = express();
app.use(cors())
app.use(express.json())





const uri = "mongodb+srv://PawMart:XlTiCpyWBEVZUCnW@cluster0.83ib2ra.mongodb.net/?appName=Cluster0";

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

        const database = client.db('pawMartDB')
        const pawMartDB = database.collection('listings')


        app.post('/listings', async (req, res) => {
            const data = req.body;

            const date = new Date();
            data.createdAt = date;
            console.log(data);
            const result = await pawMartDB.insertOne(data)
            res.send(result)
        })





        app.get('/listings', async (req, res) => {
            const { category } = req.query
            console.log(category);
            const query = {}
            if (category) {
                query.category = category
            }
            const result = await pawMartDB.find(query).toArray()
            res.send(result)
        })




        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello, Developers')
})

app.listen(port, (req, res) => {
    console.log(`server is running on port ${port}`);
})