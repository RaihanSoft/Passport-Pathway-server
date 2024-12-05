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




        //! user post ...........................................................
        app.post('/apply-visa', async (req, res) => {
            const application = req.body;
            const result = await client.db('visa').collection('applications').insertOne(application);
            res.send(result);
        });
        //   !  2nd.................................... 

        app.get('/my-visa-applications', async (req, res) => {
            const email = req.query.email;
            try {
                const applications = await client
                    .db("visa")
                    .collection("applications")
                    .find({ email })
                    .toArray();
                res.send(applications);
            } catch (error) {
                res.status(500).send({ message: 'Error fetching applications' });
            }
        });

        // DELETE route for removing an application


        app.delete('/cancel-application/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await client
                    .db("visa")
                    .collection("applications")
                    .deleteOne({ _id: new ObjectId(id) }); // Ensure correct conversion to ObjectId

                if (result.deletedCount === 1) {
                    res.send({ message: 'Application canceled successfully' });
                } else {
                    res.status(404).send({ message: 'Application not found' });
                }
            } catch (error) {
                console.error('Error deleting application:', error);
                res.status(500).send({ message: 'Error canceling application' });
            }
        });




        // ! 3rd 



        app.delete('/delete-visa/:id', async (req, res) => {

            const { id } = req.params;

            const query = { _id: new ObjectId(id) }
            const result = await visa.deleteOne(query)
            res.send(result)


        });

        // !4th 









    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}

run();

app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});
