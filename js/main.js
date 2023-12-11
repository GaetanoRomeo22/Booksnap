window.onload = () =>
{
  'use strict';

  if ('serviceWorker' in navigator)
  {
    navigator.serviceWorker.register('service_worker.js').then(function (registration)
    {
      //service worker registered correctly
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    },
    function (err)
    {
      //troubles in registering the service worker
      console.log('ServiceWorker registration failed: ', err);
    });
  }
}

//starts automatically when the page is loaded and checks if the user has access to the page (used by "cart.html", "account.html", "shop.html" e "recensione.html")
function checkLogged()
{
    if (sessionStorage.getItem('logged') !== 'true')
      document.location.href = "index.html";
}

//starts automatically when the page is loaded and checks if the user is logged
function checkNotLogged()
{
    if (sessionStorage.getItem('logged') === 'true')
      document.location.href = "index.html";
}

//------------------------------------------------INDEX.HTML------------------------------------------------------------
//starts automatically when the page is loaded and checks if the user is logged
function showNavbar()
{
  //gets navbar's button's elements
  const accountButton = document.getElementById('nav_account'),
        shopButton    = document.getElementById('nav_shop'),
        loginButton   = document.getElementById('nav_login');

  //checks if each buttons is correctly get
  if (accountButton && shopButton && loginButton)
  {
    //if the user is logged, it shows buttons that send the user to page for which login is needed
    if (sessionStorage.getItem('logged') === 'true')
    {
      accountButton.style.display = "block";
      shopButton.style.display = "block";
      loginButton.style.display = "none";
    }

    //otherwise it hides buttons that send user to page for which login is needed
    else
    {
      shopButton.style.display = "none";
      accountButton.style.display = "none";
    }
  }
  else
    console.log("Errore cattura elementi bottoni navbar");
}

