const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
require('dotenv').config();
const port = 3000;


const app = express();
app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.83ib2ra.mongodb.net/?appName=Cluster0`;

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

        // await client.connect();

        const database = client.db('pawMartDB')
        const pawMartDB = database.collection('listings')
        const orderCollection = database.collection('orders')


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
            console.log(category)
            const query = {}
            if (category) {
                query.category = category
            }
            const result = await pawMartDB.find(query).toArray()
            res.send(result)
        })



        app.get('/recent-listings', async (req, res) => {
            const result = await pawMartDB.find().sort({ createdAt: 'desc' }).limit(6).toArray();
            console.log(result);
            res.send(result)
        })




        app.get('/listings/:id', async (req, res) => {
            const id = req.params;
            console.log(id);

            const query = { _id: new ObjectId(id) }
            const result = await pawMartDB.findOne(query)
            res.send(result)
        })





        app.get('/my-listings', async (req, res) => {

            const { email } = req.query
            console.log(email);

            const query = { email: email }
            const result = await pawMartDB.find(query).toArray()
            res.send(result)
        })





        app.put('/update/:id', async (req, res) => {
            const data = req.body
            console.log(data);
            const id = req.params
            const query = { _id: new ObjectId(id) }
            const updatedListing = {
                $set: data
            }
            const result = await pawMartDB.updateOne(query, updatedListing)
            res.send(result)
        })





        app.delete('/delete/:id', async (req, res) => {
            const id = req.params
            const query = { _id: new ObjectId(id) }
            const result = await pawMartDB.deleteOne(query)
            res.send(result)
        })



        app.post('/orders', async (req, res) => {
            const data = req.body
            console.log(data);
            const result = await orderCollection.insertOne(data)
            res.send(result)
        })



        app.get('/orders', async (req, res) => {
            const { email } = req.query
            console.log(email);

            const query = { email: email }
            const result = await orderCollection.find(query).toArray()
            res.send(result)
        })



        // Dashboard stats (for charts)
        app.get('/dashboard-stats', async (req, res) => {
            const totalListings = await pawMartDB.countDocuments({});
            const totalOrders = await orderCollection.countDocuments({});

            // Category wise listings (for Pie Chart)
            const categoryCounts = await pawMartDB.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ]).toArray();

            const pieData = categoryCounts.map(item => ({
                name: item._id || 'Others',
                value: item.count
            }));

            // Last 7 days orders (for Line Chart)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const dailyOrders = await orderCollection.aggregate([
                {
                    $match: { date: { $gte: sevenDaysAgo } }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]).toArray();

            const lineData = dailyOrders.map(item => ({
                date: item._id,
                orders: item.count
            }));

            res.send({
                totalListings,
                totalOrders,
                pieData,
                lineData
            });
        });





        // await client.db("admin").command({ ping: 1 });
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