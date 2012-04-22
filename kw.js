// the main namespace
var A = {};

A.canvas = document.getElementById('canvas');
A.context = A.canvas.getContext('2d');
A.context.fillRect(0, 0, A.canvas.width, A.canvas.height);

// Disable document scrolling
document.onkeydown=function(){return event.keyCode!=38 && event.keyCode!=40 && event.keyCode!=32};

// A.cleanCoords
//
// Helper for stupid mouse coords
A.cleanCoords = function (e) {
    return {
        x: e.x - A.canvas.offsetLeft,
        y: e.y - A.canvas.offsetTop
    };
};

// - some listeners 
//
A.inputs = {};

addEventListener("keydown", function (e) {
    var k = 'k' + String(e.keyCode);
    A.inputs[k] = true;
}, false);

addEventListener("keyup", function (e) {
    var k = 'k' + String(e.keyCode);
    A.inputs[k] = false;
}, false);

addEventListener("click", function(e) {
    var goode = A.cleanCoords(e);
    if (goode.x < A.canvas.width && goode.y < A.canvas.height) {
        if (A.wallsAvailable === 0) {
            alert("Sorry, you don't have any walls available. Sell 1 soldier to buy 5 walls.");
            return null;
        }
        var gridcoords = {
            i: Math.floor(goode.y / GRID),
            j: Math.floor(goode.x / GRID)
        };
        if (A.world[gridcoords.i][gridcoords.j] === NULL) {
            A.world[gridcoords.i][gridcoords.j] = WALL;
            A.wallCount += 1;
        } else {
            alert("You must click on a green (blank) spot to place a wall there.");
        }
        A.wallsAvailable -= 1;
        A.world.draw();
    }
}, false);

// - For browser compatability... 
//
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
})();

var GRID = 8;

var NULL = "#333333";
var SOLDIER1 = "#CC0000";
var SOLDIER2 = "#0000CC";
var FOOD = "#00FF88";
var WALL = "#000000";
var WALLSPERSOLDIER = 5;

A.wallsAvailable = 0;

A.nullCount = 0;
A.soldier1Count = 0;
A.soldier2Count = 0;
A.foodCount = 0;
A.wallCount = 0;

A.colorToLabel = {
    "#333333": "NULL",
    "#CC0000": "SOLDIER1",
    "#0000CC": "SOLDIER2",
    "#00FF88": "FOOD",
    "#000000": "WALL"
}

A.colors = {
    0: NULL,
    1: SOLDIER1,
    2: SOLDIER2,
    3: FOOD,
    4: WALL
}

A.ROWS = A.canvas.height / GRID;
A.COLS = A.canvas.width / GRID;
A.world = {};

function handleSell() {
    var sellList = new Array();
    for (var i = 0; i < A.ROWS; i++) {
        for (var j = 0; j < A.COLS; j++) {
            if (A.world[i][j] === SOLDIER1) {
                sellList.push({"i": i, "j": j});
            }
        }
    }
    var rand = Math.floor(Math.random() * sellList.length);
    var coords = sellList[rand];

    // remove that random soldier from the field
    A.world[coords.i][coords.j] = NULL;
    // yay, give the player a wall to use
    A.wallsAvailable += WALLSPERSOLDIER;
    A.soldier1Count -= 1;
    alert("The life of your soldier has bought you " + WALLSPERSOLDIER + " walls. \nClick on the grid to place it at any time.");
    A.world.draw();
};

function createWorld() {
    for (var i = 0; i < A.ROWS; i++) {
        A.world[i] = new Array();
        for (var j = 0; j < A.COLS; j++) {
            var rand = Math.random();
            if (rand < 0.1) {
                A.world[i].push(FOOD);
                A.foodCount += 1;
            } else if (rand < 0.3) {
                A.world[i].push(WALL);
                A.wallCount += 1;
            } else if (rand < 0.325) {
                A.world[i].push(SOLDIER1);
                A.soldier1Count += 1;
            } else if (rand < 0.35) {
                A.world[i].push(SOLDIER2);
                A.soldier2Count += 1;
            } else {
                A.world[i].push(NULL);
                A.nullCount += 1;
            }
        }
    }
    A.world.draw = function() {
        for (var i = 0; i < A.ROWS; i++) {
            for (var j = 0; j < A.COLS; j++) {
                A.context.fillStyle = A.world[i][j];
                A.context.fillRect(j * GRID, i * GRID, GRID, GRID);
                A.context.fillStyle = "#000000";
                A.context.strokeRect(j * GRID, i * GRID, GRID, GRID);
            }
        }
        document.getElementById("nullCount").innerHTML = A.nullCount;
        document.getElementById("soldier1Count").innerHTML = A.soldier1Count;
        document.getElementById("soldier2Count").innerHTML = A.soldier2Count;
        document.getElementById("foodCount").innerHTML = A.foodCount;
        document.getElementById("wallCount").innerHTML = A.wallCount;
        document.getElementById("wallsAvailable").innerHTML = A.wallsAvailable;
    }
}

