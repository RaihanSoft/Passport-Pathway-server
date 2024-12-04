const express = require('express');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://aboRaihan:fBCOUA4pM6erI5dc@cluster0.khjiv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Middleware
app.use(express.json());
app.use(cors());

async function run() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        // ! DB
        const visa = client.db("visa").collection("add-visa");

        // ! POST
        app.post('/add-visa', async (req, res) => {
            const data = req.body;
            const result = await visa.insertOne(data);
            res.send(result);
        });


        app.get('/add-visa', async (req, res) => {
            const result = await visa.find().toArray()
            res.send(result);
        });






    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}

run();

app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});
