const express = require("express")
const cors = require("cors")
require("dotenv").config("../.env")
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_CONN_STR;
const app = express();
app.use(cors);
app.use(express.json());

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
        const database = client.db("travigo")
        await database.command({ ping: 1 });
        console.log("Connected to database");
        const Country = database.collection("countries");
        const TouristSpot = database.collection("tourist-spots");






        app.listen(process.env.PORT, () => {

            console.log("Application is running")
        });
    } catch (error) {

    }
}
run().catch(console.dir);

