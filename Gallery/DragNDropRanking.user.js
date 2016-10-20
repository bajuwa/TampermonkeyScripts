// ==UserScript==
// @name         AutoHelper - Gallery Organizer
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       bajuwa
// @match        http://www.neopets.com/gallery/*
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

// --------------------------
// USER-CONTROLLED SETTINGS
// --------------------------

var CATEGORY_SUMMARY_ENABLED = true; // If 'true', it will show a panel in the top left summarizing categories and item counts
var RELOCATE_SUBMIT_BUTTON = true;   // If 'true', it will move the submit button to always be in the top right corner
var HIGHLIGHT_COLOUR = "#123456";       // The colour of the backgrounds/highlights that appear when hovering a dragged image over another location;  Can be either real world ("white") or hex ("#ffffff")

// ------------------------------
// END USER-CONTROLLED SETTINGS
// DO NOT MODIFY ANYTHING BELOW
// ------------------------------

var $ = window.jQuery;
var _dragElement;           // needs to be passed from OnMouseDown to OnMouseMove
var previousHighlightedElement;
var targetX = 0;
var targetY = 0;

if (CATEGORY_SUMMARY_ENABLED) {
	// Find all the category names
	var categories = [];
	$('select[name^="user_cat_arr"] option:selected').each(function(){
		if (categories.indexOf($(this).text()) < 0) {
			categories.push($(this).text());
		}
	});

	// If we are on a page that supports categorization...
	if (categories.length > 0) {
		// Count how many items belong to each category
		for (var i = 0; i < categories.length; i++) {
			categories[i] = [categories[i], $('select[name^="user_cat_arr"] option:selected').filter(function(){
				return $(this).text() == categories[i];
			}).length];
		}

		// Sort the categories from least to most items
		categories.sort(function(a, b) {return a[1] - b[1];});

		// Display a list of the counts
		var el = document.createElement("div");
		el.setAttribute("style","text-align:left;position:fixed;top:0%;left:0%;background-color:white;font-weight: bold;");
		var innerHTML = "<table>";
		for (var i = 0; i < categories.length; i++) {
			innerHTML += "<tr><td> " + categories[i][0] + ": </td><td>" + categories[i][1] + "</td></tr>";
		}
		innerHTML += "</table>";
		el.innerHTML += innerHTML;
		document.body.appendChild(el);
	}
}

// If we are on a page that supports ordering...
var ordering = [];
if (window.location.href.indexOf("dowhat=rank") >= 0) {
	console.log("Detected an ordering page, preparing to GUI-rank!");

	// Make sure the ordering properly starts at 1 and increments by 1
	setupDraggableItems();

	if (RELOCATE_SUBMIT_BUTTON) {
		// Move the submit button somewhere useful
		$(".save_rank").css({
			"position":"fixed",
			"top":"0",
			"right":"0"
		});
	}
}
	
function setupDraggableItems() {
	ordering = [];
	$("form[name=gallery_form]").find('img[src^="http://images.neopets.com/items/"]').parent().each(function(){
		// Make imgs draggable (do this first so it will be included in the saved html)
		$(this).find("img").addClass("drag");
        $(this).css({ "border-left" : "1px solid transparent" });
        $(this).css({ "border-right" : "1px solid transparent" });
         
        $(this).on("dragend",handleMouseUp);
	  
		// Reset the ordered rank numbers
		var item = new Object();
		item.imageTd = $(this).html();
		item.quantity = $(this).closest("tr").next().find("td").eq($(this).index()).html();
		item.rankTd = $(this).closest("tr").next().next().find("td").eq($(this).index()).html();
		ordering.push(item);
		setRankOfImageTd($(this), ordering.length);
	});
}

function rerankAllObjects(startIndex, endIndex) {
	startIndex = startIndex || 0;
	endIndex = endIndex || $("form[name=gallery_form]").find('img[src^="http://images.neopets.com/items/"]').length;
	var currentRank = startIndex;
	$("form[name=gallery_form]").find('img[src^="http://images.neopets.com/items/"]').closest("td").slice(startIndex, endIndex+1).each(function(){
		// Reset the ordered rank numbers
		setRankOfImageTd($(this), ++currentRank);
	});
}

function setRankOfImageTd(td, rank) {
	var tdOfRankInputThatMatchesImage = $(td).closest("tr").next().next().find("td").eq($(td).index());
	// Only update the rank if it is actually different than it's current value
	if (tdOfRankInputThatMatchesImage.find("input[type=text]").val() != rank) {
		console.log("Setting rank to: " + rank);
		tdOfRankInputThatMatchesImage.find("input[type=text]").val(rank);
		tdOfRankInputThatMatchesImage.find("input[type=text]").attr("data-new_rank","y");
		tdOfRankInputThatMatchesImage.find("input[type=hidden]").attr("data-prv_rank","y");    
	}
}

function applyOrderingItemToGalleryTds(tdArray, ordering, index) {
    $(tdArray[index]).closest("tr").next().next().find("td").eq($(tdArray[index]).closest("td").index()).html($(ordering[index].rankTd));
    $(tdArray[index]).closest("tr").next().find("td").eq($(tdArray[index]).closest("td").index()).html($(ordering[index].quantity));
    $(tdArray[index]).html($(ordering[index].imageTd));
}

$("<style type='text/css'> .drag{ position:relative; } </style>").appendTo("head");

InitDragDrop();
function InitDragDrop()
{
	document.onmousedown = OnMouseDown;
	document.onmousemove = getCursorXY;
}

