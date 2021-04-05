const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const db= require('./db/index.js')

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});
app.get('/products/:id',async (request,response)=>{
  id=request.params.id;
  res=await db.find({id},1,1);
  if(res.result.length>0){
  console.log(res.result);
  response.send(res.result);
  }
  else{
    console.log("id not found")
    response.send({"res":"id not found"});
  }
})
app.get('/products', async (req, res) => {
  //response.send({'a': true});
  let page = parseInt(req.query.page);
  let size = parseInt(req.query.size);
  let start = (size*(page-1));
  console.log("start= "+start);
  console.log("end=" +start + size);
  let prod = []
  let counter = 0;
  const result = await db.querydata({"price":{$ne:Number("Nan")}})

  for(i=start;i<start+size;i++){
      if(result[i] != null){
        console.log(i+' '+result[i].price)
        prod.push(result[i])
        counter++;

      }

    }
  console.log(counter);
  res.send({"success":true,"data":{"result":prod,"meta":{"currentPage":page,"pageCount":Math.round(result.length/size),"pageSize":size,"count":result.length}}});
});
app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);
