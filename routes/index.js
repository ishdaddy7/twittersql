'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');

module.exports = function makeRouterWithSockets (io, client) {

  // a reusable function
/*  function respondWithAllTweets (req, res, next){
    var allTheTweets = tweetBank.list();
    res.render('index', {
      title: 'Twitter.js',
      tweets: allTheTweets,
      showForm: true
    });
  }*/

  function respondWithAllTweets2 (req, res, next){
     client.query('SELECT * FROM Tweets INNER JOIN Users on Users.id = Tweets.userid', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', {
       title: 'Twitter.js',
       tweets: tweets,
       showForm: true
      });
    });
  }


  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets2);
  router.get('/tweets', respondWithAllTweets2);

  // single-user page
/*  router.get('/users/:username', function(req, res, next){
    var tweetsForName = tweetBank.find({ name: req.params.username });
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweetsForName,
      showForm: true,
      username: req.params.username
    });
  });*/

// single-user page V2
  router.get('/users/:username', function(req, res, next){
    client.query('SELECT * FROM Tweets INNER JOIN Users on Users.id = Tweets.userid WHERE Users.name = $1', [req.params.username],function (err, result) {
    if (err) return next(err); // pass errors to Express
    var userTweets = result.rows;
    res.render('index', {
     title: 'Twitter.js',
     tweets: userTweets,
     showForm: true,
     username: req.params.username
    });
  });
});


  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    client.query('SELECT * FROM tweets JOIN Users on Users.id = Tweets.userid WHERE tweets.id = $1', [req.params.id], function (err, result) {
        if (err) return next(err);
        var tweetsWithThatId = result.rows;
        res.render('index', {
        title: 'Twitter.js',
        tweets: result.rows // an array of only one element ;-)
      });
    })
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    //var flag = false;

    client.query('SELECT * FROM users WHERE users.name = $1', [req.body.name], function (err,result) {
        if(err) return next(err);

        console.log(result.rows);
        if(result.rows.length !== 0){
            //return flag = true;
          client.query('INSERT INTO tweets (userid, content) VALUES ((SELECT id FROM Users WHERE name = $1),$2);',[req.body.name, req.body.content], function (err, result) {
              client.query('SELECT tweets.id FROM users, tweets WHERE users.name = $1 ORDER BY tweets.id DESC LIMIT 1',[req.body.name], function(err, result) {
                    if(err) return next(err);
                    console.log(result.rows)
                    var newTweet = {
                    name : req.body.name,
                    content : req.body.content,
                    id : result.rows[0]['id']
                  }
                  console.log(newTweet);
                  io.sockets.emit('new_tweet', newTweet);
                  res.redirect('/');
                } )

          if (err) return console.log(err);
           });
          }
        else {

        client.query('INSERT INTO users (name, pictureURL) VALUES ($1,$2)',[req.body.name, 'http:// i.onionstatic.com/avclub/5801/49/16x9/960.jpg'], function (err, result) {
        if (err) return next (err);
        //console.log(result.rows);
            client.query('INSERT INTO tweets (userid, content) VALUES ((SELECT id FROM Users WHERE name = $1),$2);',[req.body.name, req.body.content], function (err, result) {
              if (err) return next (err);

                client.query('SELECT tweets.id FROM users, tweets WHERE users.name = $1 ORDER BY tweets.id DESC LIMIT 1',[req.body.name], function(err, result) {
                      if(err) return next(err);
                      console.log(result.rows)
                      var newTweet = {
                      name : req.body.name,
                      content : req.body.content,
                      id : result.rows[0]['id']
                    }
                    console.log(newTweet);
                    io.sockets.emit('new_tweet', newTweet);
                    res.redirect('/');
                  } )
            });


        });
       }

    });
/*console.log('flag is', flag);
  if(flag) {

    client.query('INSERT INTO tweets (userid, content) VALUES ((SELECT id FROM Users WHERE name = $1),$2);',[req.body.name, req.body.content], function (err, result) {
      if (err) return next (err);
      console.log(result.rows);
    });
  }*/
  // client.query('SELECT tweets.id FROM users, tweets WHERE users.name = $1 ORDER BY tweets.id DESC LIMIT 1',[req.body.name], function(err, result) {
  //     if(err) return next(err);
  //     console.log(result.rows)
  //     var newTweet = {
  //     name : req.body.name,
  //     content : req.body.content,
  //     id : result.rows[0]['id']
  //   }
  //   console.log(newTweet);
  //   io.sockets.emit('new_tweet', newTweet);
  //   res.redirect('/');
  // } )


  });





  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
