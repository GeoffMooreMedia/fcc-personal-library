/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
let bookId;

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        //set timestamp to identify individual tests
        const timeStamp = new Date().toLocaleString();
        chai.request(server).post('/api/books').send({title:`Chai test ${timeStamp}`}).end(function(err,res){
          assert.isNull(err);
          assert.equal(res.status,200);
          assert.isObject(res.body, 'response should be an object');
          assert.equal(res.body.title,`Chai test ${timeStamp}`);
          assert.isDefined(res.body._id,'The _id field exists');
          
          //store the book id for later use
          bookId = res.body._id;
          done();
        });
        
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server).post('/api/books').end(function(err,res){
          //should be error response
          assert.equal(res.status,400);
          //should have title missing text
          assert.equal(res.text,'missing title');
          done();
        })
        
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server).get('/api/books').end(function(err,res){
          //should not have an error
          assert.isNull(err);
          //should have 200 status
          assert.equal(res.status,200);
          //result should be an array
          assert.isTrue(Array.isArray(res.body),'Response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
        })
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server).get('/api/books/aaaaaaaaaaaaaaaaaaaaaaaa').end(function(err,res){
          //should have 400 status
          assert.equal(res.status,400);
          assert.equal(res.text,'no book exists');
          done();
        })
        
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server).get(`/api/books/${bookId}`).end(function(err,res){
          //status should be 200
          assert.equal(res.status,200);
          //should be no errors
          assert.isNull(err);
          //response should be an object
          assert.isObject(res.body);
          //should have the record _id
          assert.isDefined(res.body._id);
          //should have the book title
          assert.isString(res.body.title);
          //should have an array of comments          
          assert.isTrue(Array.isArray(res.body.comments,'Comments should be an array'));
          done();
        })
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server).post(`/api/books/${bookId}`).send({comment:'Test Comment'}).end(function(err,res){
          //should be no errors
          assert.isNull(err);//
          //should have a 200 status
          assert.equal(res.status,200);
          //response body should be an object
          assert.isObject(res.body);
          //comments should be an array
          assert.isTrue(Array.isArray(res.body.comments));
          //check latest comment
          assert.equal(res.body.comments[res.body.comments.length-1],'Test Comment');
          done();
        })
      });
      
    });

  });

});
