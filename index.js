const { v4: uuidv4 } = require("uuid");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.resolve(""))); // Serve static files

let playingArr = []; // Active game rooms

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    if (!data.name) return;

    let availableRoom = playingArr.find((room) => !room.player2);

    if (availableRoom) {
      availableRoom.player2 = {
        socketId: socket.id,
        name: data.name,
        turn: availableRoom.player1.turn === "X" ? "O" : "X",
        moves: [],
      };
      socket.join(availableRoom.id);
      io.to(availableRoom.id).emit("join_room", availableRoom);
    } else {
      const newRoomId = uuidv4();
      const generatedVal = Math.floor(Math.random() * 2) === 0 ? "X" : "O";

      let newRoom = {
        id: newRoomId,
        player1: {
          socketId: socket.id,
          name: data.name,
          turn: generatedVal,
          moves: [],
        },
        player2: null,
        choiceCount: 0,
      };

      socket.join(newRoomId);
      playingArr.push(newRoom);
      socket.emit("waiting", { message: "Waiting for an opponent..." });
    }
  });

  socket.on("playing", (e) => {
    let currentGame = playingArr.find((room) =>
      [room.player1?.name, room.player2?.name].includes(e.name)
    );

    if (!currentGame) return;

    let currentPlayer =
      currentGame.player1.name === e.name
        ? currentGame.player1
        : currentGame.player2;
    let opponent =
      currentGame.player1.name !== e.name
        ? currentGame.player1
        : currentGame.player2;

    if (currentGame.choiceCount < 9) {
      if (
        !opponent.moves.includes(e.id) &&
        !currentPlayer.moves.includes(e.id)
      ) {
        currentPlayer.moves.push(e.id);
        currentGame.choiceCount++;
        io.to(currentGame.id).emit("playing", currentGame);
      }
    }
  });

  socket.on("gameOver", (data) => {
    playingArr = playingArr.filter((room) => room.id !== data.roomId);
    io.to(data.roomId).emit("gameOver", { message: "Game over!" });
  });

  socket.on("disconnect", () => {
    playingArr = playingArr.filter(
      (room) =>
        room.player1?.socketId !== socket.id &&
        room.player2?.socketId !== socket.id
    );
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  return res.sendFile("index.html");
});

server.listen(port, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`Server running on port ${port}`);
  } else {
    console.log(`Tic Tac Toe server is running`);
  }
});
