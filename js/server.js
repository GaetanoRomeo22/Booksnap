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
const app            = express(),
      port           = 3000,                                         //port number on witch the server answers
      jsonFilePath   = path.join(__dirname, 'database.json'),        //JSON file's path
      jsonData       = fs.readFileSync(jsonFilePath,'utf8'),         //JSON file's data
      info           = JSON.parse(jsonData);                         //JSON file's data convertes
let   username,                                                      //user's username
      password;                                                      //user's password
//-----------------------------------------------------Variables--------------------------------------------------------

app.use(bodyParser.urlencoded({ extended: true }));                  //allows to analize data passed in HTTP request and response
app.use(bodyParser.json());                                          //allows to analize JSON format data
app.use(cors());                                                     //allows connections by all origins

//checks if the operation works
function errorHandler(res, err)
{
  if (err)
  {
    console.error('Errore nella lettura del file JSON:', err);
    return res.status(500).json({error: 'Errore del server'});
  }
}

//shows the error message
function printError(res, message)
{
  console.log(message);
  res.status(404).json({error: message});
}

//when the server receives an HTTP request to this url, it logs the user up
app.post("/login", (req, res) =>
{
  //gets username and password from the request
  username = req.body.username;
  password = req.body.password;

  //checks if username and password are correctly read from the request and if the user isn't logged
  if (username && password)
  {
    //reads the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err) =>
    {
      //checks if it works
      errorHandler(res, err);

      //checks if the user is registered
      const checkUser = info.utenti.find(u => u.username === username);

      //if the user is registered
      if (checkUser)
      {
        //encrypts the password
        const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

        //checks if the entered password is correct, sets logged on true to store that the user is logged up and sends him to "index.html"
        if (checkUser.password === hashedPassword)
        {
          res.json({redirect: 'index.html'});
        }
        else
          printError(res, 'Password errata');
      }
      else
        printError(res, 'Utente non registrato');
    });
  }
  else
    printError(res, 'Username o password non trovati nella richiesta HTTP o accesso già effettuato');
});

//when the server receives an HTTP request to this url, it logs the user in
app.post('/register', (req, res) =>
{
  //gets name, surname, username and password from the request
  const name     = req.body.name,
        surname  = req.body.surname;
  username       = req.body.username;
  password       = req.body.password;

  //checks if the password respects the standart
  const checkPassword = new PasswordValidator();
  checkPassword.is().min(8).has().uppercase().has().symbols();

  //checks if name, surname, username and password are correctly read and if the user isn't logged
  if (name.trim() !== '' && surname.trim() !== '' && username.trim() !== '' && checkPassword.validate(password))
  {
    //reads the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err) =>
    {
      //checks if it works
      errorHandler(res, err);

      //checks if the user is registered
      const checkUser = info.utenti.find(u => u.username === username);

      //if the user isn't registered
      if (!checkUser)
      {
        //encrypts the password
        const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

        //stores the user and his information into the JSON file
        info.utenti.push
        ({
          nome:     name,
          cognome:  surname,
          username: username,
          password: hashedPassword,
          carrello: []
        });
        fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', (err) =>
        {
          //checks if it works
          errorHandler(res, err);

          //sets logged at true to store that the user is logged up and sends him to "index.html"
          logged = true;
          res.json({redirect: 'index.html'});
        });
      }
      else
        printError(res, 'Utente gia registrato');
    });
  }
  else
    printError(res, "Dati dell'utente non trovati nella richiesta HTTP, password errata o accesso già effettuato");
});

//when the server receives an HTTP request to this url, it shows the specified book's PDF
app.post('/searchBook', (req, res) =>
{
  //gets book's name from the request
  const bookName = req.body.bookName;

  //checks if the book's name is correctly read from the request and if the user is logged
  if (username && password && bookName)
  {
    //reads the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err) =>
    {
      //checks if it works
      errorHandler(res, err);

      //searchs the book
      const checkBook = info.libri.find(b => b.nome === bookName);

      //if it finds the book, it sends it's information to the client
      if (checkBook)
      {
        res.json
        ({
          percorso: checkBook.percorso,
          autore:   checkBook.autore,
          genere:   checkBook.genere,
          anno:     checkBook.anno,
          prezzo:   checkBook.prezzo
        });
      }
      else
        printError(res, 'Utente non trovato');
    })
  }
  else
    printError(res, 'Nome del libro non trovato nella richiesta HTTP o accesso non effettuato');
});

