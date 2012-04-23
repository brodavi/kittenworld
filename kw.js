// array of buttons
A.buttons = new Array();

// the state of your kittens
A.kitten1 = {
    food: 0 // current food status is none
};

// handle mouseclicks
A.handleClick = function(e) {
    var goode = A.cleanCoords(e);
    // if player clicked on the grid
    if (goode.x < A.canvas.width && goode.y < A.canvas.height) {
        if (A.canDestroyWalls === 0) {
            alert("Sorry, you can't destroy any walls. Sell 1 kitten to destroy 1 wall.");
            return null;
        }
        var gridcoords = {
            i: Math.floor(goode.y / CELLSIZE),
            j: Math.floor(goode.x / CELLSIZE)
        };
        if (A.world[gridcoords.i][gridcoords.j] === WALL) {
            A.world[gridcoords.i][gridcoords.j] = NULL;
            A.wallCount -= 1;
        } else {
            alert("You must click on a wall (black cell) to destroy it.");
        }
        A.canDestroyWalls -= 1;
        A.world.draw();
        // if canvas2 clicked................
    } else if (goode.x < A.canvas.width + 8 + A.canvas2.width && goode.y < A.canvas2.height) {
        var canvas2Coords = {
            x: goode.x - (A.canvas.width + 8), // adjust for canvas2 position
            y: goode.y
        };

        // and handle buttons
        for (var i = 0; i < A.buttons.length; i++){
            if (canvas2Coords.x > A.buttons[i].x &&
                canvas2Coords.x < A.buttons[i].x + A.buttons[i].w &&
                canvas2Coords.y > A.buttons[i].y &&
                canvas2Coords.y < A.buttons[i].y + A.buttons[i].h &&
                A.buttons[i].show === true) {
                A.buttons[i].onClick();
                A.world.draw(); // update the change of buttons
                break;
            }
        }
    }
}

// cell size (in pixels)
var CELLSIZE = 8;

// how many walls can the player destroy?
A.canDestroyWalls = 0;

// counts of things
A.army1Count = 0;
A.army2Count = 0;
A.foodCount = 0;
A.wallCount = 0;

// the units and their corresponding int assignments
var NULL = 0;
var ARMY1 = 1;
var KING1 = 2;
var ARMY2 = 3;
var KING2 = 4;
var FOOD = 5;
var WALL = 6;
var PHEROMONE1 = 7;
var PHEROMONE2 = 8;

// a dictionary from number to color
A.numberToColor = {
    0: "#333333",
    1: "#550000",
    2: "#FF0000",
    3: "#000055",
    4: "#0000FF",
    5: "#00FF88",
    6: "#000000",
    7: "#333333",
    8: "#000022"
}

// a dictionary from number to url
A.numberToIMG = {
    0: "#333333",
    1: army1img,
    2: king1img,
    3: army2img,
    4: king2img,
    5: foodimg,
    6: wallimg,
    7: "#333333",
    8: "#000022"
}

// how many rows/cols
A.ROWS = A.canvas.height / CELLSIZE;
A.COLS = A.canvas.width / CELLSIZE;

// holds world 'matrix'
A.world = {};

// make some buttons
A.sellButton = A.makeButton("sell", 10, 0, 50, 30, handleSell);
A.holdButton = A.makeButton("hold", 10, 30, 50, 30, function() {A.kitten1.state = "hold"});
A.gatherButton = A.makeButton("gather", 10, 60, 50, 30, function() {A.kitten1.state = "gather"});
A.destroyButton = A.makeButton("destroy", 10, 90, 50, 30, function() {A.kitten1.state = "destroy"});
A.stepButton = A.makeButton("step", 10, 120, 50, 30, function() {A.game.step = true;
                                                                 A.game.state = "pause";
                                                                 A.pauseButton.show = false;
                                                                 A.playButton.show = true;});
A.playButton = A.makeButton("play", 10, 180, 50, 30, function() {A.game.state = "play";
                                                                 A.playButton.show = false;
                                                                 A.pauseButton.show = true;});
A.pauseButton = A.makeButton("pause", 10, 180, 50, 30, function() {A.game.state = "pause";
                                                                   A.pauseButton.show = false;
                                                                   A.playButton.show = true;});

// hide the pause button for now
A.pauseButton.show = false;

