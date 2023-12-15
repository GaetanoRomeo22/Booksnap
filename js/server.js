//-----------------------------------------------------Node.js Modules--------------------------------------------------
const fs                = require('fs'),
      express           = require('express'),
      bodyParser        = require('body-parser'),
      path              = require('path'),
      cors              = require('cors'),
      CryptoJS          = require('crypto-js'),
      PasswordValidator = require('password-validator');
//-----------------------------------------------------Node.js Modules--------------------------------------------------

//-----------------------------------------------------Variables--------------------------------------------------------
const app          = express(),
      port         = 3000,                                         //port number on witch the server answers
      jsonFilePath = path.join(__dirname, 'database.json');        //JSON file's path
//-----------------------------------------------------Variables--------------------------------------------------------

app.use(bodyParser.urlencoded({ extended: true }));                //allows to analize data passed in HTTP request and response
app.use(bodyParser.json());                                        //allows to analize JSON format data
app.use(cors());                                                   //allows connections by all origins

//shows the error message
function sendError(res) {
  res.status(404).json({error: true});
}

//when the server receives an HTTP request to this url, it logs the user up
app.post("/login", (req, res) => {

//gets username and password from the request
const username = req.body.username,
      password = req.body.password;

  //reads the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    //checks if the user is registered
    checkUser = info.utenti.find(u => u.username === username);

    //if the user is registered
    if (checkUser) {

      //encrypts the password
      const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

      //checks if the entered password is correct and sends the user to "index.html"
      if (checkUser.password === hashedPassword) {
        res.json({
          name: checkUser.nome,
          surname: checkUser.cognome,
          redirect: 'index.html'});
      } else {
          sendError(res);
        }
    } else {
        sendError(res);
      }
  });
});

//when the server receives an HTTP request to this url, it logs the user in
app.post('/register', (req, res) => {

  //gets name, surname, username, and password from the request
  const name = req.body.name,
        surname = req.body.surname,
        username = req.body.username,
        password = req.body.password,
        confirmPassword = req.body.confirmPassword;

  //checks if the password respects the standard
  const checkPassword = new PasswordValidator();
  checkPassword.is().min(8).has().uppercase().has().symbols();

  //checks if name, surname, username, and password are correctly read and if the user isn't logged
  if (name.trim() !== ''                &&
      surname.trim() !== ''             &&
      username.trim() !== ''            &&
      checkPassword.validate(password)  &&
      username.length < 15              &&
      /\s/.test(username)               &&
      password === confirmPassword) {

    //reads the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {

      //parses the JSON data
      const info = JSON.parse(data),

      //checks if the user is registered
      checkUser = info.utenti.find(u => u.username === username);

      //if the user isn't registered
      if (!checkUser) {

        //encrypts the password
        const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

        //stores the user and his information into the JSON file
        info.utenti.push({
          nome: name,
          cognome: surname,
          username: username,
          password: hashedPassword,
          carrello: []
        });

        //writes the updated data to the JSON file
        fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', () => {});

        //sends the user to "index.html"
        res.json({redirect: 'index.html'});
      }
    });
  } else {
      sendError(res);
    }
});

//when the server receives an HTTP request to this url, it shows the specified book's PDF
app.post('/searchBook', (req, res) => {

  //gets book's name from the request
  const bookName = req.body.bookName;

  //reads the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    //searchs the book
    checkBook = info.libri.find(b => b.nome === bookName);

    //if it finds the book, it sends it's information to the client
    if (checkBook) {
      res.json ({
        percorso: checkBook.percorso,
        autore:   checkBook.autore,
        genere:   checkBook.genere,
        anno:     checkBook.anno,
        pagine:   checkBook.pagine,
        prezzo:   checkBook.prezzo,
        nome:     checkBook.nome
      });
    } else {
        sendError(res);
      }
  })
});

//when the server receives an HTTP request to this url, it shows to the user the suggestions of the book he's looking for
app.post('/getSuggestions', (req, res) => {

  //gets the user input from the request
  const input = req.body.input;

  //reads the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    //searchs books that contain the input entered by the user, ignoring the difference between lowercase and uppercase
    suggestions = info.libri.filter(b => b.nome.toLowerCase().includes(input.toLowerCase())).map(b => b.nome);

    //if it finds books, it sends the list of suggestions to the client
    if (suggestions) {
      res.json({value: suggestions});
    }
  });
});

//when the server receives an HTTP request to this url, it shows the user's cart
app.post('/showCart', (req, res) => {

  const username = req.body.username;

  //reads the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    //searchs the user's cart
    checkCart = info.utenti.find(u => u.username === username);

    //if it finds user's cart, it sends it to the client
    if (checkCart) {
      res.json({value: checkCart.carrello});
    } else {
        sendError(res);
      }
  });
});

//when the server receives an HTTP request to this url, it adds the specified book to the user's cart
app.post('/addBook', (req, res) => {

  const bookName = req.body.bookName,
        username = req.body.username;

  //reads the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    checkBook      = info.libri.find(b => b.nome === bookName),           //checks if the book is available
    checkCart      = info.utenti.find(u => u.username === username),      //searchs the user's cart
    checkDuplicate = checkCart.carrello.find(b => b.nome === bookName);   //checks if the user has already added the book at his cart

    //if it finds user's cart, the book is available and the user hasn't already added it to him cart, it does it now
    if (checkBook && checkCart && !checkDuplicate) {
      checkCart.carrello.push ({
        nome: bookName,
        prezzo: checkBook.prezzo,
        genere: checkBook.genere
      });
      fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', () => {
        res.json({ result: true })
      });
    } else {
        sendError(res);
      }
  });
});

