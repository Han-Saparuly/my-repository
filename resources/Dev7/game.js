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

var splashScreen = true;
var blightCount = 0; // Track the number of blights
var loseConditionMet = false; // Track if the player has lost

var G = {
    gridSize: { width: 16, height: 16 },
    gameStarted: false,
    color: {
        background: 0x303030,
        guardian: 0xFFD700,
        blight: 0x8B4513,
        seed: 0x00FF00, // Normal seed color
        bigSeed: 0x0000FF, // Big seed color for larger area planting
        garden: 0x006400
    },
    player: { x: 7, y: 7 },
    seedRate: 20,
    blights: [],
    seedType: "normal", // Default seed type
};

PS.init = function( system, options ) {
    PS.gridSize(G.gridSize.width, G.gridSize.height);
    PS.gridColor(G.color.background);
    displayTitleScreen();
	PS.color(G.player.x, G.player.y, G.color.guardian); // Mark the guardian's starting position
};

function displayTitleScreen() {
    PS.statusText("Garden Guardian - Click to Start");
}

PS.touch = function( x, y, data, options ) {
    if (splashScreen) {
        startGame();
    } else if (G.gameStarted && !loseConditionMet) {
        plantSeed(x, y);
    }
};

PS.input = function( device, options ) {
 var event;

 event = device.wheel;
 if ( event ) {
 if ( event === PS.WHEEL_FORWARD || event === PS.WHEEL_BACKWARD) {
  G.seedType = G.seedType === "normal" ? "big" : "normal"; // Toggle seed type
        var seedTypeText = G.seedType === "normal" ? "Normal Seed Selected" : "Big Seed Selected";
        PS.statusText(seedTypeText);
  }
 }
};


function startGame() {
    splashScreen = false;
    G.gameStarted = true;
    loseConditionMet = false;
    PS.gridColor(G.color.garden);
    PS.statusText("Protect the Garden!");
	
    PS.seed(Date.now()); 

    blightCount = 20; // Adjusted for demonstration
    G.blights = generateBlights(blightCount);
    spreadBlights(); // Initiate the first spread to start the challenge
}

function generateBlights(count) {
    var positions = [];
    for (var i = 0; i < count; i++) {
        var x, y, pos;
        do {
            // Use PS.random() seeded with PS.seed()
            x = PS.random(G.gridSize.width) - 1;
            y = PS.random(G.gridSize.height) - 1;
            pos = `${x},${y}`;
        } while (positions.includes(pos));
        positions.push(pos);
        PS.color(x, y, G.color.blight);
    }
    return positions;
}

function plantSeed(x, y) {
    // Check the current seed type
    if (G.seedType === "big") {
        // Plant a big seed that affects a 3x3 area around (x, y)
        let affected = false; // Flag to check if any blight was affected
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let checkX = x + dx;
                let checkY = y + dy;
                // Ensure we're within bounds
                if (checkX >= 0 && checkX < G.gridSize.width && checkY >= 0 && checkY < G.gridSize.height) {
                    let pos = `${checkX},${checkY}`;
                    // Check if there's a blight at this position
                    if (G.blights.includes(pos)) {
                        PS.color(checkX, checkY, G.color.bigSeed); // Change the color to big seed
                        blightCount--;
                        G.blights = G.blights.filter(p => p !== pos); // Remove the blight from the list
                        affected = true;
                    }
                }
            }
        }
        if (affected) {
            PS.audioPlay("piano_g5"); // Play a sound to indicate successful big seed planting
            PS.statusText("Big Seed Planted!");
        } else {
            PS.statusText("No blights affected!");
        }
    } else {
        // Planting logic for a normal seed
        let pos = `${x},${y}`;
        if (G.blights.includes(pos)) {
            PS.color(x, y, G.color.seed); // Change the color to normal seed
            blightCount--;
            G.blights = G.blights.filter(p => p !== pos); // Remove the blight from the list
            PS.audioPlay("piano_g6"); // Play a sound to indicate successful normal seed planting
            PS.statusText("Seed planted!");
        } else {
            PS.statusText("Try planting on a blight!");
        }
    }

    // Check if all blights have been cleared
    if (blightCount === 0) {
        PS.statusText("Garden is clear! You've won!");
        PS.audioPlay("fx_tada");
        G.gameStarted = false; // End the game
    }
}

function spreadBlights() {
    if (!G.gameStarted || loseConditionMet) return;
    
    var newBlights = [];
    G.blights.forEach(function(blight) {
        var parts = blight.split(',');
        var bx = parseInt(parts[0]), by = parseInt(parts[1]);
        var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Left, Right, Up, Down
        directions.forEach(function(dir) {
            var nx = bx + dir[0], ny = by + dir[1];
            var newPos = `${nx},${ny}`;
            if (nx >= 0 && nx < G.gridSize.width && ny >= 0 && ny < G.gridSize.height && !G.blights.includes(newPos) && !newBlights.includes(newPos)) {
                newBlights.push(newPos);
            }
        });
    });

    if (newBlights.length > 0) {
        var spreadPos = newBlights[PS.random(newBlights.length) - 1];
        var parts = spreadPos.split(',');
        var px = parseInt(parts[0]), py = parseInt(parts[1]);
        if (px === G.player.x && py === G.player.y) {
            PS.statusText("You've been overtaken by blight! Game over.");
			PS.audioPlay("fx_scratch");
            loseConditionMet = true;
            G.gameStarted = false;
            return;
        }
        PS.color(px, py, G.color.blight);
        G.blights.push(spreadPos);
        blightCount++;
		PS.audioPlay("fx_squink");
        PS.statusText("Blight spreads! Blighted cells left: " + blightCount);
    }

    // Schedule the next spread
    PS.timerStart(150, spreadBlights); // Adjust timing as needed for game balance
}

PS.keyDown = function( key, shift, ctrl, options ) {
    if (!G.gameStarted || loseConditionMet) return; // Prevent movement if the game hasn't started or is over

    var dx = 0, dy = 0;
    switch (key) {
        case PS.KEY_ARROW_UP: dy = -1; break;
        case PS.KEY_ARROW_DOWN: dy = 1; break;
        case PS.KEY_ARROW_LEFT: dx = -1; break;
        case PS.KEY_ARROW_RIGHT: dx = 1; break;
    }

    movePlayer(dx, dy);
    if (G.blights.includes(`${G.player.x},${G.player.y}`)) {
        PS.statusText("You've been overtaken by blight! Game over.");
		PS.audioPlay("fx_scratch");
        loseConditionMet = true;
        G.gameStarted = false; // Stop game interactions
    }
};

function movePlayer(dx, dy) {
    var newX = G.player.x + dx;
    var newY = G.player.y + dy;

    if (newX >= 0 && newX < G.gridSize.width && newY >= 0 && newY < G.gridSize.height) {
        PS.color(G.player.x, G.player.y, G.color.garden); // Restore the garden color behind the player
        G.player.x = newX;
        G.player.y = newY;
        PS.color(newX, newY, G.color.guardian);
    }
}






