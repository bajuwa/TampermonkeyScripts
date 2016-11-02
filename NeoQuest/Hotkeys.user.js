// ==UserScript==
// @name         AutoQuester - Hotkeys
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       bajuwa
// @match        http://www.neopets.com/games/neoquest/neoquest.phtml*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery;

var LIMIT_NAV_SPAMMING = true; // If you want to make sure you don't accidentally travel more than 1 space at a time (or any other action past your first input), set this to 'true'; Otherwise, set to 'false'.
// Note: If you're using Map Extender, keep this set to 'true' to avoid map misalignments!!!

// Allow player to use keyboard shortcuts
var hasSentNavAction = false;
document.onkeypress = function (e) { 

    e = e || window.event; 
    var charCode = e.charCode || e.keyCode, 
        character = String.fromCharCode(charCode); 

    console.log("Recieved event charCode '" + charCode + "' for character '" + character + "'");

    // Overworld Hotkeys
    if ($("img[src='http://images.neopets.com/nq/n/navarrows.gif']").length > 0) {
        if (hasSentNavAction) {
            return;
        }

        // Spacebar
        switch (charCode) {
            case 32:
                e.preventDefault();
                // Toggle the overhead banner from Map Extender

                break;
        }

        switch (character) {
            case '7': // North-West
            case 'q':
                window.location.href = "neoquest.phtml?action=move&movedir=1";
                hasSentNavAction = true;
                break;
            case '8': // North
            case 'w':
                window.location.href = "neoquest.phtml?action=move&movedir=2";
                hasSentNavAction = true;
                break;
            case '9': // North-East
            case 'e':
                window.location.href = "neoquest.phtml?action=move&movedir=3";
                hasSentNavAction = true;
                break;
            case '4': // West
            case 'a':
                window.location.href = "neoquest.phtml?action=move&movedir=4";
                hasSentNavAction = true;
                break;
            case '6': // East
            case 'd':
                window.location.href = "neoquest.phtml?action=move&movedir=5";
                hasSentNavAction = true;
                break;
            case '1': // South-West
            case 'z':
                window.location.href = "neoquest.phtml?action=move&movedir=6";
                hasSentNavAction = true;
                break;
            case '2': // South
            case 'x':
                window.location.href = "neoquest.phtml?action=move&movedir=7";
                hasSentNavAction = true;
                break;
            case '3': // South-East
            case 'c':
                window.location.href = "neoquest.phtml?action=move&movedir=8";
                hasSentNavAction = true;
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
            case 'k': // Skills
                window.location.href = "neoquest.phtml?action=skill";
                break;
            case 'i': // Items
                window.location.href = "neoquest.phtml?action=items";
                break;
            case 'g': // Click 'Go!' to enter new locations
                $('a :contains("Go!")').click();
                break;
            case 't': // Click 'Talk' to begin NPC conversations
                window.location.href = $('a:contains("Talk")').attr("href")
                break;
        }

    } else if (window.location.href.indexOf("action=talk") >= 0) {
        // NPC Chat Hotkeys
        window.location.href = $('a[href^="neoquest.phtml?action=talk"').eq(parseInt(charCode)-49).attr("href");
    } else if ($("img[src^='http://images.neopets.com/nq/n/lupe_']").length > 0 || $("img[src^='http://images.neopets.com/nq/m/']").length > 0) {
        // Battle Hotkeys
        
        // Spacebar
        switch (charCode) {
            case 32:
                e.preventDefault();
                // Default 'next' action
                $('input[value="Click here to begin the fight!"]').click();
                $('input[value="Click here to return to the map"]').click();
                $('input[value="Click here to return to Neopia City"]').click();
                $('a :contains("Click here")').click();

                break;
        }

        switch (character) {
            case 'a': // Attack
                $('a:contains("Attack")').click();
                break;
            case 'f': // Flee
                $('a:contains("Flee")').click();
                break;
            case 'd': // Do Nothing
                $('a:contains("Do nothing")').click();
                break;
            case 'q': // Skill #1
                $('a:contains("Cast")').eq(0).click();
                break;
            case 'w': // Skill #2
                $('a:contains("Cast")').eq(1).click();
                break;
            case 'e': // Skill #3
                $('a:contains("Cast")').eq(2).click();
                break;
            case 'r': // Skill #4
                $('a:contains("Cast")').eq(3).click();
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
    }
};