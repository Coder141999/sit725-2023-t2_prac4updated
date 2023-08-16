const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const uri = "mongodb+srv://coder12345:mongodb12345@cluster0.faktrzo.mongodb.net/?retryWrites=true&w=majority";
const port = process.env.port || 3000;
let collection;

app.use(express.static(__dirname + '/'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/images', express.static('images')); 

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function runDBConnection() {
    try {
        await client.connect();
        collection = client.db().collection('Cat');
        console.log("Connected to the database successfully");
    } catch (ex) {
        console.error(ex);
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/cats', (req, res) => {
    collection.find({}).toArray((err, result) => {
        if (!err) {
            res.json({ statusCode: 200, data: result, message: 'get all cats success' });
        } else {
            res.json({ statusCode: 500, data: null, message: err.message });
        }
    });
});

app.post('/api/cat', (req, res) => {
    let cat = req.body;
    collection.insertOne(cat, async (err, result) => {
        if (err) {
            console.error("Insertion Error: ", err);
            return res.json({ statusCode: 500, data: null, message: err.message });
        }

        if (result && result.acknowledged) {
            try {
                const insertedCat = await collection.findOne({ _id: result.insertedId });
                if (insertedCat) {
                    return res.json({ statusCode: 201, data: insertedCat, message: 'success' });
                } else {
                    console.error("Failed to retrieve the inserted document.");
                    return res.json({ statusCode: 500, data: null, message: "Failed to retrieve the inserted document." });
                }
            } catch (fetchErr) {
                console.error("Error fetching inserted document: ", fetchErr);
                return res.json({ statusCode: 500, data: null, message: "Error fetching inserted document." });
            }
        } else {
            console.error("Unexpected result structure: ", result);
            return res.json({ statusCode: 500, data: null, message: "Unexpected database response" });
        }
    });
});

app.listen(3000, () => {
    console.log('Express server started on port 3000');
    runDBConnection();
});

