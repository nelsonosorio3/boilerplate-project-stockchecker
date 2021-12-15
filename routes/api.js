'use strict';
const fetch = require('node-fetch')
const mongoose = require("mongoose");
const mySecret = process.env['DB'];
const bcrypt  = require("bcrypt");

mongoose.connect(mySecret, {userNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const likesSchema = new Schema({
  name : {type: String, required: true},
  num : {type: Number, required: true},
  ip : {type: Array, required: true}
});

const Likes = mongoose.model("Likes", likesSchema);

const getLikes = async (name) =>{
  let likes = await Likes.findOne({name})
  if (!likes) {
    likes = await Likes.create({name, num: 0, ip: []})
  }
  return likes.num
}

const checkIp = async (name, ip) =>{
  let likes = await Likes.findOne({name})
  let hash = bcrypt.hashSync(ip, 3);
  let isInDB = false
  for (let ip of likes.ip){
    if (bcrypt.compareSync(ip, hash)) {
      isInDB = true
      break
    }
  }
  if (!isInDB){
    likes.ip.push(ip)
    likes.save()
    return true
  }
  return false
}

const addLike = async (name) =>{
  let like = await Likes.findOneAndUpdate({name}, {$inc: {num: 1}})
}


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      let {stock, like} = req.query
      if (typeof stock === "string"){
        stock = stock.toUpperCase();
        const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
        const data = await response.json();
        let price = data.latestPrice;
        if (!price) return res.json({"error": "not a valid stock name"});
        let likes = await getLikes(stock)
        if (like === "true") {
          let newIp = await checkIp(stock, req.ip)
          if (newIp) {
            await addLike(stock)
            likes = await getLikes(stock)
          }
        }
        let stockData = {stock, price, likes}
        return res.json({stockData})
      }
      else {
        let stockData = []
        for (let element of stock){
          let st = element.toUpperCase()
          const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${st}/quote`)
          const data = await response.json()
          let price = data.latestPrice
          if (!price) return res.json({"error": `${element} is not a valid stock`})
          
          let likes = await getLikes(st)
          if (like === "true") {
            let newIp = await checkIp(st, req.ip)
            if (newIp) {
              await addLike(st)
              likes = await getLikes(st)
            }
          }
          stockData.push({stock: st, price, rel_likes: likes})
        }
        let rel_like1 = stockData[0].rel_likes
        let rel_like2 = stockData[1].rel_likes
        stockData[0].rel_likes = rel_like1 - rel_like2;
        stockData[1].rel_likes = rel_like2 - rel_like1;
        return res.json({stockData})
      }     
    });
    
};
