const { MongoClient } = require('mongodb');

// Connecting MongoDB using mongodb
const client = new MongoClient(process.env.DATABASE, {
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('natours');
    const collection = database.collection('tours');
    const result = await collection.insertOne({
      name: 'The snow adventurer',
      price: 452,
      rating: 4.6,
    });
    console.log(result);
  } finally {
    await client.close();
  }
}
run().catch((err) => console.log(err));

module.exports = run;
