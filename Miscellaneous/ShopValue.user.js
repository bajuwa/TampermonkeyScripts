// ==UserScript==
// @name         AutoHelper - Shop Value
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  When open to the shop page, sums up the values of already priced items on that specific page and displays them underneath the "Items Stocked"/"Free Space" information
// @author       bajuwa
// @match        http://www.neopets.com/market.phtml?*type=your*
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

// Constants
var $ = window.jQuery;

// Calculate current known stock price sum
var currentPriceSum = 0;
$('input[name^="cost_"]').each(function(){
    currentPriceSum += parseInt($(this).val()) * ($(this).closest("tr").find("select option").length-1);
});

// Display the overall summary below the stock information
$("<br>Current Stock Total: <b>" + addCommas(currentPriceSum) + " np</b>").appendTo($("img[name=keeperimage]").parent());


function addCommas(nStr)
{
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}


