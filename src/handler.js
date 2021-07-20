const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name, year = 0, author = '', summary = '', publisher = '', pageCount = 0, readPage = 0, reading = false,
  } = request.payload;

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  if (name === undefined || name === '') {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const book = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };

  books.push(book);

  const isSuccess = books.filter((b) => b.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const checkNameFiltering = (returnedBooks, name) => {
  if (name !== undefined && returnedBooks.length > 0) {
    return returnedBooks.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }
  return returnedBooks;
};

const checkReadingFiltering = (returnedBooks, reading) => {
  if (reading !== undefined && returnedBooks.length > 0) {
    return returnedBooks.filter((book) => {
      const bookReading = book.reading ? 1 : 0;
      return bookReading.toString() === reading;
    });
  }
  return returnedBooks;
};

const checkFinishedFiltering = (returnedBooks, finished) => {
  if (finished !== undefined && returnedBooks.length > 0) {
    return returnedBooks.filter((book) => {
      const bookFinished = book.finished ? 1 : 0;
      return bookFinished.toString() === finished;
    });
  }
  return returnedBooks;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  let returnedBooks = [...books];

  returnedBooks = checkNameFiltering(returnedBooks, name);

  returnedBooks = checkReadingFiltering(returnedBooks, reading);

  returnedBooks = checkFinishedFiltering(returnedBooks, finished);

  returnedBooks = returnedBooks.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  const response = h.response({
    status: 'success',
    data: {
      books: returnedBooks,
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((b) => b.id === bookId)[0];

  if (book === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  }

  return {
    status: 'success',
    data: {
      book,
    },
  };
};

const updateBookByIdHandler = (request, h) => {
  const {
    name, year = 0, author = '', summary = '', publisher = '', pageCount = 0, readPage = 0, reading = false,
  } = request.payload;

  const { bookId } = request.params;
  const finished = pageCount === readPage;
  const updatedAt = new Date().toISOString();

  if (name === undefined || name === '') {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt,
    };

    return {
      status: 'success',
      message: 'Buku berhasil diperbarui',
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index === -1) {
    const response = h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);
    return response;
  }

  books.splice(index, 1);
  return {
    status: 'success',
    message: 'Buku berhasil dihapus',
  };
};

module.exports = {
  addBookHandler, getAllBooksHandler, getBookByIdHandler, updateBookByIdHandler, deleteBookByIdHandler,
};
