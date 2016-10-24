// ==UserScript==
// @name         AutoQuester - Map Modder
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

var X = 2;
var Y = 1;
var Z = 0;


// ================================================
// =====            CSS/JS Display            =====
// ================================================

// Allow user to control whether they are viewing the original NQ screen or our Extended Map screen
var mapDiv = $('#AutoQuesterMapModder');
if (mapDiv.length == 0) {
    // Sometimes our Map Blackout script fails to load in time (or isn't installed!) so make the bg ourselves
    console.log("Map display blackout triggered (from Map Modder!)");
    mapDiv = $('<div></div>').attr("id", "AutoQuesterMapModder").css({
        "position":"fixed",
        "top":"0",
        "left":"0",
        "z-index":"10000",
        "width":"100%",
        "height":"100%",
        "background":"black",
        "overflow":"auto"
    }).appendTo($('body'));
} 

function redisplayMap() {
    console.log("Map display enabled");
    mapDiv.css("display","");
    $('body').css("overflow","hidden");
}
redisplayMap();

// Display a series of buttons for dev purposes
var buttonDiv = $('<div></div>')
.appendTo($('body'))
.attr("id", "devButtons")
.css({
    "position":"fixed",
    "top":"5px",
    "right":"5px",
    "height":"90%",
    "overflow":"auto",
    "z-index":"10004",
    "color":"white",
    "text-align":"left"
});

// Display a button to control the redisplay toggling of map vs original
$('<button>Set All Empty Tiles</button>').click(function(){
    var maps = JSON.parse(GM_getValue(GM_MAPS, "[]"));
    var currentMap = $('#AutoQuesterMapModderSelector').find(":selected").val();
    for (var y = 0; y < maps[currentMap].length; y++) {
        for (var x = 0; x < maps[currentMap][y].length; x++) {
            if (maps[currentMap][y][x] == "" || maps[currentMap][y][x] == undefined) {
                maps[currentMap][y][x] = TILE_OPTIONS[selectedTile];
            }
        }
    }
    GM_setValue(GM_MAPS, JSON.stringify(maps));
    drawMap(mapDiv, [currentMap,0,0], maps);
}).appendTo($(buttonDiv));
for (var key in TILE_OPTIONS) {
    console.log("adding: " + TILE_OPTIONS[i]);
    $(buttonDiv).append($('<br><input type=radio name=tile-selection value=' + key + '>' + key + '</input>').prop('checked', false).on('click', function(){
        selectedTile = $(this).attr('value');
        console.log(selectedTile);
    }));
}

// Create a blank div to display options on
var selectedTile = "";
var optionsDiv = $('<div id="AutoQuesterOptions"></div>').attr("id", "AutoQuesterOptions").css({
    "position":"fixed",
    "top":"0",
    "left":"0",
    "z-index":"10002",
    "width":"100%",
    "background":"black",
    "overflow":"auto"
}).appendTo($('body'));

$('<div id="AutoQuesterMapModderSelector"></div>').css({
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
var mapSelector = $("<select></select>").appendTo($("#AutoQuesterMapModderSelector"));
mapSelector.append($("<option>").attr('value',-1).text("--"));
for (var i = 0; i < maps.length; i++) {
    mapSelector.append($("<option>").attr('value',i).text(mapNames[i]));
}

// Every time they choose a map, display it to the user
$(mapSelector).change(function(){
    if ($(this).val() >= 0) {
        $(mapDiv).find("table").remove();
        drawMap(mapDiv, [parseInt($(this).val()),0,0]);
    }
});

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
// =====          Map Extender Logic          =====
// ================================================

function drawMap(mapDiv, currentLocation) {
    var maps = JSON.parse(GM_getValue(GM_MAPS, "[]"));
    var map = maps[currentLocation[Z]];

    console.log("Drawing full map: " + currentLocation[Z]);

    // Initialize displayed map size to full map image
    $(mapDiv).empty();
    var table = $("<table cellspacing='0' cellpadding='0'></table>").appendTo($(mapDiv)).css("border","none");
    var tileWidth = $('img[src^="http://images.neopets.com/nq/t"]').eq(0).width();
    var mapTopLeft = currentLocation;
    var numOfRows = map.length - mapTopLeft[Y];
    var numOfColumns = map[0].length - mapTopLeft[X];

    // Draw the seeable map range
    console.log("Drawing map with <" + numOfRows + "> rows and <" + numOfColumns + "> columns");
    console.log("Map top left: " + mapTopLeft);
    for (var row = 0; row < numOfRows; row++) {
        var tr = $("<tr></tr>").appendTo($(table));
        for (var col = 0; col < numOfColumns; col++) {
            var td = $("<td></td>").appendTo($(tr)).mousedown(function() {
                maps = JSON.parse(GM_getValue(GM_MAPS, "[]"));
                maps[currentLocation[Z]][$(this).parent("tr").index()][$(this).index()] = TILE_OPTIONS[selectedTile];
                $(this).empty();
                $(this).append("<img src='" + TILE_OPTIONS[selectedTile] + "' />");
                GM_setValue(GM_MAPS, JSON.stringify(maps));
            });
            if (mapTopLeft[Y] + row < 0 || mapTopLeft[X] + col < 0 || mapTopLeft[Y] + row >= maps[mapTopLeft[Z]].length || mapTopLeft[X] + col >= maps[mapTopLeft[Z]][mapTopLeft[Y] + row].length) {
                $(td).append("<div style='border-style:none;width:" + tileWidth + "px;height:" + tileWidth + "px' />");
            } else {
                var coord = [mapTopLeft[Z], mapTopLeft[Y] + row, mapTopLeft[X] + col];
                var image = maps[coord[0]][coord[1]][coord[2]];
                if (image.length > 0 && image.indexOf("http") < 0) {
                    image = "http://images.neopets.com/nq/tp/" + image + ".gif";
                    maps[coord[0]][coord[1]][coord[2]] = image;
                    console.log(image);
                }
                if (image != "" && image != undefined) {
                    $(td).append("<img src='" + image + "' />");
                } else {
                    $(td).append("<div style='border-style:none;width:" + tileWidth + "px;height:" + tileWidth + "px' />");
                }
            }
        }
    }
    GM_setValue(GM_MAPS, JSON.stringify(maps));
    maps = JSON.parse(GM_getValue(GM_MAPS, "[]"));

    // If drawing a full map, scroll to center
    $(mapDiv).scrollTop(tileWidth * numOfRows * 0.5);
    $(mapDiv).scrollLeft(tileWidth * numOfColumns * 0.5);

    console.log("Done drawing map");
}

// Load our map information
var maps = JSON.parse(GM_getValue(GM_MAPS, "[]"));
var mapNames = JSON.parse(GM_getValue(GM_MAP_NAMES, "[]"));
var portals = JSON.parse(GM_getValue(GM_PORTAL_PAIRS, "[]"));
console.log("Portals:");
console.log(portals);

// If we have no data, turn off mapping
if (maps.length == 0 || mapNames.length == 0 || portals.length == 0) {
    console.log("Detected empty map data, alerting user and disabling map extender");
    alert("Whoops!  Looks like Map Modder can't find any map data, make sure you've imported a MapModder.storage.json file in order to use this script!");
}

// Determine if we draw our own map and redisplay the original content
drawMap(mapDiv, [0,0,0]);

// DEV: Print out all our stored data
console.log("Maps:");
console.log(maps);
console.log("Portals:");
console.log(portals);
console.log("Location:");
console.log(location);