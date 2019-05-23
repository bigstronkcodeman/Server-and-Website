function View(m) {
    this.canvas = document.getElementById('theCanvas');
    this.model = m;
}


View.prototype.canvasClick = function (event) {
    var ctx = this.canvas.getContext('2d');
    var x = event.offsetX;
    var y = event.offsetY;
    this.model.spawn(x, y);
}

View.prototype.pauseUpdate = function () {
    var ctx = this.canvas.getContext('2d');
    for (var i = 0; i < this.model.userQueue.length; i++) {
        //ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 100%, 50%)';
        ctx.fillStyle = 'red';
        if (this.model.userQueue[i].queuey == 0 || this.model.userQueue[i].queuex == 0) {
            if (this.model.userQueue[i].queuey == 0 && this.model.userQueue[i].queuex == 0) {
                ctx.fillRect(this.model.userQueue[i].queuex * 10, this.model.userQueue[i].queuey * 10, 10, 10);
            }
            else if (this.model.userQueue[i].queuey == 0) {
                ctx.fillRect((this.model.userQueue[i].queuex * 10) + 1, (this.model.userQueue[i].queuey * 10), 9, 10);
            }
            else {
                ctx.fillRect((this.model.userQueue[i].queuex * 10), (this.model.userQueue[i].queuey * 10) + 1, 10, 9);
            }
        }
        else {
            ctx.fillRect((this.model.userQueue[i].queuex * 10) + 1, (this.model.userQueue[i].queuey * 10) + 1, 9, 9);
        }
    }
}

View.prototype.update = function () {
    let ctx = this.canvas.getContext('2d');
    ctx.fillStyle = 'black';
    for (var i = 1; i < this.model.world.sizeX; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 10 + 0.5, 0.5);
        ctx.lineTo(i * 10 + 0.5, 1000.5);
        ctx.stroke();
        ctx.moveTo(0.5, i * 10 + 0.5);
        ctx.lineTo(1000.5, i * 10 + 0.5);
        ctx.stroke();
    }

    //ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 100%, 40%)';
    for (var row = 0; row < this.model.world.sizeX; row++) {
        for (var col = 0; col < this.model.world.sizeY; col++) {
            if (this.model.world.board[row][col] == true) {
                ctx.fillStyle = 'teal';
                //ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 100%, 50%)';
                if (row == 0 || col == 0) {
                    if (row == 0 && col == 0) {
                        ctx.fillRect(row * 10, col * 10, 10, 10);
                    }
                    else if (row == 0) {
                        ctx.fillRect(row * 10, (col * 10) + 1, 10, 9);
                    }
                    else {
                        ctx.fillRect((row * 10) + 1, col * 10, 9, 10);
                    }
                }
                else {
                    ctx.fillRect((row * 10) + 1, (col * 10) + 1, 9, 9);
                }
            }
            else {
                var saveStyle = ctx.fillStyle;
                ctx.fillStyle = 'lightgreen';
                if (row == 0 || col == 0) {
                    if (row == 0 && col == 0) {
                        ctx.fillRect(row * 10, col * 10, 10, 10);
                    }
                    else if (row == 0) {
                        ctx.fillRect(row * 10, (col * 10) + 1, 10, 9);
                    }
                    else {
                        ctx.fillRect((row * 10) + 1, col * 10, 9, 10);
                    }
                }
                else {
                    ctx.fillRect((row * 10) + 1, (col * 10) + 1, 9, 9);
                }
                ctx.fillStyle = saveStyle;
            }
        }
    }
}




function World() {
    this.sizeX = 100;
    this.sizeY = 90;
    this.board = new Array(this.sizeX);
    for (var i = 0; i < this.sizeX; i++) {
        this.board[i] = new Array(this.sizeY);
    }

    for (var row = 0; row < this.sizeX; row++) {
        for (var col = 0; col < this.sizeY; col++) {
            this.board[row][col] = false;
            if ((col + row) % (Math.floor(Math.random() * 10)) == 1) {
                this.board[row][col] = true;
            }
        }
    }
}

World.prototype.update = function (userQueue) {
    function isInBounds(num1, num2, sizeX, sizeY) {
        return ((num1 >= 0 && num1 <= sizeX - 1) && (num2 >= 0 && num2 <= sizeY - 1));
    }


    var neighbors = new Array(this.sizeX);
    for (var i = 0; i < neighbors.length; i++) {
        neighbors[i] = new Array(this.sizeY);
    }

    for (var row = 0; row < this.sizeX; row++) {
        for (var col = 0; col < this.sizeY; col++) {
            var livingNeighbors = 0;
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    if (isInBounds(row + i, col + j, this.sizeX, this.sizeY) && !(j == 0 && i == 0)) {
                        if (this.board[row + i][col + j] == true) {
                            livingNeighbors++;
                        }
                    }
                }
            }
            neighbors[row][col] = livingNeighbors;
        }
    }

    for (var row = 0; row < this.sizeX; row++) {
        for (var col = 0; col < this.sizeY; col++) {
            if (this.board[row][col] == true) {
                if ((neighbors[row][col] < 2 || neighbors[row][col] > 3)
                    && (userQueue.map(function (ele) { return ele.queuex; }).indexOf(col) == -1 || userQueue.map(function (ele) { return ele.queuey; }).indexOf(row) == -1)) {
                    this.board[row][col] = false;
                }
            }
            else {
                if (neighbors[row][col] == 3) {
                    this.board[row][col] = true;
                }
            }
        }
    }
}




function Model() {
    this.world = new World();
    this.userQueue = new Array();
}

Model.prototype.update = function () {
    this.world.update(this.userQueue);
    if (this.userQueue.length > 0) {
        for (var i = 0; i < this.userQueue.length; i++) {
            this.world.board[this.userQueue[i].queuex][this.userQueue[i].queuey] = true;
        }
    }
    this.userQueue = new Array();
}

Model.prototype.spawn = function (x, y) {
    var col = Math.floor(x / 10);
    var row = Math.floor(y / 10);
    var queueObj = {
        queuex: col,
        queuey: row
    };
    this.userQueue.push(queueObj);
    console.log('world[' + row + '][' + col + '] is queued to be set to true');
}



var controllerSelf;
function Controller(v, m) {
    this.view = v;
    this.model = m;
    controllerSelf = this;
}

Controller.prototype.update = function () {

}

Controller.prototype.userClick = function (event) {
    controllerSelf.view.canvasClick(event);
}




function Game() {
    this.model = new Model();
    this.view = new View(this.model);
    this.controller = new Controller(this.view, this.model);
    this.generations = 0;
}

Game.prototype.onTimer = function () {
    document.getElementById('theCanvas').onclick = this.controller.userClick;
    //this.controller.update();
    if (document.getElementById('pauseButton').value == 'go') {
        this.generations++;
        this.model.update();
        this.view.update();
    }
    else {
        this.view.pauseUpdate();
    }
}

let game = new Game();
let x = document.getElementById('timeSlider');
let timer = function() {
    game.onTimer();
    document.getElementById('genCount').innerHTML = 'Generation: ' + game.generations;
    setTimeout(timer, -x.value)
}
setTimeout(timer, -x.value);


function pauseToggle(button) {
    if (button.value == 'go') {
        button.value = 'stop';
        button.innerHTML = 'resume';
    }
    else {
        button.value = 'go';
        button.innerHTML = 'pause';
    }
}