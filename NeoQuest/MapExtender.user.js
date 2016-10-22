// ==UserScript==
// @name         AutoQuester - Extended Map
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       bajuwa
// @match        http://www.neopets.com/games/neoquest/neoquest.phtml*
// @run-at       document-end
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==
/* jshint -W097 */
'use strict';

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

GM_setValue(GM_MAP_NAMES, JSON.stringify([
    "Temple of Roo, Level 2",
    "Techo Cave 1",
    "Techo Cave 2",
    "Techo Cave 4",
    "Techo Cave 3",
    "Techo Cave 5",
    "Techo Cave 6",
    "Mountain Fortress",
    "Techo Cave 7",
    "Two Rings Cave",
    "Kal Panning (initial)",
    "Kal Panning (restored)",
    "Ancient Neopia",
    "Two Rings Palace, Level 1",
    "Two Rings Palace, Level 2",
    "Two Rings Palace, Level 3",
    "Dank Cave, Level 2",
    "Dank Cave, Level 3",
    "Dank Cave, Level 4",
    "Dank Cave, Level 1",
    "Jungle Ruins, Dungeon Level 1",
    "Jungle Ruins, Gors' Garden",
    "Jungle Ruins, Dungeon Level 2",
    "Jungle Ruins, Tower Level 1",
    "Jungle Ruins, Dungeon Level 3",
    "Jungle Ruins, Tower Level 2",
    "Jungle Ruins, Tower Level 3",
    "Jungle Ruins, Tower Level 4",
    "Jungle Ruins, Tower Level 5",
    "Jungle Ruins, Base Level",
    "Temple of Roo, Level 1"
]));

// TODO: Non-blocker tiles that are actually blocker tiles cause FU
var BLOCKING_TILES = ["water_iso", "water_lu", "water_u", "water_ru", "water_l", "water_r", "water_ld", "water_d", "water_rd", 
                      "water_lr", "water_ud", "water_t_l", "water_t_r", "water_t_u", "water_t_d", "water_x",
                      "mountain", "dirt", "stone", "dungeon_pillar", "dungeon_barrel", "dungeon_crate", "dungeon_table"];

function trimMap(map) {
    var trimmed = [0,0];

    // Trim empty top rows
    var empty = true;
    while (empty) {
        for (var c = 0; c < map[0].length; c++) {
            if (map[0][c] != "" && map[0][c] != undefined) {
                empty = false;
                break;
            }
        }
        if (empty) {
            map.splice(0,1);
            trimmed[0]++;
        }
    }

    // Trim empty bottom rows
    empty = true;
    while (empty) {
        for (var c = 0; c < map[map.length-1].length; c++) {
            if (map[map.length-1][c] != "" && map[map.length-1][c] != undefined) {
                empty = false;
                break;
            }
        }
        if (empty) {
            map.splice(map.length-1,1);
        }
    }

    // Trim empty left columns
    empty = true;
    var numOfEmptyColumns = 0;
    while (empty) {
        for (var r = 0; r < map.length; r++) {
            if (map[r][numOfEmptyColumns] != "" && map[r][numOfEmptyColumns] != undefined) {
                empty = false;
                break;
            }
        }
        if (empty) {
            numOfEmptyColumns++;
        }
    }
    for (var r = 0; r < map.length; r++) {
        map[r].splice(0,numOfEmptyColumns);
    }
    trimmed[1] += numOfEmptyColumns;

    // Trim empty right columns
    empty = true;
    numOfEmptyColumns = 0;
    while (empty) {
        for (var r = 0; r < map.length; r++) {
            if (map[r][map[r].length - numOfEmptyColumns - 1] != "" && map[r][map[r].length - numOfEmptyColumns - 1] != undefined) {
                empty = false;
                break;
            }
        }
        if (empty) {
            numOfEmptyColumns++;
        }
    }
    for (var r = 0; r < map.length; r++) {
        map[r].splice(map[r].length - numOfEmptyColumns,numOfEmptyColumns);
    }

    return trimmed;
}

