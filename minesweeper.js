// Logic

export const TILE_STATUSES = {
    HIDDEN: 'hidden', 
    MINE: 'mine',
    NUMBER: 'number',
    MARKED: 'marked',
};

export function createBoard(boardSize, numberOfMines) {
    const board = []; // board made using nested arrays
    const minePositions = getMinePositions(boardSize, numberOfMines); // this function will give {numberOfMines} number of random locations inside of the board. Array of x,y coords
    for (let x = 0; x < boardSize; x++) { // creating rows (i.e. looping in x-direction)
        const row = [];
        for (let y = 0; y < boardSize; y++) {
            const element = document.createElement('div'); // element to display the tile on the screen
            element.dataset.status = TILE_STATUSES.HIDDEN; // by default tiles statuses hidden
            
            const tile = {
                element,
                x,
                y,
                mine: minePositions.some(positionMatch.bind(null, { x, y })), // Checking if the current position of the mine matches the mine positions so if it matches if it is a mine and we return true and if its not a mine then we return false
                get status() {
                    return this.element.dataset.status;
                },
                set status(value) {
                    this.element.dataset.status = value;
                }
            }
            row.push(tile) // adding tiles in each row=
        }
        board.push(row); // adding row to the board
    }

    return board;
}

export function markTile(tile) { // eligibility criteria for marking a tile :- --tile should be hidden or --unmark the tile if it is already marked
    if (
        tile.status !== TILE_STATUSES.HIDDEN &&
        tile.status !== TILE_STATUSES.MARKED 
    ) {
        return // means it is either a mine or revealed (number tile)
    }

    if (tile.status === TILE_STATUSES.MARKED) {
        tile.status = TILE_STATUSES.HIDDEN; // unmarking the tile
    } else {
        tile.status = TILE_STATUSES.MARKED // marking the tile
    }
}

export function revealTile(board, tile) {
    if (tile.status !== TILE_STATUSES.HIDDEN) { // as we can only reveal the tiles that are hidden
        return
    }

    if (tile.mine) {
        tile.status = TILE_STATUSES.MINE;
        return
    }

    tile.status = TILE_STATUSES.NUMBER; // if its not a mine
    const adjacentTiles = nearbyTiles(board, tile); // to set the number equal to the number of mines around it
    const mines = adjacentTiles.filter(t => t.mine);
    if (mines.length === 0) { // reveal all the portion adjacent to it which is empty and have no mines inside it
        adjacentTiles.forEach(revealTile.bind(null, board)) // recursively call the revealTile function for all the adjacent tiles. bind => adjacent tile will be automatically used as the thid parameter by forEach
    } else { // if mines.length !==0 
        tile.element.textContent = mines.length;
    }
}

export function checkWin(board) { // we will check every single tile and check every tile is either revealed as a number or hidden or it is marked. If the tile was hidden or marked with a flag we need to make sure that it's a mine so every single tile that is not revealed and is a mine => we win
    return board.every(row => { // so it is for every row
        return row.every(tile => { // so it is for every tile
            return tile.status === TILE_STATUSES.NUMBER || (tile.mine) && (tile.status === TILE_STATUSES.MARKED || tile.status === TILE_STATUSES.HIDDEN); // if the tile is a number tile that is => is it revealed if yes then ok but if mine then all the conditions being checked to make sure every mine is either hidden or marked
        })
    })
}

export function checkLose(board) {
    return board.some(row => { // if we have even single mine revealed with the status of mine then we lose 
        return row.some(tile => {
            return tile.status === TILE_STATUSES.MINE;
        })
    })
}

function getMinePositions(boardSize, numberOfMines) {
    const positions = [];

    while (positions.length < numberOfMines) { // not using the for loop coz if we get the coords or the positions of mines same that is two or more overlapping mines we can't do anything for them in for loop. In while loop if we get two mines on the same position then we'll continue looping over again n again
        const position = {
            x: randomNumber(boardSize),
            y: randomNumber(boardSize),
        }

        if (!positions.some(positionMatch.bind(null, position))) { // checking if same positions are there or not. if not then adding the position to our array. bind => 'a' will be the position and whatever we loop to find if similar to the current position or not will be passed in the function as 'b'
            positions.push(position);
        }
    }

    return positions
}

function positionMatch(a, b) {
    return a.x === b.x && a.y === b.y; // checking if they have same coordinates
}

function randomNumber(size) { // random number between 0 and size
    return Math.floor(Math.random() * size);
}

function nearbyTiles(board, { x, y }) { // all adjeact tiles in the 3x3 grid (top, left, right, bottom, top-left, top-right and so on). Left tile has an offset of -1 to the left, top-left is -1 left and -1 upward
    const tiles = [];

    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            const tile = board[x + xOffset]?.[y + yOffset]; // for the tiles at the corner we don't have all the 3x3 grid (9) tiles so to avoid the error we check if their is a tile in this row in the y-direction or not
            if(tile) tiles.push(tile); // if we have a tile then we add it to the left
        }
    }

    return tiles
}
