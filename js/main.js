//starts automatically when the page is loaded and sets the service worker
window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service_worker.js').then(function (registration) {

      //service worker registered correctly
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    },
    function (err) {

      //troubles in registering the service worker
      console.log('ServiceWorker registration failed: ', err);
    });
  }
}

//starts automatically when the page is loaded and checks if the user has access to the page (used by "cart.html", "account.html", "shop.html" e "recensione.html")
function checkLogged() {
  if (sessionStorage.getItem('logged') !== 'true') {
    document.location.href = "index.html";
  }
}

//starts automatically when the page is loaded and checks if the user is logged
function checkNotLogged() {
  if (sessionStorage.getItem('logged') === 'true') {
    document.location.href = "index.html";
  }
}

//------------------------------------------------INDEX.HTML------------------------------------------------------------
//starts automatically when the page is loaded and checks if the user is logged
function showNavbar() {

  //gets navbar's button's elements
  const accountButton = document.getElementById('nav_account'),
      shopButton    = document.getElementById('nav_shop'),
      loginButton   = document.getElementById('nav_login');

  //if the user is logged, it shows buttons that send the user to page for which login is needed
  if (sessionStorage.getItem('logged') === 'true') {
    accountButton.style.display = "block";
    shopButton.style.display = "block";
    loginButton.style.display = "none";
  }

  //otherwise it hides buttons that send user to page for which login is needed
  else {
    shopButton.style.display = "none";
    accountButton.style.display = "none";
  }
}

function initializeCarousel(wrapperSelector) {

  //gets each carousel's elements
  const wrapper = document.querySelector(wrapperSelector),

      //carousel's class of element
      carousel = wrapper.querySelector(".carousel"),

      //carousel's first image
      firstImg = carousel.querySelectorAll("img")[0],

      //arrow to scroll images
      arrowIcons = wrapper.querySelectorAll("i");

  //variables to track drag states and positions
  let isDragStart = false,
      isDragging = false,
      prevPageX,
      prevScrollLeft,
      positionDiff;

  //shows or hides navigation icons based on carousel scroll position
  const showHideIcons = () => {

    //scroll width
    let scrollWidth = carousel.scrollWidth - carousel.clientWidth;

    //left arrow property
    arrowIcons[0].style.display = carousel.scrollLeft === 0 ? "none" : "block";

    //right arrow property
    arrowIcons[1].style.display = carousel.scrollLeft === scrollWidth ? "none" : "block";
  };

  //sets an event that start when an arrow is pressed
  arrowIcons.forEach(icon => { icon.addEventListener("click", () => {

    //first image's width
    let firstImgWidth = firstImg.clientWidth + 14;

    //updates carousel position based on the clicked arrow
    carousel.scrollLeft += icon.classList.contains("carousel-left") ? -firstImgWidth : firstImgWidth;

    //delays the execution of showHideIcons
    setTimeout(() => showHideIcons(), 60);
  });
  });

  //manages automatic sliding based on the drag direction and position difference
  const autoSlide = () => {

    // if there is no image left to scroll then return from here
    if(carousel.scrollLeft - (carousel.scrollWidth - carousel.clientWidth) > -1 || carousel.scrollLeft <= 0) return;

    positionDiff = Math.abs(positionDiff); // making positionDiff value to positive
    let firstImgWidth = firstImg.clientWidth + 14;

    // getting difference value that needs to add or reduce from carousel left to take middle img center
    let valDifference = firstImgWidth - positionDiff;

    // if user is scrolling to the right
    if(carousel.scrollLeft > prevScrollLeft)
      return carousel.scrollLeft += positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;

    // if user is scrolling to the left
    carousel.scrollLeft -= positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
  }

  //manages the drag of the carousel
  const dragStart = (e) => {

    //variables to track drag start state and initial position
    isDragStart = true;
    prevPageX = e.pageX || e.touches[0].pageX;
    prevScrollLeft = carousel.scrollLeft;
  }

  //manages dragging operations
  const dragging = (e) => {

    //checks if the draggins is start
    if(!isDragStart) return;

    //prevents default behavior for touch and mouse events
    e.preventDefault();

    //indicates that the dragging is in progress
    isDragging = true;
    carousel.classList.add("dragging");

    //upgrades the scroll left property
    positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
    carousel.scrollLeft = prevScrollLeft - positionDiff;

    //shows or hides navigation icons based on the updated scroll position
    showHideIcons();
  }

  //stops the dragging
  const dragStop = () => {

    // resets drag start state
    isDragStart = false;
    carousel.classList.remove("dragging");

    //if dragging is in progress, executes autoSlide
    if(!isDragging) return;
    isDragging = false;
    autoSlide();
  }

  // adds event listeners for mouse and touch events to initiate the drag operation
  carousel.addEventListener("mousedown",  dragStart, { passive: true });
  carousel.addEventListener("touchstart", dragStart, { passive: true });

  // adds event listeners for mouse and touch move events to handle dragging
  document.addEventListener("mousemove", dragging, { passive: true });
  carousel.addEventListener("touchmove", dragging, { passive: true });

  // adds event listeners for mouse and touch end events to handle the end of dragging
  document.addEventListener("mouseup",  dragStop, { passive: true });
  carousel.addEventListener("touchend", dragStop, { passive: true });
}