function blendMaps(originalMap, originalMapLocation, additionalMap, additionalMapLocation, forceBlend) {
    console.log("Blending map location " + originalMapLocation + " with other location " + additionalMapLocation);
    var maps = JSON.parse(GM_getValue(GM_MAPS, "[]"));
    var portals = JSON.parse(GM_getValue(GM_PORTAL_PAIRS, "[]"));

    // Create a new map that is big enough to fit both maps
    var newMapSize = [(originalMap.length + additionalMap.length)*2, (originalMap[0].length + additionalMap[0].length)*2];
    console.log("New map of size: " + newMapSize);

    // Calculate a new position that is in the center of our new map
    var newMapLocation = [maps.length, Math.floor(newMapSize[0]/2), Math.floor(newMapSize[1]/2)];
    console.log("New Map Location: " + newMapLocation);

    // Iterate over all rows and columns of the new map, filling it in with details from both maps
    var newMap = [];
    var originalImageOffset = [newMapLocation[Y] - originalMapLocation[Y], newMapLocation[X] - originalMapLocation[X]];
    var additionalImageOffset = [newMapLocation[Y] - additionalMapLocation[Y], newMapLocation[X] - additionalMapLocation[X]];
    console.log("Original Image Offset: " + originalImageOffset);
    console.log("Additional Image Offset: " + additionalImageOffset);
    for (var r = 0; r < newMapSize[0]; r++) {
        newMap.push([]);
        for (var c = 0; c < newMapSize[1]; c++) {
            var originalImage = "";
            var additionalImage = "";

            // Check if each map is 'in range' and grab its image
            if (r >= originalImageOffset[0] && c >= originalImageOffset[1] && r < (originalImageOffset[0] + originalMap.length) && c < (originalImageOffset[1] + originalMap[0].length)) {
                originalImage = originalMap[r - originalImageOffset[0]][c - originalImageOffset[1]];
                //console.log("Found original image: " + originalImage);
            }
            if (r >= additionalImageOffset[0] && c >= additionalImageOffset[1] && r < (additionalImageOffset[0] + additionalMap.length) && c < (additionalImageOffset[1] + additionalMap[0].length)) {
                additionalImage = additionalMap[r - additionalImageOffset[0]][c - additionalImageOffset[1]];
                //console.log("Found additional image: " + additionalImage);
            }

            // If both images are not empty and different, we have misaligned maps and must abort
            if (!forceBlend && originalImage != "" && additionalImage != "" && originalImage != undefined && additionalImage != undefined && originalImage != additionalImage) {
                console.log("Found a contradiction between map images at new Image location " + [r,c] + ", aborting blend");
                return false;
            } else {
                if (originalImage != "" && originalImage != undefined) {
                    newMap[r].push(originalImage);
                } else {
                    newMap[r].push(additionalImage);
                }
                //console.log("Chose new image: " + newMap[r][c]);
            }
        }
    }
    console.log("Done initial blend, trimming excess....");

    // Trim off any excess empty rows/columns
    var amountTrimmed = trimMap(newMap);
    console.log("Done trimming, configuring new locations....");

    console.log("Original new map location before trimming: " + newMapLocation);
    newMapLocation[Y] -= amountTrimmed[0];
    newMapLocation[X] -= amountTrimmed[1];
    console.log("New map location trimmed to: " + newMapLocation);

    // Add the new map to our set of maps, keeping both old maps
    if (maps.length > originalMapLocation[Z] && maps.length > additionalMapLocation[Z]) {
        maps.push(newMap);

        // Find old portals for both maps and add them as new portal pais to new map
        for (var p = 0; p < portals.length; p++) {
            var portal = portals[p];
            for (var pair = 0; pair < portal.length; pair++) {
                if (portal[pair][Z] == originalMapLocation[Z]) {
                    portal[pair][Z] = maps.length-1;
                    portal[pair][X] = portal[pair][X] + originalImageOffset[1] - amountTrimmed[1];
                    portal[pair][Y] = portal[pair][Y] + originalImageOffset[0] - amountTrimmed[0];
                } else if (portal[pair][Z] == additionalMapLocation[Z]) {
                    portal[pair][Z] = maps.length-1;
                    portal[pair][X] = portal[pair][X] + additionalImageOffset[1] - amountTrimmed[1];
                    portal[pair][Y] = portal[pair][Y] + additionalImageOffset[0] - amountTrimmed[0];
                }
            }
        }

        // Save the maps and portals
        GM_setValue(GM_MAPS, JSON.stringify(maps));
        GM_setValue(GM_PORTAL_PAIRS, JSON.stringify(portals));
        GM_setValue(GM_CURRENT_LOCATION_INDEX, JSON.stringify(newMapLocation));
        console.log("Done!");
        return true;
    }
}


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