// We start with onMouseDown:
function OnMouseDown(e)
{
	// IE is retarded and doesn't pass the event object
	if (e == null) 
		e = window.event; 

	// IE uses srcElement, others use target
	var target = e.target != null ? e.target : e.srcElement;

	console.log(target.className.indexOf('drag') >= 0 
				? 'draggable element clicked' 
				: 'NON-draggable element clicked');

	// for IE, left click == 1
	// for Firefox, left click == 0
	if ((e.button == 1 && window.event != null || 
		 e.button == 0) && 
		target.className.indexOf('drag') >= 0)
	{
		console.log("Starting drag");
		_dragElement = target;
	}
}

function getCursorXY(e) {
	targetX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	targetY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
    console.log(targetX + ", " + targetY);
}

function handleMouseUp()
{
    console.log("Mouse up!");
	if (_dragElement != null)
	{
        console.log("Handling item drop: ");
        console.log(_dragElement);
		// -----------------------------------
		// START CODE MODIFICATIONS BY: bajuwa
		// -----------------------------------

		// Find the element at the place we dragged our item to and rank it just after that element
        console.log(targetX);
        console.log(targetY);
		var targetElement = document.elementFromPoint(targetX, targetY);
        var originalRankIndex = $(_dragElement).closest("tr").next().next().find("td").eq($(_dragElement).closest("td").index()).find("input[type=text]").val() - 1;
        var targetRankIndex = $(targetElement).closest("tr").next().next().find("td").eq($(targetElement).closest("td").index()).find("input[type=text]").val() - 1;
		if (targetElement != _dragElement) {
            console.log("Dropping on something other than itself, doing swap/splice");
            // If it's an image, we will be swapping the two items
            if ($(targetElement).is("img")) {
                console.log("Swapping items at ranks: " + originalRankIndex + ", " + targetRankIndex);
                
                // store temp for the swap
                var temp = new Object();
                temp.imageTd = ordering[originalRankIndex].imageTd
                temp.quantity = ordering[originalRankIndex].quantity
                temp.rankTd = ordering[originalRankIndex].rankTd
                
                ordering[originalRankIndex].imageTd = ordering[targetRankIndex].imageTd
                ordering[originalRankIndex].quantity = ordering[targetRankIndex].quantity
                ordering[originalRankIndex].rankTd = ordering[targetRankIndex].rankTd

                ordering[targetRankIndex].imageTd = temp.imageTd
                ordering[targetRankIndex].quantity = temp.quantity
                ordering[targetRankIndex].rankTd = temp.rankTd

                // reapply the ordered item td list to the table
                var tdArray = $("form[name=gallery_form]").find("tbody").first().find("img").closest("td").toArray();
                applyOrderingItemToGalleryTds(tdArray, ordering, originalRankIndex);
                applyOrderingItemToGalleryTds(tdArray, ordering, targetRankIndex);
                
                // Reapply the rank numbers
                rerankAllObjects(Math.min(originalRankIndex, targetRankIndex), Math.max(originalRankIndex, targetRankIndex));
            } else if ($(targetElement).is("td") && $(targetElement).find("img").length > 0) {
                // Modify the targetRankIndex if it is close to the edge of the td
                if (originalRankIndex < targetRankIndex && targetX - $(targetElement).offset().left < $(targetElement).width()/2) {
                    console.log("Dropped on the left side of the td, adjusting rank");
                    targetRankIndex--;
                } else if (originalRankIndex > targetRankIndex && targetX - $(targetElement).offset().left > $(targetElement).width()/2) {
                    console.log("Dropped on the right side of the td, adjusting rank");
                    targetRankIndex++;
                }
                
                // If the target is a td element that contains an image, assume we placed the dragged item between items and need to splice it in
                console.log("Splicing items at ranks: " + originalRankIndex + ", " + targetRankIndex);
                
                // Copy new item over to avoid referencing issues on deletes
                var movedItem = new Object();
                movedItem.imageTd = ordering[originalRankIndex].imageTd;
                movedItem.quantity = ordering[originalRankIndex].quantity;
                movedItem.rankTd = ordering[originalRankIndex].rankTd;

                // remove element from it's original index
                ordering.splice(originalRankIndex, 1);

                // insert element in to new index
                ordering.splice(targetRankIndex, 0, movedItem);

                // reapply the ordered item td list to the table
                var tdArray = $("form[name=gallery_form]").find("tbody").first().find("img").closest("td").toArray();
                var startIndex = Math.max(0,Math.min(originalRankIndex,targetRankIndex)); // take the max with 0 just to be sure no out-of-bounds occurs
                var endIndex = Math.min(tdArray.length,Math.max(originalRankIndex,targetRankIndex)); // take the min with array length just to be sure no out-of-bounds occurs
                console.log("Reordering indexes: " + startIndex + "-" + endIndex);
                var j = startIndex;
                while (j <= endIndex) {
                    applyOrderingItemToGalleryTds(tdArray, ordering, j);
                    j++;
                };

                // Reapply the rank numbers
                rerankAllObjects(startIndex, endIndex);
            } else {
                console.log("Target element not compatable with drag'n'drop");
                console.log($(targetElement));
            }
		}
        
        $(_dragElement).closest("td").css({ "background" : "none" });
        $(previousHighlightedElement).closest("td").css({ "background" : "none" });

		// -----------------------------------
		//  END CODE MODIFICATIONS BY: bajuwa
		// -----------------------------------

		// this is how we know we're not dragging      
		_dragElement = null;
        previousHighlightedElement = null;

		console.log('mouse up');
	}
}

function ExtractNumber(value)
{
	var n = parseInt(value);

	return n == null || isNaN(n) ? 0 : n;
}

// this is simply a shortcut for the eyes and fingers
function $(id)
{
	return document.getElementById(id);
}
