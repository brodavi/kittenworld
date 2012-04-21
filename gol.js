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

var THE_BLACK = 0;
var THE_WHITE = 0xFF;

A.createWorld = function(n, world) {
    for (var i = 0; i < n; i++) {
        var k = parseInt(Math.random()*A.canvas.width*A.canvas.height)*4;
        A.world.data[k] = THE_WHITE;
        A.world.data[k+1] = THE_WHITE;
        A.world.data[k+2] = THE_WHITE;
    }
}

A.applyRules = function(world, newWorld) {
    // highly optimized
    var width = A.canvas.width*4;
    var d = world.data;
    var nd = newWorld.data;
    var cw = A.canvas.width;
    var ch = A.canvas.height;
    var base = 0;
    for (var i = 0; i < d.length/4; i++) {
        var x = i % cw;
        var y = parseInt(i / cw);
        
        var cnt = 0;
        if (x > 0 && d[base-4] != THE_BLACK) cnt++;
        if (x < cw-1 && d[base+4] != THE_BLACK) cnt++;
        if (x > 0 && y > 0 && d[base-4-width] != THE_BLACK) cnt++;
        if (y > 0 && d[base-width] != THE_BLACK) cnt++;
        if (x < cw-1 && y > 0 && d[base+4-width] != THE_BLACK) cnt++;
        if (x > 0 && y < ch-1 && d[base-4+width] != THE_BLACK) cnt++;
        if (y < ch-1 && d[base+width] != THE_BLACK) cnt++;
        if (x < cw-1 && y < ch-1 && d[base+4+width] != THE_BLACK) cnt++;
        
        var color = null;
        if (d[base] == THE_BLACK && cnt == 3) {
            color = THE_WHITE;
        } else if (!(d[base] != THE_BLACK && (cnt == 3 || cnt == 2))) {
            color = THE_BLACK;  
        }
        
        if (color !== null) {
            nd[base] = nd[base+1] = nd[base+2] = color;
        }
        
        base += 4;
    }
    // dead cell with 3 neightbours - alive
    // live cell with 2 or 3 neightbours - still alive
    // all other cases - dead
}

function getLiveNeighbours(id, data) {
    var x = id % A.canvas.width;
    var y = parseInt(id / A.canvas.width);
    
    var cnt = 0;
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            if ((i != 0 || j != 0) &&
                !(x+i < 0 || x+i >= A.canvas.width || y+j < 0 || y+j >= A.canvas.height) &&
                data.data[4*((y+j)*A.canvas.width+(x+i))] != THE_BLACK) {
                cnt++;
            }
        }
    }
    
    return cnt;
}

// the world
A.world = A.context.getImageData(0, 0, A.canvas.width, A.canvas.height);
A.newWorld = A.context.getImageData(0, 0, A.canvas.width, A.canvas.height);

// create the world
A.createWorld(parseInt(0.2*A.canvas.width*A.canvas.height), A.world);
A.context.putImageData(A.world, 0, 0);

A.mainLoop = function() {
    if (A.inputs.k39) {
        A.applyRules(A.world, A.newWorld);
        A.context.putImageData(A.newWorld, 0, 0);
    };
}

setInterval(A.mainLoop, 50);