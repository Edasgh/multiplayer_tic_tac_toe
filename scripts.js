//getting all neccessary elements
const gridContainer = document.querySelector(".grid-board");
const grid_boxes = document.querySelectorAll(".grid-board button"),
  arr_of_grid_boxes = Array.from(grid_boxes);

const user = document.getElementById("user"),
  opp = document.getElementById("opp");

const turnTextContainer = document.querySelector(".turnText"),
  turnText = document.getElementById("Turnvalue");

const joinGameForm = document.getElementById("joinGame"),
  userNameInput = document.getElementById("userNameInput");

const playInfoContainer = document.querySelector(".play-info");

const loadingContainer = document.querySelector(".loading-container");

const socket = io();

let userName, oppName;

let p1Wins, p2Wins;

let yourTurn = "X",
  whosTurnNow,
  turnCount = 0;

document.getElementById("whosTurn").innerText = `${whosTurnNow}'s Turn`;
turnText.innerText = `${yourTurn}`;

const winning_combinations = [
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const checkWin = (p1Name, p2Name, p1Moves, p2Moves) => {
  const IncludesinP1 = (combination) => {
    if (p1Moves.length >= 3) {
      return combination.every((el) => p1Moves.includes(`box-${el + 1}`));
    }
  };
  const IncludesinP2 = (combination) => {
    if (p2Moves.length >= 3) {
      return combination.every((el) => p2Moves.includes(`box-${el + 1}`));
    }
  };
  p1Wins = winning_combinations.some(IncludesinP1); //any combination from the array
  p2Wins = winning_combinations.some(IncludesinP2);

  if (p1Wins) {
    if (p1Name == userName) {
      document.getElementById("whosTurn").innerText = `You Win`;
    } else {
      document.getElementById("whosTurn").innerText = `${oppName} Wins`;
    }
  }
  if (p2Wins) {
    if (p2Name == userName) {
      document.getElementById("whosTurn").innerText = `You Win`;
    } else {
      document.getElementById("whosTurn").innerText = `${oppName} Wins`;
    }
  }

  if (p1Wins || p2Wins) {
    let time = 0;
    const interval = setInterval(() => {
      time++;
      document.getElementById(
        "whosTurn"
      ).innerText = `Redirecting to Home Page In ${3 - time} second(s)`;
    }, 1000);

    setTimeout(() => {
      socket.emit("gameOver", { name: userName });
      clearInterval(interval);
      window.location.reload();
    }, 3000);
  }
};

joinGameForm.addEventListener("submit", (e) => {
  e.preventDefault();

  userName = userNameInput.value;
  socket.emit("find", { name: userName }); //emit is used to send a data (to be got via socket.on() function)
  joinGameForm.querySelector("button").disabled = "true";

  loadingContainer.classList.remove("d-none");
});

socket.on("find", (e) => {
  let allPlayersArr = e.allPlayers;

  joinGameForm.style.display = "none";
  loadingContainer.classList.add("d-none");
  playInfoContainer.classList.remove("d-none");
  turnTextContainer.classList.remove("d-none");
  gridContainer.classList.remove("d-none");

  const foundObj = allPlayersArr.find(
    (obj) => obj.p1.p1Name == `${userName}` || obj.p2.p2Name == `${userName}`
  );
  foundObj.p1.p1Name == `${userName}`
    ? (oppName = foundObj.p2.p2Name)
    : (oppName = foundObj.p1.p1Name);
  foundObj.p1.p1Name == `${userName}`
    ? (yourTurn = foundObj.p1.p1Turn)
    : (yourTurn = foundObj.p2.p2Turn);

  user.innerText = `${userName}`;
  opp.innerText = `${oppName}`;

  whosTurnNow = foundObj.p1.p1Turn;
  document.getElementById("whosTurn").innerText = `${whosTurnNow}'s Turn`;
  turnText.innerText = `${yourTurn}`;
});

grid_boxes.forEach((box) => {
  box.addEventListener("mouseover", () => {
    if (yourTurn === whosTurnNow) {
      box.style.cursor = "pointer";
    } else {
      box.style.cursor = "not-allowed";
    }
  });
  box.addEventListener("click", () => {
    if (yourTurn === whosTurnNow) {
      box.style.cursor = "pointer";
      box.innerText = yourTurn;
      socket.emit("playing", { value: yourTurn, id: box.id, name: userName });
    } else {
      box.style.cursor = "not-allowed";
      return;
    }
  });
});

socket.on("playing", (e) => {
  const foundObj = e.allPlayers.find(
    (obj) => obj.p1.p1Name == `${userName}` || obj.p2.p2Name == `${userName}`
  );

  let p1Name = foundObj.p1.p1Name;
  let p2Name = foundObj.p2.p2Name;

  let p1Moves = foundObj.p1.p1Moves;
  let p2Moves = foundObj.p2.p2Moves;

  if (foundObj.choiceCount % 2 != 0) {
    whosTurnNow = foundObj.p2.p2Turn;
    document.getElementById("whosTurn").innerText = `${whosTurnNow}'s Turn`;
  } else {
    whosTurnNow = foundObj.p1.p1Turn;
    document.getElementById("whosTurn").innerText = `${whosTurnNow}'s Turn`;
  }

  if (foundObj.choiceCount >= 9) {
    if (!p1Wins && !p2Wins) {
      document.getElementById("whosTurn").innerText = `Match Draw!`;

      let time = 0;
      const interval = setInterval(() => {
        time++;
        document.getElementById(
          "whosTurn"
        ).innerText = `Redirecting To Home Page In ${3 - time} second(s)`;
      }, 1000);
      setTimeout(() => {
        socket.emit("gameOver", { name: userName });
        clearInterval(interval);
        window.location.reload();
      }, 3000);
    }
  }

  if (foundObj.choiceCount <= 9) {
    if (p1Moves.length != 0) {
      p1Moves.forEach((p1Move) => {
        let p1MoveBox = document.getElementById(`${p1Move}`);

        p1MoveBox.innerText = `${foundObj.p1.p1Turn}`;
        p1MoveBox.setAttribute("disabled", true);

        //check at every step if somebody wins
        checkWin(p1Name, p2Name, p1Moves, p2Moves);
        if (p1Wins || p2Wins) {
          let restArr = arr_of_grid_boxes.filter((el) => el.id !== p1Move);
          restArr.forEach((el) => el.setAttribute("disabled", true));
        }
      });
    }
    if (p2Moves.length != 0) {
      p2Moves.forEach((p2Move) => {
        let p2MoveBox = document.getElementById(`${p2Move}`);

        p2MoveBox.innerText = `${foundObj.p2.p2Turn}`;
        p2MoveBox.setAttribute("disabled", true);

        //check at every step if somebody wins
        checkWin(p1Name, p2Name, p1Moves, p2Moves);
        if (p1Wins || p2Wins) {
          let restArr = arr_of_grid_boxes.filter((el) => el.id !== p2Move);
          restArr.forEach((el) => el.setAttribute("disabled", true));
        }
      });
    }
  }

  //WIN OR LOSE GAME
  checkWin(p1Name, p2Name, p1Moves, p2Moves);
});
