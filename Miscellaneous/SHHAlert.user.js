// ==UserScript==
// @name         AutoHelper - SHH Alert
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

if ($('div.randomEvent').length > 0 || $('img[src^="http://images.neopets.com/shh/"]').length > 0) {
    alert("Something has happened!");
}