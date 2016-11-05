// ==UserScript==
// @name         AutoQuester - Battle Animator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       bajuwa
// @match        http://www.neopets.com/games/neoquest/neoquest.phtml*
// @run-at       document-end
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

if ($('img[src="http://images.neopets.com/nq/n/lupe_combat.gif"]').length == 0) {
    return;
}

// ================================================
// =====         Custom URL Tracking          =====
// ================================================

var bodyData = $(".contentModule");
var currentWindowUrlDiv;
if ($("#AutoQuesterCustomUrlModifier").length > 0) {
    currentWindowUrlDiv = $("#AutoQuesterCustomUrlModifier");
} else {
    currentWindowUrlDiv = $('span').attr("id","AutoQuesterCustomUrlModifier").attr("data-url",window.location.href).appendTo(".contentModule");
}
$(currentWindowUrlDiv).on('click', function() {
    console.log("Sending get request to: " + $(this).attr("data-url"));
    $("#AutoQuesterCustomUrlModifier").removeAttr("data-ready");
    $.get($("#AutoQuesterCustomUrlModifier").attr("data-url"), function(data) {
        var html = $.parseHTML(data);
        // Double check that we're on a map page (maybe we're on a battle instead)
        if ($(html).find('img[src="http://images.neopets.com/nq/n/lupe_combat.gif"]').length > 0) {
            detectAndDisplaySHH($(html));
            runBattleAnimatorOnNewData($(html).find(".contentModule"));
        }
    });
});

function detectAndDisplaySHH(body) {
    var shhEvent;
    if ($(body).find('div.randomEvent').length > 0) {
        shhEvent = $(body).find('div.randomEvent');
    } else if ($(body).find('img[src^="http://images.neopets.com/shh/"]').length > 0) {
        shhEvent = $(body).find('img[src^="http://images.neopets.com/shh/"]').closest("div");
    }

    if (shhEvent != undefined) {
        alert("Something has happened!");
        console.log($(shhEvent));
        $("<div>").append($(shhEvent)).appendTo($(mapDiv)).css({
            "top":"5px",
            "width":"100%",
            "text-align":"center"
        });
    }
}

// ================================================
// =====            CSS/JS Display            =====
// ================================================

// Allow user to control whether they are viewing the original NQ screen or our Extended Map screen
var battleDiv = $('#AutoQuesterBattle');

// ================================================
// =====     Content Manipulation Helpers     =====
// ================================================

// Copies the original NQ displayed information/images onto the given map div element
function copyOriginalContent() {
    // Find the original content of the page that we've drawn over and add it to our map area
    var contentCopy = $(bodyData).find('img[src="http://images.neopets.com/nq/n/lupe_combat.gif"]').closest("table").clone();
    var contentContainer = $("<div>").appendTo($(battleDiv)).css({
        "top": "50%",
        "transform": "translateY(-50%)",
        "position":"fixed",
        "width":"100%",
        "text-align":"center"
    });
    contentCopy.appendTo($(contentContainer)).css({
        "background":"white",
        "margin":"0 auto"
    });

    // Remove the duplicated form from our copy to allow links to work properly
    contentCopy.find("form[name='ff']").first().remove();
    contentCopy.find("input[name='fact']").first().remove();
    contentCopy.find("input[name='type']").first().remove();
    contentCopy.find("form[action='neoquest.phtml']").first().remove();
}

function runBattleAnimatorOnNewData(data) {
    bodyData = $(data);
    
    // Detect which direction we moved (we may have been interupted by a battle/etc, so store it for later!)
    var url = $(currentWindowUrlDiv).attr("data-url");
    if ($(bodyData).find('img[src="http://images.neopets.com/nq/n/lupe_combat.gif"]').length == 0) {
        // We're probably not on a map page, don't draw map...
        console.log("Not on a battle page, aborting battle animator");
        return;
    }
    
    if (battleDiv.length == 0) {
        console.log("Battle display blackout triggered");
        battleDiv = $('<div></div>').attr("id", "AutoQuesterBattle").css({
            "position":"fixed",
            "top":"0",
            "left":"0",
            "z-index":"10000",
            "width":"100%",
            "height":"100%",
            "background":"black"
        }).appendTo($('body'));
    } 
    
    // Clear old battle display
    $(battleDiv).empty();
    copyOriginalContent()
    
    $("#AutoQuesterCustomUrlModifier").attr("data-ready","");
}

detectAndDisplaySHH($(document));
runBattleAnimatorOnNewData($(document).find(".contentModule"));