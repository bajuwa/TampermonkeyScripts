// ==UserScript==
// @name         AutoHelper - Event Relocater
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       bajuwa
// @match        http://www.neopets.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery;

if ($('img[src*="http://images.neopets.com/themes/"][src*="/events/"]').length > 0) {
    $('img[src*="http://images.neopets.com/themes/"][src*="/events/"]').closest("td").appendTo($("<div>").css({
        "position":"fixed",
        "left":0,
        "top":0,
        "background":"black",
        "padding":"5px"
    }).appendTo($("body")));
}