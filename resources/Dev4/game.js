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
    [PS.COLOR_RED]: PS.makeRGB(255, 0, 0), // Example conversion, adjust as necessary
    [PS.COLOR_BLUE]: PS.makeRGB(0, 0, 255),
    [PS.COLOR_GREEN]: PS.makeRGB(0, 255, 0),
    [PS.COLOR_YELLOW]: PS.makeRGB(255, 255, 0),
    // Add other colors as needed
};

PS.init = function(system, options) {
    PS.gridSize(4, 4); // Set grid size to 4x4
    PS.gridColor(PS.COLOR_GRAY); // Set background color
    PS.statusText("Match the pattern (hint: use headphones)"); // Correct method name
    PS.border(PS.ALL, PS.ALL, 2); // Correct method name

    // Initialize grid with random colors
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            PS.color(x, y, PS.random(0xFFFFFF)); // Ensure valid RGB integer colors
        }
    }
};

PS.touch = function(x, y, data, options) {
    "use strict"; // Use strict mode for better error checking

    let currentColor = PS.color(x, y); // Get the current color of the bead
    let nextColor = getNextColor(currentColor); // Determine the next color
    PS.color(x, y, nextColor); // Set the bead to the next color

    // Check if the newly placed color matches the target pattern
    if (nextColor === targetPattern[x][y]) {
        PS.audioPlay("fx_coin1"); // Play sound for correct color placement
    }

    // Check if the entire pattern matches after each touch
    if (checkPatternMatch()) {
        PS.statusText("Puzzle Solved!"); // Update status text
        PS.audioPlay("fx_tada"); // Play victory sound
    }
};

function getNextColor(color) {
    // Use RGB values for comparison and cycling through colors
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
    return true; // Pattern matches
}