// Display a button to control the redisplay toggling of map vs original
$('<button>Toggle Map</button>').click(function(){
    MAP_DISPLAY_ENABLED = !MAP_DISPLAY_ENABLED;
    GM_setValue(GM_DISPLAY_MAP, JSON.stringify(MAP_DISPLAY_ENABLED));
    redisplayMap();
}).appendTo($(buttonDiv));

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

    // Allow them to delete the chosen map
    $('<button>Delete Map</button>').click(function(){
        // Don't let the user try to delete the map they are currently on
        if ($(mapSelector).val() >= 0 && currentLocation.length > 0 && currentLocation[Z] != $(mapSelector).val()) {
            maps.splice($(mapSelector).val(), 1);
            GM_setValue(GM_MAPS, JSON.stringify(maps));

            // If we deleted a map index before our location, make adjustments
            if (currentLocation[Z] > $(mapSelector).val()) {
                currentLocation[Z]--;
                GM_setValue(GM_CURRENT_LOCATION_INDEX, JSON.stringify(currentLocation));
            }

            // Adjust all portals
            for (var p = 0; p < portals.length; p++) {
                var portal = portals[p];
                for (var pair = 0; pair < portal.length; pair++) {
                    if (portal[pair][Z] == $(mapSelector).val()) {
                        // If we deleted a map containing a portal, delete the entire pair
                        portals.splice(pair,1);
                        p--;
                        break;
                    } else if (portal[pair][Z] > $(mapSelector).val()) {
                        // If we deleted a map index before any portal location, make adjustments
                        portal[pair][Z]--;
                    }
                }
            }
            GM_setValue(GM_PORTAL_PAIRS, JSON.stringify(portals));

            $("#AutoQuesterOptions").remove();
        }
    }).appendTo($("#AutoQuesterMapSelector"))

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
                        window.location.href = "http://www.neopets.com/games/neoquest/neoquest.phtml";
                        break;
                    case 2: // Middle Click
                        if (blendMaps(maps[currentLocation[Z]], currentLocation, map, clickedLocation, true)) {
                            $("#AutoQuesterOptions").remove();
                            window.location.href = "http://www.neopets.com/games/neoquest/neoquest.phtml";
                        }
                        break;
                    case 3: // Right Click
                        if (blendMaps(maps[currentLocation[Z]], currentLocation, map, clickedLocation, false)) {
                            $("#AutoQuesterOptions").remove();
                            window.location.href = "http://www.neopets.com/games/neoquest/neoquest.phtml";
                        }
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
    contentContainer.prepend($("<div><p style='font-size:32px;margin:1px'><b>" + mapNames[mapIndex] + "</b></p></div>").css({
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

// Create a new empty map and choose a default position within the map
function createNewMapAndLocation(existingMaps, currentLocation, dimension) {
    existingMaps.push(makeArray(dimension, dimension, ""));
    GM_setValue(GM_MAPS, JSON.stringify(existingMaps));

    // Place our current location in the middle of that map
    currentLocation[X] = Math.floor(dimension/2);
    currentLocation[Y] = Math.floor(dimension/2);
    currentLocation[Z] = existingMaps.length - 1;
    GM_setValue(GM_CURRENT_LOCATION_INDEX, JSON.stringify(currentLocation));
}

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
            portals.push([ [oldLocation[0], oldLocation[1], oldLocation[2]] ]);
            createNewMapAndLocation(maps, oldLocation, DEFAULT_MAP_DIMENSION);
            portals[portals.length-1].push([oldLocation[0], oldLocation[1], oldLocation[2]]);
            GM_setValue(GM_PORTAL_PAIRS, JSON.stringify(portals));
        }
    }
}

// ================================================
// =====       Map Manipulation Methods       =====
// ================================================

function extendMapVerticallyUp(map, extendBy, mapLocation, portals) {
    for (var j = 0; j < extendBy; j++) {
        var newRow = [];
        for (var k = 0; k < map[0].length; k++) {
            newRow.push("");
        }
        map.unshift(newRow);
    }

    mapLocation[Y] += extendBy;
    for (var p = 0; p < portals.length; p++) {
        for (var pair = 0; pair < portals[p].length; pair++) {
            if (portals[p][pair][Z] == mapLocation[Z]) {
                portals[p][pair][Y] += extendBy;
            }
        }
    }
}

function extendMapHorizontallyLeft(map, extendBy, mapLocation, portals) {
    for (var r = 0; r < map.length; r++) {
        for (var c = 0; c < extendBy; c++) {
            map[r].unshift("");
        }
    }

    mapLocation[X] += extendBy;
    for (var p = 0; p < portals.length; p++) {
        for (var pair = 0; pair < portals[p].length; pair++) {
            if (portals[p][pair][Z] == mapLocation[Z]) {
                portals[p][pair][X] += extendBy;
            }
        }
    }
}

