# 🧩 8 Puzzle Game using BFS

A simple and interactive **8 Puzzle Game** developed using **React.js** and the **Breadth-First Search (BFS) algorithm**.

The project allows users to manually solve the puzzle or use the BFS algorithm to automatically find and visualize the shortest solution.

📌 Project Description

The **8 Puzzle** is a classic Artificial Intelligence problem consisting of a 3 × 3 grid containing:

- 8 numbered tiles from 1 to 8
- 1 empty space

The goal is to arrange the tiles in the following order:

1 2 3
4 5 6
7 8 _

The user can move a tile into the empty space when the tile is directly adjacent to it.

This project uses **Breadth-First Search (BFS)** to automatically search through possible puzzle configurations and find the shortest sequence of moves leading to the goal state.

🎯 Aim

To develop an interactive **8 Puzzle Game using React.js** and implement the **Breadth-First Search (BFS) algorithm** to automatically find the shortest solution.

🎯 Objectives

1. To understand the working of the BFS algorithm.
2. To implement BFS for solving the 8 Puzzle problem.
3. To represent different puzzle configurations as states.
4. To generate valid neighboring states by moving the empty tile.
5. To maintain visited states to avoid repeated configurations.
6. To find the shortest solution path from the initial state to the goal state.
7. To create an interactive user interface using React.js.
8. To visualize the BFS solution step by step.

✨ Features

- 🎮 Interactive 8 Puzzle game
- 🖱️ Click-based tile movement
- 🔀 Random puzzle shuffling
- 🧠 Automatic solving using BFS
- 📊 Move counter
- ⏱️ Game timer
- 🎉 Puzzle completion message
- 🔄 Reset functionality
- 🤖 Step-by-step automatic solution animation
- 📱 Simple and responsive interface

🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| React.js | Frontend development |
| JavaScript | Game logic and BFS implementation |
| HTML | Application structure |
| CSS | User interface and styling |
| Vite | Development and build tool |
| BFS | Puzzle-solving algorithm |

🧠 Breadth-First Search (BFS)

**Breadth-First Search** is an uninformed search algorithm that explores nodes level by level.

In the 8 Puzzle, each puzzle configuration is treated as a **state**.

For example:

Initial State

1 2 3
4 0 6
7 5 8

Here, `0` represents the empty space.

The BFS algorithm generates all possible states by moving the empty space.

For example:

1 2 3
4 5 6
7 0 8

The algorithm continues exploring new states until it reaches:

1 2 3
4 5 6
7 8 0

⚙️ How BFS Works

The algorithm follows these steps:

1. Take the current puzzle configuration.
2. Convert the configuration into a searchable state.
3. Add the initial state to a queue.
4. Mark the initial state as visited.
5. Remove the first state from the queue.
6. Check whether it is the goal state.
7. Find the position of the empty space.
8. Generate all valid movements.
9. Create new puzzle states.
10. Ignore states that have already been visited.
11. Store the parent of each new state.
12. Add new states to the queue.
13. Continue until the goal state is found.
14. Trace the parent states backward to construct the solution path.
15. Reverse the path and display it step by step.

🔄 BFS Flow

             Initial State
                   |
                   v
             Add to Queue
                   |
                   v
             Remove State
                   |
                   v
          Is Goal Reached?
             /          \
           Yes           No
            |             |
            v             v
       Build Path    Generate Moves
                          |
                          v
                   Check Visited
                          |
                          v
                    Add to Queue
                          |
                          v
                     Repeat

📦 Data Structures Used

 1. Queue

BFS uses a **FIFO (First In, First Out)** queue.

Queue:
[State 1] → [State 2] → [State 3] → ...


The first inserted state is processed first.

 2. Visited Set

A `Set` is used to store states that have already been explored.

const visited = new Set();


This prevents the algorithm from exploring the same puzzle configuration repeatedly.


 3. Parent Map

A `Map` is used to remember how each state was reached.

const parent = new Map();

This allows the program to reconstruct the complete solution after reaching the goal state.


🧩 Puzzle Representation

The puzzle is represented as a JavaScript array.

Example:

[1, 2, 3, 4, 5, 6, 7, 8, 0]


The goal state is:

const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];


The value `0` represents the empty space.

---

📂 Project Structure


8-puzzle-bfs/
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── components/
│   │   └── PuzzleBoard.jsx
│   │
│   ├── utils/
│   │   └── bfsSolver.js
│   │
│   ├── App.css
│   ├── App.jsx
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js


> `node_modules` is intentionally not included in GitHub because it is generated automatically by `npm install`.



## 🎮 How to Play

### Step 1: Shuffle

Click the:

🔀 Shuffle

button to generate a new puzzle.

Step 2: Move Tiles

Click a tile that is next to the empty space.

Only valid moves are allowed.

Step 3: Solve Manually

Arrange the tiles into:

1 2 3
4 5 6
7 8 _


Step 4: Automatic BFS Solution

Click:

🧠 Solve with BFS


The BFS algorithm searches for the shortest solution and automatically animates the required moves.

### Step 5: Reset

Click:

🔄 Reset

to return the puzzle to its original state.

---

⏱️ Timer and Move Counter

The game maintains two important statistics:

### Moves

Counts the number of moves made by the player.

### Time

Measures how long the player takes to manually solve the puzzle.

The timer starts when the player makes the first move.

The timer stops when the puzzle is solved.

---

## 🤖 Automatic Solver

The automatic solver uses BFS to find the shortest path.

The process is:


Current Puzzle
      ↓
BFS Search
      ↓
Generate Possible States
      ↓
Check Goal State
      ↓
Find Shortest Path
      ↓
Animate Solution
      ↓
Puzzle Solved 🎉


## 📊 Complexity

For Breadth-First Search:

### Time Complexity


O(b^d)

### Space Complexity


O(b^d)


Where:

- `b` = branching factor
- `d` = depth of the solution

BFS can require significant memory because it stores many states while searching.

However, the 8 Puzzle has a relatively small state space, making BFS suitable for this educational project.


## 📚 Learning Outcomes

After completing this project, the following concepts are understood:

- Breadth-First Search
- State-space representation
- Queue data structure
- Visited state management
- Parent-state tracking
- Path reconstruction
- React components
- React state management
- Event handling
- JavaScript array manipulation
- Connecting an AI algorithm with a web interface

---

## 🚀 Installation and Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

You can check Node.js and npm using:

node --version
npm --version


### 1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/8-puzzle-bfs.git

### 2. Navigate to the Project
cd 8-puzzle-bfs

### 3. Install Dependencies
npm install


 4. Start the Development Server

npm run dev

5. Open in Browser

Vite will display a local address similar to:

http://localhost:5173/

Open this address in your browser.


🏗️ Build for Production

To create a production build:

npm run build

To preview the production build:

npm run preview

🔮 Future Improvements

Some possible improvements include:

- Implement A* Search Algorithm.
- Add Manhattan Distance visualization.
- Add difficulty levels.
- Add BFS vs A* comparison.
- Display number of states explored.
- Display algorithm execution time.
- Add pause/resume functionality.
- Add better tile animations.
- Add sound effects.
- Add leaderboard functionality.
- Add dark/light mode.
- Deploy the game online.


🎓 Academic Application

This project demonstrates the practical implementation of an **Artificial Intelligence uninformed search algorithm**.

It can be used for:

- AI laboratory experiments
- Data Structures and Algorithms projects
- Artificial Intelligence projects
- React.js learning
- Algorithm visualization


👨‍💻 Author

**Sandesh Shrimant Sawant**

B.Tech Computer Science and Engineering

📄 License

This project is created for educational and academic purposes.
