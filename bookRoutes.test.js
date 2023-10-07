const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("./index");
const { expect } = chai;

chai.use(chaiHttp);
let token;
let bookId;

describe("User Routes", function () {
  // Test user registration route
  describe("POST /api/register", function () {
    it("should register a new user", async function () {
      this.timeout(8000);

      try {
        const res = await chai.request(app).post("/api/register").send({
          name: "Test User",
          email: "test@example.com",
          password: "testpassword",
        });
        // console.log(res);

        expect(res).to.have.status(201);
        expect(res.body.message).to.equal("Test User successfully registered");
      } catch (err) {
        throw err;
      }
    });

    it("should return a 400 Bad Request for missing required fields", async function () {
      try {
        const res = await chai.request(app).post("/api/register").send({});

        expect(res).to.have.status(400);
        expect(res.body.message).to.equal("All fields are required");
      } catch (err) {
        throw err;
      }
    });
  });

  // Test user login route
  describe("POST /api/login", function () {
    it("should login an existing user and return an authentication token", async function () {
      try {
        const res = await chai.request(app).post("/api/login").send({
          email: "test@example.com",
          password: "testpassword",
        });
        // console.log(res);
        token = res.body.token;
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal("User LoggedIn");
        expect(res.body.token).to.be.a("string");
      } catch (err) {
        throw err;
      }
    });

    it("should return a 401 Unauthorized for incorrect credentials", async function () {
      try {
        const res = await chai.request(app).post("/api/login").send({
          email: "test@example.com",
          password: "incorrectpassword",
        });

        expect(res).to.have.status(401);
        expect(res.body.message).to.equal("Wrong Password");
      } catch (err) {
        throw err;
      }
    });
  });
});

// BOOK ROUTES
describe("Book Routes", function () {
  // Test to post new book
  describe("POST /api/books", function () {
    it("should create a new book", async function () {
      this.timeout(8000);

      try {
        // Create a new book using the authorization token
        const createBookRes = await chai
          .request(app)
          .post("/api/books")
          .set("Authorization", `${token}`)
          .send({
            title: "Sample Book",
            author: "John Doe",
            isbn: "1234567890",
            description: "A sample book description",
            publishedDate: "2023-01-01",
          });
        // console.log(createBookRes.body.book._id);
        bookId = createBookRes.body.book._id;
        expect(createBookRes).to.have.status(201);
        expect(createBookRes.body.message).to.equal("Book created");
      } catch (err) {
        throw err;
      }
    });

    it("should return a 400 Bad Request for missing required fields", async function () {
      try {
        // Attempt to create a new book with missing required fields
        const createBookRes = await chai
          .request(app)
          .post("/api/books")
          .set("Authorization", `${token}`)
          .send({});

        expect(createBookRes).to.have.status(400);
        expect(createBookRes.body.message).to.equal("All fields are required");
      } catch (err) {
        throw err;
      }
    });
  });

  // Test getting books with pagination
  describe("GET /api/books", function () {
    it("should return a list of books with pagination", async function () {
      try {
        const res = await chai
          .request(app)
          .get("/api/books?page=1")
          .set("Authorization", `${token}`);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
      } catch (err) {
        throw err;
      }
    });

    it("should return a list of books matching the search query", async function () {
      try {
        const searchQuery = "Sample";
        const res = await chai
          .request(app)
          .get(`/api/books?query=${searchQuery}`)
          .set("Authorization", `${token}`);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
      } catch (err) {
        throw err;
      }
    });

    it("should return a specific book by its ID", async function () {
      try {
        const res = await chai
          .request(app)
          .get(`/api/books?id=${bookId}`)
          .set("Authorization", `${token}`);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
      } catch (err) {
        throw err;
      }
    });

    it("should return a 400 Not Found if the book ID is invalid", async function () {
      try {
        const invalidBookId = "invalid_id";
        const res = await chai
          .request(app)
          .get(`/api/books?id=${invalidBookId}`)
          .set("Authorization", `${token}`);

        expect(res).to.have.status(400);
        expect(res.body.message).to.equal(
          "Internal server error" || "Book Not Found"
        );
      } catch (err) {
        throw err;
      }
    });
  });

  // Test to Update Book by id
  describe("PUT /api/books/:id", function () {
    it("should update a book by ID", async function () {
      this.timeout(8000);

      try {
        const updateBookRes = await chai
          .request(app)
          .put(`/api/books/${bookId}`)
          .set("Authorization", `${token}`)
          .send({
            title: "Updated Book",
            author: "Updated Author",
            isbn: "9876543210",
            description: "Updated description",
            publishedDate: "2023-03-01",
          });

        expect(updateBookRes).to.have.status(200);
        expect(updateBookRes.body.message).to.equal("Book updated");
      } catch (err) {
        throw err;
      }
    });

    it("should return a 400 Not Found if the book ID is invalid", async function () {
      try {
        const invalidBookId = "invalid_id";
        const updateBookRes = await chai
          .request(app)
          .put(`/api/books/${invalidBookId}`)
          .set("Authorization", `${token}`)
          .send({
            title: "Updated Book",
            author: "Updated Author",
            isbn: "9876543210",
            description: "Updated description",
            publishedDate: "2023-03-01",
          });

        expect(updateBookRes).to.have.status(400);
        expect(updateBookRes.body.message).to.equal("Internal server error");
      } catch (err) {
        throw err;
      }
    });
  });

  // Test to Delete Book by id
  describe("DELETE /api/books/:id", function () {
    it("should delete a book by ID", async function () {
      try {
        const deleteBookRes = await chai
          .request(app)
          .delete(`/api/books/${bookId}`)
          .set("Authorization", `${token}`);

        expect(deleteBookRes).to.have.status(200);
        expect(deleteBookRes.body.message).to.equal("Book deleted");
      } catch (err) {
        throw err;
      }
    });

    it("should return a 400 Not Found if the book ID is invalid", async function () {
      try {
        const invalidBookId = "invalid_id";
        const deleteBookRes = await chai
          .request(app)
          .delete(`/api/books/${invalidBookId}`)
          .set("Authorization", `${token}`);

        expect(deleteBookRes).to.have.status(400);
        expect(deleteBookRes.body.message).to.equal("Internal server error");
      } catch (err) {
        throw err;
      }
    });
  });
});
