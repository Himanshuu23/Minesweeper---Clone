// Display/UI
// We can add audio of bomb blasts when we click on the mine and all the other mines are shown
import { TILE_STATUSES, createBoard, markTile, revealTile, checkWin, checkLose, } from "./minesweeper.js";


const BOARD_SIZE = 10;
const NUMBER_OF_MINES = 7;
const minesLeftText = document.querySelector('[data-mine-count]');
const messageText = document.querySelector('.subtext');

const board = createBoard(BOARD_SIZE, NUMBER_OF_MINES);
const boardElement = document.querySelector('.board');


board.forEach(row => {
    row.forEach(tile => {
        boardElement.append(tile.element);
        tile.element.addEventListener('click', () => { // for handling left clicks
            revealTile(board, tile);
            checkGameEnd(); // everytime a tile is revealed this function will be called
        })
        tile.element.addEventListener('contextmenu', e => { // for handling right clicks
            e.preventDefault(); // so on right clicking on tiles => the menu containing back, forawrd, reload etc doesn't shows up
            markTile(tile);
            listMinesLeft();
        })
    })
})
boardElement.style.setProperty('--size', BOARD_SIZE);
minesLeftText.textContent = NUMBER_OF_MINES;

function listMinesLeft() { // it will return the number of tiles that are currently marked coz we mark the tile which has a mine on it so when a tile is marked we would decrease the number of mines left
    const markedTilesCount = board.reduce((count, row) => {
        return count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length // adding the number of tiles with marked status in each row to the count variable
    }, 0) // count starts at zero

    minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount // mines left
}

function checkGameEnd() {
    const win = checkWin(board); // passing the board to check the state of the board if we won or lost
    const lose = checkLose(board);

    if (win || lose) { // we want to stop the ability of the user to click on any of the tiles
        boardElement.addEventListener('click', stopProp, { capture: true }); // tiles event listeners occur in the buuble state so this event listener which is in the capture state will be fired before the tiles
        boardElement.addEventListener('contextmenu', stopProp, { capture: true });
    }

    if (win) {
        messageText.textContent = 'You Win';
    }

    if (lose) {
        messageText.textContent = 'You Lose';
        board.forEach(row => { // if lost then revealing the position of all the mines
            row.forEach(tile => {
                if (tile.status === TILE_STATUSES.MARKED) markTile(tile) // if the tile is marked then we mark it again to unmark it so we can display the mines which are marked as well coz in the revealTile function we only reveal the tiles which are hidden
                if (tile.mine) revealTile(board, tile);
                const audio = new Audio('./bomb.mp3');
                audio.play();
            })
        })
    }
}

function stopProp(e) {
    e.stopImmediatePropagation(); // it stops the event from going further down so it will never go to the tile's event listeners
}