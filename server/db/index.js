//require('dotenv').config();
const {MongoClient} = require('mongodb');
const fs = require('fs');

const MONGODB_DB_NAME = 'clear-fashion';
const MONGODB_COLLECTION = 'products';
const MONGODB_URI = 'mongodb+srv://reihan:omate974@clear-fashion.4e5rl.mongodb.net/clear-fashion?retryWrites=true&w=majority';

let client = null;
let database = null;

/**
 * Get db connection
 * @type {MongoClient}
 */
const getDB = module.exports.getDB = async () => {
  try {
    if (database) {
      console.log('💽  Already Connected');
      return database;
    }

    client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    database =  client.db(MONGODB_DB_NAME)

    console.log('💽  Connected');

    return database;
  } catch (error) {
    console.error('🚨 MongoClient.connect...', error);
    return null;
  }
};

/**
 * Insert list of products
 * @param  {Array}  products
 * @return {Object}
 */
module.exports.insert = async products => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    // More details
    // https://docs.mongodb.com/manual/reference/method/db.collection.insertMany/#insert-several-document-specifying-an-id-field
    const result = await collection.insertMany(products, {'ordered': false});

    return result;
  } catch (error) {
    console.error('🚨 collection.insertMany...', error);
    fs.writeFileSync('products.json', JSON.stringify(products));
    return {
      'insertedCount': error.result.nInserted
    };
  }
};

/**
 * Find products based on query
 * @param  {Array}  query
 * @return {Array}
 */
module.exports.find = async (query, limit, page) => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.find(query).sort({price:1, _id:1}).limit(limit).skip((page - 1) * limit).toArray();
    const number_doc = await collection.countDocuments();
    return [result, number_doc];
  } catch (error) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

module.exports.findById = async id => {
  try{
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.find({'_id':id}).toArray();

    return result;
    }
    catch (error) {
    console.error('🚨 collection.find...', error);
    return null;
  }  
}

module.exports.length = async() => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    let length = await collection.countDocuments()
    return length;
  } catch(e) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

module.exports.findByBrand = async (brand = null, price = null, limit = 12) => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    if (brand == null && price == null)
    {
      const result = await collection.find({'price':{$gte:0}}).sort({'price':1}).limit(limit).toArray();
      return result;
    }
    else if (price == null)
    {
      const result = await collection.find({'brand':brand, 'price':{$gte:0}}).sort({'price':1}).limit(limit).toArray();
      return result;
    }
    else if (brand == null)
    {
      const result = await collection.find({'price':{$lte:price, $gte:0}}).sort({'price':1}).limit(limit).toArray();
      return result;
    }
    else
    {
      const result = await collection.find({'brand':brand, 'price':{$lte:price, $gte:0}}).sort({'price':1}).limit(limit).toArray();
      return result;
    }
    
  } catch(e) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

module.exports.lower_than_price = async price => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.find({'price':{$lte:price}})
    return result;
  } catch(e) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

module.exports.sorted_price = async() => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.sort({'price':1})
    return result;
  } catch(e) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

/**
 * Close the connection
 */
module.exports.close = async () => {
  try {
    await client.close();
  } catch (error) {
    console.error('🚨 MongoClient.close...', error);
  }
};
