const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Sequelize = require('sequelize');

//asyncHandler wraps each route in this function and is taken as the callback
function asyncHandler(callback){
  return async(req, res, next) => {
    try {
      await callback(req, res, next)
    } catch(error){
      res.status(500).render('error');
    }
  }
}

// Shows the full list of books.
router.get('/', asyncHandler(async (req, res, next) => {
    const books = await Book.findAll({ order: [['createdAt', 'DESC']]});
    res.render('index', { books, title: 'Book list' });
    console.log('Rendering books');
}));

// Shows the create new book form.
router.get('/new', asyncHandler(async (req, res) => {
  res.render('new-book', {book: {}, title: 'New Book'});
}));

// Posts a new book to the database and redirects to the new route.
router.post('/', asyncHandler(async (req, res) => {
  let book ;
  try {
    book = await Book.create({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      year: req.body.year })
    res.redirect('/books/' + book.id);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('update-book', { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }
  }
}));

// Shows book detail form.
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('update-book', { book, title: book.title });  
  } else {
throw error;
  }
})); 

// Updates book info in the database.
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect('/'); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('book/' + book.id, { book, errors: error.errors, title: 'Edit Book' })
    } else {
      throw error;
      
    }
  }
}));

// Deletes a book. 
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/')
    res.sendStatus(301)
    console.log('deleted')
  } else {
   throw error
  }
}));

module.exports = router;
