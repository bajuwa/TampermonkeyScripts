// ==UserScript==
// @name         AutoQuester - Extended Map
// @namespace    http://tampermonkey.net/
// @version      0.2
// @author       bajuwa
// @match        http://www.neopets.com/games/neoquest/neoquest.phtml*
// @run-at       document-end
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==
/* jshint -W097 */
'use strict';

var TILE_OPTIONS = {
    "castle" : "http://images.neopets.com/nq/tp/castle.gif",
    "cave" : "http://images.neopets.com/nq/tp/cave.gif",
    "cave_down" : "http://images.neopets.com/nq/tp/cave_down.gif",
    "cave_ent" : "http://images.neopets.com/nq/tp/cave_ent.gif",
    "cave_exit" : "http://images.neopets.com/nq/tp/cave_exit.gif",
    "cave_up" : "http://images.neopets.com/nq/tp/cave_up.gif",
    "city" : "http://images.neopets.com/nq/tp/city.gif",
    "desert" : "http://images.neopets.com/nq/tp/desert.gif",
    "dirt" : "http://images.neopets.com/nq/tp/dirt.gif",
    "dungeon" : "http://images.neopets.com/nq/tp/dungeon.gif",
    "dungeon_barrel" : "http://images.neopets.com/nq/tp/dungeon_barrel.gif",
    "dungeon_bed" : "http://images.neopets.com/nq/tp/dungeon_bed.gif",
    "dungeon_carpet" : "http://images.neopets.com/nq/tp/dungeon_carpet.gif",
    "dungeon_chair" : "http://images.neopets.com/nq/tp/dungeon_chair.gif",
    "dungeon_crate" : "http://images.neopets.com/nq/tp/dungeon_crate.gif",
    "dungeon_door" : "http://images.neopets.com/nq/tp/dungeon_door.gif",
    "dungeon_down" : "http://images.neopets.com/nq/tp/dungeon_down.gif",
    "dungeon_pillar" : "http://images.neopets.com/nq/tp/dungeon_pillar.gif",
    "dungeon_portal" : "http://images.neopets.com/nq/tp/dungeon_portal.gif",
    "dungeon_table" : "http://images.neopets.com/nq/tp/dungeon_table.gif",
    "dungeon_up" : "http://images.neopets.com/nq/tp/dungeon_up.gif",
    "forest" : "http://images.neopets.com/nq/tp/forest.gif",
    "grassland" : "http://images.neopets.com/nq/tp/grassland.gif",
    "hills" : "http://images.neopets.com/nq/tp/hills.gif",
    "jungle" : "http://images.neopets.com/nq/tp/jungle.gif",
    "mountain" : "http://images.neopets.com/nq/tp/mountain.gif",
    "npc_denethrir" : "http://images.neopets.com/nq/tp/npc_denethrir.gif",
    "npc_erick" : "http://images.neopets.com/nq/tp/npc_erick.gif",
    "npc_gatekeeper" : "http://images.neopets.com/nq/tp/npc_gatekeeper.gif",
    "npc_irgo" : "http://images.neopets.com/nq/tp/npc_irgo.gif",
    "npc_korabric" : "http://images.neopets.com/nq/tp/npc_korabric.gif",
    "npc_margoreth" : "http://images.neopets.com/nq/tp/npc_margoreth.gif",
    "npc_pomanna" : "http://images.neopets.com/nq/tp/npc_pomanna.gif",
    "npc_rikti" : "http://images.neopets.com/nq/tp/npc_rikti.gif",
    "npc_tylix" : "http://images.neopets.com/nq/tp/npc_tylix.gif",
    "ruins" : "http://images.neopets.com/nq/tp/ruins.gif",
    "snow" : "http://images.neopets.com/nq/tp/snow.gif",
    "stone" : "http://images.neopets.com/nq/tp/stone.gif",
    "swamp" : "http://images.neopets.com/nq/tp/swamp.gif",
    "unique_archmagus" : "http://images.neopets.com/nq/tp/unique_archmagus.gif",
    "unique_faleinn" : "http://images.neopets.com/nq/tp/unique_faleinn.gif",
    "unique_gors" : "http://images.neopets.com/nq/tp/unique_gors.gif",
    "unique_guardianfire" : "http://images.neopets.com/nq/tp/unique_guardianfire.gif",
    "unique_guardianice" : "http://images.neopets.com/nq/tp/unique_guardianice.gif",
    "unique_guardianlife" : "http://images.neopets.com/nq/tp/unique_guardianlife.gif",
    "unique_guardianshock" : "http://images.neopets.com/nq/tp/unique_guardianshock.gif",
    "unique_guardianspectral" : "http://images.neopets.com/nq/tp/unique_guardianspectral.gif",
    "unique_jahbal" : "http://images.neopets.com/nq/tp/unique_jahbal.gif",
    "unique_kreai" : "http://images.neopets.com/nq/tp/unique_kreai.gif",
    "unique_rollay" : "http://images.neopets.com/nq/tp/unique_rollay.gif",
    "unique_xantan" : "http://images.neopets.com/nq/tp/unique_xantan.gif",
    "water_d" : "http://images.neopets.com/nq/tp/water_d.gif",
    "water_iso" : "http://images.neopets.com/nq/tp/water_iso.gif",
    "water_l" : "http://images.neopets.com/nq/tp/water_l.gif",
    "water_ld" : "http://images.neopets.com/nq/tp/water_ld.gif",
    "water_lr" : "http://images.neopets.com/nq/tp/water_lr.gif",
    "water_lu" : "http://images.neopets.com/nq/tp/water_lu.gif",
    "water_r" : "http://images.neopets.com/nq/tp/water_r.gif",
    "water_rd" : "http://images.neopets.com/nq/tp/water_rd.gif",
    "water_ru" : "http://images.neopets.com/nq/tp/water_ru.gif",
    "water_t_d" : "http://images.neopets.com/nq/tp/water_t_d.gif",
    "water_t_l" : "http://images.neopets.com/nq/tp/water_t_l.gif",
    "water_t_r" : "http://images.neopets.com/nq/tp/water_t_r.gif",
    "water_t_u" : "http://images.neopets.com/nq/tp/water_t_u.gif",
    "water_u" : "http://images.neopets.com/nq/tp/water_u.gif",
    "water_ud" : "http://images.neopets.com/nq/tp/water_ud.gif",
    "water_x" : "http://images.neopets.com/nq/tp/water_x.gif"
};

