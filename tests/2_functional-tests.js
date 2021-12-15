const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let likesG = 0;
let likesM = 0
suite('Functional Tests', function() {
  test("Viewing one stock: GET request to /api/stock-prices/", done=>{
    chai
      .request(server)
      .get("/api/stock-prices?stock=MSFT")
      .end((err, res)=>{
        assert.equal(res.body.stockData.stock, "MSFT");
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        likesM = res.body.stockData.likes;
        done();
      });
  });
  test("Viewing one stock and liking it: GET request to /api/stock-prices/", done=>{
    chai
      .request(server)
      .get("/api/stock-prices?stock=GOOG&like=true")
      .end((err, res)=>{
        assert.equal(res.body.stockData.stock, "GOOG");
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        assert.isAbove(res.body.stockData.likes, 0);
        likesG = res.body.stockData.likes
        done();
      });
  });
  test("Viewing the same stock and liking it again: GET request to /api/stock-prices/", done=>{
    chai
      .request(server)
      .get("/api/stock-prices?stock=GOOG&like=true")
      .end((err, res)=>{
        assert.equal(res.body.stockData.stock, "GOOG");
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        assert.equal(res.body.stockData.likes, likesG)
        done();
      });
  });
  test("Viewing two stocks: GET request to /api/stock-prices/", done=>{
    chai
      .request(server)
      .get("/api/stock-prices?stock=GOOG&stock=MSFT")
      .end((err, res)=>{
        assert.equal(res.body.stockData[0].stock, "GOOG");
        assert.equal(res.body.stockData[1].stock, "MSFT");
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        assert.equal(res.body.stockData[0].rel_likes, likesG-likesM);
        assert.equal(res.body.stockData[1].rel_likes, likesM-likesG);
        done();
      });
  });
  test("Viewing two stocks and liking them: GET request to /api/stock-prices/", done=>{
    chai
      .request(server)
      .get("/api/stock-prices?stock=GOOG&stock=MSFT&like=true")
      .end((err, res)=>{
        assert.equal(res.body.stockData[0].stock, "GOOG");
        assert.equal(res.body.stockData[1].stock, "MSFT");
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        assert.equal(res.body.stockData[0].rel_likes, likesG-likesM);
        assert.equal(res.body.stockData[1].rel_likes, likesM-likesG);
        done();
      });
  });
});