//when the server receives an HTTP request to this url, it removes the specified book from the user's cart
app.post('/removeBook', (req, res) => {

  //gets book's name from the request
  const bookName = req.body.bookName,
        username = req.body.username;

  //reads the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    //searchs the user
    checkUser = info.utenti.find(u => u.username === username);

    //if it finds him
    if (checkUser) {

      //checks if the book to remove is in his cart
      const index = checkUser.carrello.findIndex(book => book.nome === bookName);
      if (index !== -1) {

        //removes the book from user's cart
        checkUser.carrello.splice(index, 1);

        //reads the JSON file to apply the changes
        fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', () => {});

        //sends the user's cart to the client
        res.json({value: checkUser.carrello});
      } else {
          sendError(res);
        }
    } else {
        sendError(res);
      }
  });
});

//when the server receives an HTTP request to this url, it shows the book's reviews
app.post('/showBookReviews', (req, res) => {

  //gets book's name from the request
  const bookName = req.body.bookName;

  //tries to read the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    //checks if the book is available and sends its reviews to the client
    checkBook = info.libri.find(b => b.nome === bookName);
    if (checkBook) {
      res.json({value: checkBook.recensioni});
    } else {
        sendError(res);
      }
  });
});

//when the server receives an HTTP request to this url, it shows the book's reviews
app.post('/checkReview', (req, res) => {

  //gets book's name from the request
  const bookName = req.body.bookName,
        username = req.body.username;

  //tries to read the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    //checks if the book is available
    checkBook = info.libri.find(book => book.nome === bookName);

    //if it finds the book
    if (checkBook) {

      //checks if the user has already reviewed it
      const checkReview = checkBook.recensioni.find(review => review.utente === username);

      //if he hasn't, he can write a review
      res.json({ value: checkReview, user: username, redirect: 'recensione.html' });
    }
  });
});

//when the server receives an HTTP request to this url, it shows the book's reviews
app.post('/writeReview', (req, res) => {

  //gets book's name and review from the request
  const bookName    = req.body.bookName,
        reviewTitle = req.body.reviewTitle,
        review      = req.body.review,
        username = req.body.username;

  //tries to read the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    //checks if the book is available
    checkBook = info.libri.find(b => b.nome === bookName);

    //if the book is available
    if (checkBook) {

      //gets the local date and hour
      const date = new Date(),
            day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();

      //stores the review and its information
      checkBook.recensioni.push({
        titolo: reviewTitle,
        commento: review,
        data: day + "/" + month + "/" + year,
        utente: username
      })
      fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', () => {});

      //sends the user to "shop.html"
      res.json({ redirect: 'shop.html' });
    } else {
        sendError(res);
      }
  });
});

//when the server receives an HTTP request to this url, it removes user's review
app.post('/removeReview', (req, res) => {

  //gets book's name from the request
  const bookName = req.body.bookName,
        username = req.body.username;

    //tries to read the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {

      //parses the JSON data
      const info = JSON.parse(data),

      //searchs the book
      checkBook = info.libri.find(book => book.nome === bookName);

      //if it finds its
      if (checkBook) {

        //checks if the book to remove is in his cart
        const index = checkBook.recensioni.findIndex(review => review.utente === username);
        if (index !== -1) {

          //removes the book from user's cart
          checkBook.recensioni.splice(index, 1);

          //reads the JSON file to apply the changes
          fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', () => {});

          //sends the user's cart to the client
          res.json({result: true, value: checkBook.recensioni});
        } else {
            sendError(res);
          }
      } else {
          sendError(res);
        }
    });
});

//when the server receives an HTTP request to this url, it returns user's data
app.post("/getInfo", (req, res) => {

  const username = req.body.username;

  //reads the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    //gets user's information
    checkUser = info.utenti.find(u => u.username === username);

    //if it finds the user, sends its data to the client
    if (checkUser) {

      //array containing books reviewed by the user
      let reviewedBooks = [];

      //each book reviewed by the user is added into the array
      info.libri.forEach(book => {
        book.recensioni.forEach(review => {
          if (review.utente === checkUser.username)
            reviewedBooks.push ({
              recensione: review.titolo,
              nome: book.nome,
              genere: book.genere
            });
        });
      });

      //sends the information to the client
      res.json ({ recensioni: reviewedBooks });
    } else {
        sendError(res);
      }
  });
});

//when the server receives an HTTP request to this url, it clears user's cart
app.post('/emptyCart', (req, res) => {

  const username = req.body.username;

  //reads the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {

    //parses the JSON data
    const info = JSON.parse(data),

    //searchs the user's cart
    checkCart = info.utenti.find(u => u.username === username);

    //if it finds user's cart, it clears it
    if (checkCart) {
      checkCart.carrello = [];
      fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', () => {});
      res.json({ result: true});
    } else {
        sendError(res);
      }
  });
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});