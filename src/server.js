const express = require("express")
const cors = require("cors")
require("dotenv").config("../.env")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_CONN_STR;
const app = express();
app.use(cors());
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


        app.get("/seed", async (req, res) => {
            const countries = [
                {
                    name: "Bangladesh",
                    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6A7JrLQLaT9sJ_rBG0MWGXUXgPW9Fqau0ew&usqp=CAU", // Add appropriate image path
                    attractions: ["Sundarban", "Cox’s Bazar", "Rangamati", "Bandarban", "Saint Martin’s Island"],
                    short_description: "A beautiful country with diverse landscapes and rich cultural heritage."
                },
                {
                    name: "Thailand",
                    image: "https://res.klook.com/image/upload/q_85/c_fill,w_750/v1639736722/blog/oufsodq0763kplkzxow9.jpg", // Add appropriate image path
                    attractions: ["Bangkok", "Chiang Mai", "Ayutthaya", "Phuket", "Phi Phi Islands"],
                    short_description: "A vibrant destination known for its bustling cities and stunning beaches."
                },
                {
                    name: "Indonesia",
                    image: "https://images.adsttc.com/media/images/64a5/54e7/cb9c/461e/3928/f58c/large_jpg/indonesia-plans-to-build-its-new-capital-from-the-ground-up-to-replace-the-sinking-city-of-jakarta_4.jpg?1688556809", // Add appropriate image path
                    attractions: ["Bali", "Borobudur Temple", "Komodo National Park", "Raja Ampat Islands", "Yogyakarta"],
                    short_description: "An archipelago with countless islands offering unique cultural and natural experiences."
                },
                {
                    name: "Malaysia",
                    image: "https://www.amazingtoursbd.com/public/images.php?images=../tour_image/10-top-reasons-why-you-should-visit-malaysia.jpg&width=730&height=400&counter=2", // Add appropriate image path
                    attractions: ["Kuala Lumpur", "Langkawi", "Penang", "Cameron Highlands", "Taman Negara National Park"],
                    short_description: "A melting pot of cultures with modern cities and breathtaking nature."
                },
                {
                    name: "Vietnam",
                    image: "https://visitworld.today/media/blog/previews/gJT6NTlOrj63Mj4yoq5rJojC4jczc9tuGML1chz1.jpg", // Add appropriate image path
                    attractions: ["Ha Long Bay", "Ho Chi Minh City", "Hoi An Ancient Town", "Phong Nha Caves", "Mekong Delta"],
                    short_description: "A country with a rich history, vibrant culture, and stunning landscapes."
                },
                {
                    name: "Cambodia",
                    image: "https://un-page.org/static/8be8d38bafeb58ace99a0d235e713859/credit-photo-paul-szewczyk-cambodia-unsplash.jpg", // Add appropriate image path
                    attractions: ["Angkor Wat", "Siem Reap", "Phnom Penh", "Kep", "Bokor National Park"],
                    short_description: "Home to ancient temples, rich history, and beautiful scenery."
                }
            ];


            const result = await Country.insertMany(countries)
            res.send(result);
        })


        // COUNTRY API

        app.get("/api/countries", async (req, res) => {
            const result = await Country.find().toArray();
            res.send(result).status(200);
        })

        // CREATE TOURIST SPOTS

        app.post("/api/tourist-spots", async (req, res) => {
            const {
                image,
                tourists_spot_name,
                country_name,
                location,
                short_description,
                average_cost,
                seasonality,
                travel_time,
                totaVisitorsPerYear,
                user_email,
                user_name
            } = req.body;

            average_cost = parseFloat(average_cost)

            const touristSpot = {
                image,
                tourists_spot_name,
                country_name,
                location,
                short_description,
                average_cost,
                seasonality,
                travel_time,
                totaVisitorsPerYear,
                user_email,
                user_name
            };
            // Check for required fields
            if (!image || !tourists_spot_name || !country_name || !location || !short_description) {
                return res.status(400).send({ error: 'Missing required fields' });
            }

            try {
                const result = await TouristSpot.insertOne(touristSpot);
                res.status(201).send(result);
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        })

        app.get("/api/tourist-spots/:id", async (req, res) => {
            const id = req.params.id;

            try {
                const data = await TouristSpot.findOne({ _id: new ObjectId(id) });

                if (!data) {
                    return res.status(404).send({ message: "Tourist spot not found" });
                }
                const country = await Country.findOne({ name: data?.country_name })
                res.status(200).send({ data, country });
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        });

        // GET ALL TOURIST SPOTS

        app.get("/api/tourist-spots", async (req, res) => {
            const sort = req.query.sort || "asc"; // Use query parameter to determine sort order
            const country = req.query.country;
            if (country) {
                const sortOrder = sort === "asc" ? 1 : -1; // 1 for ascending, -1 for descending

                try {
                    const data = await TouristSpot
                        .find({ country_name: country })
                        .sort({ average_cost: sortOrder })
                        .toArray();

                    res.status(200).send(data);
                } catch (error) {
                    res.status(500).send({ error: error.message });
                }
            } else {
                const sortOrder = sort === "asc" ? 1 : -1; // 1 for ascending, -1 for descending

                try {
                    const data = await TouristSpot
                        .find()
                        .sort({ average_cost: sortOrder })
                        .toArray();

                    res.status(200).send(data);
                } catch (error) {
                    res.status(500).send({ error: error.message });
                }
            }


        });

        // GET MY LIST

        app.get("/api/my-list/:email", async (req, res) => {
            const email = req.params.email;

            try {
                const data = await TouristSpot
                    .find({ user_email: email })
                    .toArray();

                res.status(200).send(data);
            } catch (error) {
                res.status(500).send({ error: error.message });
            }

        });


        app.patch("/api/tourist-spots/:id", async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            try {
                const result = await TouristSpot.updateOne(
                    { _id: new ObjectId(id) }, // Filter by ID
                    { $set: updatedData } // Update with the provided data
                );
                if (result.matchedCount === 0) {
                    return res.status(404).send({ error: 'Tourist spot not found' });
                }

                res.status(200).send({ message: 'Tourist spot updated successfully' });
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        });
        app.delete("/api/tourist-spots/:id", async (req, res) => {
            const id = req.params.id;

            try {
                const result = await TouristSpot.deleteOne({ _id: new ObjectId(id) })
                if (result.deletedCount === 0) {

                    res.send({ message: "Not found." }).status(404);
                }
                res.send({ message: "Deleted successfully." }).status(200);
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        });

        app.listen(process.env.PORT, () => {


            console.log("Application is running")
        });
    } catch (error) {

    }
}
run().catch(console.dir);

