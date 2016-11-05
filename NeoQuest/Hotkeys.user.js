// ==UserScript==
// @name         AutoQuester - Hotkeys
// @namespace    http://tampermonkey.net/
// @version      0.4
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

var NAME_TO_FACT_TYPE = {
    "Spirit of Growth" : 200019,
    "Weak Healing Potion" : 220000,
    "Standard Healing Potion" : 220001,
    "Strong Healing Potion" : 220002,
    "Greater Healing Potion" : 220003
};

// Allow player to use keyboard shortcuts
var hasSentNavAction = false;
document.onkeypress = function (e) { 

    e = e || window.event; 
    var charCode = e.charCode || e.keyCode, 
        character = String.fromCharCode(charCode); 

    console.log("Recieved event charCode '" + charCode + "' for character '" + character + "'");
    
    // Spacebar
    switch (charCode) {
        case 32:
            e.preventDefault();
            // Default 'next' action
            $('input[value="Click here to begin the fight!"]').click();
            $('input[value="Click here to return to the map"]').click();
            $('input[value="Click here to return to Neopia City"]').click();

            return;
    }
	
    // Overworld Hotkeys
    if ($("img[src='http://images.neopets.com/nq/n/navarrows.gif']").length > 0) {

        switch (character) {
            case '7': // North-West
            case 'q':
                navigateTo("neoquest.phtml?action=move&movedir=1");
                break;
            case '8': // North
            case 'w':
                navigateTo("neoquest.phtml?action=move&movedir=2");
                break;
            case '9': // North-East
            case 'e':
                navigateTo("neoquest.phtml?action=move&movedir=3");
                break;
            case '4': // West
            case 'a':
                navigateTo("neoquest.phtml?action=move&movedir=4");
                break;
            case '6': // East
            case 'd':
                navigateTo("neoquest.phtml?action=move&movedir=5");
                break;
            case '1': // South-West
            case 'z':
                navigateTo("neoquest.phtml?action=move&movedir=6");
                break;
            case '2': // South
            case 'x':
                navigateTo("neoquest.phtml?action=move&movedir=7");
                break;
            case '3': // South-East
            case 'c':
                navigateTo("neoquest.phtml?action=move&movedir=8");
                break;
            case 's': // Sneak
                navigateTo("neoquest.phtml?movetype=3");
                break;
            case 'n': // Normal
                navigateTo("neoquest.phtml?movetype=1");
                break;
            case 'h': // Hunt
                navigateTo("neoquest.phtml?movetype=2");
                break;
            case 'k': // Skills
                window.location.href = "neoquest.phtml?action=skill";
                break;
            case 'i': // Items
                window.location.href = "neoquest.phtml?action=items";
                break;
            case 'g': // Click 'Go!' to enter new locations
                navigateTo($('a:contains("Go")').attr("href"));
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
        
        switch (character) {
            case 'a': // Attack
                navigateTo("neoquest.phtml?fact=attack&type=0");
                break;
            case 'f': // Flee
                navigateTo("neoquest.phtml?fact=flee&type=0");
                break;
            case 'd': // Do Nothing
                navigateTo("neoquest.phtml?fact=noop&type=0");
                break;
            case 'q': // Skill #1
                castSpell(0);
                break;
            case 'w': // Skill #2
                castSpell(1);
                break;
            case 'e': // Skill #3
                castSpell(2);
                break;
            case 'r': // Skill #4
                castSpell(3);
                break;
            case 'z': // 'Use a ...' #1
                useItem(0);
                break;
            case 'x': // 'Use a ...' #2
                useItem(1);
                break;
            case 'c': // 'Use a ...' #3
                useItem(2);
                break;
            case 'v': // 'Use a ...' #4
                useItem(3);
                break;
        }
    }
};

function castSpell(index) {
    navigateTo("neoquest.phtml?fact=special&type=" + NAME_TO_FACT_TYPE[$('a:contains("Cast")').eq(index).find("i").text()])
}

function useItem(index) {
    var itemName = $('a:contains("Use a")').eq(index).text();
    itemName = itemName.substring(6,itemName.indexOf("(")).trim();
    navigateTo("neoquest.phtml?fact=item&type=" + NAME_TO_FACT_TYPE[itemName]);
}

function navigateTo(url) {
    console.log("Navigating to: " + url);
    if ($('#AutoQuesterCustomUrlModifier').length > 0) {
        if ($("#AutoQuesterCustomUrlModifier")[0].hasAttribute("data-ready")) {
            console.log("Navigating via #AutoQuesterCustomUrlModifier to " + url);
            $('#AutoQuesterCustomUrlModifier').attr("data-url",url);
            $('#AutoQuesterCustomUrlModifier').click();
        }
    } else {
        if (!LIMIT_NAV_SPAMMING || !hasSentNavAction) {
            console.log("Navigating via window.location.href to " + url);
            window.location.href = url;
        }
    }
    hasSentNavAction = true;
}
