	// ==UserScript==
	// @name         AutoHelper - Gallery Organizer
	// @namespace    http://tampermonkey.net/
	// @version      0.1
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

	var CATEGORY_SUMMARY_ENABLED = true; // if 'true', it will show a panel in the top left summarizing categories and item counts
	var RELOCATE_SUBMIT_BUTTON = true;   // if 'true', it will move the submit button to always be in the top right corner

	// ------------------------------
	// END USER-CONTROLLED SETTINGS
	// DO NOT MODIFY ANYTHING BELOW
	// ------------------------------

	var $ = window.jQuery;

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
		rerankAllObjects();

		if (RELOCATE_SUBMIT_BUTTON) {
			// Move the submit button somewhere useful
			$(".save_rank").css({
				"position":"fixed",
				"top":"0",
				"right":"0"
			});
		}
	}

	function rerankAllObjects() {
		ordering = [];
		$('img[src^="http://images.neopets.com/items/"]').parent().each(function(){
			// Reset the ordered rank numbers
			var item = new Object();
			item.imageTd = $(this).html();
			item.quantity = $(this).closest("tr").next().find("td").eq($(this).index()).html();
			item.rankTd = $(this).closest("tr").next().next().find("td").eq($(this).index()).html();
			ordering.push(item);
			setRankOfImageTd($(this), ordering.length);

			// Make imgs draggable
			$(this).find("img").addClass("drag");
		});
	}

	function setRankOfImageTd(td, rank) {
		var tdOfRankInputThatMatchesImage = $(td).closest("tr").next().next().find("td").eq($(td).index());
		// Only update the rank if it is actually different than it's current value
		if (tdOfRankInputThatMatchesImage.find("input[type=text]").val() != rank) {
			tdOfRankInputThatMatchesImage.find("input[type=text]").val(rank);
			tdOfRankInputThatMatchesImage.find("input[type=text]").attr("data-new_rank","y");
			tdOfRankInputThatMatchesImage.find("input[type=hidden]").attr("data-prv_rank","y");    
		}
	}

	// Draggable images borrowed code from: http://luke.breuer.com/tutorial/javascript-drag-and-drop-tutorial.aspx
	var _startX = 0;            // mouse starting positions
	var _startY = 0;
	var _offsetX = 0;           // current element offset
	var _offsetY = 0;
	var _dragElement;           // needs to be passed from OnMouseDown to OnMouseMove
	var _oldZIndex = 0;         // we temporarily increase the z-index during drag
	$("<style type='text/css'> .drag{ position:relative; } </style>").appendTo("head");

	// The relevant events belong to the document: onMouseDown, onMouseMove, and onMouseUp.  Attempting to make drag and drop using onMouseMove of an element will result in buggy operation, as the cursor tends to jump outside of the element when it is moved quickly; when this happens, onMouseMove will stop firing until the mouse moves back over the element. Clearly, this is not desirable, so the document's mouse events are used.

	InitDragDrop();

	function InitDragDrop()
	{
		document.onmousedown = OnMouseDown;
		document.onmouseup = OnMouseUp;
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
			// grab the mouse position
			_startX = e.clientX;
			_startY = e.clientY;

			// grab the clicked element's position
			_offsetX = ExtractNumber(target.style.left);
			_offsetY = ExtractNumber(target.style.top);

			// bring the clicked element to the front while it is being dragged
			_oldZIndex = target.style.zIndex;
			_oldLeft = target.style.left;
			_oldTop = target.style.top;
			target.style.zIndex = 10000;

			// we need to access the element in OnMouseMove
			_dragElement = target;

			// tell our code to start moving the element with the mouse
			document.onmousemove = OnMouseMove;

			// cancel out any text selections
			document.body.focus();

			// prevent text selection in IE
			document.onselectstart = function () { return false; };
			// prevent IE from trying to drag an image
			target.ondragstart = function() { return false; };

			// prevent text selection (except IE)
			return false;
		}
	}

	// Once OnMouseMove is wired up, it will fire whenever the mouse moves:
	function OnMouseMove(e)
	{
		if (e == null) 
			var e = window.event; 

		// this is the actual "drag code"
		_dragElement.style.left = (_offsetX + e.clientX - _startX) + 'px';
		_dragElement.style.top = (_offsetY + e.clientY - _startY) + 'px';

		//console.log('(' + _dragElement.style.left + ', ' +  _dragElement.style.top + ')');  
	}

	// When the mouse is released, we remove the event handlers and reset _dragElement:
	function OnMouseUp(e)
	{
		if (_dragElement != null)
		{
			_dragElement.style.zIndex = _oldZIndex;
			_dragElement.style.left = _oldLeft;
			_dragElement.style.top = _oldTop;

			// we're done with these events until the next OnMouseDown
			document.onmousemove = null;
			document.onselectstart = null;
			_dragElement.ondragstart = null;

			// -----------------------------------
			// START CODE MODIFICATIONS BY: bajuwa
			// -----------------------------------

			// Find the element at the place we dragged our item to and rank it just after that element
			var targetElement = document.elementFromPoint(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset);
			var targetRankIndex = $(targetElement).closest("tr").next().next().find("td").eq($(targetElement).closest("td").index()).find("input[type=text]").val() - 1;
			var originalRankIndex = $(_dragElement).closest("tr").next().next().find("td").eq($(_dragElement).closest("td").index()).find("input[type=text]").val() - 1;
			if ($(targetElement).is("img") && targetElement != _dragElement) {
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
				var i = 0;
				var tdArray = $("form[name=gallery_form]").find("tbody").first().find("tr").find("td").toArray();
				var startIndex = max(0,min(originalRankIndex,targetRankIndex)); // take the max with 0 just to be sure no out-of-bounds occurs
				var endIndex = min(tdArray.length,max(originalRankIndex,targetRankIndex)); // take the min with array length just to be sure no out-of-bounds occurs
				for (j = startIndex; j < endIndex; j++) {
					if ($(tdArray[j]).find("img").length > 0) {
						$(tdArray[j]).closest("tr").next().next().find("td").eq($(tdArray[j]).closest("td").index()).html($(ordering[i].rankTd));
						$(tdArray[j]).closest("tr").next().find("td").eq($(tdArray[j]).closest("td").index()).html($(ordering[i].quantity));
						$(tdArray[j]).html($(ordering[i].imageTd));
						i++;
					}
				};

				// Reapply the rank numbers
				rerankAllObjects();
			}

			// -----------------------------------
			//  END CODE MODIFICATIONS BY: bajuwa
			// -----------------------------------

			// this is how we know we're not dragging      
			_dragElement = null;

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
