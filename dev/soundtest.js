var player = require('play-sound')(opts = {})

 player.play('gong.wav', function (err) {
   if (err) throw err;
   console.log("Audio finished");
 });