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
        if (A.wallsAvailable === 0) {
            alert("Sorry, you don't have any walls available.\nSell 1 soldier to buy 5 walls.");
            return null;
        }
        var gridcoords = {
            i: Math.floor(goode.y / CELLSIZE),
            j: Math.floor(goode.x / CELLSIZE)
        };
        if (A.world[gridcoords.i][gridcoords.j] === NULL ||
            A.world[gridcoords.i][gridcoords.j] === FOOD ) {
            A.world[gridcoords.i][gridcoords.j] = WALL;
            A.wallCount += 1;
        } else {
            alert("You must click on a grey (blank)\nspot to place a wall there.");
        }
        A.wallsAvailable -= 1;
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

// how many walls can the player put up?
A.wallsAvailable = 0;

// counts of things
A.army1Count = 0;
A.army2Count = 0;
A.foodCount = 0;
A.wallCount = 0;

// how many walls does the player get by selling 1 army?
var WALLSPERARMY = 5;

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
    7: "#220000",
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
A.stepButton = A.makeButton("step", 10, 120, 50, 30, function() {A.game.step = true});
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
            if (A.world[i][j] === ARMY1) {
                sellList.push({"i": i, "j": j});
            }
        }
    }

    // randomly pick someone you just sold
    var rand = Math.floor(Math.random() * sellList.length);
    var coords = sellList[rand];

    // remove that random soldier from the field
    A.world[coords.i][coords.j] = NULL;

    // yay, give the player some walls to use
    A.wallsAvailable += WALLSPERARMY;
    A.army1Count -= 1;
    alert("The life of your soldier has bought you " +
          WALLSPERARMY +
          " walls. \nClick on the grid to place it at any time.");
    A.game.state = "pause";
    A.pauseButton.show = false;
    A.playButton.show = true;
    A.world.draw();
};

// just rules for the kittens
function kittenRules(i, j) {
    if (countNeighboring(ARMY2, i, j) > 0) { // if there is a zombie adjacent,
        A.world[i][j] = NULL; // this kitten dies
        A.army1Count -= 1;
    } else if (A.kitten1.state === "gather" && countNeighboring(FOOD, i, j) > 0) { // if there is food, grab it
        var coords = findNeighboring(FOOD, i, j);
        // find the first food found by scanline order and replace it with the army
        A.world[coords.row][coords.col] = ARMY1;
        A.foodCount -= 1;
        // replace army with nothing
        A.world[i][j] = NULL;
    } else if (A.kitten1.state === "gather") { // no food around! move somewhere
        var rand = Math.round(Math.random() * 2 - 1);
        var rand2 = Math.round(Math.random() * 2 - 1);
        if (A.world[i + rand] !== undefined &&
            A.world[i + rand][j + rand2] !== undefined &&
            A.world[i + rand][j + rand2] !== WALL &&
            A.world[i + rand][j + rand2] !== ARMY1 &&
            A.world[i + rand][j + rand2] !== ARMY2 &&
            A.world[i + rand][j + rand2] !== PHEROMONE1) {
            if (!(rand === 0 && rand2 === 0)) {
                A.world[i + rand][j + rand2] = ARMY1; // move there
                A.world[i][j] = PHEROMONE1; // leave pheromone
            }
        }
    }
}

// just rules for the zombie kittens
function zombieRules(i, j) {
    // if 2 or more kittens are adjacent... kill the 'current' zombie kitten...
    if (countNeighboring(ARMY1, i, j) > 2) {
        A.world[i][j] = NULL;
        A.army2Count -= 1;
    } else { // just wander aimlessly

        var rand = Math.random();
        // a 0.2 probability of moving
        if (rand < 0.2) {
            var randi = Math.round(Math.random() * 2 - 1);
            var randj = Math.round(Math.random() * 2 - 1);
            if (A.world[i + randi] !== undefined &&
                A.world[i + randi][j + randj] !== undefined &&
                A.world[i + randi][j + randj] !== WALL &&
                A.world[i + randi][j + randj] !== ARMY1 &&
                A.world[i + randi][j + randj] !== ARMY2 &&
                A.world[i + randi][j + randj] !== PHEROMONE1) {
                if (!(rand === 0 && randj === 0)) {
                    A.world[i + randi][j + randj] = ARMY2; // move there
                    A.world[i][j] = NULL;
                }
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
            } else if (cell === PHEROMONE1) { // if pheromone1...
                A.world[i][j] = NULL;
            } else if (cell === PHEROMONE2) { // if pheromone2...
                A.world[i][j] = NULL;
            } else if (cell === NULL) { // if null....
                // maybe randomly spawn food?
                var rand = Math.random();
                if (rand < 0.005) {
                    A.world[i][j] = FOOD;
                    A.foodCount += 1;
                };
            }
        }
    }
}

// the main name of the game
function mainLoop() {

    if (A.game.step || A.game.state === "play") { // if not paused, or if stepping...
        var start = new Date();
        applyRules(A.world);
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