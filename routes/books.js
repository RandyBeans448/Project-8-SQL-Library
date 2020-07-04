const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
//Require OP from Sequelize to access the 'LIKE' operater 
const Sequelize = require('sequelize');
const { Op } = Sequelize.Op;


function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

//Search Library for books
router.get('/books', asyncHandler(async (req, res) => {
  let { searchQuery } = req.query;
  let book = await Book.findAll({ where: { 
    title: { [Op.like]: `%${searchQuery}%`}, 
    author: { [Op.like]: `%${searchQuery}%`},
    genre: { [Op.like]: `%${searchQuery}%`},
    year: { [Op.like]: `%${searchQuery}%`}
    } 
  })
  res.render("index", { book, title: "Search Results" });
  console.log('Search complete')
 }));

// Shows the full list of books.
router.get('/', asyncHandler(async (req, res, next) => {
  try {
    const books = await Book.findAll({ order: [["createdAt", "DESC"]]});
    res.render('index', { books, title: "Book list" });
    console.log('Rendering books');
  } catch(e) {
    console.log(e);
  }
 
}));

// Shows the create new book form.
router.get('/new', asyncHandler(async (req, res) => {
  res.render('new-book', {book: {}, title: "New Book"});
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
    res.redirect("/books/" + book.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
    } else {
      throw error;
    }
  }
}));

// Shows book detail form.
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("update-book", { book, title: book.title });  
  } else {
    res.sendStatus(500);
  }
})); 

// Updates book info in the database.
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/"); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("book/" + book.id, { book, errors: error.errors, title: "Edit Book" })
    } else {
      throw error;
    }
  }
}));



// Deletes a book. 
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id)
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