//initializes each carousel
initializeCarousel("#carousel1");
initializeCarousel("#carousel2");
initializeCarousel("#carousel3");
initializeCarousel("#carousel4");
initializeCarousel("#carousel5");
initializeCarousel("#carousel6");
initializeCarousel("#carousel7");

//when the user clicks on a book's image, it sends him to "shop.html" and shows book's information
function showBook(bookElement) {

  //checks if user is logged
  if (sessionStorage.getItem('logged') === 'true') {

    //gets image's URL
    let imageUrl = bookElement.src,

        //extracts book's name from the URL
        fileName = imageUrl.split('/').pop(),

        //removes file's extension
        bookName = fileName.replace(/\.[^/.]+$/, "");

    //removes URL's escape characters
    bookName = decodeURIComponent(bookName);

    //stores book's name into the session storage
    sessionStorage.setItem('bookSearch', bookName);

    //sends the user to "shop.html"
    document.location.href = "shop.html";
  }

  //if the user isn't logged, sends him to "login.html"
  else {
    document.location.href = "login.html";
  }
}
//------------------------------------------------INDEX.HTML------------------------------------------------------------

//------------------------------------------------LOGIN.HTML------------------------------------------------------------
//executes the login when the form's submit button is pressed
function login() {

  //gets user's username and password from the page
  const username = document.getElementById('log_usr').value,
      password = document.getElementById('log_passw').value;

  //sends an HTTP request to the server at the specified url to check if the login works
  $.ajax ({
    url        : 'http://localhost:3000/login',
    method     : 'POST',
    contentType: 'application/json',
    data       : JSON.stringify ({ username: username, password: password }),

    //if the login works, it sends the user at "index.html"
    success: function (data) {
      sessionStorage.setItem('logged', 'true');
      sessionStorage.setItem('name', data.name);
      sessionStorage.setItem('surname', data.surname);
      sessionStorage.setItem('username', username);
      document.location.href = data.redirect;
    },

    //if the login doesn't work, it shows the error message
    error: function () {
      const loginError = document.getElementById('login_error');
      if (loginError) {
        loginError.innerText     = 'Credenziali errate';
        loginError.style.display = 'block';
      }
    }
  });
}

