for (var i = 0; i < 1; i++) {
    for (var j = 0; j < 1; j++) {

    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomIntegerInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderMat(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}



function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}


function sumCol(mat, colIdx) {
    var sum = 0;
    for (var i = 0; i < mat.length; i++) {
        sum += +mat[i][colIdx];
    }
    return sum;
}

function sumRow(mat, rowIdx) {
    var sum = 0;
    for (var i = 0; i < mat[0].length; i++) {
        sum += +mat[rowIdx][i];
    }
    return sum;
}


function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) neighborsCount++;
            // if (mat[i][j]) neighborsCount++;
        }
    }
    return neighborsCount;
}

function startTime() {
    gStartTime = Date.now();
    var elTimer = document.querySelector('.timer span');
    gTimerInterval = setInterval(function() {
        var passedSeconds = (Date.now() - gStartTime) / 1000;
        elTimer.innerText = passedSeconds.toFixed(3);
    }, 100);
}

function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

// get empty cell
function getEmptyCell() {
    var emptyCells = getEmptyCells();
    var idx = getRandomIntInclusive(0, emptyCells.length - 1);
    var emptyCell = emptyCells[idx];
    return emptyCell;
}


// get empty cells
function getEmptyCells(board) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j]) continue;
            emptyCells.push({ i, j });
        }
    }
    return emptyCells;
}

function getAllNegs(pos) {
    var negs = [];

    for (var i = pos.i - 1; i <= pos.i + 1 && i < 8; i++) {
        if (i < 0) continue;
        for (var j = pos.j - 1; j <= pos.j + 1 && j < 8; j++) {
            if (j < 0 || (i === pos.i && j === pos.j)) continue;
            negs.push({ i, j });
        }
    }

    return negs;
}