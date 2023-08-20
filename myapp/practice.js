const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const dbPath = path.join(__dirname, "goodreads.db");
let db = null;

const intializeAndConnectDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log(`Server is Running at http://localhost:3001`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

intializeAndConnectDb();

app.get("/book/", async (request, response) => {
  const dbQuery = `select * from book order by book_id;`;
  const getAllBooks = await db.all(dbQuery);
  response.send(getAllBooks);
});

app.get("/book/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const dbQuery = `select * from book where book_id = ${bookId}`;
  const getBook = await db.get(dbQuery);
  response.send(getBook);
});

app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const addBook = await db.run(addBookQuery);
  const book_Id = addBook.lastID;
  response.send({ book_id: book_Id });
});

app.put("/book/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;

  await db.run(updateBookQuery);
  response.send(`Updates successfully`);
});
app.delete("/book/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const result = `delete from book where book_id = ${bookId}`;
  await db.run(result);
  response.send("Deleted Successfully");
});
