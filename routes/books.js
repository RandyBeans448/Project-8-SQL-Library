const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}


// Shows the full list of books.
router.get('/', asyncHandler(async (req, res, next) => {
  // let limit = 10
  // let offset = 0 + (req.body.page - 1) * limit
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

/// Posts a new book to the database and redirects to the new route.
router.post('/', asyncHandler(async (req, res, next) => {
  const book = await Book.create({
    title: req.body.title,
    author: req.body.author,
    genre: req.body.genre,
    year: req.body.year })
    res.redirect("/books/" + book.id);
  console.log('Posting books new');
}));

// Shows book detail form.
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("book-detail", { book, title: book.title });  
  } else {
    res.sendStatus(404);
  }
})); 

// Updates book info in the database.
router.post('/', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.update(req.body);
    res.redirect("/books");
  } else {
    res.sendStatus(404);
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