function initializeCarousel(wrapperSelector)
{
  const wrapper = document.querySelector(wrapperSelector),
    //elemento del carosello
    carousel = wrapper.querySelector(".carousel"),
    //prima immagine del carosello
    firstImg = carousel.querySelectorAll("img")[0],
    //frecce per scorrere le immagini
    arrowIcons = wrapper.querySelectorAll("i");

  let isDragStart = false,
    isDragging = false,
    prevPageX,
    prevScrollLeft,
    positionDiff;

  const showHideIcons = () =>
  {
    let scrollWidth = carousel.scrollWidth - carousel.clientWidth;
    arrowIcons[0].style.display = carousel.scrollLeft === 0 ? "none" : "block";
    arrowIcons[1].style.display = carousel.scrollLeft === scrollWidth ? "none" : "block";
  };

  arrowIcons.forEach(icon =>
  {
    icon.addEventListener("click", () =>
    {
      let firstImgWidth = firstImg.clientWidth + 14;
      carousel.scrollLeft += icon.classList.contains("carousel-left") ? -firstImgWidth : firstImgWidth;
      setTimeout(() => showHideIcons(), 60);
    });
  });

  const autoSlide = () =>
  {
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

  const dragStart = (e) =>
  {
    // updatating global variables value on mouse down event
    isDragStart = true;
    prevPageX = e.pageX || e.touches[0].pageX;
    prevScrollLeft = carousel.scrollLeft;
  }

  const dragging = (e) =>
  {
    // scrolling images/carousel to left according to mouse pointer
    if(!isDragStart) return;
    e.preventDefault();
    isDragging = true;
    carousel.classList.add("dragging");
    positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
    carousel.scrollLeft = prevScrollLeft - positionDiff;
    showHideIcons();
  }

  const dragStop = () =>
  {
    isDragStart = false;
    carousel.classList.remove("dragging");
    if(!isDragging) return;
    isDragging = false;
    autoSlide();
  }

  carousel.addEventListener("mousedown",  dragStart, { passive: true });
  carousel.addEventListener("touchstart", dragStart, { passive: true });

  document.addEventListener("mousemove", dragging, { passive: true });
  carousel.addEventListener("touchmove", dragging, { passive: true });

  document.addEventListener("mouseup",  dragStop, { passive: true });
  carousel.addEventListener("touchend", dragStop, { passive: true });
}

initializeCarousel("#carousel1");
initializeCarousel("#carousel2");
initializeCarousel("#carousel3");
initializeCarousel("#carousel4");
initializeCarousel("#carousel5");
initializeCarousel("#carousel6");
initializeCarousel("#carousel7");

//when the user clicks on a book's image, it sends him to "shop.html" and shows book's information
function showBook(bookElement)
{
   //checks if user is logged
      if (sessionStorage.getItem('logged') === 'true')
      {
        //gets image's URL
        let imageUrl = bookElement.src;

        //extracts book's name from the URL
        let fileName = imageUrl.split('/').pop();

        //removes file's extension
        let bookName = fileName.replace(/\.[^/.]+$/, "");

        //removes URL's escape characters
        bookName = decodeURIComponent(bookName);

        //stores book's name into the session storage
        sessionStorage.setItem('bookSearch', bookName);

        //sends the user to "shop.html"
        document.location.href = "shop.html";
      }
      else
        document.location.href = "login.html";
}
//------------------------------------------------INDEX.HTML------------------------------------------------------------

//------------------------------------------------LOGIN.HTML------------------------------------------------------------
//executes the login when the form's submit button is pressed
function login()
{
  //gets user's username and password from the page
  const username = document.getElementById('log_usr').value,
        password = document.getElementById('log_passw').value;

  //checks if entered values are correctly read
  if(username && password)
  {
    //sends an HTTP request to the server at the specified url to check if the login works
    $.ajax
    ({
      url        : 'http://localhost:3000/login',
      method     : 'POST',
      contentType: 'application/json',
      data       : JSON.stringify({username, password}),

      //if the login works, it sends the user at "index.html"
      success: function (data)
      {
        sessionStorage.setItem('logged', 'true');
        document.location.href = data.redirect;
      },

      //if the login doesn't work, it shows the error message
      error: function (xhr)
      {
        console.error("Errore durante l'autenticazione:", xhr.responseJSON.error);

        //gets login error element
        const loginError = document.getElementById('login_error');

        //checks if the login error element is correctly read and shows the error message
        if (loginError)
        {
          loginError.innerText     = 'Credenziali errate';
          loginError.style.display = 'block';
        }
      }
    });
  }
  else
    console.log("Errore lettura username o password");
}
//------------------------------------------------LOGIN.HTML------------------------------------------------------------

//------------------------------------------------REGISTRAZIONE.HTML----------------------------------------------------
//checks if the password respects the standard
function checkPassword()
{
  //gets password and error message element
  let password   = document.getElementById('reg_passw').value;
  const regError = document.getElementById('reg_error');

  //checks if password and error message element are correctly read
  if (password && regError)
  {
    //checks if the password contains at least 8 letters, an upper case letter and a special character
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[@#$%^&+=-_]/.test(password))
    {
      regError.innerText     = 'La password deve contenere almeno 8 caratteri, una lettera maiuscola e un carattere speciale';
      regError.style.display = 'block';
      return false;
    }
    return true;
  }
}

//executes the signup when the form's submit button is pressed
function register()
{
  //gets user's name, surname, username and password from the page
  const name     = document.getElementById('reg_name'   ).value,
        surname  = document.getElementById('reg_surname').value,
        username = document.getElementById('reg_usr'    ).value,
        password = document.getElementById('reg_passw'  ).value;

  //checks if entered values are correctly read
  if (name && surname && username && password)
  {
    //checks if the password respects the standard
    if (checkPassword())
    {
      //sends an HTTP request to the server at the specified url to check if the sign-up works
      $.ajax
      ({
        url:          'http://localhost:3000/register',
        method:       'POST',
        contentType:  'application/json',
        data:         JSON.stringify({name, surname, username, password}),

        //if the sign-up works, it sends the user at the page "index.html"
        success: function (data)
        {
          sessionStorage.setItem('logged', 'true');
          window.location.href = data.redirect;
        },
        error: function (xhr)
        {
          console.error("Errore durante l'autenticazione:", xhr.responseJSON.error);

          //gets register error element
          const regError = document.getElementById('reg_error');

          //checks if the register error element is correctly read and shows the error message
          if (regError)
          {
            regError.innerText     = 'Username non disponibile o uso di caratteri non consentiti per nome e cognome';
            regError.style.display = 'block';
          }
        }
      });
    }
  }
  else
    console.log("Errore lettura dati utente");
}
//------------------------------------------------REGISTRAZIONE.HTML----------------------------------------------------

//------------------------------------------------SHOP.HTML-------------------------------------------------------------
//clears the reviews list
function clearReviewList()
{
  //gets reviews list element
  const reviewList = document.getElementById('reviews_list');

  //checks if reviews list element is correctly read and clears the list
  if(reviewList)
    reviewList.innerHTML = '';
  else
    console.log("Errore lettura lista recensioni");
}

//shows suggestions to the user about the book he's searching
function getSuggestions()
{
  //gets book's name and suggestions list element
  const input          = document.getElementById('search_in').value,
        suggestionList = document.getElementById('suggestion_list');

  //checks if book's name and suggestions list element are correctly read
  if(input.trim() !== '' && suggestionList)
  {
    //clears previous suggestions
    suggestionList.innerHTML = '';

    //sends an HTTP request to the specified url to get suggestions for the search
    $.ajax
    ({
      url:         'http://localhost:3000/getSuggestions',
      method:      'POST',
      contentType: 'application/json',
      data:        JSON.stringify({input}),
      success: function (data)
      {
        //each suggestion is inserted as a <li> element in a <ul> list
        data.value.forEach(suggestion =>
        {
          const li = document.createElement('li');
          li.textContent = suggestion;

          //if the user clicks on a suggestion, it writes it into the search bar text
          li.onclick = function ()
          {
            document.getElementById('search_in').value = suggestion;

            //deletes remaining suggestions
            suggestionList.innerHTML = '';
          };

          //appends the suggestion to the suggestion list
          suggestionList.appendChild(li);
        });
      },
      error: function (xhr)
      {
        console.error("Errore nella ricerca del libro: ", xhr.responseJSON.error);
      }
    });
  }
}

//searchs book which title is entered by the user when the form's submit button is pressed
function searchBook()
{
  //gets book's name
  const bookName = document.getElementById('search_in').value;

  //checks if book's name is correctly read
  if (bookName)
  {
    //gets book's information
    const bookImage        = document.getElementById("preview_image"),
          bookNameAppear   = document.getElementById('book_name'),
          bookAuthorAppear = document.getElementById('book_author'),
          bookTypeAppear   = document.getElementById('book_type'),
          bookYearAppear   = document.getElementById('book_year'),
          bookPageAppear   = document.getElementById('book_page'),
          bookPriceAppear  = document.getElementById('book_price'),
          pdfView          = document.getElementById('pdf_viewer'),
          pdfAppear        = document.getElementById('pdf_hidden');

    //checks if every book's piece of information is correctly read
    if(bookImage && bookNameAppear && bookAuthorAppear && bookTypeAppear && bookYearAppear && bookPageAppear && bookPriceAppear && pdfView && pdfAppear)
    {
      //sends an HTTP request to the server at the specified url to check if the login works
      $.ajax
      ({
        url:          'http://localhost:3000/searchBook',
        method:       'POST',
        contentType:  'application/json',
        data:         JSON.stringify({bookName}),
        success: function (data)
        {
          //clears preview reviews list
          clearReviewList();
          showBookReviews();

          //set book's information to make it visualizable
          pdfView.src                  = data.percorso;
          pdfAppear.style.display      = "block";
          bookImage.src                = 'images/' + data.genere + '/' + bookName + '.webp';
          bookNameAppear.textContent   = bookName;
          bookAuthorAppear.textContent = data.autore;
          bookTypeAppear.textContent   = 'Genere: ' + data.genere;
          bookYearAppear.textContent   = 'Anno Pubblicazione: ' + data.anno;
          bookPriceAppear.textContent  = 'Prezzo: ' + data.prezzo;

          //stores book's name into the session's cache
          sessionStorage.setItem('bookName', bookName);
        },
        error: function (xhr)
        {
          console.error("Errore nella ricerca del libro: ", xhr.responseJSON.error);
        }
      });
    }
  }
  else
    console.log("Errore lettura elementi informazioni libro");
}

//allows the user to add a book in his cart
function addBook()
{
  //gets the book searched by the user
  const bookName = document.getElementById("search_in").value;

  //checks if the book's name is correctly read
  if (bookName)
  {
    //sends an HTTP request at the specified url to add the book in user's cart
    $.ajax
    ({
      url:         'http://localhost:3000/addBook',
      method:      'POST',
      contentType: 'application/JSON',
      data:         JSON.stringify({ bookName }),
      error: function (xhr)
      {
        console.error('Errore inserimento libro nel carrello:', xhr.responseJSON.error);
      }
    });
  }
  else
    console.log("Errore lettura nome libro");
}

// shows book's reviews
function showBookReviews()
{
  // gets book's name and reviews list element
  const bookName = document.getElementById('search_in').value;

  if (bookName)
  {
    // sends an HTTP request at the specified url to get logged value and check if the user is logged
    $.ajax
    ({
      url:         'http://localhost:3000/showBookReviews',
      method:      'POST',
      contentType: 'application/JSON',
      data:        JSON.stringify({ bookName }),

      success: function (data)
      {
        // clears previous reviews list
        clearReviewList();

        // gets reviews list element
        const reviewsList      = document.getElementById('reviews_list');
        const noReviewsMessage = document.getElementById('no_reviews');

        // Check if there are reviews
        if (data.value.length > 0)
        {
          // Display "Recensioni" message
          noReviewsMessage.textContent = 'Recensioni';

          // each review is inserted as a <li> element in a <ul> list
          data.value.forEach((review) =>
          {
            const bookReview     = document.createElement('p'),
              reviewTitle      = document.createElement('h3'),
              reviewUsername   = document.createElement('p'),
              spacer           = document.createElement('p'),
              reviewData       = document.createElement('p'),
              infoRevContainer = document.createElement('div'),
              reviewContainer  = document.createElement('div'),
              manageContainer  = document.createElement('div');

            // sets review's information
            reviewUsername.textContent = review.utente;
            reviewData.textContent     = review.data;
            spacer.textContent         = '|';
            reviewTitle.textContent    = review.titolo;
            bookReview.textContent     = review.commento;
            spacer.id                  = 'book_spacer';
            reviewUsername.id          = 'user_container';
            infoRevContainer.id        = 'inforev_container';
            reviewContainer.id         = 'review_container';
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
        }
        else
        {
          // Display "Nessuna recensione" message
          noReviewsMessage.textContent = 'Nessuna recensione';
        }
      },
      error: function (xhr)
      {
        console.error('Errore ricerca recensioni libro:', xhr.responseJSON.error);
      },
    });
  }
  else
  {
    console.log('Errore lettura nome libro');
  }
}

//checks if the user has already reviewed the book
function checkReview()
{
  const bookName = sessionStorage.getItem('bookName');

  if (bookName)
  {
    //sends an HTTP request at the specified url to check if user has already registered the book
    $.ajax
    ({
      url:         'http://localhost:3000/checkReview',
      method:      'POST',
      contentType: 'application/JSON',
      data:         JSON.stringify({ bookName }),

      //if the user hasn't already reviewed the book, it sends him to "recensione.html"
      success: function(data)
      {
        if (!data.value)
        {
          document.location.href = data.redirect;
        }
        else
        {

        }
      },
      error: function (xhr)
      {
        console.error('Errore inserimento libro nel carrello:', xhr.responseJSON.error);
      }
    });
  }
}

//checks if the user has accessed this page by clicking a book's image in "index.html"
function checkSearch()
{
  //gets book's name searched by the user from session storage
  const checkBook1 = sessionStorage.getItem('bookSearch'),
        checkBook2 = sessionStorage.getItem('bookName');

  //checks if the user has accessed this page from "index.html"
  if (checkBook1)
  {
    //gets search bar's value
    document.getElementById('search_in').value = checkBook1;

    //calls searchBook to show book's information
    searchBook();

    //removes book's name from session storage
    sessionStorage.removeItem('bookSearch');
  }

  //checks if the user has accessed this page from "recensione.html"
  else if (checkBook2)
  {
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
function writeReview()
{
  //gets book's review and name
  const reviewTitle = document.getElementById('review_title').value,
    review      = document.getElementById('review').value,
    bookName    = sessionStorage.getItem('bookName');

  //checks if book's review and name are correctly read
  if (bookName && review && reviewTitle)
  {
    //sends an HTTP request to the server at the specified url to store user's review
    $.ajax
    ({
      url: 'http://localhost:3000/writeReview',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({bookName, review, reviewTitle}),
      success: function(data)
      {
        document.location.href = data.redirect;
      },
      error: function (xhr)
      {
        console.error("Errore scrittura recensione: ", xhr.responseJSON.error);
      }
    });
  }
  else
    console.log("Errore lettura recensione o nome libro");
}
//------------------------------------------------RECENSIONE.HTML-------------------------------------------------------

//------------------------------------------------ACCOUNT.HTML----------------------------------------------------------
//executes the logout when the form's submit button is pressed
function logout()
{
    sessionStorage.removeItem('bookName');
    sessionStorage.removeItem('bookSearch');
    sessionStorage.removeItem('logged');
    window.location.href = "index.html";
}

//empties user's cart
function emptyCart()
{
  //send an HTTP request to the server at the specified url to get logged value and check if the user is logged
  $.ajax
  ({
    url   : 'http://localhost:3000/emptyCart',
    method: 'POST',

    //if the logout works, it sends the user to "index.html"
    success: function ()
    {
      updateCartView();
    },
    error: function (xhr)
    {
      console.error('Errore durante la richiesta di stato di logged:', xhr.responseJSON.error);
    }
  });
}

//removes a user's review
function removeReview(bookName)
{
  //send an HTTP request to the server at the specified url to get logged value and check if the user is logged
  $.ajax
  ({
    url   :      'http://localhost:3000/removeReview',
    method:      'POST',
    contentType: 'application/json',
    data:        JSON.stringify({ bookName }),

    //if the logout works, it sends the user to "index.html"
    success: function ()
    {
      getInfo();
    },
    error: function (xhr)
    {
      console.error('Errore durante la richiesta di stato di logged:', xhr.responseJSON.error);
    }
  });
}

//starts automatically when the page is loaded, gets user's data and shows them in the page
function getInfo()
{
  //send an HTTP request to the server at the specified url to get user's data
  $.ajax
  ({
    url   : 'http://localhost:3000/getInfo',
    method: 'POST',
    success: function (data)
    {
      //gets username, name and surname elements
      const usernameText = document.getElementById('acc_user'),
        nameText     = document.getElementById('acc_name'),
        surnameText  = document.getElementById('acc_surn');

      //checks if elements are correctly read
      if (usernameText && nameText && surnameText)
      {
        //shows user's data
        usernameText.textContent = 'Ciao ' + data.username;
        nameText.textContent     = data.nome;
        surnameText.textContent  = data.cognome;
      }
      else
        console.log("Errore lettura informazioni utente");
    },
    error: function (xhr)
    {
      console.error("Errore recupero dati utente:", xhr.responseJSON.error);
    }
  });
}

//shows user's reviews when the button is pressed
function showUserReviews()
{
  //send an HTTP request to the server at the specified url to get user's data
  $.ajax
  ({
    url   : 'http://localhost:3000/getInfo',
    method: 'POST',
    success: function (data)
    {
      //gets username, name and surname elements
      const reviewList = document.getElementById('reviews_cronology');
      const noReviewsMessage = document.getElementById('no_reviews');

      //checks if elements are correctly read
      if (reviewList && noReviewsMessage)
      {
        //clears previous reviews
        reviewList.innerHTML = '';
        if (data.recensioni.length === 0) {
          // If there are no reviews, show the "Non ci sono recensioni" message
          noReviewsMessage.innerHTML = 'Nessuna recensione';
        }
        else {
          // If there are reviews, hide the "Non ci sono recensioni" message
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
      else
        console.log("Errore lettura informazioni utente");
    },
    error: function (xhr)
    {
      console.error("Errore recupero dati utente:", xhr.responseJSON.error);
    }
  });
}

//removes a book from the user's cart
function removeBookFromCart(bookName)
{
  $.ajax
  ({
    url:         'http://localhost:3000/removeBook',
    method:      'POST',
    contentType: 'application/json',
    data:        JSON.stringify({ bookName }),

    //if it works, it updates cart visualization
    success: function (data)
    {
      updateCartView(data.value);
    },
    error: function (xhr)
    {
      console.error('Errore nella rimozione del libro dal carrello:', xhr.responseJSON.error);
    }
  });
}

// Funzione per aggiornare la visualizzazione del carrello
function updateCartView(cartItems)
{
  //gets cart element
  const cartList = document.getElementById("cart_list");

  //total price of books in the cart
  let totalPrice = 0;

  //checks if cart element is correctly read
  if (cartList)
  {
    //clears previous cart visualization
    cartList.innerHTML = '';

    //shows the updated cart
    cartItems.forEach(ordine =>
    {
      const bookName       = document.createElement('h3'),
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
      removeBook.onclick = function ()
      {
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
    if (parseFloat(totalPrice) > 0)
    {
      //appends cart's total price and clear cart button
      cartTot.textContent    = 'Carrello: ' + (parseFloat(totalPrice)) + '€';
      cartSpacer.textContent = '|';
      clearCart.textContent  = 'Svuota';

      //when the clear cart button is pressed, it empties user's cart
      clearCart.onclick = function ()
      {
        totalPrice = 0;
        cartTot.textContent    = 'Carrello vuoto';
        cartSpacer.textContent = '';
        clearCart.textContent  = '';
        emptyCart();
      };
    }
    else
    {
      cartTot.textContent    = 'Carrello vuoto';
      cartSpacer.textContent = '';
      clearCart.textContent  = '';
    }
  }
  else
    console.log("Errore cattura carrello");
}

//starts automatically when the page is loaded and gets user's cart
function showCart()
{
  //gets cart element
  const cartList = document.getElementById("cart_list");

  //total price of books in the cart
  let totalPrice = 0;

  //checks if cart element is correctly read
  if (cartList)
  {
    //sends an HTTP request to get user's cart
    $.ajax
    ({
      url: 'http://localhost:3000/showCart',
      method: 'POST',
      success: function (data)
      {
        //each book added to the cart is inserted as a <li> element in a <ul> list
        data.value.forEach(ordine =>
        {
          const bookName       = document.createElement('h3'),
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
          removeBook.onclick = function ()
          {
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
        if (parseFloat(totalPrice) > 0)
        {
          //appends cart's total price and clear cart button
          cartTot.textContent    = 'Carrello: ' + (parseFloat(totalPrice)) + '€';
          cartSpacer.textContent = '|';
          clearCart.textContent  = 'Svuota';

          //when the clear cart button is pressed, it empties user's cart
          clearCart.onclick = function ()
          {
            totalPrice             = 0;
            cartTot.textContent    = 'Carrello vuoto';
            cartSpacer.textContent = '';
            clearCart.textContent  = '';
            emptyCart();
          };
        }
        else
        {
          cartTot.textContent    = 'Carrello vuoto';
          cartSpacer.textContent = '';
          clearCart.textContent  = '';
        }
      },
      error: function (xhr)
      {
        console.error('Errore ottenimento carrello:', xhr.responseJSON.error);
      }
    });
  }
}
//------------------------------------------------ACCOUNT.HTML----------------------------------------------------------
