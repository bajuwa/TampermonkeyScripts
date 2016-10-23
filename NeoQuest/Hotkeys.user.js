// ==UserScript==
// @name         AutoQuester - Hotkeys
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       bajuwa
// @match        http://www.neopets.com/games/neoquest/neoquest.phtml*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery;

// Allow player to use keyboard shortcuts
document.onkeypress = function (e) { 
    e = e || window.event; 
    var charCode = e.charCode || e.keyCode, 
        character = String.fromCharCode(charCode); 
    
    
    switch (charCode) {
        case 32:
            // Default 'next' action
            $('input[value="Click here to begin the fight!"]').click();
            $('input[value="Click here to return to the map"]').click();
            $('input[value="Click here to return to Neopia City"]').click();
            $('a :contains("Click here")').click();
            break;
    }

    switch (character) {
        case '7': // North-West
            window.location.href = "neoquest.phtml?action=move&movedir=1";
            break;
        case '8': // North
            window.location.href = "neoquest.phtml?action=move&movedir=2";
            break;
        case '9': // North-East
            window.location.href = "neoquest.phtml?action=move&movedir=3";
            break;
        case '4': // West
            window.location.href = "neoquest.phtml?action=move&movedir=4";
            break;
        case '6': // East
            window.location.href = "neoquest.phtml?action=move&movedir=5";
            break;
        case '1': // South-West
            window.location.href = "neoquest.phtml?action=move&movedir=6";
            break;
        case '2': // South
            window.location.href = "neoquest.phtml?action=move&movedir=7";
            break;
        case '3': // South-East
            window.location.href = "neoquest.phtml?action=move&movedir=8";
            break;
        case 's': // Sneak
            window.location.href = "neoquest.phtml?movetype=3";
            break;
        case 'n': // Normal
            window.location.href = "neoquest.phtml?movetype=1";
            break;
        case 'h': // Hunt
            window.location.href = "neoquest.phtml?movetype=2";
            break;
        case 'a': // Attack
            $('a:contains("Attack")').click();
            break;
        case 'f': // Flee
            $('a:contains("Flee")').click();
            break;
        case 'd': // Do Nothing
            $('a:contains("Do nothing")').click();
            break;
        case 'q': // Skills
            window.location.href = "neoquest.phtml?action=skill";
            break;
        case 'w': // Items
            window.location.href = "neoquest.phtml?action=items";
            break;
        case 'z': // 'Use a ...' #1
            $('a:contains("Use a ")').eq(0).click();
            break;
        case 'x': // 'Use a ...' #2
            $('a:contains("Use a ")').eq(1).click();
            break;
        case 'c': // 'Use a ...' #3
            $('a:contains("Use a ")').eq(2).click();
            break;
        case 'v': // 'Use a ...' #4
            $('a:contains("Use a ")').eq(3).click();
            break;
        case 'g': // Click 'Go!' to enter new locations
            $('a :contains("Go!")').click();
            break;
    }
};