var GM_MAPS = "AQ_extendedMap_maps"; // Our grand master 3D map grid (XY: coordinate within map, Z: which map)
var GM_MAP_NAMES = "AQ_extendedMap_mapNames"; // A 1D array of map names; each name is at corresponding Z coordinate index
var GM_PORTAL_PAIRS = "AQ_extendedMap_portalPairs"; // Stores XYZ map locations for pairs of connected portals (only stores A->Z, implies Z->A)
var GM_CURRENT_LOCATION_INDEX = "AQ_extendedMap_locationIndex"; // Which XYZ location we are on
var GM_MOVE_DIR = "AQ_extendedMap_moveDir"; // The last direction we moved (just in case we were interupted by an attack)
var GM_MOVE_LINK = "AQ_extendedMap_moveLink"; // The last portal we travelled through (just in case we were interupted by an attack)
var GM_DISPLAY_MAP = "AQ_extendedMap_displayMap"; // Whether or not our map is displayed
var GM_DISPLAY_OVERVIEW = "AQ_extendedMap_displayOverview"; // Whether or not our overview is displayed

var X = 2;
var Y = 1;
var Z = 0;

var DEFAULT_MAP_DIMENSION = 10;

// TODO: Non-blocker tiles that are actually blocker tiles cause FU
var BLOCKING_TILES = ["water_iso", "water_lu", "water_u", "water_ru", "water_l", "water_r", "water_ld", "water_d", "water_rd", 
                      "water_lr", "water_ud", "water_t_l", "water_t_r", "water_t_u", "water_t_d", "water_x",
                      "mountain", "dirt", "stone", "dungeon_pillar", "dungeon_barrel", "dungeon_crate", "dungeon_table"];

var RECONFIGURE_POSITION_MESSAGE = "Please reconfigure your character's position by using the 'Reconfigure Position' button on the bottom right.  If you need more help, make sure to check out the 'Misaligned State' section of the Wiki!";


// ================================================
// =====            CSS/JS Display            =====
// ================================================