function findNeighboring (thing, i , j) {
    var coords = {};

    if (A.world[i-1]) {
        // the row above
        if (A.world[i-1][j-1] && A.world[i-1][j-1] === thing) { coords.row = i - 1; coords.col = j - 1; };
        if (A.world[i-1][j] === thing) { coords.row = i - 1; coords.col = j; };
        if (A.world[i-1][j+1] && A.world[i-1][j+1] === thing) { coords.row = i - 1; coords.col = j + 1; };
    }
    if (A.world[i][j-1] && A.world[i][j-1] === thing) { coords.row = i; coords.col = j - 1; }; // the 'current' row
    if (A.world[i][j+1] && A.world[i][j+1] === thing) { coords.row = i; coords.col = j + 1; };
    if (A.world[i+1]) {
        // the row below
        if (A.world[i+1][j-1] && A.world[i+1][j-1] === thing) { coords.row = i + 1; coords.col = j - 1; };
        if (A.world[i+1][j] === thing) { coords.row = i + 1; coords.col = j; };
        if (A.world[i+1][j+1] && A.world[i+1][j+1] === thing) { coords.row = i + 1; coords.col = j + 1; };
    }
    return coords;
}

function countNeighboring (thing, i, j) {
    var cnt = 0;
    // count adjacent "thing"
    if (A.world[i-1]) {
        // the row above
        if (A.world[i-1][j-1] && A.world[i-1][j-1] === thing) { cnt += 1 };
        if (A.world[i-1][j] === thing) { cnt += 1 };
        if (A.world[i-1][j+1] && A.world[i-1][j+1] === thing) { cnt += 1 };
    }
    if (A.world[i][j-1] && A.world[i][j-1] === thing) { cnt += 1 }; // the 'current' row
    if (A.world[i][j+1] && A.world[i][j+1] === thing) { cnt += 1 };
    if (A.world[i+1]) {
        // the row below
        if (A.world[i+1][j-1] && A.world[i+1][j-1] === thing) { cnt += 1 };
        if (A.world[i+1][j] === thing) { cnt += 1 };
        if (A.world[i+1][j+1] && A.world[i+1][j+1] === thing) { cnt += 1 };
    }
    return cnt;
}

function soldierRules(soldier, other, i, j) {
    // if surrounded by others... kill the 'current' soldier... turn him into food
    if (countNeighboring(other, i, j) > 2) {
        A.world[i][j] = FOOD;
        if (soldier === SOLDIER1) {
            A.soldier1Count -= 1;
        } else {
            A.soldier2Count -= 1;
        }
        A.foodCount += 1;
    } else if (countNeighboring(FOOD, i, j) > 0) {
        var coords = findNeighboring(FOOD, i, j);
        // find the first clockwise food and replace it with the soldier
        A.world[coords.row][coords.col] = soldier;
        A.foodCount -= 1;
        // replace soldier with nothing
        A.world[i][j] = NULL;
    } else { // nothing around! what the...
        var rand = Math.round(Math.random() * 2 - 1);
        var rand2 = Math.round(Math.random() * 2 - 1);
        if (A.world[i + rand] && A.world[i + rand][j + rand2]) {
            if (rand !== 0 && rand2 !== 0) {
                if (soldier === SOLDIER1) {
                    A.world[i + rand][j + rand2] = SOLDIER1;
                } else {
                    A.world[i + rand][j + rand2] = SOLDIER2;
                }
                A.world[i][j] = NULL;
            }
        }
    }
}

function applyRules() {
    for (var i = 0; i < A.ROWS; i++) {
        for (var j = 0; j < A.COLS; j++) {
            if (A.world[i][j] === SOLDIER1) { // if soldier1....
                soldierRules(SOLDIER1, SOLDIER2, i, j);
            }
            if (A.world[i][j] === SOLDIER2) { // if soldier2....
                soldierRules(SOLDIER2, SOLDIER1, i, j);
            }
            if (A.world[i][j] === FOOD) { // if food....
                // if surrounded by foods... randomly spawn either a soldier1 or soldier2
                if (countNeighboring(FOOD, i, j) > 3) {
                    var rand = Math.random();
                    if (rand < 0.1) {
                        A.world[i][j] = SOLDIER1;
                        A.soldier1Count += 1;
                        A.foodCount -= 1;
                    } else if (rand < 0.2) {
                        A.world[i][j] = SOLDIER2;
                        A.soldier2Count += 1;
                        A.foodCount -= 1;
                    }
                };
            }
            if (A.world[i][j] === 9) { // if nothing...
                var rand = function(){Math.random()};
                if (rand <= 0.1) {
                    A.world[i][j] = SOLDIER1;
                    A.soldier1Count += 1;
                } else if (rand <= 0.2) {
                    A.world[i][j] = SOLDIER2;
                    A.soldier2Count += 1;
                } else if (Math.random() <= 0.3) {
                    A.world[i][j] = FOOD; // spawn some food maybe
                    A.foodCount += 1;
                }
            }
        }
    }
}

function mainLoop() {
    if (A.inputs.k39) {
        var start = new Date();
        applyRules(A.world);
        A.world.draw(); // to optimize, just draw AS the rules are happening... we don't need to redraw
        console.log('time delta', new Date().getTime() - start.getTime());
    };
}

// create it
createWorld();
// draw it
A.world.draw();

setInterval(mainLoop, 50);