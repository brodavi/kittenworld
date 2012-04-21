// the main namespace
var A = {};

A.canvas = document.getElementById('canvas');
A.context = A.canvas.getContext('2d');
A.context.fillRect(0, 0, A.canvas.width, A.canvas.height);

//prevent doubleclicking on canvas from selecting text on the page
A.canvas.onselectstart=function(){return false;};

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
//prevent right-click from getting a menu
//addEventListener('contextmenu', function(evt){evt.preventDefault();}, false);

// Disable document scrolling
document.onkeydown=function(){return event.keyCode!=38 && event.keyCode!=40 && event.keyCode!=32};

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

addEventListener("mousedown", function(e) {
    A.inputs.mousedown = true;
    A.inputs.mouseup = false;
}, false);

addEventListener("mouseup", function(e) {
    A.inputs.mouseup = true;
    A.inputs.mousedown = false;
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

// old vars
var THE_BLACK = 0;
var THE_WHITE = 0xFF;

// new vars
var GRID = 8;

var NULL = "#333333";
var SOLDIER1 = "#CC0000";
var SOLDIER2 = "#0000CC";
var FOOD = "#00FF88";
var WALL = "#000000";

A.nullCount = 0;
A.soldier1Count = 0;
A.soldier2Count = 0;
A.foodCount = 0;
A.wallCount = 0;

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
            }
        }
        document.getElementById("nullCount").innerHTML = A.nullCount;
        document.getElementById("soldier1Count").innerHTML = A.soldier1Count;
        document.getElementById("soldier2Count").innerHTML = A.soldier2Count;
        document.getElementById("foodCount").innerHTML = A.foodCount;
        document.getElementById("wallCount").innerHTML = A.wallCount;
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

function applyRules(world) {
    for (var i = 0; i < A.ROWS; i++) {
        for (var j = 0; j < A.COLS; j++) {
            if (world[i][j] === SOLDIER1) { // if soldier1....
                // if surrounded by soldier2s... kill the 'current' soldier1... turn him into food
                if (countNeighboring(SOLDIER2, i, j) > 2) {
                    world[i][j] = FOOD;
                    A.soldier1Count -= 1;
                    A.foodCount += 1;
                } else if (countNeighboring(FOOD, i, j) > 0) {
                    var coords = findNeighboring(FOOD, i, j);
                    // find the first clockwise food and replace it with soldier
                    world[coords.row][coords.col] = SOLDIER1;
                    A.foodCount -= 1;
                    // replace soldier with nothing
                    world[i][j] = NULL;
                } else { // nothing around! what the...
                    var rand = Math.round(Math.random() * 2 - 1);
                    var rand2 = Math.round(Math.random() * 2 - 1);
                    if (world[i + rand] && world[i + rand][j + rand2]) {
                        if (rand !== 0 && rand2 !== 0) {
                            world[i + rand][j + rand2] = SOLDIER1;
                            world[i][j] = NULL;
                        }
                    }
                }
            }
            if (world[i][j] === SOLDIER2) { // if soldier2....
                // if surrounded by soldier1s... kill the 'current' soldier1... turn him into food
                if (countNeighboring(SOLDIER1, i, j) > 2) {
                    world[i][j] = FOOD;
                    A.soldier2Count -= 1;
                    A.foodCount += 1;
                } else if (countNeighboring(FOOD, i, j) > 0) {
                    var coords = findNeighboring(FOOD, i, j);
                    // find the first clockwise food and replace it with soldier
                    world[coords.row][coords.col] = SOLDIER2;
                    // replace soldier with nothing
                    world[i][j] = NULL;
                    A.foodCount -= 1;
                } else { // nothing all over the place! what the...
                    var rand = Math.round(Math.random() * 2 - 1);
                    var rand2 = Math.round(Math.random() * 2 - 1);
                    if (world[i + rand] && world[i + rand][j + rand2]) {
                        if (rand !== 0 && rand2 !== 0) {
                            world[i + rand][j + rand2] = SOLDIER2;
                            world[i][j] = NULL;
                        }
                    }
                }
            }
            if (world[i][j] === FOOD) { // if food....
                // if surrounded by foods... randomly spawn either a soldier1 or soldier2
                if (countNeighboring(FOOD, i, j) > 3) {
                    var rand = Math.random();
                    if (rand < 0.1) {
                        world[i][j] = SOLDIER1;
                        A.soldier1Count += 1;
                    } else if (rand < 0.2) {
                        world[i][j] = SOLDIER2;
                        A.soldier2Count += 1;
                    }
                };
            }
            if (world[i][j] === 9) { // if nothing...
                var rand = function(){Math.random()};
                if (rand <= 0.1) {
                    world[i][j] = SOLDIER1;
                    A.soldier1Count += 1;
                } else if (rand <= 0.2) {
                    world[i][j] = SOLDIER2;
                    A.soldier2Count += 1;
                } else if (Math.random() <= 0.3) {
                    world[i][j] = FOOD; // spawn some food maybe
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