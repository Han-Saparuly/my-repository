/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-22 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these two lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

// Define the target pattern
const targetPattern = [
    [PS.COLOR_RED, PS.COLOR_BLUE, PS.COLOR_GREEN, PS.COLOR_YELLOW],
    [PS.COLOR_BLUE, PS.COLOR_GREEN, PS.COLOR_YELLOW, PS.COLOR_RED],
    [PS.COLOR_GREEN, PS.COLOR_YELLOW, PS.COLOR_RED, PS.COLOR_BLUE],
    [PS.COLOR_YELLOW, PS.COLOR_RED, PS.COLOR_BLUE, PS.COLOR_GREEN]
];

// Convert predefined color constants to RGB integers for comparison
const colorToRGB = {
    [PS.COLOR_RED]: PS.makeRGB(255, 0, 0),
    [PS.COLOR_BLUE]: PS.makeRGB(0, 0, 255),
    [PS.COLOR_GREEN]: PS.makeRGB(0, 255, 0),
    [PS.COLOR_YELLOW]: PS.makeRGB(255, 255, 0),
};

// Current level and game state
let currentLevel = 1;
const maxLevel = 5; // Maximum level
const victorySound = "fx_tada"; // Victory sound
const hintSound = "fx_coin1"; // Hint sound

// Level visibility settings (percentage of the pattern shown)
const levelVisibility = {
    1: 1.0, // 100%
    2: 0.75, // 75%
    3: 0.5, // 50%
    4: 0.25, // 25%
    5: 0.1, // 10%
};

PS.init = function(system, options) {
    PS.gridSize(8, 5); // Expanded grid size to accommodate mini-grid
    PS.gridColor(PS.COLOR_GRAY);
    setupLevel(currentLevel);
};

function setupLevel(level) {
    PS.statusText(`Level ${level}: Match the pattern`);
    PS.border(PS.ALL, PS.ALL, 0); // Simplify by removing the border

    // Initialize main puzzle grid with random colors
    for (let x = 0; x < 4; x++) { // Restrict to the left side for the puzzle area
        for (let y = 0; y < 4; y++) {
            PS.color(x, y, PS.random(0xFFFFFF));
            PS.data(x, y, true); // Mark these beads as part of the puzzle area
        }
    }

    // Display mini-grid pattern based on the current level
    displayMiniGrid(level);
}

function displayMiniGrid(level) {
    const visibility = levelVisibility[level] ?? 1; // Default to 100% visibility if undefined
    const visibleTiles = Math.floor(16 * visibility);

    let positions = [];
    for (let i = 0; i < 16; i++) {
        positions.push(i < visibleTiles);
    }
    positions = shuffle(positions); // Shuffle visibility

    for (let i = 0; i < 16; i++) {
        let x = i % 4; // Column
        let y = Math.floor(i / 4); // Row
        let color = positions[i] ? targetPattern[x][y] : PS.COLOR_GRAY;
        PS.color(x + 4, y, color); // Display on the right
        PS.data(x + 4, y, false); // Not part of the puzzle area
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

PS.touch = function(x, y, data, options) {
    if (!PS.data(x, y)) return; // Ignore touches on the mini-grid

    let currentColor = PS.color(x, y);
    let nextColor = getNextColor(currentColor);
    PS.color(x, y, nextColor);

    if (nextColor === targetPattern[x][y]) {
        PS.audioPlay(hintSound);
    }

    if (checkPatternMatch()) {
        nextLevel(); // Advance to the next level immediately after a match
    }
};

function getNextColor(color) {
    if (color === colorToRGB[PS.COLOR_RED]) {
        return colorToRGB[PS.COLOR_BLUE];
    } else if (color === colorToRGB[PS.COLOR_BLUE]) {
        return colorToRGB[PS.COLOR_GREEN];
    } else if (color === colorToRGB[PS.COLOR_GREEN]) {
        return colorToRGB[PS.COLOR_YELLOW];
    } else {
        return colorToRGB[PS.COLOR_RED];
    }
}

function checkPatternMatch() {
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            if (PS.color(x, y) !== targetPattern[x][y]) {
                return false; // Pattern does not match
            }
        }
    }
    PS.audioPlay(victorySound);
    PS.statusText("Puzzle Solved!");
    return true; // Return true to indicate a match
}

function nextLevel() {
    if (currentLevel < maxLevel) {
        currentLevel++;
    } else {
        PS.statusText("Congratulations! All levels complete! Restarting...");
        currentLevel = 1; // Reset to the first level if the max is reached
    }
    setupLevel(currentLevel);
}

PS.init(system, options); // Initialize the game when the script loads



