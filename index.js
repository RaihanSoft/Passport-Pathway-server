require('dotenv').config()


const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.khjiv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();
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



        // GET - Get the 6 Latest Newly Added Visas
        app.get('/all-visas', async (req, res) => {
            try {
                // Sort by `_id` in descending order to fetch the newest first and limit the result to 6 documents
                const visas = await visaCollection
                    .find()
                    .sort({ _id: -1 }) // Newest first
                    .limit(6)          // Limit to 6 documents
                    .toArray();

                res.status(200).json(visas);
            } catch (error) {
                console.error("Error fetching all visas:", error);
                res.status(500).json({ message: "Error fetching all visas." });
            }
        });


        // GET - Get All Visas (No Filter)
        app.get('/all-visa', async (req, res) => {
            try {
                const visas = await visaCollection.find().toArray();
                res.status(200).json(visas);
            } catch (error) {
                console.error("Error fetching all visas:", error);
                res.status(500).json({ message: "Error fetching all visas." });
            }
        });


        // GET - Get Visas for Logged-in User (Filtered by userEmail)
        app.get('/add-visa', async (req, res) => {
            const { email } = req.query;
            if (!email) {
                return res.status(400).json({ message: "Email query parameter is required." });
            }

            try {
                const visas = await visaCollection.find({ userEmail: email }).toArray();
                res.status(200).json(visas);
            } catch (error) {
                console.error("Error fetching visas:", error);
                res.status(500).json({ message: "Error fetching visas." });
            }
        });

        // POST - Add Visa (with userEmail)
        app.post('/add-visa', async (req, res) => {
            const data = req.body;
            if (!data.userEmail) {
                return res.status(400).json({ message: "User email is required." });
            }

            try {
                const result = await visaCollection.insertOne(data);
                res.status(201).json(result);
            } catch (error) {
                console.error("Error adding visa:", error);
                res.status(500).json({ message: "Error adding visa." });
            }
        });

        // DELETE - Delete Visa by ID
        app.delete('/delete-visa/:id', async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid ID format." });
            }

            try {
                const result = await visaCollection.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 1) {
                    res.status(200).json({ message: "Visa deleted successfully." });
                } else {
                    res.status(404).json({ message: "Visa not found." });
                }
            } catch (error) {
                console.error("Error deleting visa:", error);
                res.status(500).json({ message: "Failed to delete visa." });
            }
        });

      

        // PUT - Update Visa
        app.put('/update-visa/:id', async (req, res) => {
            try {
                const id = req.params.id;

                // Validate ObjectId
                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ message: 'Invalid ID format.' });
                }

                const filter = { _id: new ObjectId(id) };
                const updateData = req.body;

                // Debugging Logs
                console.log('Received ID:', id);
                console.log('Update Data:', updateData);

                // Build the update operation
                const update = {
                    $set: {
                        countryName: updateData.countryName,
                        visaType: updateData.visaType,
                        processingTime: updateData.processingTime,
                        fee: updateData.fee,
                        validity: updateData.validity,
                        applicationMethod: updateData.applicationMethod,
                        description: updateData.description,
                        requiredDocuments: updateData.requiredDocuments,
                        countryImage: updateData.countryImage,
                        ageRestriction: updateData.ageRestriction,
                    },
                };

                // Perform the update operation
                const result = await visaCollection.updateOne(filter, update);

                // Respond based on the result of the update
                if (result.modifiedCount > 0) {
                    res.status(200).json({ message: 'Visa updated successfully', result });
                } else {
                    res.status(404).json({ message: 'Visa not found or no changes made.' });
                }
            } catch (error) {
                console.error('Error during update:', error);
                res.status(500).json({ message: 'Failed to update visa.', error });
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
