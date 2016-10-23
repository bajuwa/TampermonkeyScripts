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
        "background":"black"
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
    "z-index":"10004",
    "color":"white"
});

// Display a button to control the redisplay toggling of map vs original
var TILE_OPTIONS = ["water", "dirt"];
for (i = 0; i < TILE_OPTIONS.length; i++) {
    console.log("adding: " + TILE_OPTIONS[i]);
    $(buttonDiv).append($('<input type=radio name=tile-selection value=' + TILE_OPTIONS[i] + '>' + TILE_OPTIONS[i] + '</input><br>').prop('checked', false).on('click', function(){
        selectedTile = $(this).attr('value');
        console.log(selectedTile);
    }));
}
$('<button>Set All Empty Tiles</button>').click(function(){

}).appendTo($(buttonDiv));

// Create a blank div to display options on
var selectedTile = "";
var optionsDiv = $('<div id="AutoQuesterOptions"></div>').attr("id", "AutoQuesterOptions").css({
    "position":"fixed",
    "top":"0",
    "left":"0",
    "z-index":"10002",
    "width":"100%",
    "height":"100%",
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
        $("#AutoQuesterOptions").find("table").remove();
        var mapTopLeft = [parseInt($(this).val()),0,0];
        var map = maps[parseInt($(this).val())];
        drawMap(optionsDiv, mapTopLeft, maps);
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
// =====     Content Manipulation Helpers     =====
// ================================================

// TODO

// ================================================
// =====          Map Extender Logic          =====
// ================================================

function drawMap(mapDiv, currentLocation, maps) {
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
                maps[currentLocation[Z]][$(this).parent("tr").index()][$(this).index()] = selectedTile;
                GM_setValue(GM_MAPS, JSON.stringify(maps));
                drawMap(mapDiv, currentLocation, JSON.parse(GM_getValue(GM_MAPS, "[]")));
            }); 
            if (mapTopLeft[Y] + row < 0 || mapTopLeft[X] + col < 0 || mapTopLeft[Y] + row >= maps[mapTopLeft[Z]].length || mapTopLeft[X] + col >= maps[mapTopLeft[Z]][mapTopLeft[Y] + row].length) {
                $(td).append("<div style='border-style:none;width:" + tileWidth + "px;height:" + tileWidth + "px' />");
            } else {
                var coord = [mapTopLeft[Z], mapTopLeft[Y] + row, mapTopLeft[X] + col];
                var image = maps[coord[0]][coord[1]][coord[2]];
                if (image != "" && image != undefined) {
                    $(td).append("<img src='http://images.neopets.com/nq/tp/" + image + ".gif' />");
                } else {
                    $(td).append("<div style='border-style:none;width:" + tileWidth + "px;height:" + tileWidth + "px' />");
                }
            }
        }
    }

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
drawMap(mapDiv, [0,0,0], maps);

// DEV: Print out all our stored data
console.log("Maps:");
console.log(maps);
console.log("Portals:");
console.log(portals);
console.log("Location:");
console.log(location);