// Allow user to control whether they are viewing the original NQ screen or our Extended Map screen
var MAP_DISPLAY_ENABLED = JSON.parse(GM_getValue(GM_DISPLAY_MAP, "false"));
var mapDiv = $('#AutoQuesterMap');
if (mapDiv.length == 0) {
    // Sometimes our Map Blackout script fails to load in time (or isn't installed!) so make the bg ourselves
    console.log("Map display blackout triggered (from Map Extender!)");
    mapDiv = $('<div></div>').attr("id", "AutoQuesterMap").css({
        "position":"fixed",
        "top":"0",
        "left":"0",
        "z-index":"10000",
        "width":"100%",
        "height":"100%",
        "background":"black"
    }).appendTo($('body'));
} 

function redisplayMap() {
    if (MAP_DISPLAY_ENABLED) {
        console.log("Map display enabled");
        mapDiv.css("display","");
        $('body').css("overflow","hidden");
    } else {
        console.log("Map display disabled");
        mapDiv.css("display","none");
        $('body').css("overflow","auto");
    }
}
redisplayMap();

// Display a series of buttons for dev purposes
var buttonDiv = $('<div></div>')
.appendTo($('body'))
.attr("id", "devButtons")
.css({
    "position":"fixed",
    "bottom":"5px",
    "right":"5px",
    "z-index":"10004"
});

function setMapExtenderEnable(isEnabled) {
    MAP_DISPLAY_ENABLED = isEnabled;
    GM_setValue(GM_DISPLAY_MAP, JSON.stringify(MAP_DISPLAY_ENABLED));
    redisplayMap();
}

function toggleMapExtender() {
    setMapExtenderEnable(!MAP_DISPLAY_ENABLED);
}

// Display a button to control the redisplay toggling of map vs original
$('<button>Toggle Map</button>').click(toggleMapExtender).appendTo($(buttonDiv));

// Display a button to all users to reconfigure position
$('<button>Reconfigure Position</button>').click(function(){
    // Create a blank div to display options on
    var optionsDiv = $('<div id="AutoQuesterOptions"></div>').attr("id", "AutoQuesterOptions").css({
        "position":"fixed",
        "top":"0",
        "left":"0",
        "z-index":"20000",
        "width":"100%",
        "height":"100%",
        "background":"black",
        "overflow":"auto"
    }).appendTo($('body'));

    // At any time, user can cancel reconfiguration
    $('<button>Cancel</button>').click(function(){
        $("#AutoQuesterOptions").remove();
    }).appendTo($("#AutoQuesterOptions"))
        .css({
        "position":"fixed",
        "bottom":"5px",
        "right":"5px",
        "z-index":"10004"
    });

    $('<div id="AutoQuesterMapSelector"></div>').css({
        "position":"fixed",
        "top":"0",
        "z-index":"20001",
        "width":"100%",
        "background":"black"
    }).appendTo($("#AutoQuesterOptions"));

    // Have user choose a map
    var maps = JSON.parse(GM_getValue(GM_MAPS, "[]"));
    var mapNames = JSON.parse(GM_getValue(GM_MAP_NAMES, "[]"));
    var portals = JSON.parse(GM_getValue(GM_PORTAL_PAIRS, "[]"));
    var currentLocation = JSON.parse(GM_getValue(GM_CURRENT_LOCATION_INDEX, "[]"));
    var mapSelector = $("<select></select>").appendTo($("#AutoQuesterMapSelector"));
    mapSelector.append($("<option>").attr('value',-1).text("--"));
    for (var i = 0; i < maps.length; i++) {
        mapSelector.append($("<option>").attr('value',i).text(mapNames[i]));
    }

    // Every time they choose a map, display it to the user
    $(mapSelector).change(function(){
        if ($(this).val() >= 0) {
            $("#AutoQuesterOptions").find("table").remove();
            var mapTopLeft = [parseInt($(this).val()),0,0];
            var map = maps[parseInt($(this).val())];
            drawMap(optionsDiv, mapTopLeft, maps, true, function(e) {
                var clickedLocation = [mapTopLeft[Z], $(this).parent("tr").index() + mapTopLeft[Y], $(this).index() + mapTopLeft[X]];
                console.log("You clicked on: " + clickedLocation);
                switch (e.which) {
                    case 1: // Left-click
                        GM_setValue(GM_CURRENT_LOCATION_INDEX, JSON.stringify(clickedLocation));
                        setMapExtenderEnable(true);
                        window.location.href = "http://www.neopets.com/games/neoquest/neoquest.phtml";
                        break;
                }
            }, function(){
            });
        }
    });

}).appendTo($(buttonDiv));

