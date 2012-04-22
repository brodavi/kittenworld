// the main namespace
var A = {};

A.game = {};

A.canvas = document.getElementById('canvas');
A.canvas2 = document.getElementById('canvas2');
A.context = A.canvas.getContext('2d');
A.context2 = A.canvas2.getContext('2d');
A.context.fillRect(0, 0, A.canvas.width, A.canvas.height);
A.context2.fillRect(0, 0, A.canvas2.width, A.canvas2.height);

// Disable document scrolling
document.onkeydown=function(){return event.keyCode!=38 && event.keyCode!=40 && event.keyCode!=32};

//prevent doubleclicking on canvas from selecting text on the page
A.canvas.onselectstart=function(){return false;};
A.canvas2.onselectstart=function(){return false;};

A.buttons = new Array();

A.kitten1 = {};

var sellButtonImg = new Image();
sellButtonImg.src = "sellButton.png";
sellButtonImg.onload = function() {
    sellButton.ready = true;
};

sellButton = {
    img: sellButtonImg,
    x: 10,
    y: 10,
    w: 50,
    h: 30,
    ready: false,
    onClick: function() {
        handleSell();
    }
};

var holdButtonImg = new Image();
holdButtonImg.src = "holdButton.png";
holdButtonImg.onload = function() {
    holdButton.ready = true;
};

holdButton = {
    img: holdButtonImg,
    x: 10,
    y: 30,
    w: 50,
    h: 30,
    ready: false,
    onClick: function() {
        A.kitten1.state = "hold";
    }
};

var gatherButtonImg = new Image();
gatherButtonImg.src = "gatherButton.png";
gatherButtonImg.onload = function() {
    gatherButton.ready = true;
};

gatherButton = {
    img: gatherButtonImg,
    x: 10,
    y: 60,
    w: 60,
    h: 30,
    ready: false,
    onClick: function() {
        A.kitten1.state = "gather";
    }
};

var destroyButtonImg = new Image();
destroyButtonImg.src = "destroyButton.png";
destroyButtonImg.onload = function() {
    destroyButton.ready = true;
};

destroyButton = {
    img: destroyButtonImg,
    x: 10,
    y: 90,
    w: 60,
    h: 30,
    ready: false,
    onClick: function() {
        A.kitten1.state = "destroy";
    }
};

var stepButtonImg = new Image();
stepButtonImg.src = "stepButton.png";
stepButtonImg.onload = function() {
    stepButton.ready = true;
};

stepButton = {
    img: stepButtonImg,
    x: 10,
    y: 120,
    w: 60,
    h: 30,
    ready: false,
    onClick: function() {
        A.game.step = true;
    }
};

var playButtonImg = new Image();
playButtonImg.src = "playButton.png";
playButtonImg.onload = function() {
    playButton.ready = true;
};

playButton = {
    img: playButtonImg,
    x: 10,
    y: 150,
    w: 60,
    h: 30,
    ready: false,
    onClick: function() {
        A.game.play = true;
    }
};

var pauseButtonImg = new Image();
pauseButtonImg.src = "pauseButton.png";
pauseButtonImg.onload = function() {
    pauseButton.ready = true;
};

pauseButton = {
    img: pauseButtonImg,
    x: 10,
    y: 180,
    w: 60,
    h: 30,
    ready: false,
    onClick: function() {
        A.game.play = false;
    }
};

A.buttons.push(holdButton);
A.buttons.push(gatherButton);
A.buttons.push(destroyButton);
A.buttons.push(stepButton);
A.buttons.push(playButton);
A.buttons.push(pauseButton);

A.mapToButtons = function(coords) {
    for (var i = 0; i < A.buttons.length; i++){
        if (coords.x > A.buttons[i].x &&
            coords.x < A.buttons[i].x + A.buttons[i].w &&
            coords.y > A.buttons[i].y &&
            coords.y < A.buttons[i].y + A.buttons[i].h) {
            A.buttons[i].onClick();
        }
    }
};

