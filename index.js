const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eeiu8.mongodb.net/?retryWrites=true&w=majority`;

// console.log('mogno  :',uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("employeeManagement");
        const employeeCollection = database.collection("employee")

        app.post("/addEmploys", async (req, res) => {
            const sectorsdata = req.body;
            const result = await employeeCollection.insertOne(sectorsdata);
            res.json(result);
            console.log(result)

        });






        //get all Employs
        app.get("/allEmploys", async (req, res) => {

            const cursor = employeeCollection.find({})
            const count = await cursor.count(); // 110 - 10 -10 -10 +10

            const page = req.query.page;   // 3
            const size = parseInt(req.query.size);  // 10
            let allEmploys;
            if (page) {
                allEmploys = await cursor.skip(page * size).limit(size).toArray()
            } else {
                allEmploys = await cursor.toArray();
            }
            res.send({
                count,
                allEmploys
            });
        });

        // Delete Employs
        app.delete('/deleteEmploy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await employeeCollection.deleteOne(query);
            res.json(result);
        })


        app.put("/updateUser", async (req, res) => {
            // console.log(req.body);
            delete req.body._id;
            const user = Object.entries(req.body).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {})
            const isExistEmail = await (await employeeCollection.find({}).toArray()).map(em => em.Email).includes(email => email === user.Email?.toLowerCase());
            // console.log(user); 
            if (isExistEmail) {
                res.json({ existEmail: true, message: "Email already exist!" })
            } else {
                const filter = { _id: ObjectId(user._id) };
                const options = { upsert: true };
                const updateDoc = {
                    $set: user,
                };
                const result = await employeeCollection.updateOne(filter, updateDoc, options);
                res.json(result);
            }
        })


    } catch (error) {
        console.log(error);
    }
}

run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Hello World!')
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})