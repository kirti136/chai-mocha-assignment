const { Router } = require("express");
const { BookModel } = require("../models/book.model");
const { verifyToken } = require("../middlewares/verifyToken.middleware");

const bookRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Books-related endpoints
 */

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       description: Book data to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               description:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Book created
 *               book:
 *                 title: 'Sample Book'
 *                 author: 'John Doe'
 *                 isbn: '1234567890'
 *                 description: 'A sample book description'
 *                 publishedDate: '2023-01-01'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: All fields are required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */

bookRouter.post("/books", verifyToken, async (req, res) => {
  try {
    const { title, author, isbn, description, publishedDate } = req.body;

    // Validate required fields
    if (!title || !author || !isbn || !publishedDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBook = new BookModel({
      title,
      author,
      isbn,
      description,
      publishedDate,
    });

    await newBook.save();

    res.status(201).json({ message: "Book created", book: newBook });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get books with pagination, search, and by ID
 *     tags: [Books]
 *     description: Retrieve all books with pagination, search for books by title or author, or get a book by its ID.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query for title or author
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Book ID for getting a specific book
 *     responses:
 *       200:
 *         description: A list of books or a single book
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
bookRouter.get("/books", verifyToken, async (req, res) => {
  try {
    const { page, query, id } = req.query;
    const perPage = 4;
    const skip = (page - 1) * perPage;

    if (id) {
      const book = await BookModel.findById(id);
      if (!book) {
        return res.status(400).json({ message: "Book Not Found" });
      }
      return res.status(200).json(book);
    } else if (query) {
      const searchRegex = new RegExp(query, "i");
      const books = await BookModel.find({
        $or: [{ title: searchRegex }, { author: searchRegex }],
      });
      return res.status(200).json(books);
    } else {
      const books = await BookModel.find().skip(skip).limit(perPage);
      return res.status(200).json(books);
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Internal server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the book to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated book data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               description:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Book updated
 *               book:
 *                 title: 'Updated Book'
 *                 author: 'Updated Author'
 *                 isbn: '9876543210'
 *                 description: 'Updated description'
 *                 publishedDate: '2023-03-01'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             example:
 *               message: Book not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
bookRouter.put("/books/:id", verifyToken, async (req, res) => {
  try {
    const updatedBook = await BookModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({ message: "Book updated", book: updatedBook });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Internal server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the book to delete
 *         schema:
 *           type: string
 *     responses:
 *       202:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             example:
 *               message: Book not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */
bookRouter.delete("/books/:id", verifyToken, async (req, res) => {
  try {
    const deletedBook = await BookModel.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Book deleted", book: deletedBook });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  bookRouter,
};
