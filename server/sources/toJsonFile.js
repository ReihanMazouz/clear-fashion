const fsLibrary  = require('fs') 

module.exports.productToJsonFile = (products, brand, end) => {
    jsonproducts = ProductToJson(products, brand, end);
    var options = { flag : 'a' };
    fsLibrary.writeFile('ScrappedProducts.json', jsonproducts, options, function(err) {
        if (err) throw err;
    });
};

function ProductToJson(products, brand, end){
    let jsonproducts = "";
    for(let i = 0; i < products.length; i++){
        //Checking if we have a price superior to 0, replacing by null if we don't.
        if(!(products[i].price > 0)){
            products[i].price = null;
        }
        jsonproducts += '\t{\n\t\t"brand" : "' + brand + '",\n\t\t"name": "' + products[i].name + '",\n\t\t"price": ' + products[i].price + '\n\t},\n';
    }
    if(end){
        jsonproducts = jsonproducts.substring(0, jsonproducts.length - 2);
        jsonproducts += '\n]'
    }
    
    return jsonproducts;
}