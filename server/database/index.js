'user strict';

const {MongoClient} = require('mongodb');
 // TODO put this information in a .config file 
 
const MONGODB_URI ="mongodb+srv://admin-user:ULTRA_password_92@clear-fashion-cluster.nnulq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const MONGODB_DB_NAME = "clearfashion"
//const config = require("../config");
const fs=require('fs');



class MongoCluster {
    constructor(mongo_uri, mongo_db_name){
        this.mongo_uri=mongo_uri;
        this.mongo_db_name=mongo_db_name;
        this.db=null;
        this.client=null;
        this.collection=null;
    }

    // function to connect to the database and set the client, the db and the collection if not already connected
    async connect() {
        try{
            if (this.db != null){
                // db already connected
                console.log("Already connected");
            }
            else {
                // db not connected, initiating connection
                this.client = await MongoClient.connect(this.mongo_uri, {'useNewUrlParser': true});
                this.db =  this.client.db(this.mongo_db_name);
                this.collection = this.db.collection('products');
                console.log("Connected");
            }
        } catch(error){
            console.log("Error in connection to the mongo client :", error);
        }
    };

    //TODO function to instert an array of product in the DB and not stopping if the product is already in the DB
    async insert(products){
        //take the array as arg
        //check if the client is connected, connect if not
        await this.connect();
        try {
            //try insert the products
            const result=await this.collection.insertMany(products, {'ordered': false});
            // return the result
            console.log(`Successfully inserted ${result.result.n} products in the database`);
            return result;
        } catch(error){
            //catch error if error
            console.log("Error inserting the products :", error);
            console.log("Storing the products in a JSON file");
            // put the products in a JSON file not to lose them
            fs.writeFileSync('products.json', JSON.stringify(products));
            return {
                'insertedCount': error.result.nInserted
             };
        }
    }
    // function to make a query

    async find(query){
        try{
            // check if connected and connect if not
            await this.connect();
            // applying the query
            const result=await this.collection.find(query).toArray();
            //returning the results
            return result
        } catch(error){
            // if error, display it and return null
            console.log("Error when querying the products :", error);
            return null;
        }
    }

    //function to remove from the DB
    async removeProducts(query){
        //taking as argument a query describing the products to remove
        try {
            // check if connected, connect if not
            await this.connect();
            // try to remove the products
            const result = await this.collection.remove(query);
            //display the result of the query
            console.log(`Successfuly deleted ${result.result.n} documents`)
        } catch(error){
            // log error if error
            console.log("Error when removing the products :", error)
        }
    }
    
    // function to close the connection
    async close(){
        try {
            await this.client.close();
            console.log("Connection closed")
        } catch(error){
            console.log("Error closing the connection :", error);
        }
    }
}


module.exports= MongoCluster;