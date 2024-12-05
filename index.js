


const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

const uri = "mongodb+srv://aboRaihan:fBCOUA4pM6erI5dc@cluster0.khjiv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

        // Database and Collection references
        const visaCollection = client.db("visa").collection("add-visa");
        const applicationsCollection = client.db("visa").collection("applications");

        // POST - Submit Visa Application
        app.post('/apply-visa', async (req, res) => {
            const application = req.body;

            // Validate required fields
            if (!application.email || !application.firstName || !application.lastName) {
                return res.status(400).json({ message: "Missing required fields." });
            }

            try {
                const result = await applicationsCollection.insertOne(application);
                res.status(201).json({ message: "Application submitted successfully.", result });
            } catch (error) {
                console.error("Error submitting application:", error);
                res.status(500).json({ message: "Error submitting application." });
            }
        });

        // GET - Fetch Visa Details by ID
        app.get('/visa-details/:id', async (req, res) => {
            const { id } = req.params;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid ID format." });
            }

            try {
                const visa = await visaCollection.findOne({ _id: new ObjectId(id) });
                if (visa) {
                    res.status(200).json(visa);
                } else {
                    res.status(404).json({ message: "Visa not found." });
                }
            } catch (error) {
                console.error("Error fetching visa details:", error);
                res.status(500).json({ message: "Error fetching visa details." });
            }
        });

        // GET - Get All Visas (No Filter)
        app.get('/all-visas', async (req, res) => {
            try {
                const visas = await visaCollection.find().toArray();
                res.status(200).json(visas);
            } catch (error) {
                console.error("Error fetching all visas:", error);
                res.status(500).json({ message: "Error fetching all visas." });
            }
        });

      

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}

run();

app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});
