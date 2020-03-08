/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;


module.exports = function (app) {
  let booksCollection;
  
  //initialize the database connection
  const client = new MongoClient(MONGODB_CONNECTION_STRING, { useNewUrlParser: true });
  client.connect(err => {
    if(err) throw err;
    booksCollection = client.db("library").collection("books");
    console.log('DB Connected');
  });


  app.route('/api/books')
    .get(function (req, res){
      //find all records in the database
      booksCollection.find({}).toArray((err,result)=>{
        if(err){
          res.status(400).json({error:err});
        }
        else{
          //parse the returned result
          const resultArr = result.map(doc=>{
            return {_id:doc._id,title:doc.title,commentcount:doc.comments.length};
          })
          res.status(200).json(resultArr);
        }
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title

      //if no title was provided
      if(!title){
        res.status(400).send('missing title');
      }
      booksCollection.insertOne({title,comments:[]},(err,result)=>{
        //if there was an error
        if(err)res.status(400).json({error:err})
        else{
          res.status(200).json({title:title,_id:result.insertedId,comments:[]});
        }
      });
    })
    
    .delete(function(req, res){
      booksCollection.deleteMany({}).then(()=>{
        res.status(200).send('complete delete successful');
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      const bookId = req.params.id;
      //search the collection
      booksCollection.findOne({_id:new ObjectId(bookId)}).then(book=>{
        //if no matching book found
        if(!book){
          res.status(400).send('no book exists');
        }
        else{
          res.status(200).send(book);
        }
      }).catch(err=>res.status(400).json({error:err}));
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //update the record
      booksCollection.findOneAndUpdate({_id:new ObjectId(bookid)},{$push:{comments:comment}},{returnOriginal:false}).then(doc=>{
          res.status(200).json(doc.value);
      }).catch(err=>res.status(400).json({error:err}));
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