// push them into the array
A.buttons.push(A.sellButton);
A.buttons.push(A.holdButton);
A.buttons.push(A.gatherButton);
A.buttons.push(A.destroyButton);
A.buttons.push(A.stepButton);
A.buttons.push(A.playButton);
A.buttons.push(A.pauseButton);

// handles the selling of armies
function handleSell() {
    var sellList = new Array();
    for (var i = 0; i < A.ROWS; i++) {
        for (var j = 0; j < A.COLS; j++) {
            if (A.world2[i][j] === ARMY1) {
                sellList.push({"i": i, "j": j});
            }
        }
    }

    // randomly pick someone you just sold
    var rand = Math.floor(Math.random() * sellList.length);
    var coords = sellList[rand];

    // remove that random soldier from the field
    A.world2[coords.i][coords.j] = NULL;

    // yay, player can destroy walls
    A.canDestroyWalls += 1;
    A.army1Count -= 1;
    alert("The life of your kitten has bought you\nThe ability to destroy any wall.\nClick on a wall to destroy it at any time.");
    A.game.state = "pause";
    A.pauseButton.show = false;
    A.playButton.show = true;
    A.world2.draw();
};

// add a kitten somewhere on the board
function addKitten() {
    while(1) {
        var randi = Math.round(Math.random() * (A.ROWS - 1));
        var randj = Math.round(Math.random() * (A.COLS - 1));
        if (randj < (A.COLS / 2) && A.world[randi][randj] === NULL) {
            A.world2[randi][randj] = ARMY1;
            return;
        }
    }
}

A.kittenFood = 0; // the var counting kitten food
A.kitten1.state = "gather"; // initialize to gather

function kittenMaybeMove(i, j, i2, j2) {
    if (A.world[i2] !== undefined &&
        A.world[i2][j2] !== undefined &&
        A.world[i2][j2] !== WALL &&
        A.world[i2][j2] !== ARMY1 &&
        A.world[i2][j2] !== ARMY2 &&
        A.world[i2][j2] !== PHEROMONE1) {
        if (!(i === i2 && j === j2)) {
            A.world2[i2][j2] = ARMY1; // move there
            A.world2[i][j] = PHEROMONE1; // leave pheromone
        }
    }
}

// just rules for the kittens
function kittenRules(i, j) {
    if (countNeighboring(ARMY2, i, j) > 0) { // if there is a zombie adjacent,
        A.world2[i][j] = NULL; // this kitten dies
        A.army1Count -= 1;
    } else if (countNeighboring(KING2, i, j) > 0) {
        // if there is a king nearby, stay still so you can gather forces
    } else if (A.kitten1.state === "gather" && countNeighboring(FOOD, i, j) > 0) { // if there is food, grab it
        var coords = findNeighboring(FOOD, i, j);
        // find the first food found by scanline order and replace it with the army
        A.world2[coords.row][coords.col] = ARMY1;
        A.foodCount -= 1;
        // replace army with nothing
        A.world[i][j] = NULL;

        A.kittenFood += 1; // add to the kitten army stores
        if (A.kittenFood === 5) { // if 5 foods gathered,
            addKitten(); // add a kitten somewhere
            A.army1Count += 1; // add kitten count
            A.kittenFood = 0; // reset kitten stores
        }
    } else if (A.kitten1.state === "gather") { // no food around! move somewhere
        var rand = Math.round(Math.random() * 2 - 1);
        var rand2 = Math.round(Math.random() * 2 - 1);
        kittenMaybeMove(i, j, i + rand, j + rand2);
    } else if (A.kitten1.state === "destroy") { // go to enemy base! destroy king!
        var randdir = Math.random();
        if (randdir < 0.3) { // random walking around (stochastically avoid obstacles)
            var rand = Math.round(Math.random() * 2 - 1);
            var rand2 = Math.round(Math.random() * 2 - 1);
            kittenMaybeMove(i, j, i + rand, j + rand2);
        } else if (randdir < 0.8) { // generally move to the right
            var randright = Math.round(Math.random() * 2 - 1); // either -1, 0, or 1
            if (randright === -1) {
                kittenMaybeMove(i, j, i - 1, j + 1); // try to move to upper right
            } else if (randright === 0) {
                kittenMaybeMove(i, j, i, j + 1); // try to move to right
            } else if (randright === 1) {
                kittenMaybeMove(i, j, i + 1, j + 1); // try to move to lower right
            }
        }
    }
}

