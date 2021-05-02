'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');

const PORT = process.env.PORT || 3300;
const server = express();

server.set('view engine', 'ejs');
server.use(express.static('./public'));
server.use(express.urlencoded({ extended: true }));


server.get('/', (req, res) => {

  res.render('pages/index');

});

server.get('/searches/new', (req, res) => {

  res.render('pages/searches/new');
});


server.post('/searches', (req, res) => {

  let search = req.body.search;
  let type = req.body.type;

  let url = `https://www.googleapis.com/books/v1/volumes?q=${type}:${search}`;

  superagent.get(url)
    .then(booksdata => {

      let bookdata = booksdata.body.items;
      let bookInfo = bookdata.map((item) => {

        return new Books(item);
      });
      console.log(bookInfo);
      res.render('pages/searches/show', { booksArr: bookInfo });

    }).catch(error => {

      console.log(error);

      res.render('pages/error');
    });

});

server.get('/hello', (req, res) => {

  res.render('pages/index');

});

server.get('*', (req, res) => {
  res.render('pages/error');;
});


function Books(booksData) {

  this.url = booksData.volumeInfo.imageLinks;
  if (Object.keys(this.url).length !== 0) {
    this.url = this.url.thumbnail;
  } else {
    this.url = 'https://i.imgur.com/J5LVHEL.jpg';
  }
  this.title = booksData.volumeInfo.title || 'Not available';
  this.author = booksData.volumeInfo.authors || 'Not available';
  this.description = booksData.volumeInfo.description || 'Not available';


}


server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
