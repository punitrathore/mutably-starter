console.log("Sanity Check: JS is working!");

const UI = {
  refreshBooks: function(books) {
    for (var i=0; i< books.length; i++) {
      const {_id, title} = books[i]
      ELEMENTS.booksList().append('<li class="list-group-item item-' + _id + '">'
                              + '<button class="btn btn-primary edit-btn edit-' + _id + '" data-id="' + _id + '">Edit</button>'
                              + '<button class="btn btn-success save-btn save-' + _id + '" data-id="' + _id + '">Save</button>'
                              + '<span class="title-' + _id + '">&nbsp;' + title + '</span>'
                              + '<span class="form-inline edit-form input-' + _id + '">&nbsp;<input class="form-control" value="' + title + '"/></span>'
                              + '<button class="btn btn-danger delete-btn pull-right" data-id="' + _id + '">Delete</button>'
                              + '</li>')
    }
  },

  deleteBook: function(book) {
    console.log('handleBookDeleteResponse got ', book);
    var bookId = book._id;
    var $row = $('.item-'  +  bookId);
    // remove that book row
    $row.remove();
  },

  updateBook: function(book) {
    var id = book._id;

    // replace the old title with the new title
    $('.title-' + id).html('&nbsp;' + book.title)

    $('.title-' + id).show()
    $('.input-' + id).hide()
    $('.edit-' + id).show()
    $('.save-' + id).hide()
  },

  addEventListeners: function() {
    ELEMENTS.newBookForm().on('submit', ACTIONS.createBook)
    // becasue the delete-btn is added dynamically, the click handler needs to be written like such, bound to the document
    $(document).on('click', '.delete-btn', ACTIONS.deleteBook)
    $(document).on('click', '.edit-btn', ACTIONS.editBook)
    $(document).on('click', '.save-btn', ACTIONS.updateBook)
  }
};

const ELEMENTS = {
  booksList: () => $('.list-group'),
  newBookForm: () => $('#new-book-form')
}

const ACTIONS = {
  createBook: function(event) {
    event.preventDefault()
    var newBookData = $(this).serialize();
    console.log(newBookData);
    $(this).trigger("reset");

    BookStore.create(newBookData)
      .then(UI.getAllBooks);
  },

  getAllBooks: function(event) {
    ELEMENTS.booksList().html('')
    BookStore.fetchAll()
      .then(UI.refreshBooks)
  },

  editBook: function(event) {
    var id = $(event.target).data('id')

    // hide the static title, show the input field
    $('.title-' + id).hide()
    $('.input-' + id).show()

    // hide the edit button, show the save button
    $('.edit-' + id).hide()
    $('.save-' + id).show()
  },

  updateBook: function(event) {
    var id = $(event.target).data('id')

    // grab the user's inputted data
    var updatedTitle = $('.input-' + id + ' input').val()
    BookStore.update(id, updatedTitle)
    .then(UI.updateBook)
  },

  deleteBook: function(event) {
    var id = $(event.target).data('id')
    BookStore.delete(id)
      .then(UI.deleteBook);
  }
};

const BookStore = {
  create: (book) => {
    return fetch('http://mutably.herokuapp.com/books/', {
      method: 'POST',
      body: book,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
  },
  fetchAll: () => {
    return fetch('http://mutably.herokuapp.com/books', {
      method: 'GET'
    })
    .then(response => response.json())
    .then(data => data.books);
  },

  delete: (id) => {
    return fetch('http://mutably.herokuapp.com/books/' + id, {
      method: 'DELETE'
    })
    .then(response => response.json());
  },

  //TODO: should pass the whole book here instead of just the title
  update: (id, updatedTitle) => {
    return fetch('http://mutably.herokuapp.com/books/' + id, {
      method: 'PUT',
      body: JSON.stringify({title: updatedTitle}),
      headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())

  }
};

$(document).ready(function(){
  // get all the data on load of the page
  ACTIONS.getAllBooks();
  UI.addEventListeners();
});