//makes the password visible or invisible in login form
function logTogglePasswordVisibility() {
  let password = document.getElementById("log_passw");
  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

//makes the password visible or invisible in sign up form
function regTogglePasswordVisibility() {
  let password = document.getElementById("reg_passw");
  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

function confRegTogglePasswordVisibility() {
  let password = document.getElementById("conf_passw");
  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
}
//------------------------------------------------LOGIN.HTML------------------------------------------------------------

//------------------------------------------------REGISTRAZIONE.HTML----------------------------------------------------
//checks username's format
function checkUsername() {

  //gets username and error message element
  const username = document.getElementById('reg_usr').value,
      regError = document.getElementById('reg_error');

  //chechs if the username contains more of 15 characters
  if (username.length > 15) {
    regError.innerText     = "La dimensione dell'username eccede il limite massimo di 15 caratteri";
    regError.style.display = 'block';
    return false;
  }

  //checks if the username contains spaces
  else if (/\s/.test(username)) {
    regError.innerText     = "L'username non può contenere spazi";
    regError.style.display = 'block';
    return false;
  }
  return true;
}

//checks if the password respects the standard
function checkPassword() {

  //gets password and error message element
  const password = document.getElementById('reg_passw').value,
      regError = document.getElementById('reg_error');

  //checks if the password contains at least 8 letters, an upper case letter and a special character
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[@#$%^&+=-_]/.test(password)) {
    regError.innerText     = 'La password deve contenere almeno 8 caratteri, una lettera maiuscola e un carattere speciale';
    regError.style.display = 'block';
    return false;
  }

  //checks if the password contains spaces
  else if (/\s/.test(password)) {
    regError.innerText     = 'La password non può contenere spazi';
    regError.style.display = 'block';
    return false;
  }
  return true;
}

//executes the signup when the form's submit button is pressed
function register() {

  //gets user's name, surname, username, and password from the page
  const name          = document.getElementById('reg_name').value,
      surname         = document.getElementById('reg_surname').value,
      username        = document.getElementById('reg_usr').value,
      password        = document.getElementById('reg_passw').value,
      confirmPassword = document.getElementById('conf_passw').value;

  //checks if the password respects the standard using the checkPassword() function
  if (checkUsername() && checkPassword() && password === confirmPassword) {

    //sends an HTTP request to the server at the specified URL to check if the sign-up works
    $.ajax({
      url: 'http://localhost:3000/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify ({ name: name, surname: surname, username: username, password: password, confirmPassword: confirmPassword}),

      //if the sign-up works, it sends the user to the page "index.html"
      success: function (data) {
        sessionStorage.setItem('logged',   'true');
        sessionStorage.setItem('name',     name);
        sessionStorage.setItem('surname',  surname);
        sessionStorage.setItem('username', username);
        document.location.href = data.redirect;
      },

      //if the sign-up doesn't work, shows the error message
      error: function () {
        const regError = document.getElementById('reg_error');
        if (regError) {
          regError.innerText = 'Username non disponibile o uso di caratteri non consentiti per nome e cognome';
          regError.style.display = 'block';
        }
      }
    });
  }
}
//------------------------------------------------REGISTRAZIONE.HTML----------------------------------------------------

//------------------------------------------------SHOP.HTML-------------------------------------------------------------
//clears the reviews list
function clearReviewList() {
  const reviewList = document.getElementById('reviews_list');
  reviewList.innerHTML = '';
}

//shows suggestions to the user about the book he's searching
function getSuggestions() {

  //gets book's name and suggestions list element
  const input = document.getElementById('search_in').value,
      suggestionList = document.getElementById('suggestion_list');
  if(input.trim() !== '')
  {
    //clears previous suggestions
    suggestionList.innerHTML = '';

    //sends an HTTP request to the specified url to get suggestions for the search
    $.ajax ({
      url:         'http://localhost:3000/getSuggestions',
      method:      'POST',
      contentType: 'application/json',
      data:        JSON.stringify({input: input}),
      success: function (data) {

        //each suggestion is inserted as a <li> element in a <ul> list
        data.value.forEach(suggestion => {
          const li = document.createElement('li');
          li.textContent = suggestion;

          //if the user clicks on a suggestion, it writes it into the search bar text
          li.onclick = function () {
            document.getElementById('search_in').value = suggestion;

            //deletes remaining suggestions
            suggestionList.innerHTML = '';
          };

          //appends the suggestion to the suggestion list
          suggestionList.appendChild(li);
        });
      }
    });
  }
}

//searchs book which title is entered by the user when the form's submit button is pressed
function searchBook() {

  //gets book's information
  const bookName       = document.getElementById('search_in').value,
      bookImage        = document.getElementById("preview_image"),
      bookNameAppear   = document.getElementById('book_name'),
      bookAuthorAppear = document.getElementById('book_author'),
      bookTypeAppear   = document.getElementById('book_type'),
      bookYearAppear   = document.getElementById('book_year'),
      bookPageAppear   = document.getElementById('book_page'),
      bookPriceAppear  = document.getElementById('book_price'),
      pdfView          = document.getElementById('pdf_viewer'),
      pdfAppear        = document.getElementById('pdf_hidden');

  //sends an HTTP request to the server at the specified url to check if the login works
  $.ajax ({
    url:          'http://localhost:3000/searchBook',
    method:       'POST',
    contentType:  'application/json',
    data:         JSON.stringify({bookName: bookName}),
    success: function (data) {

      //clears preview reviews list
      clearReviewList();
      showBookReviews();
      checkBookInCart(data.nome);

      let noPreview = document.getElementById('no_preview');

      //set book's information to make it visualizable
      if(data.percorso) {
        pdfView.src = data.percorso;
        noPreview.style.display = 'none';
        pdfView.style.display = 'block';
      } else {
        pdfView.src = '';
        noPreview.textContent = 'Preview non ancora disponibile';
        noPreview.style.display = 'block';
        pdfView.style.display = 'none';
      }

      //set book's information to make it visualizable
      pdfView.src                  = data.percorso;
      pdfAppear.style.display      = "block";
      bookImage.src                = 'images/' + data.genere + '/' + bookName + '.webp';
      bookNameAppear.textContent   = bookName;
      bookAuthorAppear.textContent = data.autore;
      bookTypeAppear.textContent   = 'Genere: ' + data.genere;
      bookPageAppear.textContent   = 'Pagine: ' + data.pagine;
      bookYearAppear.textContent   = 'Anno Pubblicazione: ' + data.anno;
      bookPriceAppear.textContent  = 'Prezzo: ' + data.prezzo;

      //stores book's name into the session's cache
      sessionStorage.setItem('bookName', bookName);
    }
  });
}


// New function to check if the book is in the user's cart
function checkBookInCart(bookName) {
  const addButton = document.getElementById("cart_btn");

  // Assume you have a function to retrieve the user's cart (e.g., getCartFromServer)
  getCartFromServer(function (cart) {
    const isBookInCart = cart.some(item => item.nome === bookName);
    addButton.innerHTML = "";

    if (isBookInCart) {
      const imgInCart = document.createElement("img");
      const textInCart = document.createElement("cart_btn");
      imgInCart.src = "images/Button%20icons/check-solid.svg";
      textInCart.innerText = "Nel carrello";
      addButton.appendChild(imgInCart);
      addButton.appendChild(textInCart);
    } else {
      const imgInCart = document.createElement("img");
      const textInCart = document.createElement("cart_btn");
      imgInCart.src = "images/Button%20icons/cart-shopping-solid.svg";
      textInCart.innerText = "Aggiungi al carrello";
      addButton.appendChild(imgInCart);
      addButton.appendChild(textInCart);
    }
  });
}

function getCartFromServer(callback) {
  $.ajax({
    url: 'http://localhost:3000/showCart',
    method: 'POST',
    data: ({ username: sessionStorage.getItem('username') }),
    success: function (data) {
      callback(data.value);
    }
  });
}

//allows the user to add a book in his cart
function addBook() {

  //gets the book searched by the user
  const bookName = document.getElementById("search_in").value;

  //sends an HTTP request at the specified url to add the book in user's cart
  $.ajax ({
    url:         'http://localhost:3000/addBook',
    method:      'POST',
    contentType: 'application/JSON',
    data:         JSON.stringify({ bookName: bookName, username: sessionStorage.getItem('username') }),

    success: function (){
      const addButton = document.getElementById("cart_btn");
      addButton.innerHTML = "";
      const imgInCart = document.createElement("img");
      const textInCart = document.createElement("cart_btn");
      imgInCart.src = "images/Button%20icons/check-solid.svg";
      textInCart.innerText = "Nel carrello";
      addButton.appendChild(imgInCart);
      addButton.appendChild(textInCart);
    }
  })
}

//shows book's reviews
function showBookReviews() {

  //gets book's name and reviews list element
  const bookName = document.getElementById('search_in').value;

  //sends an HTTP request at the specified url to get logged value and check if the user is logged
  $.ajax ({
    url:         'http://localhost:3000/showBookReviews',
    method:      'POST',
    contentType: 'application/JSON',
    data:        JSON.stringify({ bookName: bookName }),
    success: function (data) {

      //clears previous reviews list
      clearReviewList();

      //gets reviews list element
      const reviewsList      = document.getElementById('reviews_list');
      const noReviewsMessage = document.getElementById('no_reviews');

      //checks if there are reviews
      if (data.value.length > 0) {
        noReviewsMessage.textContent = 'Recensioni';

        //each review is inserted as a <li> element in a <ul> list
        data.value.forEach((review) => {
          const bookReview     = document.createElement('p'),
              reviewTitle      = document.createElement('h3'),
              reviewUsername   = document.createElement('p'),
              spacer           = document.createElement('p'),
              reviewData       = document.createElement('p'),
              infoRevContainer = document.createElement('div'),
              reviewContainer  = document.createElement('div'),
              manageContainer  = document.createElement('div');

          //sets review's information
          reviewUsername.textContent = review.utente;
          reviewData.textContent     = review.data;
          spacer.textContent         = '|';
          reviewTitle.textContent    = review.titolo;
          bookReview.textContent     = review.commento;
          spacer.id                  = 'book_spacer';
          infoRevContainer.id        = 'inforev_container';
          reviewContainer.id         = review.utente;
          reviewContainer.classList  = 'review_container';
          manageContainer.id         = 'managerev_container';

          // appends the review and its information
          reviewContainer.appendChild(infoRevContainer);
          infoRevContainer.appendChild(reviewData);
          infoRevContainer.appendChild(spacer);
          infoRevContainer.appendChild(reviewUsername);
          reviewContainer.appendChild(reviewTitle);
          reviewContainer.appendChild(bookReview);
          reviewsList.appendChild(reviewContainer);
        });
      } else {
        noReviewsMessage.textContent = 'Nessuna recensione';
      }
    }
  });
}

//checks if the user has already reviewed the book
function checkReview() {

  //gets book's name from the session storage
  const bookName = sessionStorage.getItem('bookName');

  //sends an HTTP request at the specified url to check if user has already registered the book
  $.ajax ({
    url:         'http://localhost:3000/checkReview',
    method:      'POST',
    contentType: 'application/JSON',
    data:         JSON.stringify({ bookName: bookName, username: sessionStorage.getItem('username') }),

    //if the user hasn't already reviewed the book, it sends him to "recensione.html"
    success: function(data) {
      if (!data.value) {
        document.location.href = data.redirect;
      } else {
        let reviewAuthor = document.getElementById(data.user);
        reviewAuthor.style.transition = 'color 0.5s ease';
        reviewAuthor.style.color = '#ec3853';
        setTimeout(function() {
          reviewAuthor.style.color = '';
        }, 700);
        document.getElementById(data.user).scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}

//checks if the user has accessed this page by clicking a book's image in "index.html"
function checkSearch() {

  //gets book's name searched by the user from session storage
  const checkBook1 = sessionStorage.getItem('bookSearch'),
      checkBook2 = sessionStorage.getItem('bookName');

  //checks if the user has accessed this page from "index.html"
  if (checkBook1) {

    //gets search bar's value
    document.getElementById('search_in').value = checkBook1;

    //calls searchBook to show book's information
    searchBook();

    //removes book's name from session storage
    sessionStorage.removeItem('bookSearch');
  }

  //checks if the user has accessed this page from "recensione.html"
  else if (checkBook2) {

    //gets search bar's value
    document.getElementById('search_in').value = checkBook2;

    //calls searchBook to show book's information
    searchBook();

    //removes book's name from session storage
    sessionStorage.removeItem('bookName');
  }
}
//------------------------------------------------SHOP.HTML-------------------------------------------------------------

//------------------------------------------------RECENSIONE.HTML-------------------------------------------------------
//stores a book's review written by the user
function writeReview() {

  //gets book's review and name
  const reviewTitle = document.getElementById('review_title').value,
      review      = document.getElementById('review').value,
      bookName    = sessionStorage.getItem('bookName');

  //sends an HTTP request to the server at the specified url to store user's review
  $.ajax ({
    url: 'http://localhost:3000/writeReview',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ bookName: bookName, review: review, reviewTitle: reviewTitle, username: sessionStorage.getItem('username') }),

    //if it works, sends the user to "shop.html"
    success: function(data) {
      document.location.href = data.redirect;
    }
  });
}
//------------------------------------------------RECENSIONE.HTML-------------------------------------------------------

//------------------------------------------------ACCOUNT.HTML----------------------------------------------------------
//executes the logout when the form's submit button is pressed and frees session storage
function logout() {
  sessionStorage.removeItem('bookName');
  sessionStorage.removeItem('bookSearch');
  sessionStorage.removeItem('logged');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('name');
  sessionStorage.removeItem('surname');
  window.location.href = "index.html";
}

//empties user's cart
function emptyCart() {
  // Invia una richiesta al server per svuotare il carrello
  $.ajax({
    url: 'http://localhost:3000/emptyCart',
    method: 'POST',
    data: { username: sessionStorage.getItem('username') },
    success: function () {
      // Chiamata completata con successo, ora aggiorna la visualizzazione del carrello
      updateCartView();
    },
    error: function () {
      console.error('Errore durante lo svuotamento del carrello.');
    }
  });
}


//removes a user's review
function removeReview(bookName) {

  //send an HTTP request to the server at the specified url to get logged value and check if the user is logged
  $.ajax ({
    url   :      'http://localhost:3000/removeReview',
    method:      'POST',
    contentType: 'application/json',
    data:        JSON.stringify({ bookName: bookName, username: sessionStorage.getItem('username') }),
    success: function () {
      showUserReviews();
    }
  });
}

//starts automatically when the page is loaded, gets user's data and shows them in the page
function getInfo() {

  //send an HTTP request to the server at the specified url to get user's data
  $.ajax ({
    url   : 'http://localhost:3000/getInfo',
    method: 'POST',
    data: { username: sessionStorage.getItem('username') },
    success: function () {

      //gets username, name and surname elements
      const usernameText = document.getElementById('acc_user'),
          nameText     = document.getElementById('acc_name'),
          surnameText  = document.getElementById('acc_surn');

      //shows user's data
      usernameText.textContent = 'Ciao ' + sessionStorage.getItem('username');
      nameText.textContent     = sessionStorage.getItem('name');
      surnameText.textContent  = sessionStorage.getItem('surname');
    }
  });
}

//shows user's reviews when the button is pressed
//shows user's reviews when the button is pressed
function showUserReviews() {

  //sends an HTTP request to the server at the specified url to get user's data
  $.ajax ({
    url   : 'http://localhost:3000/getInfo',
    method: 'POST',
    data: { username: sessionStorage.getItem('username') },
    success: function (data) {

      //gets username, name and surname elements
      const reviewList = document.getElementById('reviews_cronology');
      const noReviewsMessage = document.getElementById('no_reviews');

      //clears previous reviews
      reviewList.innerHTML = '';
      if (data.recensioni.length === 0) {

        //if there are no reviews, show the "Non ci sono recensioni" message
        noReviewsMessage.innerHTML = 'Nessuna recensione';
      } else {

        //if there are reviews, hide the "Non ci sono recensioni" message
        noReviewsMessage.innerHTML = 'Le tue recensioni';

        //each review is inserted as a <li> element in a <ul> list
        data.recensioni.forEach(book => {
          const reviewItem      = document.createElement('li'),
              removeButton      = document.createElement('button'),
              bookCover         = document.createElement('img'),
              bookName          = document.createElement('h3'),
              reviewName        = document.createElement('p'),
              spacer            = document.createElement('p'),
              imageContainer    = document.createElement('div'),
              revContainer      = document.createElement('div'),
              remTitleContainer = document.createElement('div');

          bookCover.src               = 'images/' + book.genere + '/' + book.nome + '.webp';
          bookCover.alt               = book.nome;
          bookName.textContent        = book.nome;
          reviewName.textContent      = 'Titolo: ' + book.recensione;
          removeButton.textContent    = 'Rimuovi';
          spacer.textContent          = '|';
          spacer.id                   = 'book_spacer';
          bookCover.id                = 'cronology_rev_img';
          reviewName.id               = 'book_price';
          imageContainer.className    = 'image_container';
          revContainer.className      = 'info_container';
          remTitleContainer.className = 'price_container'

          imageContainer.appendChild(bookCover);
          imageContainer.appendChild(revContainer);
          revContainer.appendChild(bookName);
          revContainer.appendChild(remTitleContainer);
          remTitleContainer.appendChild(removeButton);
          remTitleContainer.appendChild(spacer);
          remTitleContainer.appendChild(reviewName);
          reviewList.appendChild(imageContainer);
          reviewList.appendChild(reviewItem);

          //when a remove button is pressed, it removes a user's review
          removeButton.onclick = function () {
            removeReview(book.nome);
            showUserReviews();
          };
        })
      }
    }
  });
}

//removes a book from the user's cart
function removeBookFromCart(bookName) {

  //sends an HTTP request to the server at the specified url to check if the book is in user's cart
  $.ajax ({
    url:         'http://localhost:3000/removeBook',
    method:      'POST',
    contentType: 'application/json',
    data:        JSON.stringify({ bookName: bookName, username: sessionStorage.getItem('username') }),
    success: function (data) {
      updateCartView(data.value);
    }
  });
}

function updateCartView(cartItems) {

  //gets cart element
  const cartList = document.getElementById("cart_list");

  //total price of books in the cart
  let totalPrice = 0;

  //clears previous cart visualization
  cartList.innerHTML = '';

  //shows the updated cart
  cartItems.forEach(ordine => {
    const bookName     = document.createElement('h3'),
        bookPrice      = document.createElement('p'),
        spacer         = document.createElement('p'),
        removeBook     = document.createElement('button'),
        insertImage    = document.createElement('img'),
        imageContainer = document.createElement('div'),
        infoContainer  = document.createElement('div'),
        priceContainer = document.createElement('div');

    //shows book's information
    bookName.textContent     = ordine.nome;
    bookPrice.textContent    = 'Prezzo: ' + ordine.prezzo;
    spacer.textContent       = '|';
    removeBook.textContent   = 'Rimuovi';
    insertImage.src          = 'images/' + ordine.genere + '/' + ordine.nome + '.webp';
    spacer.id                = 'book_spacer';
    imageContainer.className = 'image_container';
    infoContainer.className  = 'info_container';
    priceContainer.className = 'price_container';

    //adds book's price to cart's total price
    totalPrice += parseFloat(ordine.prezzo);

    //when a remove button is pressed, it removes the indicated book from user's cart
    removeBook.onclick = function () {
      removeBookFromCart(ordine.nome);
    };

    //appends book's information
    imageContainer.appendChild(insertImage);
    imageContainer.appendChild(infoContainer);
    infoContainer.appendChild(bookName);
    infoContainer.appendChild(priceContainer);
    priceContainer.appendChild(removeBook);
    priceContainer.appendChild(spacer);
    priceContainer.appendChild(bookPrice);
    cartList.appendChild(imageContainer);
  });

  //gets total price and clear cart button elements
  const cartTot    = document.getElementById('cart_price'),
      cartSpacer = document.getElementById('book_spacer1'),
      clearCart  = document.getElementById('cart_clear');

  //if the cart isn't empty
  if (parseFloat(totalPrice) > 0) {

    //appends cart's total price and clear cart button
    cartTot.textContent    = 'Carrello: ' + (parseFloat(totalPrice)) + '€';
    cartSpacer.textContent = '|';
    clearCart.textContent  = 'Svuota';

    //when the clear cart button is pressed, it empties user's cart
    clearCart.onclick = function () {
      totalPrice = 0;
      cartTot.textContent    = 'Carrello vuoto';
      cartSpacer.textContent = '';
      clearCart.textContent  = '';
      emptyCart();
    };
  } else {
    cartTot.textContent    = 'Carrello vuoto';
    cartSpacer.textContent = '';
    clearCart.textContent  = '';
  }
}

//starts automatically when the page is loaded and gets user's cart
function showCart() {

  //gets cart element
  const cartList = document.getElementById("cart_list");

  //sends an HTTP request to the server at the specified url to get user's cart
  $.ajax ({
    url: 'http://localhost:3000/showCart',
    method: 'POST',
    data: { username: sessionStorage.getItem('username') },
    success: function (data) {

      //total price of books in the cart
      let totalPrice = 0;

      //each book added to the cart is inserted as a <li> element in a <ul> list
      data.value.forEach(ordine => {
        const bookName     = document.createElement('h3'),
            bookPrice      = document.createElement('p'),
            spacer         = document.createElement('p'),
            removeBook     = document.createElement('button'),
            insertImage    = document.createElement('img'),
            imageContainer = document.createElement('div'),
            infoContainer  = document.createElement('div'),
            priceContainer = document.createElement('div');

        //shows book's information
        bookName.textContent     = ordine.nome;
        bookPrice.textContent    = 'Prezzo: ' + ordine.prezzo;
        bookPrice.id             = 'book_price';
        spacer.textContent       = '|';
        removeBook.textContent   = 'Rimuovi';
        insertImage.src          = 'images/' + ordine.genere + '/' + ordine.nome + '.webp';
        spacer.id                = 'book_spacer';
        imageContainer.className = 'image_container';
        infoContainer.className  = 'info_container';
        priceContainer.className = 'price_container';

        //adds book's price to cart's total price
        totalPrice += parseFloat(ordine.prezzo);

        //when a remove button is pressed, it removes the indicated book from user's cart
        removeBook.onclick = function () {
          removeBookFromCart(ordine.nome);
        };

        //appends book's information
        imageContainer.appendChild(insertImage);
        imageContainer.appendChild(infoContainer);
        infoContainer.appendChild(bookName);
        infoContainer.appendChild(priceContainer);
        priceContainer.appendChild(removeBook);
        priceContainer.appendChild(spacer);
        priceContainer.appendChild(bookPrice);
        cartList.appendChild(imageContainer);
      });

      //gets total price and clear cart button elements
      const cartTot  = document.getElementById('cart_price'),
          cartSpacer = document.getElementById('book_spacer1'),
          clearCart  = document.getElementById('cart_clear');

      //if the cart isn't empty
      if (parseFloat(totalPrice) > 0) {

        //appends cart's total price and clear cart button
        cartTot.textContent    = 'Carrello: ' + (parseFloat(totalPrice)) + '€';
        cartSpacer.textContent = '|';
        clearCart.textContent  = 'Svuota';

        //when the clear cart button is pressed, it empties user's cart
        clearCart.onclick = function () {
          totalPrice             = 0;
          cartTot.textContent    = 'Carrello vuoto';
          cartSpacer.textContent = '';
          clearCart.textContent  = '';
          emptyCart();
        };
      } else {
        cartTot.textContent    = 'Carrello vuoto';
        cartSpacer.textContent = '';
        clearCart.textContent  = '';
      }
    }
  });
}
//------------------------------------------------ACCOUNT.HTML----------------------------------------------------------