//when the server receives an HTTP request to this url, it shows to the user the suggestions of the book he's looking for
app.post('/getSuggestions', (req, res) =>
{
  //gets the user input from the request
  const input = req.body.input;

  //checks if the input is correctly read from the request and if the user is logged
  if (input && username && password)
  {
    //searchs books that contain the input entered by the user, ignoring the difference between lowercase and uppercase
    const suggestions = info.libri.filter(b => b.nome.toLowerCase().includes(input.toLowerCase())).map(b => b.nome);

    //if it finds books, it sends the list of suggestions to the client
    if (suggestions)
      res.json({value: suggestions});
  }
  else
    printError(res, 'Input non trovato nella richiesta HTTP o accesso non effettuato');
});

//when the server receives an HTTP request to this url, it shows the user's cart
app.post('/showCart', (req, res) =>
{
  //checks if the user is logged
  if (username && password)
  {
    //reads the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err) =>
    {
      //checks if it works
      errorHandler(res, err);

      const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex),                       //encrypts the password
            checkCart = info.utenti.find(u => u.username === username && u.password === hashedPassword); //searchs the user's cart
      //if it finds user's cart, it sends it to the client
      if (checkCart)
        res.json({value: checkCart.carrello});
      else
        printError(res, "Carrello dell'utente non trovato");
    });
  }
  else
    printError(res, 'Username o password non trovati nella richiesta HTTP o accesso non effettuato');
});

//when the server receives an HTTP request to this url, it adds the specified book to the user's cart
app.post('/addBook', (req, res) =>
{
  //gets the book's name from the request
  const bookName = req.body.bookName;

  //if the user is logged and if the book's name is correctly read from the request
  if (username && password && bookName)
  {
    //reads the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err) =>
    {
      //checks if it works
      errorHandler(res, err);

      const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex),                            //encrypts the password
            checkBook      = info.libri.find(b => b.nome === bookName),                                       //checks if the book is available
            checkCart      = info.utenti.find(u => u.username === username && u.password === hashedPassword), //searchs the user's cart
            checkDuplicate = checkCart.carrello.find(b => b.nome === bookName);                               //checks if the user has already added the book at his cart

      //if it finds user's cart, the book is available and the user hasn't already added it to him cart, it does it now
      if (checkBook && checkCart && !checkDuplicate)
      {
        checkCart.carrello.push
        ({
          nome: bookName,
          prezzo: checkBook.prezzo,
          genere: checkBook.genere
        });
        fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', (err) =>
        {
          //checks if it works
          errorHandler(res, err);
        });
      }
      else
        printError(res, 'Libro gia presente nel carrello');
    });
  }
  else
    printError(res, 'Nome del libro non trovato nella richiesta HTTP o accesso non effettuato');
});

//when the server receives an HTTP request to this url, it removes the specified book from the user's cart
app.post('/removeBook', (req, res) =>
{
  //gets book's name from the request
  const bookName = req.body.bookName;

  //checks if the book's name is correctly read and if the user is logged
  if (username && password && bookName)
  {
    const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex),                            //encrypts the password
          checkUser      = info.utenti.find(u => u.username === username && u.password === hashedPassword); //searchs the user

    //if it finds him
    if (checkUser)
    {
      //checks if the book to remove is in his cart
      const index = checkUser.carrello.findIndex(book => book.nome === bookName);
      if (index !== -1)
      {
        //removes the book from user's cart
        checkUser.carrello.splice(index, 1);

        //reads the JSON file to apply the changes and sends the user's cart to the client
        fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', (err) =>
        {
          //checks if it works
          errorHandler(res, err);
          res.json({ value: checkUser.carrello });
        });
      }
      else
        printError(res, 'Libro non trovato nel carrello');
    }
    else
      printError(res, 'Utente non trovato');
  }
  else
    printError(res, 'Nome del libro non trovato nella richiesta HTTP o accesso non effettuato');
});

//when the server receives an HTTP request to this url, it shows the book's reviews
app.post('/showBookReviews', (req, res) =>
{
  //gets book's name from the request
  const bookName = req.body.bookName;

  //checks if the book's name is correctly read from the request and if the user is logged
  if (bookName && username && password)
  {
    //tries to read the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err) =>
    {
      //checks if it works
      errorHandler(res, err);

      //checks if the book is available and sends its reviews to the client
      const checkBook = info.libri.find(b => b.nome === bookName);
      if (checkBook)
        res.json({value: checkBook.recensioni});
      else
        printError(res, 'Libro non trovato');
    });
  }
  else
    printError(res, 'Nome del libro non trovato nella richiesta HTTP o accesso non effettuato');
});

//when the server receives an HTTP request to this url, it shows the book's reviews
app.post('/checkReview', (req, res) =>
{
  //gets book's name from the request
  const bookName = req.body.bookName;

  //checks if book's name and review are correctly read from the request and if the user is logged
  if (bookName && username && password)
  {
    //checks if the book is available
    const checkBook = info.libri.find(book => book.nome === bookName);

    //if it finds the book
    if (checkBook)
    {
      //checks if the user has already reviewed it
      const checkReview = checkBook.recensioni.find(review => review.utente === username);

      //if he hasn't, he can write a review
      res.json({ value: checkReview, redirect: 'recensione.html' });
    }
    else
      printError(res, 'Nome del libro non trovati nella richiesta HTTP o accesso non effettuato');
  }
});

