var pg = require('pg');
var conString = "postgres://localhost/twitterdb";

//this initializes a connection pool
//it will keep idle connections open for a (configurable) 30 seconds
//and set a limit of 10 (also configurable)
pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('SELECT * FROM Tweets WHERE userId IN ($1, $2, $3)',[4,2,8], function(err, result) {
    //call `done()` to release the client back to the pool
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log('hello');
    console.log(result.rows);
    //output: 1
  });
});
