'use strict'

const MINE = '💣'
const EMPTY = ' '
const FLAG = '🚩'


var gBoom = new Audio('boom.mp3');
var gBoard;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    hint: false,
}
var gStartTime;
var gFirstClick = 0;
var gTimerInterval;
var gLevel = {
    size: 4,
    mines: 2,
    flags: 2,
    hintInUse: 0,
    safeClickMode: false,
    safeClicks: 3
}

addEventListener('contextmenu', function (ev) {
    ev.preventDefault();
    return false;
}, false);

function initGame() {
    clearInterval(gTimerInterval);
    // update Dom
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = '😃';
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = 0;
    var elLives = document.querySelector('.lives');
    elLives.style.opacity = 1;
    var elFlagCount = document.querySelector('.flagcount');
    //update model
    gFirstClick = 0;
    gGame.shownCount = 0;
    switch (gLevel.size) {
        case 4:
            gGame.lives = 1;
            var elLives = document.querySelector('.lives');
            elLives.innerText = '❤';
            break;
        case 8:
            gGame.lives = 2;
            var elLives = document.querySelector('.lives');
            elLives.innerText = '❤❤';
            break;
        case 12:
            gGame.lives = 3;
            var elLives = document.querySelector('.lives');
            elLives.innerText = '❤❤❤';
            break;
    }
    // update hints
    gLevel.hintInUse = 0;
    for (var i = 0; i < 3; i++) {
        var elBulb = document.querySelector(`.hint${i + 1}`);
        elBulb.src = "lightbulboff.png";
    }
    gGame.hint = false;
    //update flags
    gLevel.flags = gLevel.mines;
    elFlagCount.innerText = `${FLAG + gLevel.flags}`;
    //update safe clicks
    var elSafeClick = document.querySelector('.safeclick');
    gLevel.safeClicks = 3;
    elSafeClick.innerText = `${gLevel.safeClicks} more safe clicks`
    gGame.isOn = true;
    gBoard = buildBoard(gLevel.size);
    renderBoard(gBoard, ".board-container");
    console.log(gBoard);
}

function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        var row = [];
        for (var j = 0; j < size; j++) {
            var cell = {
                isMine: false,
                location: {
                    i,
                    j
                },
                isShown: false,
                isMarked: false,
                isFirst: false,
                minesAroundCount: 0,
            }
            // var cell = {};
            // cell.isMine = false;
            // cell.location = {};
            // cell.location.i = i;
            // cell.location.j = j;
            // cell.isShown = false;
            // cell.isMarked = false;
            // cell.isFirst = false;
            // cell.minesAroundCount = 0;
            row.push(cell);
        }
        board.push(row)
    }
    return board
}

function renderBoard(board) {
    var strHTML = '<table border="1px black" class="board"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board.length; j++) {
            var className = `cell cell${i}-${j}-`;
            strHTML += `<td addEventListener()  oncontextmenu="javascript:cellMarked(this) ;return false;" class="${className}"  onClick="cellClicked(this)">${EMPTY}</td>`;
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;
}

function easyMode() {
    gLevel.mines = 2;
    gLevel.flags = 2;
    gLevel.size = 4;
    var elLives = document.querySelector('.lives');
    elLives.innerText = '❤';
    initGame();
}


function mediumMode() {
    var elLives = document.querySelector('.lives');
    elLives.innerText = '❤❤';
    gLevel.mines = 12;
    gLevel.flags = 12;
    gLevel.size = 8
    var elBoard = document.querySelector(".board");
    elBoard.classList.add("medium");
    initGame();

}

function expertMode() {
    var elLives = document.querySelector('.lives');
    elLives.innerText = '❤❤❤';
    gLevel.mines = 30;
    gLevel.flags = 30;
    gLevel.size = 12;
    initGame();
    console.log(gBoard);
}

function setMinesNegsCountModal(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) continue;
            board[i][j].minesAroundCount = minesNegsCount(i, j, board);
        }
    }
}

function minesNegsCount(cellI, cellJ, board) {
    var minesNegsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isMine) minesNegsCount++;
        }
    }
    return minesNegsCount;
}

function cellClicked(elCell) {
    if (!gGame.isOn) return;
    var cell = getCellFromElemet(elCell);
    if (gGame.hint) {
        giveHint(cell);
        return;
    }
    if (cell.isMarked) return;
    if (cell.isShown) return;
    if (gFirstClick <= 1) {
        if (gFirstClick === 0) {
            startTime();
            gFirstClick++;
            gFirstClick++;
        }
        cell.isFirst = true;
        setMines(gLevel.mines);
        setMinesNegsCountModal(gBoard);
    }
    cell.isShown = true;
    renderCell(elCell);
    checkGameOverWin();
    if (cell.isMine) {
        checkGameOverLose();
        return;
    }
    if (cell.minesAroundCount > 0) {
        return;
    }
    if (cell.minesAroundCount === 0) expand(cell);
    console.log('expand:', gGame.shownCount);
}

function renderCell(elCell) {
    var cell = getCellFromElemet(elCell);
    if (gGame.hint) elCell.classList.add('shown1sec');
    else if (gLevel.safeClickMode) elCell.classList.add('safeclicked');
    else {
        if (cell.isMarked) return;
        elCell.classList.add('shown');
        gGame.shownCount++;
    }
    if (cell.isMine) {
        elCell.innerText = MINE;
        return;
    }
    if (cell.minesAroundCount > 0) {
        elCell.innerText = cell.minesAroundCount;
        return;
    }
    if (cell.minesAroundCount === 0) {
        elCell.innerText = EMPTY;
    }
}