// ================================================
// =====            General Tools             =====
// ================================================

function makeArray(columns, rows, val) {
    var arr = [];
    for(var i = 0; i < rows; i++) {
        var row = [];
        for (var j = 0; j < columns; j++) {
            row.push(val);
        }
        arr.push(row);
    }
    return arr;
}

function arraysEqual(a, b) {
    //console.log("Compairing " + a + " with " + b);
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Add a jquery method to center an element within the page (vertically and horizontally based on screen size)
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, ($(window).height() - $(this).outerHeight()) / 2) + "px");
    this.css("left", Math.max(0, ($(window).width() - $(this).outerWidth()) / 2) + "px");
    return this;
}

// ================================================
// =====     Content Manipulation Helpers     =====
// ================================================

// Copies the original NQ displayed information/images onto the given map div element
function copyOriginalContent(mapDiv, mapNames, mapIndex) {
    // Find the original content of the page that we've drawn over and add it to our map area
    var contentCopy = $('div[class="contentModuleHeader"]').eq(0).next().clone();
    var contentContainer = $("<div>").appendTo($(mapDiv)).css({
        "position": "absolute",
        "width": "100%",
        "pointer-events": "none"
    });
    contentCopy.appendTo($(contentContainer));

    // Remove the duplicated form from our copy to allow links to work properly
    contentCopy.find("form[name='ff']").first().remove();
    contentCopy.find("input[name='fact']").first().remove();
    contentCopy.find("input[name='type']").first().remove();
    contentCopy.find("form[action='neoquest.phtml']").first().remove();
    contentCopy.find("input[name='action']").first().remove();
    contentCopy.find("input[name='target']").first().remove();
    contentCopy.find("input[name='say']").first().remove();
    contentCopy.find("input[name='give']").first().remove();
    contentCopy.find("input[value*='items']").on("click", function(){
        console.log($('body').find("input[value*='items']").first());
        $('body').find("input[value*='items']").first().click();
    });
    contentCopy.find("input[type=radio]").on("click", function(){
        $('body').find("input[name=" + $(this).attr('name') + "]").first().click();
    });

    // If we have a map, port over the player information/links (without the map/navigation tables)
    var mapName = $('td:contains("You are in")').text()
    mapName = mapName.substring(mapName.indexOf("You are in") + "You are in".length);
    mapName = mapName.split("the ").join("");
    mapName = mapName.substring(0, mapName.indexOf("."));

    // Allow users to show/hide the original content overview
    var OVERVIEW_DISPLAY_ENABLED = JSON.parse(GM_getValue(GM_DISPLAY_OVERVIEW, "false"));
    contentContainer.prepend($("<div id='overviewDisplay'><p style='font-size:32px;margin:1px'><b>" + mapNames[mapIndex] + "</b></p></div>").css({
        "background":"none",
        "color":"white",
        "width":"100%",
        "pointer-events": "all"
    }).on("click", function(){
        OVERVIEW_DISPLAY_ENABLED = !OVERVIEW_DISPLAY_ENABLED;
        GM_setValue(GM_DISPLAY_OVERVIEW, JSON.stringify(OVERVIEW_DISPLAY_ENABLED));
        contentCopy.slideToggle();
    }));

    // Display the area name followed by the character details (health, exp, etc)
    contentCopy.prepend($("<p style='font-size:16px;margin:1px;margin-top:0px;'><b>" + mapName + "</b></p>"));
    contentCopy.css({
        "background":"none",
        "color":"white",
        "width":"100%",
        "display": OVERVIEW_DISPLAY_ENABLED ? "block" : "none",
        "pointer-events": "all"
    });

    // Copy any 'talk to...' or 'do ...' actions out of the table into a div at the bottom of the page
    var talkContent = contentCopy.find('td:contains("You are in")').last().clone();
    console.log(talkContent);
    console.log(talkContent.html());
    talkContent.contents().filter(function() {
        return this.nodeType == 3; //Node.TEXT_NODE
    }).first().remove();
    console.log(talkContent);
    console.log(talkContent.html());
    $("<div></div>").appendTo(mapDiv).css({
        "position":"fixed",
        "width":"100%",
        "bottom":"5px",
        "align":"center",
        "color":"white"
    }).html(talkContent.html());

    // Remove the original map and navigator table from our copy of the content
    contentCopy.find("> table").remove();
}

