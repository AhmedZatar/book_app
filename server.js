'use strict';


const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverRide = require('method-override');

require('dotenv').config();

const PORT = process.env.PORT || 3300;
const server = express();


server.use(express.static('./public'));
server.use(methodOverRide('_method'));

const client = new pg.Client(process.env.DATABASE_URL);

server.set('view engine', 'ejs');
server.use(express.urlencoded({ extended: true }));

server.get('/', (req, res) => {

  let SQL = `SELECT * FROM books;`;
  client.query(SQL)
    .then(data => {
      res.render('pages/index', { booksdata: data.rows });
    });


});

server.get('/searches/new', (req, res) => {

  res.render('pages/searches/new');
});


server.post('/searches', (req, res) => {

  let search = req.body.search;
  let type = req.body.type;

  let url = `https://www.googleapis.com/books/v1/volumes?q=+in${type}:${search}`;

  superagent.get(url)
    .then(booksdata => {

      let bookdata = booksdata.body.items;
      let bookInfo = bookdata.map((item) => {

        return new Books(item);
      });

      res.render('pages/searches/show', { booksArr: bookInfo });

    }).catch(err=>{
      res.render('pages/error',{error:err});

    });

});

server.post('/addbook', (req, res) => {

  let SQL = 'INSERT INTO books (url,title,author,description,isbn,bookshelf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;';
  let safeValues = [req.body.url, req.body.title, req.body.author, req.body.description, req.body.isbn, req.body.bookshelf];
  client.query(SQL, safeValues)
    .then(result => {
      res.redirect(`/books/${result.rows[0].id}`);
    })
    .catch(err=>{
      res.render('pages/error',{error:err});

    });


});

server.get('/books/:id', (req, res) => {

  let bookId = req.params.id;
  let SQL = `SELECT * FROM books WHERE id=$1;`;
  let safeValue = [bookId];
  client.query(SQL, safeValue)
    .then(result => {

      res.render('./pages/books/show', { book: result.rows[0] });
    })
    .catch(err=>{
      res.render('pages/error',{error:err});

    });

});

server.put('/updateBook/:id',(req,res)=>{
  let {url,title,author,isbn,bookshelf,description} =req.body;
  let SQL ='UPDATE books SET url=$1,title=$2,author=$3,isbn=$4,bookshelf=$5,description=$6 WHERE id=$7;';
  let safeValues= [url,title,author,isbn,bookshelf,description,req.params.id];
  client.query(SQL,safeValues)
    .then(()=>{
      res.redirect(`/books/${req.params.id}`);

    }).catch(err=>{
      res.render('pages/error',{error:err});

    });
});

server.delete('/deleteBook/:id',(req,res)=>{

  let SQL = 'DELETE FROM books WHERE id=$1;';
  let safeValue=[req.params.id];
  client.query(SQL,safeValue)
    .then(()=>{
      res.redirect('/');
    }).catch(err=>{
      res.render('pages/error',{error:err});

    });
});

server.get('/hello', (req, res) => {

  res.render('pages/index');

});

server.get('*', (req, res) => {
  res.render('pages/404page');
});

function Books(booksData) {

  this.url = booksData.volumeInfo.imageLinks;
  if (this.url) {
    this.url = this.url.thumbnail;
  } else {
    this.url = 'https://i.imgur.com/J5LVHEL.jpg';
  }
  this.title = booksData.volumeInfo.title || 'Not available';
  this.author = booksData.volumeInfo.authors || 'Not available';
  this.description = booksData.volumeInfo.description || 'Not available';
  this.isbn = booksData.volumeInfo.industryIdentifiers ;
  if (this.isbn){
    this.isbn = this.isbn[0].identifier;
  }else { this.isbn = 'Not available';
  }
  this.bookshelf = booksData.volumeInfo.categories || 'Not available.';

}


client.connect()
  .then(() => {

    server.listen(PORT, () => {
      console.log(`my port is ${PORT}`);

    });

  });
