const express = require("express");
const app = express();

const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 5000;

//creating a server in http
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.resolve(""))); // so we can use the html file

//to generate which turn to be played first
const values = ["X", "O"];
let randmIdx = Math.floor(Math.random() * 2);
let generatedVal = values[randmIdx];

let arr = [];
let playingArr = [];

io.on("connection", (socket) => {
  //on is used to get the data sent via "emit" function
  socket.on("find", (e) => {
    if (e.name !== null) {
      arr.push(e.name);

      if (arr.length >= 2) {
        let p1obj = {
          p1Name: arr[0],
          p1Turn: generatedVal,
          p1Moves: [],
        };

        let p2Trn = p1obj.p1Turn === "X" ? "O" : "X";

        let p2obj = {
          p2Name: arr[1],
          p2Turn: p2Trn,
          p2Moves: [],
        };

        let obj = {
          p1: p1obj,
          p2: p2obj,
          choiceCount: 0,
        };

        playingArr.push(obj);

        arr.splice(0, 2);

        io.emit("find", { allPlayers: playingArr });
      }
    }
  });

  socket.on("playing", (e) => {
    let p1MovesSet, p2MovesSet;
    let currentPlayObj = playingArr.find(
      (obj) => obj.p1.p1Name === e.name || obj.p2.p2Name === e.name
    );

    if (currentPlayObj.p1.p1Turn === e.value) {
      if (currentPlayObj.p2.p2Moves.includes(e.id)) {
        return;
      } else {
        currentPlayObj.p1.p1Moves.push(e.id);
        p1MovesSet = new Set([...currentPlayObj.p1.p1Moves]);
        currentPlayObj.p1.p1Moves = [...p1MovesSet];
      }
      if (currentPlayObj.choiceCount < 9) {
        currentPlayObj.choiceCount++;
      }
    }

    if (currentPlayObj.p2.p2Turn === e.value) {
      if (currentPlayObj.p1.p1Moves.includes(e.id)) {
        return;
      } else {
        currentPlayObj.p2.p2Moves.push(e.id);
        p2MovesSet = new Set([...currentPlayObj.p2.p2Moves]);
        currentPlayObj.p2.p2Moves = [...p2MovesSet];
      }
      if (currentPlayObj.choiceCount < 9) {
        currentPlayObj.choiceCount++;
      }
    }

    io.emit("playing", { allPlayers: playingArr });
  });

  socket.on("gameOver", (e) => {
    playingArr = playingArr.filter((obj) => obj.p1.p1Name !== e.name);
  });
});

app.get("/", (req, res) => {
  return res.sendFile("index.html");
});

server.listen(port, () => {
  if(process.env.NODE_ENV==="development")
  {
    console.log(`Server running on port ${port}`);
  }
  else
  {
    console.log(`Tic Tac Toe server is running`);
  }
});
