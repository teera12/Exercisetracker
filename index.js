const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL);

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});




app.route('/api/users')
  .post("/api/users", (req, res) => {
    User.findOne({ username: req.body.username }, (err, foundUser) => {
      if (err) return;
      if (foundUser) {
        res.send("Username Taken");
      } else {
        const newUser = new User({
          username: req.body.username
        });
        newUser.save();
        res.json({
          username: req.body.username,
          _id: newUser._id
        });
      }
    });
  });

app.post('/api/users/:_id/exercises', (req, res) =>{
  const{description, duration, date = new Date()} = req.body;
  const id = req.params._id
  User.findById(id, (err, user) => {
    if(user){
      const username = user.username;
      const exercise = {
        description, 
        duration, 
        date
      }
      if(!user.log) user.log = {exercise}
      else user.log.push(exercise)
      user.save((err, data) => {
        if(data){
          exercise.username = username;
          exercise._id = id;
          res.json(exercise)
        }
      });
    }
  });
});

app.get((request, response) => {
    User.find((error, data) => {
      if(data){
        response.json(data)
      }
    });
  });