//when the server receives an HTTP request to this url, it shows the book's reviews
app.post('/writeReview', (req, res) =>
{
  //gets book's name and review from the request
  const bookName    = req.body.bookName,
    reviewTitle = req.body.reviewTitle,
    review      = req.body.review;

  //checks if book's name and review are correctly read from the request and if the user is logged
  if (bookName && review && reviewTitle && username && password)
  {
    //checks if the book is available
    const checkBook = info.libri.find(b => b.nome === bookName);

    //if the book is available
    if (checkBook)
    {
      //gets the local date and hour
      const date   = new Date(),
            day  = date.getDate(),
            month= date.getMonth() + 1,
            year = date.getFullYear();

      //stores the review and its information
      checkBook.recensioni.push
      ({
        titolo:   reviewTitle,
        commento: review,
        data:     day + "/" + month + "/" + year,
        utente:   username
      })
      fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', (err) =>
      {
        //checks if it works
        errorHandler(res, err);
      });

      //sends the user to "shop.html"
      res.json({ redirect: 'shop.html' });
    }
  }
  else
    printError(res, 'Nome del libro o recensione non trovati nella richiesta HTTP o accesso non effettuato');
});

//when the server receives an HTTP request to this url, it removes user's review
app.post('/removeReview', (req, res) =>
{
  //gets book's name from the request
  const bookName = req.body.bookName;

  //checks if the book's name is correctly read and if the user is logged
  if (username && password && bookName)
  {
    const checkBook = info.libri.find(book => book.nome === bookName); //searchs the user

    //if it finds him
    if (checkBook)
    {
      //checks if the book to remove is in his cart
      const index = checkBook.recensioni.findIndex(review => review.utente === username);
      if (index !== -1)
      {
        //removes the book from user's cart
        checkBook.recensioni.splice(index, 1);

        //reads the JSON file to apply the changes and sends the user's cart to the client
        fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', (err) =>
        {
          //checks if it works
          errorHandler(res, err);
          res.json({ value: checkBook.recensioni });
        });
      }
      else
        printError(res, 'Recensione libro non trovata');
    }
    else
      printError(res, 'Utente non trovato');
  }
  else
    printError(res, 'Nome del libro non trovato nella richiesta HTTP o accesso non effettuato');
});

//when the server receives an HTTP request to this url, it returns user's data
app.post("/getInfo", (req, res) =>
{
  //checks if the user is logged
  if (username && password)
  {
    //reads the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err) =>
    {
      //checks if it works
      errorHandler(res, err);

      const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex),                            //encrypts the password
            checkUser      = info.utenti.find(u => u.username === username && u.password === hashedPassword); //gets user's information

      //if it finds the user, sends its data to the client
      if (checkUser)
      {
        //array containing books reviewed by the user
        let reviewedBooks = [];

        //each book reviewed by the user is added into the array
        info.libri.forEach(book =>
        {
          book.recensioni.forEach(review =>
          {
            if (review.utente === checkUser.username)
              reviewedBooks.push
              ({
                recensione : review.commento,
                nome       : book.nome,
                genere     : book.genere
              });
          });
        });

        //sends the information to the client
        res.json
        ({
          username:   checkUser.username,
          nome:       checkUser.nome,
          cognome:    checkUser.cognome,
          recensioni: reviewedBooks
        });
        }
      else
        printError(res, 'Utente non trovato');
    });
  }
  else
    printError(res, 'Username o password non trovati nella richiesta HTTP o accesso non effettuato');
});

//when the server receives an HTTP request to this url, it clears user's cart
app.post('/emptyCart', (req, res) =>
{
  //checks if the user is logged
  if (username && password)
  {
    //reads the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err) =>
    {
      //checks if it works
      errorHandler(res, err);

      const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex),                            //encrypts the password
            checkCart      = info.utenti.find(u => u.username === username && u.password === hashedPassword); //searchs the user's cart

      //if it finds user's cart, it clears it
      if (checkCart)
      {
        checkCart.carrello = [];
        res.json({ result: true });
        fs.writeFile(jsonFilePath, JSON.stringify(info, null, 2), 'utf8', (err) =>
        {
          //checks if it works
          errorHandler(res, err);
        });
      }
      else
        printError(res, "Carrello dell'utente non trovato");
    });
  }
  else
    printError(res, 'Username o password non trovati nella richiesta HTTP o accesso non effettuato');
});

app.listen(port, () =>
{
  console.log(`Server in ascolto sulla porta ${port}`);
});