A.cleanCoords = function(e) {
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
    if (goode.x < A.canvas.width && goode.y < A.canvas.height) { // if clicking on the grid
        if (A.wallsAvailable === 0) {
            alert("Sorry, you don't have any walls available.\nSell 1 soldier to buy 5 walls.");
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
            alert("You must click on a green (blank)\nspot to place a wall there.");
        }
        A.wallsAvailable -= 1;
        A.world.draw();
    } else if (goode.x < A.canvas.width + 8 + A.canvas2.width && goode.y < A.canvas2.height) {
        var canvas2Coords = {
            x: goode.x - (A.canvas.width + 8),
            y: goode.y
        };
        A.mapToButtons(canvas2Coords);
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

A.wallsAvailable = 0;

A.nullCount = 0;
A.soldier1Count = 0;
A.soldier2Count = 0;
A.foodCount = 0;
A.wallCount = 0;

var WALLSPERSOLDIER = 5;

var NULL = 0; //"#333333";
var SOLDIER1 = 1; //"#550000";
var KING1 = 2; //"#FF0000";
var SOLDIER2 = 3; //"#000055";
var KING2 = 4; //"#0000FF";
var FOOD = 5; //"#00FF88";
var WALL = 6; //"#000000";

A.numberToColor = {
    0: "#333333",
    1: "#550000",
    2: "#FF0000",
    3: "#000055",
    4: "#0000FF",
    5: "#00FF88",
    6: "#000000"
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
    alert("The life of your soldier has bought you " +
          WALLSPERSOLDIER +
          " walls. \nClick on the grid to place it at any time.");
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
    // place the kings
    A.world[1][1] = KING1;
    A.world[A.ROWS - 2][A.COLS - 2] = KING2;

    // set the draw func
    A.world.draw = function() {
        for (var i = 0; i < A.ROWS; i++) {
            for (var j = 0; j < A.COLS; j++) {
                A.context.fillStyle = A.numberToColor[A.world[i][j]];
                A.context.fillRect(j * GRID, i * GRID, GRID, GRID);
                A.context.strokeStyle = "#000000";
                A.context.strokeRect(j * GRID, i * GRID, GRID, GRID);
            }
        }

        // paint the kings
        A.context.lineWidth = "2px";
        A.context.strokeStyle = "#FFFF00";
        A.context.strokeRect(GRID - 1, GRID - 1, GRID + 2, GRID + 2);
        A.context.strokeRect((A.COLS - 2) * GRID - 1, (A.ROWS - 2) * GRID - 1, GRID + 2, GRID + 2);

        // paint the buttons
        for (var i = 0; i < A.buttons.length; i++) {
            if (A.buttons[i].ready) {
                A.context2.drawImage(A.buttons[i].img, A.buttons[i].x, A.buttons[i].y, A.buttons[i].w, A.buttons[i].h);
            }
        }

        // display counts
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
    } else if (countNeighboring(FOOD, i, j) > 0) { // if there is food, grab it
        var coords = findNeighboring(FOOD, i, j);
        // find the first clockwise food and replace it with the soldier
        A.world[coords.row][coords.col] = soldier;
        A.foodCount -= 1;
        // replace soldier with nothing
        A.world[i][j] = NULL;
    } else { // nothing around! move somewhere
        var rand = Math.round(Math.random() * 2 - 1);
        var rand2 = Math.round(Math.random() * 2 - 1);
        if (A.world[i + rand] !== undefined &&
            A.world[i + rand][j + rand2] !== undefined &&
            A.world[i + rand][j + rand2] !== WALL) {
            if (!(rand === 0 && rand2 === 0)) {
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
            if (A.world[i][j] === NULL) { // if null....
                var rand = Math.random();
                if (rand < 0.05) {
                    A.world[i][j] = FOOD;
                    A.foodCount += 1;
                };
            }
        }
    }
}

function mainLoop() {

    if (A.game.step || A.game.play) { // hit 'right'
        var start = new Date();
        applyRules(A.world);
        A.world.draw(); // to optimize, just draw AS the rules are happening... we don't need to redraw
        console.log('time delta', new Date().getTime() - start.getTime());
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

    setInterval(mainLoop, 50);

}, false);