// ================================================
// =====     Character Navigation Helpers     =====
// ================================================

// Takes previous location and which direction we moved in and calculates where the new location is
// Does not take in to account any environmental issues when moving across the map (ex blocker tiles)
function getNewLocationAfterMove(oldLocation, moveDirection) {
    // Calculate the relative coordinates given a direction to move
    var relativeCoords = [0,0,0];
    switch (moveDirection) {
        case '1': // North-West
            relativeCoords[X] += -1;
            relativeCoords[Y] += -1;
            break;
        case '2': // North
            relativeCoords[Y] += -1;
            break;
        case '3': // North-East
            relativeCoords[X] += 1;
            relativeCoords[Y] += -1;
            break;
        case '4': // West
            relativeCoords[X] += -1;
            break;
        case '5': // East
            relativeCoords[X] += 1;
            break;
        case '6': // South-West
            relativeCoords[X] += -1;
            relativeCoords[Y] += 1;
            break;
        case '7': // South
            relativeCoords[Y] += 1;
            break;
        case '8': // South-East
            relativeCoords[X] += 1;
            relativeCoords[Y] += 1;
            break;
    }

    // Using the old location as a starting point, calculate the new coordinate
    var newCoord = [0,0,0];
    newCoord[X] = oldLocation[X] + relativeCoords[X];
    newCoord[Y] = oldLocation[Y] + relativeCoords[Y];
    newCoord[Z] = oldLocation[Z];

    console.log("Calculated new coordinate: " + newCoord);
    return newCoord;
}

function moveMainCharacter(oldLocation, maps, portals) {
    var moveDir = GM_getValue(GM_MOVE_DIR, "0");
    if (moveDir >= 1) {
        GM_setValue(GM_MOVE_DIR, "0");
        var newCoord = getNewLocationAfterMove(oldLocation, moveDir);

        // Only update location if the lupe moved!
        var blockerTileIndex = BLOCKING_TILES.indexOf(maps[newCoord[0]][newCoord[1]][newCoord[2]]);
        if (blockerTileIndex < 0) {
            console.log("Next coord isn't a blocker, updating location to: " + newCoord);
            oldLocation[Z] = newCoord[Z];
            oldLocation[Y] = newCoord[Y];
            oldLocation[X] = newCoord[X];
            GM_setValue(GM_CURRENT_LOCATION_INDEX, JSON.stringify(oldLocation));
        } else {
            console.log("Next coord is a blocker <" + BLOCKING_TILES[blockerTileIndex] + ">, not updating location");
        }
    }

    // If we went through a portal, follow or create a portal link
    var moveLink = GM_getValue(GM_MOVE_LINK, "0");
    if (moveLink >= 1) {
        GM_setValue(GM_MOVE_LINK, "0");
        console.log("Detected portal move via link: " + moveLink);

        // Try to find an existing portal link with our old location
        var foundNewLocation = false;
        for (var i = 0; i < portals.length; i++) {
            var portal = portals[i];
            if (arraysEqual(portal[0], oldLocation)) {
                console.log("Following portal from " + portal[0] + " to " + portal[1]);
                oldLocation[X] = portal[1][X];
                oldLocation[Y] = portal[1][Y];
                oldLocation[Z] = portal[1][Z];
                foundNewLocation = true;
            } else if (arraysEqual(portal[1], oldLocation)) {
                console.log("Following portal from " + portal[1] + " to " + portal[0]);
                oldLocation[X] = portal[0][X];
                oldLocation[Y] = portal[0][Y];
                oldLocation[Z] = portal[0][Z];
                foundNewLocation = true;
            }
        }

        // If we didn't find a portal, create a new map 
        if (!foundNewLocation) {
            console.log("Unable to find portal, creating new map and location");
            alert("Whoops!  Looks like Map Extender couldn't find out where this portal lead to... " + RECONFIGURE_POSITION_MESSAGE);
            setMapExtenderEnable(false);
        }
    }
}


