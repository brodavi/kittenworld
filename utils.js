// the main namespace
var A = {};

// the "game".. holds state
A.game = {};

// the grid canvas
A.canvas = document.getElementById('canvas');
// the button canvas
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

// make a button
A.makeButton = function(id, x, y, w, h, callBack){
    var newButtonImg = new Image();
    newButtonImg.src = id + "Button.png";

    var newButton = {
        img: newButtonImg,
        x: x,
        y: y,
        w: w,
        h: h,
        show: true,
        ready: false,
        onClick: function() {
            callBack();
        }
    };

    newButtonImg.onload = function() {
        newButton.ready = true;
    };

    return newButton;
};

// clean up mouse coords, hopefully
A.cleanCoords = function(e) {
    return {
        x: e.x - A.canvas.offsetLeft,
        y: e.y - A.canvas.offsetTop
    };
};

// mouseclick listener
addEventListener("click", function(e) {
    A.handleClick(e);
}, false);


// finds the first coords (scan-line ordering) of any THING from centerpoint i,j
function findNeighboring (thing, i , j) {
    var coords = {};

    if (A.world[i-1]) {
        // the row above exists....
        if (A.world[i-1][j-1] && A.world[i-1][j-1] === thing) { coords.row = i - 1; coords.col = j - 1; };
        if (A.world[i-1][j] === thing) { coords.row = i - 1; coords.col = j; };
        if (A.world[i-1][j+1] && A.world[i-1][j+1] === thing) { coords.row = i - 1; coords.col = j + 1; };
    }
    if (A.world[i][j-1] && A.world[i][j-1] === thing) { coords.row = i; coords.col = j - 1; }; // the 'current' row
    if (A.world[i][j+1] && A.world[i][j+1] === thing) { coords.row = i; coords.col = j + 1; };
    if (A.world[i+1]) {
        // the row below exists...
        if (A.world[i+1][j-1] && A.world[i+1][j-1] === thing) { coords.row = i + 1; coords.col = j - 1; };
        if (A.world[i+1][j] === thing) { coords.row = i + 1; coords.col = j; };
        if (A.world[i+1][j+1] && A.world[i+1][j+1] === thing) { coords.row = i + 1; coords.col = j + 1; };
    }
    return coords;
}

// count how many neighboring THINGS there are from center point i,j
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

// generates the tiny world
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
                A.world[i].push(ARMY1);
                A.army1Count += 1;
            } else if (rand < 0.35) {
                A.world[i].push(ARMY2);
                A.army2Count += 1;
            } else {
                A.world[i].push(NULL);
                A.nullCount += 1;
            }
        }
    }

    // place the kings
    var army1img = new Image()
    army1img.src = "army1.png";
    var army2img = new Image()
    army2img.src = "army2.png";

    // set the draw func
    A.world.draw = function() {
        for (var i = 0; i < A.ROWS; i++) {
            for (var j = 0; j < A.COLS; j++) {
                    A.context.fillStyle = A.numberToColor[A.world[i][j]];
                    A.context.fillRect(j * CELLSIZE, i * CELLSIZE, CELLSIZE, CELLSIZE);
                if (A.world[i][j] === ARMY1) {
                    A.context.drawImage(army1img, j * CELLSIZE, i * CELLSIZE);
                } else if (A.world[i][j] === ARMY2) {
                    A.context.drawImage(army2img, j * CELLSIZE, i * CELLSIZE);
                } else {
                    A.context.strokeStyle = "#000000";
                    A.context.strokeRect(j * CELLSIZE, i * CELLSIZE, CELLSIZE, CELLSIZE);
                }
            }
        }

        // add king1
        A.world[Math.floor(A.ROWS / 2)][1] = KING1;
        
        // paint king 1
        var king1x = 8;
        var king1y = Math.floor(A.ROWS / 2) * CELLSIZE;
        A.context.fillStyle = "#333333";
        A.context.fillRect(king1x, king1y, CELLSIZE, CELLSIZE);
        A.context.drawImage(army1img, king1x, king1y);
        A.context.lineWidth = "2px";
        A.context.strokeStyle = "#FFFF00";
        A.context.strokeRect(king1x - 2, king1y - 2, CELLSIZE + 2, CELLSIZE + 2);

        // add king2
        A.world[Math.floor(A.ROWS / 2)][A.COLS - 2] = KING2;

        // paint king 2
        var king2x = A.COLS * CELLSIZE - 2 * CELLSIZE;
        var king2y = Math.floor(A.ROWS / 2) * CELLSIZE;
        A.context.fillStyle = "#333333";
        A.context.fillRect(king2x, king2y, CELLSIZE, CELLSIZE);
        A.context.drawImage(army2img, king2x, king2y);
        A.context.lineWidth = "2px";
        A.context.strokeStyle = "#FFFF00";
        A.context.strokeRect(king2x - 2, king2y - 2, CELLSIZE + 2, CELLSIZE + 2);

        // paint the buttons
        for (var i = 0; i < A.buttons.length; i++) {
            if (A.buttons[i].ready && A.buttons[i].show === true) {
                A.context2.drawImage(A.buttons[i].img, A.buttons[i].x, A.buttons[i].y, A.buttons[i].w, A.buttons[i].h);
            }
        }

        // display counts
        document.getElementById("army1Count").innerHTML = A.army1Count;
        document.getElementById("army2Count").innerHTML = A.army2Count;
        document.getElementById("foodCount").innerHTML = A.foodCount;
        document.getElementById("wallCount").innerHTML = A.wallCount;
        document.getElementById("wallsAvailable").innerHTML = A.wallsAvailable;
    }
}