function expand(cell) {

    var cellI = cell.location.i;
    var cellJ = cell.location.j;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isShown) continue;
            gBoard[i][j].isShown = true
            var elCell = document.querySelector(`.cell${i}-${j}-`);
            if (gBoard[i][j].minesAroundCount === 0) expand(gBoard[i][j]);
            renderCell(elCell);
        }
    }

}

function setMines(numOfMines) {
    for (var idx = 0; idx < numOfMines; idx++) {
        var i = getRandomInt(0, gBoard.length);
        var j = getRandomInt(0, gBoard.length);
        if (gBoard[i][j].isFirst) {
            var i = getRandomInt(0, gBoard.length);
            var j = getRandomInt(0, gBoard.length);
        }
        gBoard[i][j].isMine = true;
    }
}


function getCellFromElemet(elCell) {
    var arr = elCell.className.split('-');
    var i = +arr[0].slice(9);
    var j = +arr[1];
    return gBoard[i][j];
}

function checkGameOverLose() {
    gGame.lives--;
    gGame.shownCount--;
    gBoom.play();
    var strHTML = '';
    var elLives = document.querySelector('.lives');
    if (gGame.lives === 0) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                if (gBoard[i][j].isMarked) {
                    if (!gBoard[i][j].isMine) {
                        var elCell = document.querySelector(`.cell${i}-${j}-`);
                        elCell.innerText = MINE + '❌';
                        continue;
                    }
                    continue;
                }
                if (gBoard[i][j].isMine) {
                    var elCell = document.querySelector(`.cell${i}-${j}-`);
                    elCell.classList.add('shown');
                    elCell.innerText = MINE;
                }
            }
        }
        elLives.style.opacity = 0;
        gGame.isOn = false;
        clearInterval(gTimerInterval);
        var elSmiley = document.querySelector('.smiley');
        elSmiley.innerText = '🤯';
    } else {
        for (var i = 0; i < gGame.lives; i++) {
            strHTML += '❤'
        }
        elLives.innerText = strHTML;
    }
}

function checkGameOverWin() {
    if (gLevel.size * gLevel.size - gLevel.mines !== gGame.shownCount) return;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = document.querySelector(`.cell${i}-${j}-`);
                if (elCell.innerText === MINE) continue;
                gBoard[i][j].isMarked = true;
                elCell.innerText = FLAG;
            }
            gGame.isOn = false;
            clearInterval(gTimerInterval);
            var elSmiley = document.querySelector('.smiley');
            elSmiley.innerText = '😎';
        }
    }
}


function giveHint(cell) {
    if (gFirstClick < 1) return;
    if (!gGame.hint) {
        if (gLevel.hintInUse === 3) return;
        gGame.hint = true;
        var elBulb = document.querySelector(`.hint${gLevel.hintInUse + 1}`);
        elBulb.src = "lightbulbon.png";
        gLevel.hintInUse++;
        return;
    }

    var cellI = cell.location.i;
    var cellJ = cell.location.j
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isShown) continue;
            var elCell = document.querySelector(`.cell${i}-${j}-`);
            renderCell(elCell);
        }
    }
    setTimeout(function () {
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard.length) continue;
                if (i === cellI && j === cellJ) continue;
                if (gBoard[i][j].isShown) continue;
                var elCell = document.querySelector(`.cell${i}-${j}-`);
                elCell.classList.remove('shown1sec');
                if (gBoard[i][j].isMarked) {
                    elCell.innerText = FLAG;
                    continue;
                }
                elCell.innerText = EMPTY;
            }
        }
    }, 1000);
    gGame.hint = false;
}

function safeClick() {
    if (gLevel.safeClicks === 0) return;
    gLevel.safeClickMode = true;
    var i = getRandomInt(0, gBoard.length);
    var j = getRandomInt(0, gBoard.length);
    while (gBoard[i][j].isMine || gBoard[i][j].isShown || gBoard[i][j].isMarked) {
        var i = getRandomInt(0, gBoard.length);
        var j = getRandomInt(0, gBoard.length);
    }
    var elSafeCell = document.querySelector(`.cell${i}-${j}-`);
    elSafeCell.classList.add('safeclicked');
    renderCell(elSafeCell);

    setTimeout(function () {
        elSafeCell.classList.remove('safeclicked');
        elSafeCell.innerText = EMPTY;
    }, 2500)
    var elSafeClick = document.querySelector('.safeclick');
    gLevel.safeClicks--;
    elSafeClick.innerText = `${gLevel.safeClicks} more safe clicks`
    gLevel.safeClickMode = false;
}

function cellMarked(elCell) {
    if (!gGame.isOn) return;
    if (gFirstClick === 0) {
        startTime();
        gFirstClick++;
    }
    var elFlagCount = document.querySelector('.flagcount');
    var cell = getCellFromElemet(elCell);
    if (cell.isShown) return;
    if (cell.isMarked) {
        cell.isMarked = false;
        gGame.markedCount--;
        gLevel.flags++;
        elFlagCount.innerText = `${FLAG + gLevel.flags}`;
        elCell.innerText = EMPTY;
    } else {
        if (gLevel.flags === 0) return;
        cell.isMarked = true;
        gGame.markedCount++;
        gLevel.flags--;
        elFlagCount.innerText = `${FLAG + gLevel.flags}`;
        elCell.innerText = FLAG;
    }
}




function startTime() {
    gStartTime = Date.now();
    var elTimer = document.querySelector('.timer');
    gTimerInterval = setInterval(function () {
        var passedSeconds = (Date.now() - gStartTime) / 1000;
        elTimer.innerText = passedSeconds.toFixed(0);
        gGame.secsPassed++;
    }, 1000);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}