// ================================================
// =====          Map Extender Logic          =====
// ================================================

function checkForContradictions(currentLocation, maps, portals) {
    var n = 0;
    var mapDim = [$('img[src^="http://images.neopets.com/nq/t"]').closest("tr").length, $('img[src^="http://images.neopets.com/nq/t"]').closest("tr").eq(0).find("td").length - 2];
    console.log("Map dim: " + mapDim);
    var halfMapSize = [Math.floor(mapDim[0]/2), Math.floor(mapDim[1]/2)];
    console.log("halfMapSize: " + halfMapSize);
    var topLeftCoord = [currentLocation[0], currentLocation[1] - halfMapSize[0], currentLocation[2] - halfMapSize[1]];
    var bottomRightCoord = [currentLocation[0], currentLocation[1] + halfMapSize[0], currentLocation[2] + halfMapSize[1]];
    console.log("topLeftCoord: " + topLeftCoord);
    console.log("bottomRightCoord: " + bottomRightCoord);
    
    console.log("Top left coord from current position: " + topLeftCoord);
    $('img[src^="http://images.neopets.com/nq/t"]').each(function(){
        var currentRow = topLeftCoord[Y] + Math.floor(n / mapDim[1]);
        var currentColumn = topLeftCoord[X] + (n % mapDim[1]);
        var newTile = $(this).attr('src').substring($(this).attr('src').lastIndexOf("/") + 1, $(this).attr('src').lastIndexOf("."));

        // If our current position isn't a contradiction nor the 'lupe' tile....
        if (newTile.indexOf("lupe") < 0) {
            if (maps[topLeftCoord[Z]][currentRow][currentColumn] != "" && maps[topLeftCoord[Z]][currentRow][currentColumn] != undefined && maps[topLeftCoord[Z]][currentRow][currentColumn].indexOf("unique_") < 0 && maps[topLeftCoord[Z]][currentRow][currentColumn] != newTile) {
                console.log("Found a contradiction in map entries, aborting");
                return false;
            } else {
                // Fill in the tile with our new information
                maps[topLeftCoord[Z]][currentRow][currentColumn] = maps[topLeftCoord[Z]][currentRow][currentColumn] || newTile;
            }
        }
        n++;
    });

    // If a contradiction was found, we need to alert the user to reconfigure
    if (n < $('img[src^="http://images.neopets.com/nq/t"]').length - 1) {
        // Create a new blank map and move current location to the new map (let the player/user reconfigure position or blend maps)
        console.log("Detected map contradiction, alerting user to reconfigure");
        alert("Whoops!  Looks like Map Extender got a little confused as to where you are. " + RECONFIGURE_POSITION_MESSAGE);
        setMapExtenderEnable(false);
        return true;
    }
    return false;
}

