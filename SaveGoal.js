const HaxballJS = require("haxball.js");
const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

webhookURL="https://discord.com/api/webhooks/1175798132378959913/89FAwKy-aIXpomNq7tMAeHjcZ6ZE0i--BADLPPAzUsHapRA4S6373e-p0qZYTJEQv3H2"

HaxballJS.then((HBInit) => {
  const room = HBInit({
    roomName: "SaveGoal",
    maxPlayers: 16,
    public: true,
    noPlayer: true,
    token: "thr1.AAAAAGWacYIxOgwvBfA7Eg.XKlGHELQTDM",
  });
  var VoteList=[];

  room.setDefaultStadium("Big");
  room.setScoreLimit(5);
  room.setTimeLimit(0);

  function updateAdmins() { 
    var players = room.getPlayerList();
    if ( players.length == 0 ) return; 
    if ( players.find((player) => player.admin) != null ) return; 
    room.setPlayerAdmin(players[0].id, true); 
  }
  function EndRecord(){
    var gamerec=room.stopRecording();
    fs.writeFile('./recs/GOAL.hbr2',gamerec, 'utf8', (err) => {
        if (err) {
          console.error('Gol kaydelirken bir hata oluştu:', err);
        } else {
          console.log('Gol başarıyla dosyaya eklendi:');
        }
      })
   }
   function sendFileToDiscord() {
    try {
      const fileStream = fs.createReadStream('./recs/GOAL.hbr2');
      const form = new FormData();
      form.append('file', fileStream);
      const response = fetch(webhookURL, {
        method: 'POST',
        body: form,
      });
      if (response.ok) 
      {
        console.log('Dosya Discord\'a başarıyla gönderildi.');
      } else {
        console.error('Dosya gönderme işlemi başarısız oldu.');
      }
    } catch (error)
    {
      console.error('Hata:', error);
    }
  }
  

  room.onGameStart = function () {
    room.startRecording();
  }
  room.onPositionsReset = function () {
    EndRecord();
    room.startRecording();
  }
  room.onPlayerJoin = function(player) {
    updateAdmins();
  }
  
  room.onPlayerLeave = function(player) {
    updateAdmins();
  }
  room.onPlayerChat = function (player, message) {
    if (message == "!ss")
    {
        if(VoteList.includes(player.name))
        {
           room.sendAnnouncement(" You can only vote once", null, 0x7B6DD6, "normal", 0);
        }
        else
        {
           VoteList.push(player.name)
           let vote=4-VoteList.length
           room.sendAnnouncement(" It needs "+vote+" more votes for the goal to be recorded.", null, 0x7B6DD6, "normal", 0);
        }
        if(VoteList.length==4)
        {
           room.sendAnnouncement("The goal was successfully recorded in the discord channel.", null, 0x7B6DD6, "normal", 0);
           sendFileToDiscord();
        }
   }
  }

  room.onRoomLink = function (link) {console.log(link);};
});