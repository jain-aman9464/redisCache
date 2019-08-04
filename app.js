const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');
const port = 3000;
const app = express();

const db = require('./models');

let client = redis.createClient();

client.on('connect', function () {
  console.log('Connected to Redis. . .');
})
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(methodOverride('_method'));

// Search Page
app.get('/', function (req, res, next) {
  res.render('searchusers');
});

app.post('/user/search', function (req, res, next) {
  let id = req.body.id;

  client.hgetall(id, function (err, obj) {
    if (err)
      console.log('cache err: ', err);
    if (!obj) {
      console.log('Cache Miss...Querying to DB !!')
      db.users.findAll({
        raw: true,
        where: {
          'user_id': id
        }
      }).then(result => {
        console.log('result: ', result)
        if (!result.length) {
          res.render('searchusers', {
            error: 'User does not exist'
          });
        }
        else {
          console.log('Rendered data from DB');
          console.log('Pushing this data to cache. . .');

          client.hmset(id, [
            'fist_name', result[0].first_name,
            'last_name', result[0].last_name,
            'email', result[0].email,
            'phone', result[0].phone
          ], function (err, reply) {
            if (err)
              console.log('Error pushing data into cache: ', err);
            console.log(reply);
          });
          res.render('details', {
            user: result[0]
          });
        }
      });
    }
    else {
      console.log('cache HIT');
      obj.user_id = id;
      console.log('Rendered data from redis cache');
      res.render('details', {
        user: obj
      });
    }
  });
});

app.get('/user/add', function (req, res, next) {
  res.render('adduser');
});

//Add a new user into DB
app.post('/user/add', function (req, res, next) {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  db.users.create({
    user_id: id,
    first_name: first_name,
    last_name: last_name,
    email: email,
    phone: phone
  }).then(function (users) {
    res.redirect('/');
  });
});

app.post('/user/add', function (req, res, next) {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  client.hmset(id, [
    'fist_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone
  ], function (err, reply) {
    if (err)
      console.log(err);

    console.log(reply);
    res.redirect('/');
  });
});

app.delete('/user/delete/:id', function (req, res, next) {
  client.del(req.params.id);
  res.redirect('/');
});

app.listen(port, function () {
  console.log('Server started on PORT: ' + port);
})