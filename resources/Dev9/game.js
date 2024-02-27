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
var winConditionMet = false; // Track if the player has won
var difficultyOptions = ["Easy", "Normal", "Hard"];
var selectedDifficultyIndex = 1; // Default to Normal
var powerUpPos = null; // Track the power-up position
var powerUpActive = false; // Track if the power-up is active
var powerUpTimer = null; // Timer ID for the power-up duration

var G = {
    gridSize: { width: 16, height: 16 },
    gameStarted: false,
    difficulty: "Normal", // Default difficulty setting
    color: {
        background: 0x303030,
        guardian: 0xFFD700,
        blight: 0x8B4513,
        seed: 0x00FF00,
        bigSeed: 0x0000FF,
        garden: 0x006400,
        highlight: 0xFFFFFF // Color for highlighting selected menu item
    },
    player: { x: 7, y: 7 },
    seedRate: 20,
    blights: [],
    seedType: "normal",
};

PS.init = function(system, options) {
    PS.gridSize(G.gridSize.width, G.gridSize.height);
    PS.gridColor(G.color.background);
    displayDifficultySelection();
	PS.color(G.player.x, G.player.y, G.color.guardian);
};

function displayDifficultySelection() {
    PS.statusText("Select Difficulty: " + difficultyOptions[selectedDifficultyIndex]);
    // Highlight the selected difficulty option
    // For simplicity, we're just using the status text,
    // but you could use grid cells to create a more complex menu
}

function updateDifficultySelection(change) {
    selectedDifficultyIndex += change;
    if (selectedDifficultyIndex < 0) {
        selectedDifficultyIndex = difficultyOptions.length - 1;
    } else if (selectedDifficultyIndex >= difficultyOptions.length) {
        selectedDifficultyIndex = 0;
    }
    displayDifficultySelection();
}

function confirmDifficultySelection() {
    G.difficulty = difficultyOptions[selectedDifficultyIndex];
    PS.statusText("Difficulty: " + G.difficulty + " - Click to Start");
    splashScreen = false;
}

function placePowerUp() {
    var x, y, pos;
    do {
        x = PS.random(G.gridSize.width) - 1;
        y = PS.random(G.gridSize.height) - 1;
        pos = `${x},${y}`;
    } while (G.blights.includes(pos) || (x === G.player.x && y === G.player.y));
    powerUpPos = pos;
    PS.glyph(x, y, "⚡"); // glyph for power-up
    PS.glyphColor(x, y, PS.COLOR_YELLOW); // Set glyph color to make it distinct
}

PS.keyDown = function(key, shift, ctrl, options) {
    if (splashScreen) {
        switch (key) {
            case PS.KEY_ARROW_UP:
            case PS.KEY_ARROW_DOWN:
                updateDifficultySelection(key === PS.KEY_ARROW_UP ? -1 : 1);
                break;
            case PS.KEY_ENTER:
            case PS.KEY_SPACE:
                confirmDifficultySelection();
                break;
        }
    } else if (G.gameStarted && !loseConditionMet) {
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
    }
};

PS.touch = function(x, y, data, options) {
    if (!splashScreen && !G.gameStarted && !loseConditionMet) {
        startGame();
    } else if (G.gameStarted && !loseConditionMet) {
        plantSeed(x, y);
    }
};


