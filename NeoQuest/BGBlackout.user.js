// ==UserScript==
// @name         AutoQuester - Map Blackout
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Blacks out the page as early as possible
// @author       bajuwa
// @match        http://www.neopets.com/games/neoquest/neoquest.phtml*
// @run-at       document-body
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

var i = setInterval(function(){
    if (document.getElementById('AutoQuesterMap') == null) {
        console.log("Map display blackout triggered");
        var mapDiv = document.createElement('div');
        mapDiv.id = 'AutoQuesterMap';
        mapDiv.style["position"] = "fixed";
        mapDiv.style["top"] = "0";
        mapDiv.style["left"] = "0";
        mapDiv.style["z-index"] = "10000";
        mapDiv.style["width"] = "100%";
        mapDiv.style["height"] = "100%";
        mapDiv.style["background"] = "black";
        document.getElementsByTagName('body')[0].appendChild(mapDiv);
    } else {
        clearInterval(i);
    }
},100);
