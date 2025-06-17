var express = require('express');
var router = express.Router();

const fs = require('fs'); // File System modülü, dosya işlemleri için kullanılır

let routes = fs.readdirSync(__dirname); 


for(let route of routes)
{
  if(route.endsWith(".js") && route !== "index.js") 
  {
    router.use("/"+route.replace(".js","") , require('./' + route)); 
  }
}

module.exports = router;