PS.input = function(device, options) {
    var event = device.wheel;
    if (event && powerUpActive) {
        if (event === PS.WHEEL_FORWARD || event === PS.WHEEL_BACKWARD) {
            G.seedType = G.seedType === "normal" ? "big" : "normal"; // Toggle seed type
            var seedTypeText = G.seedType === "normal" ? "Normal Seed Selected" : "Big Seed Selected";
            PS.statusText(seedTypeText);
			PS.audioPlay("fx_click");
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

    blightCount = G.difficulty === "Easy" ? 10 : G.difficulty === "Normal" ? 20 : 30;
    G.blights = generateBlights(blightCount);
	placePowerUp();
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
        PS.statusText("Garden is saved!");
        PS.audioPlay("fx_tada");
        G.gameStarted = false; // End the game
		PS.glyph(G.player.x, G.player.y, 0); // Remove the power-up glyph
        powerUpPos = null; // Clear the power-up position
		restoreGardenColorGradually();
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
    }

    // Schedule the next spread
    PS.timerStart(150, spreadBlights); // Adjust timing as needed for game balance
	if (!powerUpPos && G.gameStarted && !loseConditionMet) {
        placePowerUp(); // Optionally, you can adjust the frequency of power-up appearance
    }
}

function collectPowerUp() {
    powerUpActive = true;
    PS.glyph(G.player.x, G.player.y, 0); // Remove the power-up glyph
    powerUpPos = null; // Clear the power-up position

    // Start or reset the power-up timer
    if (powerUpTimer !== null) {
        PS.timerStop(powerUpTimer);
    }
    powerUpTimer = PS.timerStart(300, deactivatePowerUp);

    PS.statusText("Power-up collected! Toggle seeds for 5 seconds.");
}

function deactivatePowerUp() {
    powerUpActive = false;
    PS.timerStop(powerUpTimer);
    powerUpTimer = null;
    PS.statusText("Power-up expired.");
	G.seedType = "normal";
}


function movePlayer(dx, dy) {
    var newX = G.player.x + dx;
    var newY = G.player.y + dy;

    if (newX >= 0 && newX < G.gridSize.width && newY >= 0 && newY < G.gridSize.height) {
        PS.color(G.player.x, G.player.y, G.color.garden); // Restore the garden color behind the player
        G.player.x = newX;
        G.player.y = newY;
        PS.color(newX, newY, G.color.guardian);
    }
	
	if (powerUpPos === `${G.player.x},${G.player.y}`) {
        collectPowerUp();
		PS.audioPlay("fx_powerup3");
    }
}

// Function to gradually restore garden's original color
function restoreGardenColorGradually() {
    const originalColor = 0x006400; 
    const gridWidth = PS.gridSize().width;
    const gridHeight = PS.gridSize().height;
    let coloredBeads = [];

    // Function to spread color to a single bead
    function colorOneBead() {
        if (coloredBeads.length === 0) {
            // Initially start from a random bead
            const startX = PS.random(gridWidth) - 1;
            const startY = PS.random(gridHeight) - 1;
            coloredBeads.push({ x: startX, y: startY });
            PS.color(startX, startY, originalColor);
        } else {
            // Spread color from existing colored beads
            const nextBeads = [];
            coloredBeads.forEach(bead => {
                [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(dir => {
                    const newX = bead.x + dir[0];
                    const newY = bead.y + dir[1];
                    if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight) {
                        const currentColor = PS.color(newX, newY);
                        if (currentColor !== originalColor) {
                            PS.color(newX, newY, originalColor);
                            nextBeads.push({ x: newX, y: newY });
                        }
                    }
                });
            });
            coloredBeads = nextBeads;
        }

        if (coloredBeads.length > 0) {
            setTimeout(colorOneBead, 100); // Adjust time for faster/slower spread
        } else {
            // Once done, make flowers appear
            makeFlowersAppear();
        }
    }

    colorOneBead(); // Start the process
}

// Function to make flowers appear on the grid
function makeFlowersAppear() {
    const gridWidth = PS.gridSize().width;
    const gridHeight = PS.gridSize().height;
    const flowers = [
        { glyph: '✿', color: PS.COLOR_RED }, 
        { glyph: '❀', color: PS.COLOR_YELLOW },
        { glyph: '✾', color: PS.COLOR_VIOLET }
    ];

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            // Randomly decide if a flower should appear on this bead
            if (Math.random() > 0.8) { // 20% chance for a flower to appear
                const flower = flowers[Math.floor(Math.random() * flowers.length)];
                PS.glyph(x, y, flower.glyph);
                PS.glyphColor(x, y, flower.color); // Set the glyph color
            }
        }
    }
}






