const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Game = require('./models/games');
const bodyParser = require('body-parser');


const app = express();


const dbURI = "mongodb://127.0.0.1:27017/arcade";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(3000))
  .catch(err => console.log(err));
  
app.set('view engine', 'ejs'); // Set EJS as the view engine

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

app.get('/', (req, res) => {
  res.redirect('/games');
});

app.get('/games/new', (req, res) => {
  try {
      res.render('newGame');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/games/search', (req, res) => {
  const title = req.query.title;
  const type = req.query.type;

  if (title !== undefined && type==="") {
      Game.find({ name: {$regex:title, $options:"i" }})
          .exec()
          .then(games => {
              res.render('index', { games,title,type });
                      })
          .catch(err => {
              console.error(err);
              res.status(500).send('Error fetching games');
          });
  }
  else if (title===undefined && type !== undefined) {
      // Find based on type only
      Game.find({ type: type })
          .exec()
          .then(games => {
              res.render('index', { games,title,type });
          })
          .catch(err => {
              console.error(err);
              res.status(500).send('Error fetching games');
          });
  }else if (title !== undefined && (type !== undefined) ){
      // Find based on both title and type
      Game.find({ name: {$regex:title, $options:"i" }, type: type })
          .exec()
          .then(games => {
              res.render('index', { games,title,type });
          })
          .catch(err => {
              console.error(err);
              res.status(500).send('Error fetching games');
          });
  }  else {
      Game.find({})
      .exec()
      .then(games => {
          res.render('index', { games,title,type});
      })
      .catch(err => {
          console.error(err);
          res.status(500).send('Error fetching games');
      });
  }
});


app.get('/games', async (req, res) => {
  try {
    const title="";
    const type="";
    // Fetch the list of games from the database
    const games = await Game.find({});
    // Render the index page and pass the list of games
    res.render('index', { games, title, type });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/games/:id', async (req, res) => {
  try {
      const gameId = req.params.id;
      const game = await Game.findById(gameId);
      if (!game) {
          return res.status(404).send('Game not found');
      }
      res.render('gameDetails', { game });
  } catch (error) {
      res.status(500).send("Internal Server Error");
  }
});



app.get('/games/:id/edit', async (req, res) => {
  const game = await Game.findById(req.params.id);
  res.render('editGame', { game }); 
});





app.post('/games', async (req, res) => {
  try {
    const newGame = new Game({
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      minimumAge: req.body.minimumAge,
      pricing: {
        hourly: req.body.priceHourly,
        perGame: req.body.pricePerGame,
      },
      image: {
        description: req.body.imageAltText ,
        path: req.body.imagePath,
      }
     
    });

    
    await newGame.save();

    res.redirect('/games');
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to save the game.');
  }
});






app.put('/games/:id', (req, res) => {
  const id = req.params.id;
  const updatedGame = {
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    minimumAge: req.body.minimumAge,
    pricing: {
        hourly: req.body.priceHourly,
        perGame: req.body.pricePerGame
    },
    image: {
        description: req.body.imageAltText,
        path: req.body.imagePath
    }
  };

  Game.findByIdAndUpdate(id, updatedGame, { new: true, runValidators: true })
    .then(updatedGameDoc => {
        if (updatedGameDoc) {
            res.json({ success: true, game: updatedGameDoc });
        } else {
            res.status(404).json({ success: false, message: 'Game not found' });
        }
    })
    .catch(err => {
        console.error("Error updating game:", err);
        res.status(500).json({ success: false, message: 'Error updating game', error: err });
    });
});






app.delete('/games/:id', async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.status(200).send('Game deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});










