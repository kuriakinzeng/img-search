'use strict'
const app = require('express')(); 
app.set('view engine', 'pug');
const mongodb = require('mongodb').MongoClient;
var db;
// mongodb://u:p@ds143340.mlab.com:43340/img-search
mongodb.connect(process.env.MONGOLAB_URI,(err,d)=>{
    if(err) throw err;
    db = d;
    app.listen(process.env.PORT || 8080, ()=>{
        console.log('Be listening')
    });
});

app.get('/api/imagesearch/:term',(req,res) => {
    console.log(req.query.offset);
    const GoogleImages = require('google-images');
    // exposing API key is bad, but this is not a critical app 
    const client = new GoogleImages('005239928322090407730:x63wsgcocgy', 'AIzaSyAcO8M0Ev4SDw1Khcb-XdfjaOu8pw5KFwc');
    client.search(req.params.term,{page: req.query.offset||1}).then(function(results){
        db.collection('searchTerms').insert({
            term: req.params.term,
            when: new Date().toISOString()
        },(err,response) => { if (err) throw err; });
        let response = [];
        results.forEach((r)=>{
           response.push({
               "url": r.url,
               "snippet": r.description,
               "thumbnail": r.thumbnail.url,
               "context": r.parentPage
           });
        });
        res.json(response);
    }); 
});

app.get('/api/latest/imagesearch/',(req,res)=>{
    db.collection('searchTerms')
    .find({},{_id:0}).limit(10).sort({ when: -1 })
    .toArray((err,results)=>{
        if(err) throw err;
        res.json(results);
    });
});

app.get('/',(req,res) => {
    res.render('index',{});
});