function zombieMaybeMove(i, j, i2, j2) {
    if (A.world[i2] !== undefined &&
        A.world[i2][j2] !== undefined &&
        A.world[i2][j2] !== WALL &&
        A.world[i2][j2] !== ARMY1 &&
        A.world[i2][j2] !== ARMY2 &&
        A.world[i2][j2] !== KING2 &&
        A.world[i2][j2] !== PHEROMONE1) {
        if (!(i === i2 && j === j2)) {
            if (A.world[i][j] === FOOD) {
                A.foodCount -= 1;
            }
            A.world2[i2][j2] = ARMY2; // move there
            A.world2[i][j] = NULL;
        }
    }
}

// just rules for the zombie kittens
function zombieRules(i, j) {
    // if 2 or more kittens are adjacent... kill the 'current' zombie kitten...
    if (countNeighboring(ARMY1, i, j) > 1) {
        A.world2[i][j] = NULL;
        A.army2Count -= 1;
    } else if (countNeighboring(KING1, i, j) > 0) {
        // just stay still... wait for other zombies to approach so you can take the king
    } else { // just wander aimlessly

        var rand = Math.random();
        // a 0.2 probability of moving
        if (rand < 0.2) {
            var randi = Math.round(Math.random() * 2 - 1); // either -1, 0, or 1
            var randj = Math.round(Math.random() * 2 - 1);
            zombieMaybeMove(i, j, i + randi, j + randj);
        } else if (rand < 0.25) { // a 0.05 percent chance on top of moving probability
            // generally move to the left
            var randleft = Math.round(Math.random() * 2 - 1); // either -1, 0, or 1
            if (randleft === -1) {
                zombieMaybeMove(i, j, i - 1, j - 1); // try to move to upper left
            } else if (randleft === 0) {
                zombieMaybeMove(i, j, i, j - 1); // try to move to left
            } else if (randleft === 1) {
                zombieMaybeMove(i, j, i + 1, j - 1); // try to move to lower left
            }
        }
    }
}

// apply some rules to the game board
function applyRules() {
    for (var i = 0; i < A.ROWS; i++) {
        for (var j = 0; j < A.COLS; j++) {
            var cell = A.world[i][j];
            if (cell === ARMY1) { // if army1....
                kittenRules(i, j);
            } else if (cell === ARMY2) { // if army2....
                zombieRules(i, j);
            } else if (cell === KING1) { // if kitten king...
                if (countNeighboring(ARMY2, i, j) > 2) { // if surrounded by zombies
                    if (A.game.state !== "lost") {
                        alert ("Game over! Your kitten king has been surrounded by zombies!");
//                        A.resetGame();
                        A.game.state = "lost";
                    }
                }
            } else if (cell === KING2) { // if zombie king...
                if (countNeighboring(ARMY1, i, j) > 2) { // if surrounded by kittens
                    if (A.game.state !== "won") {
                        alert ("You won! Your kittens took out the zombie king!");
//                        A.resetGame();
                        A.game.state = "won";
                    }
                }
            } else if (cell === PHEROMONE1) { // if pheromone1...
                A.world2[i][j] = NULL;
            } else if (cell === PHEROMONE2) { // if pheromone2...
                A.world2[i][j] = NULL;
            } else if (cell === NULL) { // if null....
                // maybe randomly spawn food?
                var rand = Math.random();
                if (rand < 0.005) {
                    A.world2[i][j] = FOOD;
                    A.foodCount += 1;
                };
            }
        }
    }
}

A.game.step = false;
// the main name of the game
function mainLoop() {

    if (A.game.step || A.game.state === "play") { // if not paused, or if stepping...
        var start = new Date();
        applyRules(A.world);

        // apply all world2 changes to world
        A.world = A.world2;
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11111
        //
        // OOOOOOOOOHHHHHHHHMMMMMMMYYYYYYYYYYGGGGGGGGGOOOOOOOOOODDDDDDDDDDDDDDD!!!!!!!!!!!!!
        // to optimize, just draw AS the rules are happening... we don't need to redraw
        A.world.draw();
//        console.log('time delta', new Date().getTime() - start.getTime());
        if (A.game.step) {
            A.game.step = false;
        }
    };
}

// When everything is loaded, do this
window.addEventListener('load', function() {

    // create it
    createWorld();

    // draw it
    A.world.draw();

    // loop it
    setInterval(mainLoop, 50);

}, false);