function drawMap(mapDiv, currentLocation, maps, drawFullMap, mouseDownHandler) {
    drawFullMap = drawFullMap || false;
    var map = maps[currentLocation[Z]];

    if (drawFullMap) {
        console.log("Drawing full map: " + currentLocation[Z]);
    } else {
        console.log("Drawing visible map: " + currentLocation[Z]); 
    }

    // Initialize displayed map size to full map image
    var table = $("<table cellspacing='0' cellpadding='0'></table>").appendTo($(mapDiv)).css("border","none");
    var tileWidth = $('img[src^="http://images.neopets.com/nq/t"]').eq(0).width();
    var mapTopLeft = currentLocation;
    var numOfRows = map.length - mapTopLeft[Y];
    var numOfColumns = map[0].length - mapTopLeft[X];

    // If we aren't drawing a full map, instead base size off of what is visible on the screen
    if (!drawFullMap) {
        numOfRows = Math.ceil($(window).height() / tileWidth);
        numOfColumns = Math.ceil($(window).width() / tileWidth);
        mapTopLeft = [currentLocation[0], currentLocation[1] - Math.floor(numOfRows/2), currentLocation[2] - Math.floor(numOfColumns/2)];
    }

    // Draw the seeable map range
    console.log("Drawing map with <" + numOfRows + "> rows and <" + numOfColumns + "> columns");
    console.log("Map top left: " + mapTopLeft);
    var lupeImage = $('img[src^="http://images.neopets.com/nq/tl/lupe"]').eq(0);
    for (var row = 0; row < numOfRows; row++) {
        var tr = $("<tr></tr>").appendTo($(table));
        for (var col = 0; col < numOfColumns; col++) {
            var td = $("<td></td>").appendTo($(tr)).mousedown(mouseDownHandler); 
            if (mapTopLeft[Y] + row < 0 || mapTopLeft[X] + col < 0 || mapTopLeft[Y] + row >= maps[mapTopLeft[Z]].length || mapTopLeft[X] + col >= maps[mapTopLeft[Z]][mapTopLeft[Y] + row].length) {
                $(td).append("<div style='border-style:none;width:" + tileWidth + "px;height:" + tileWidth + "px' />");
            } else {
                var coord = [mapTopLeft[Z], mapTopLeft[Y] + row, mapTopLeft[X] + col];
                var image = maps[coord[0]][coord[1]][coord[2]];
                if (arraysEqual(currentLocation, coord) && !drawFullMap) {
                    $(td).append("<img src='" + lupeImage.attr('src') + "' />");
                } else if (image != "" && image != undefined) {
                    $(td).append("<img src='" + TILE_OPTIONS[image] + "'/>");
                } else {
                    $(td).append("<div style='border-style:none;width:" + tileWidth + "px;height:" + tileWidth + "px' />");
                }
            }
        }
    }

    // If drawing a full map, scroll to center
    if (drawFullMap) {
        $(mapDiv).scrollTop(tileWidth * numOfRows * 0.5);
        $(mapDiv).scrollLeft(tileWidth * numOfColumns * 0.5);
    }

    console.log("Done drawing map");
}

// Detect which direction we moved (we may have been interupted by a battle/etc, so store it for later!)
if (window.location.href.indexOf("action=move&movedir=") >= 0) {
    GM_setValue(GM_MOVE_DIR, window.location.href.slice(-1));
} else if (window.location.href.indexOf("action=move&movelink=") >= 0) {
    GM_setValue(GM_MOVE_LINK, window.location.href.substring(window.location.href.lastIndexOf("=")+1));
} 

// Load our map information
var maps = JSON.parse(GM_getValue(GM_MAPS, "[]"));
var mapNames = JSON.parse(GM_getValue(GM_MAP_NAMES, "[]"));
var portals = JSON.parse(GM_getValue(GM_PORTAL_PAIRS, "[]"));
var location = JSON.parse(GM_getValue(GM_CURRENT_LOCATION_INDEX, "[]"));
console.log("Portals:");
console.log(portals);

// If we have no data, turn off mapping
if (maps.length == 0 || mapNames.length == 0 || portals.length == 0) {
    console.log("Detected empty map data, alerting user and disabling map extender");
    alert("Whoops!  Looks like Map Extender can't find any map data, make sure you've imported a MapExtender.storage.json file in order to use this script!");
    setMapExtenderEnable(false);
} else if (location.length == 0) {
    console.log("Detected empty location data");
    alert("Whoops!  Looks like Map Extender can't figure out where your character is.  " + RECONFIGURE_POSITION_MESSAGE);
    setMapExtenderEnable(false);
}

// Using stored move direction/links, update our characters location
moveMainCharacter(location, maps, portals);

// Determine if we draw our own map and redisplay the original content
if ($('img[src^="http://images.neopets.com/nq/t"]').length == 0) {
    // Hide the map and just show a regular neoquest page for non-map pages
    mapDiv.css("display","none");
    $('body').css("overflow","auto");

    // Also hide the buttons, they won't have any effect anyways
    $("#devButtons").css("display","none");
} else {
    // Make sure we are aligned with the original NQ map
    if (!checkForContradictions(location, maps, portals)) {
        copyOriginalContent(mapDiv, mapNames, location[Z]);
        drawMap(mapDiv, location, maps);
    }
}

// DEV: Print out all our stored data
console.log("Maps:");
console.log(maps);
console.log("Portals:");
console.log(portals);
console.log("Location:");
console.log(location);