function extendMapVerticallyDown(map, extendBy) {
    for (var j = 0; j < extendBy; j++) {
        var newRow = [];
        for (var k = 0; k < map[0].length; k++) {
            newRow.push("");
        }
        map.push(newRow);
    }
}

function extendMapHorizontallyRight(map, extendBy) {
    for (var r = 0; r < map.length; r++) {
        for (var c = 0; c < extendBy; c++) {
            map[r].push("");
        }
    }
}

function updateMap(currentLocation, maps, portals) {
    var n = 0;
    var mapDim = [$('img[src^="http://images.neopets.com/nq/t"]').closest("tr").length, $('img[src^="http://images.neopets.com/nq/t"]').closest("tr").eq(0).find("td").length - 2];
    console.log("Map dim: " + mapDim);
    var halfMapSize = [Math.floor(mapDim[0]/2), Math.floor(mapDim[1]/2)];
    console.log("halfMapSize: " + halfMapSize);
    var topLeftCoord = [currentLocation[0], currentLocation[1] - halfMapSize[0], currentLocation[2] - halfMapSize[1]];
    var bottomRightCoord = [currentLocation[0], currentLocation[1] + halfMapSize[0], currentLocation[2] + halfMapSize[1]];
    console.log("topLeftCoord: " + topLeftCoord);
    console.log("bottomRightCoord: " + bottomRightCoord);

    // If our location is close to the top/left edges of our map, extend the map
    if (topLeftCoord[Y] < 0) {
        console.log("New rows needed");
        extendMapVerticallyUp(maps[currentLocation[Z]], 0 - topLeftCoord[Y], currentLocation, portals);
        topLeftCoord[Y] = 0;
    } else if (bottomRightCoord[Y] >= maps[currentLocation[Z]].length) {
        extendMapVerticallyDown(maps[currentLocation[Z]], bottomRightCoord[Y] - maps[currentLocation[Z]].length + 1);
    }

    if (topLeftCoord[X] < 0) {
        console.log("New columns needed");
        extendMapHorizontallyLeft(maps[currentLocation[Z]], 0 - topLeftCoord[X], currentLocation, portals);
        topLeftCoord[X] = 0;
    } else if (bottomRightCoord[X] >= maps[currentLocation[Z]][0].length) {
        extendMapHorizontallyRight(maps[currentLocation[Z]], bottomRightCoord[X] - maps[currentLocation[Z]][0].length + 1);
    }

    // Save Changes
    GM_setValue(GM_MAPS, JSON.stringify(maps));
    GM_setValue(GM_PORTAL_PAIRS, JSON.stringify(portals));
    GM_setValue(GM_CURRENT_LOCATION_INDEX, JSON.stringify(currentLocation));

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

    if (n < $('img[src^="http://images.neopets.com/nq/t"]').length - 1) {
        // Create a new blank map and move current location to the new map (let the player/user reconfigure position or blend maps)
        console.log("Creaing new map, number of images found too small: " + n);
        createNewMapAndLocation(maps, currentLocation, Math.max(mapDim[0], mapDim[1]));
        updateMap(currentLocation, maps, portals);
    } else {
        GM_setValue(GM_MAPS, JSON.stringify(maps));
    }
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
                    $(td).append("<img src='http://images.neopets.com/nq/tp/" + image + ".gif' />");
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


// ================================================
// =====          Map Extender Logic          =====
// ================================================

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

// If we have no data, create some initial data
if (maps.length == 0 || location.length == 0) {
    console.log("Detected empty map data, resetting stored data");

    // Create an empty map
    maps = [];
    createNewMapAndLocation(maps, location, DEFAULT_MAP_DIMENSION);
}

// Using stored move direction/links, update our characters location
moveMainCharacter(location, maps, portals);

// Detect inner 5x5 images and update known images if necessary (overwrite old images)
updateMap(location, maps, portals);

// Determine if we draw our own map and redisplay the original content
if ($('img[src^="http://images.neopets.com/nq/t"]').length == 0) {
    // Hide the map and just show a regular neoquest page for non-map pages
    mapDiv.css("display","none");
    $('body').css("overflow","auto");

    // Also hide the buttons, they won't have any effect anyways
    $("#devButtons").css("display","none");

    // Since we have no map to draw, abort further action
    return;
} else {
    copyOriginalContent(mapDiv, mapNames, location[Z]);
    drawMap(mapDiv, location, maps);
}


// DEV: Print out all our stored data
console.log("Maps:");
console.log(maps);
console.log("Portals:");
console.log(portals);
console.log("Location:");
console.log(location);