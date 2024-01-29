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

var shadowStatus = false;

PS.init = function( system, options ) {
    PS.gridSize( 4, 2 ); // Adjusted for two rows
    PS.statusText( "Try to make a simple beat!" );
    PS.borderColor( PS.ALL, PS.ALL, PS.COLOR_BLACK );
    PS.radius( PS.ALL, PS.ALL, 25 ); // Rounded rectangle

    PS.glyphColor( PS.ALL, PS.ALL, PS.COLOR_WHITE );

 // Add pause/stop symbols to bottom rows


 // This array of objects stores
 // the properties/status of each note
 // including its channel ID

 const NOTES = [
 {
 letter : "1",
 filename : "perc_drum_snare",
 color : PS.COLOR_RED,
 playing : false,
 paused : false,
 channel : ""
 },
 {
 letter : "2",
 filename : "perc_drum_bass",
 color : PS.COLOR_ORANGE,
 playing : false,
 paused : false,
 channel : ""
 },
 {
 letter : "3",
 filename : "perc_drum_tom2",
 color : 0xE0E000,
 playing : false,
 paused : false,
 channel : ""
 },
 {
 letter : "4",
 filename : "perc_cymbal_crash3",
 color : PS.COLOR_GREEN,
 playing : false,
 paused : false,
 channel : ""
 }
 ];
	
 const NOTES_ROW2 = [
        {
 letter : "5",
 filename : "perc_block_low",
 color : 0x800080,
 playing : false,
 paused : false,
 channel : ""
 },
 {
 letter : "6",
 filename : "perc_block_high",
 color : 0x00FFFF,
 playing : false,
 paused : false,
 channel : ""
 },
 {
 letter : "7",
 filename : "perc_hihat_closed",
 color : PS.COLOR_BLUE,
 playing : false,
 paused : false,
 channel : ""
 },
 {
 letter : "8",
 filename : "perc_conga_high",
 color : 0xFFC0CB,
 playing : false,
 paused : false,
 channel : ""
 }
    ];

 // Called when a note is loaded
 // Saves channel ID in associated data

 const loaded = function ( result ) {
 result.data.channel = result.channel;
 };

 // Called when a note stops playing
 // Updates status of note

 const ended = function ( result ) {
 result.data.playing = false;
 result.data.paused = false;
 };

 // Set up note glyphs and colors,
 // preload the eight note sounds and
 // initialize note data

 for ( let x = 0; x < NOTES.length; x += 1 ) {
 let note = NOTES[ x ]; // note data
 PS.color( x, 0, note.color );  // note color
 PS.glyph( x, 0, note.letter ); // note letter

 // Note data passed to onLoad function
 // and also onEnd function
 // through .data parameter

 PS.audioLoad( note.filename, {
 data : note,
 lock : true,
 onLoad : loaded,
 onEnd : ended
 } ); // preload and lock sound

 // Store note data in all beads
 // associated with this note

 PS.data( x, 0, note );
 }
	
 for ( let x = 0; x < NOTES_ROW2.length; x += 1 ) {
        let note = NOTES_ROW2[ x ];
        PS.color( x, 1, note.color ); // Note the change in y-coordinate
        PS.glyph( x, 1, note.letter );
        PS.audioLoad( note.filename, {
            data : note,
            lock : true,
            onLoad : loaded,
            onEnd : ended
        });
        PS.data( x, 1, note ); // Note the change in y-coordinate
    }
};

PS.touch = function( x, y, data, options ) {
	
 var a, b, c;

 r = PS.random(256) - 1; // random red 0-255
 g = PS.random(256) - 1; // random green
 b = PS.random(256) - 1; // random blue
 PS.gridColor( a, b, c ); // set grid color
	
 var r, g, b;

 // If shadow is visible, hide it

 if ( shadowStatus ) {
 shadowStatus = false;
 PS.gridShadow( false );
 }

 // Otherwise show with random color
 // Max color value is 127 to insure
 // visibility against white grid

 else {
 shadowStatus = true;
 r = PS.random(128) - 1; // random red 0-127
 g = PS.random(128) - 1; // random green
 b = PS.random(128) - 1; // random blue
 PS.gridShadow( true, r, g, b );}
 
 // Pressed play?

 if (y === 0 || y === 1) {
        data.playing = true;
        data.paused = false;
        PS.audioPlay( data.filename );
        PS.glyphColor( x, y, PS.COLOR_GREEN );
    }
	
};

 PS.exit = function( x, y, data, toX, toY, options ) {
    // Change the glyph color back to white when the cursor exits the bead
    if (y === 0 || y === 1) {
        PS.glyphColor(x, y, PS.COLOR_WHITE);
    }
};

 PS.release = function( x, y, data, options ) {
    // Ensure that the color is reset only for the glyphs in the first row
    if (y === 0 || y === 1) {
        PS.glyphColor(x, y, PS.COLOR_WHITE);
    }
};





