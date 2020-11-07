const mysql = require('mysql');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
var todayDate = new Date().toISOString().slice(0,10);
const util = require('util');


var prevMonday = new Date();
prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7);
var xyz = prevMonday.toISOString().slice(0,10);



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




function getMaxLevel(userid)
{
    return new Promise(function(resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err)  catch.
       
        const query_str='select max(level) As maxLevel from user_play where userid=?';
        var query_var = [userid];
        db.query(query_str, query_var, function (err, rows, fields) {
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}


function getTotalScore(userid)
{
    return new Promise(function(resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err)  catch.
       
        const query_str='select sum(score) As userTotalscore from user_play where userid=?';
        var query_var = [userid];
        db.query(query_str, query_var, function (err, rows, fields) {
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}


function getWeeklyScore(userid,gameTime)
{
    return new Promise(function(resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err)  catch.
       
        const query_str='select sum(score) As userWeeklyScore from user_play where userid=? and gameplay>?';
        var query_var = [userid,gameTime];
        db.query(query_str, query_var, function (err, rows, fields) {
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

function getTopScorer(gameTime)
{
    return new Promise(function(resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err)  catch.
       
        const query_str='select userid, sum(score) As sum_score from user_play where gameplay>? group by userid order by sum_score desc limit 2';
        var query_var = [gameTime];
        db.query(query_str, query_var, function (err, rows, fields) {
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

function getUserName(userid)
{
    return new Promise(function(resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err)  catch.
       
        const query_str='select username from user_play where userid=?';
        var query_var = [userid];
        db.query(query_str, query_var, function (err, rows, fields) {
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows[0].username);
        });
    });
}


function getUserRank(userid)
{
    return new Promise(function(resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err)  catch.
       
        const query_str = 'select  userid ,sum(score) As totalScore from user_play group by userid order by totalScore desc';
        var query_var = [userid];
        db.query(query_str, query_var, function (err, rows, fields) {
            // Call reject on error states,
            // call resolve with results

            if(!err)
        
            for(var i=0;i<rows.length;i++)
            {
            
                if(Number(rows[i].userid)==Number(userid))
                {
                    rank=i+1;
                    break;
                
                }
            }  
            if (err) {
                return reject(err);
            }
            resolve(rank);
        });
    });
}




// API to fetch all the data
app.post('/fetch_leaderboard',async function(req,res){
    const data = req.body;
   
    var response={};

    const sql1 = 'insert into  user_play (userid,username,level,score,gameplay) values (?,?,?,?,?)';
    db.query(sql1,[data.userid,data.username,data.level,data.score,todayDate],function(err,fileds){
    if(err)
    console.log(err);         
    });


    response.max_level= await getMaxLevel(data.userid);
    response.userTotalScore= await getTotalScore(data.userid);
    response.userWeeklyScore= await getWeeklyScore(data.userid,xyz);
    response.userRank= await getUserRank(data.userid);
    response.topscorers= await getTopScorer(xyz);
   
    for(var i=0;i<response.topscorers.length;i++)
    {
        console.log(response.topscorers.length);
        console.log(response.topscorers[i]['userid']);
        response.topscorers[i]['username']=await getUserName(response.topscorers[i]['userid'])
        
    }
   res.send(response);
});



app.get('/get_user_rank',function(req,res){
    const userid = req.query.userid;
    const sql = 'select  userid ,sum(score) As totalScore from user_play group by userid order by totalScore desc';
    var rank=0;
    
    db.query(sql,function(err,rows,fields){
        if(!err)
        
        for(var i=0;i<rows.length;i++)
        {
        
            if(Number(rows[i].userid)==Number(userid))
            {
                rank=i+1;
                break;
            
            }
        }  
        res.send({rank});   
        
    });
    
    
   
});

