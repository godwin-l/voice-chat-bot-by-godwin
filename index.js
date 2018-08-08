'use strict';
require('dotenv').config()
const APIAI_TOKEN = process.env.APIAI_TOKEN;
const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID;

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); 
app.use(express.static(__dirname + '/public')); 

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log('Godwin connected');
});
const apiai = require('apiai')(APIAI_TOKEN);
app.get('/', (req, res) => {
  res.sendFile('index.html');
});
io.on('connection', function(socket) {
  socket.on('chat message', (text) => {
    console.log('Godwin said: ' + text);
    let apiaiReq = apiai.textRequest(text, {
      sessionId: APIAI_SESSION_ID
    });

    apiaiReq.on('response', (response) => {
      let aiText = response.result.fulfillment.speech;
      console.log('Assistant reply: ' + aiText);
      socket.emit('bot reply', aiText);
    });
    apiaiReq.on('error', (error) => {
      console.log(error);
    });

    apiaiReq.end();

  });
});
