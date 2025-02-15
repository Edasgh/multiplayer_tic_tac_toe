# MultiPlayer Tic-tac-toe game:

This program is a multiplayer Tic-Tac-Toe game using HTML, CSS, JavaScript, and Node.js with Socket.io for real-time communication between players. Here’s a brief explanation of how each part of the program works:

## Live Link :
https://multiplayer-tic-tac-toe-6nt4.onrender.com

### `index.html`

This file sets up the structure of the web page:

- Loads necessary scripts and stylesheets.
- Defines a form for users to enter their name and join the game.
- Displays elements for game info (user names, turn info) and the Tic-Tac-Toe grid.
- Includes the necessary scripts to handle the game logic.

### `style.css`

This file styles the HTML elements:

- Sets up basic styles for the body, headings, and buttons.
- Styles the game grid and its elements.
- Includes animations and transitions for better UX.
- Uses custom fonts from Google Fonts.

### `fonts.css`

This file defines font styles:

- Specifies different font weights and styles for the "Poppins" font.
- Provides classes for easy use of these font styles in the HTML.

### `index.js`

This file sets up the server using Node.js and Socket.io:

- Creates an HTTP server and sets up Socket.io for real-time communication.
- Serves the static files (HTML, CSS, JS) from the root directory.
- Manages game logic on the server-side, including player connections, game state, and turn handling.

#### Key functions and logic:

- **Connection Handling**: Listens for players connecting and disconnecting, and manages player matchmaking.[socket.on [socket.on(eventName,event)] is used to get the data sent via socket.emit[socket.emit(eventName,data)] function and similarly socket.emit is used to send data to the server (The eventName of socket.on event and socket.emit should be same to get data in the server)]
- **Game State Management**: Keeps track of game states (e.g., player turns, moves, game over conditions) and updates clients accordingly.
- **Real-time Updates**: Uses Socket.io to emit events to clients, keeping them in sync with the current game state.

### `scripts.js`

This file handles the client-side logic and interaction:

- Connects to the server via Socket.io.
- Manages user interactions, such as joining a game and making moves.
- Updates the UI based on the current game state received from the server.

#### Key functions and logic:

- **Event Listeners**: Sets up event listeners for form submission and grid button clicks.
- **Socket Events**: Listens for events from the server (`find`, `playing`, `gameOver`) and updates the UI accordingly.
- **Game Logic**: Implements the game logic, including checking for wins, handling turns, and updating the game state.

### Brief Flow of the Program

1. **User Joins the Game**:

   - User enters their name and submits the form.
   - Client emits a `find` event with the user's name.
   - Server adds the user to the waiting list and matches them with another player if available.

2. **Game Starts**:

   - When two players are matched, the server emits a `find` event with game info (players, turns, etc.) to both clients.
   - Clients update their UI to show the game board and player info.

3. **Playing the Game**:

   - Players take turns clicking on grid boxes.
   - Each move emits a `playing` event with the move info to the server.
   - Server updates the game state and checks for win conditions or a draw.
   - Server emits updated game state to both clients, who update their UI accordingly.

4. **Game Over**:
   - If a win or draw condition is met, the server emits a `gameOver` event.
   - Clients display the game result and reset the game after a short delay.

### To run the program in the browser simply start the server using `npm run start` command and open two windows for two different players