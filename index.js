const mysql = require('mysql');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();



// mysql connection
const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'password',
    database : 'leaderboard'
});

db.connect(function(err){
    if(!err)
    console.log("db connection establised");
    else
    console.log("db connection failed"+JSON.stringify(err));
});


// express server connection
var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
 })



// body parser for JSON data
app.use(bodyParser.json());



// API to fetch all the data
app.get('/fetch_score',function(req,res){

    db.query('select * from users',function(err,fields){
        if(!err)
        res.send(fields);
        else
        console.log(err);


    });

});