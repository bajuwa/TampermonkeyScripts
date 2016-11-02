// ==UserScript==
// @name         AutoQuester - Progress Tracker
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       bajuwa
// @match        http://www.neopets.com/games/neoquest/neoquest.phtml*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==
/* jshint -W097 */
'use strict';

var $ = window.jQuery;

var GM_PROGRESS_DISPLAY_ENABLED = "AQ_progressTracker_progressDisplayEnabled";
var GM_COMPLETION = "AQ_progressTracker_completion";
var GM_DISPLAY = "AQ_progressTracker_display";
var GM_CURRENT_INVENTORY = "AQ_progressTracker_currentInventory";

var ELEMENT_ID_ALL = 'AutoQuester-ProgressTracker';
var ELEMENT_ID_MAIN = 'AutoQuester-ProgressTracker-Main';
var ELEMENT_ID_SECONDARY = 'AutoQuester-ProgressTracker-Secondary';
var CLASS_SUBTASK_TOGGLE = "AutoQuester-ProgressTracker-Subtasks";
var CLASS_KEYWORD = "AutoQuester-ProgressTracker-Keyword";

var PROGRESS_DISPLAY_ENABLED = JSON.parse(GM_getValue(GM_PROGRESS_DISPLAY_ENABLED, "false"));
var CURRENT_INVENTORY = JSON.parse(GM_getValue(GM_CURRENT_INVENTORY, "{}"));

$("<style type='text/css'> ." + CLASS_KEYWORD + "{ color:gray; font-style:italics;cursor:pointer;} </style>").appendTo("head");

$(document).ready(function(){
    // Create a div to hold all progress tracker information
    $('<div>').attr('id',ELEMENT_ID_ALL).appendTo($('body')).css({
        "position":"fixed",
        "z-index":"20010",
        "bottom":"0",
        "left":"0",
        "background":"black",
        "color":"white",
        "font-weight":"bold",
        "text-align":"left",
        "display":"none"
    });

    $('<div>').attr('id',ELEMENT_ID_MAIN).css({"float":"left","margin-bottom":"20px"}).appendTo($('#'+ELEMENT_ID_ALL));
    $('<div>').attr('id',ELEMENT_ID_SECONDARY).css({"float":"left","margin-bottom":"20px","display":"none","width":"300px"}).appendTo($('#'+ELEMENT_ID_ALL));

    // Create a main list menu that shows what tasks need to be done
    updateInventory();
    setupMainTable();
    loadDisplayStatus();
    loadCompletionStatus();
    calculateCompletionRates();

    // Create a secondary menu that shows details about list entries when clicked
    setupSecondaryTable();

    // Once everything is set up, set the div to display
    $('#'+ELEMENT_ID_MAIN).css("display", (PROGRESS_DISPLAY_ENABLED ? "block" : "none") );
    $('#'+ELEMENT_ID_ALL).css("display","block");

    // Create a button on the bottom left hand screen that can be used to open/close the helper menu
    $('<button>Toggle Progress</button>').click(function(){
        PROGRESS_DISPLAY_ENABLED = !PROGRESS_DISPLAY_ENABLED;
        GM_setValue(GM_PROGRESS_DISPLAY_ENABLED, JSON.stringify(PROGRESS_DISPLAY_ENABLED));
        $('#'+ELEMENT_ID_MAIN).slideToggle();
    }).css({
        "position":"absolute",
        "left":"0",
        "bottom":"0",
        "min-width":"125px"
    }).appendTo($('#'+ELEMENT_ID_ALL));

    // Create a button to restart progress (wipe all completion statuses)
    $('<button>Restart</button>').click(function(){
        GM_deleteValue(GM_COMPLETION);
        GM_deleteValue(GM_CURRENT_INVENTORY);
        loadCompletionStatus();
        calculateCompletionRates();
    }).css({
        "position":"absolute",
        "right":"0",
        "bottom":"0"
    }).appendTo($('#'+ELEMENT_ID_MAIN));

});

// ---------------------
//  SAVE CONFIGURATIONS
// ---------------------

var hasImportedInventory = false;
function updateInventory() {
    if (hasImportedInventory) {
        return;
    }
    if ($("img[src='http://images.neopets.com/nq/n/lupe_win.gif']").length > 0) {
        // If on a rewards page, add new rewards
        hasImportedInventory = true;
        var currentInventory = JSON.parse(GM_getValue(GM_CURRENT_INVENTORY, "{}"));
        $("img[src='http://images.neopets.com/nq/n/lupe_win.gif']").parent().find("b").each(function() {
            updateInventoryForItem(currentInventory, $(this).text());
        });
        GM_setValue(GM_CURRENT_INVENTORY, JSON.stringify(currentInventory));
    } else if ($('div:contains("gave you a")').length > 0) {
        // If on a crafting results page, remove old items and add new
        hasImportedInventory = true;
        var currentInventory = JSON.parse(GM_getValue(GM_CURRENT_INVENTORY, "{}"));
        $('div:contains("gave you a")').last().find("li").each(function() {
            updateInventoryForItem(currentInventory, $(this).text(), -1);
        });
        var createdItem = toTitleCase($('div:contains("gave you a")').last().find("> b").last().text());
        updateInventoryForItem(currentInventory, createdItem);
        GM_setValue(GM_CURRENT_INVENTORY, JSON.stringify(currentInventory));
    } else {
        // else, clear our 'no-double import inventory' switch
        hasImportedInventory = false;
        if (window.location.href.indexOf("action=items") >= 0) {
            // If on an inventory page, reset inventory and reload from current page info
            var currentInventory = {};
            $("b:contains('Your Items')").parent().find("table").first().find("tr").each(function(){
                var increaseBy = $(this).find("td").eq(1).text().indexOf("/") >= 0 ? $(this).find("td").eq(1).text().substring(0,$(this).find("td").eq(1).text().indexOf("/")) : 1;
                updateInventoryForItem(currentInventory, $(this).find("td").eq(0).text(), increaseBy);
            });
            GM_setValue(GM_CURRENT_INVENTORY, JSON.stringify(currentInventory));
        }
    }
}

function updateInventoryForItem(inventory, potentialItemName, increaseBy = 1) {
    var itemName = toTitleCase(potentialItemName)
    if (itemName.indexOf("experience") >= 0) {
        return;
    }
    if (itemName.startsWith("A ")) {
        itemName = itemName.substring(2);
    }
    if (itemName.startsWith("An ")) {
        itemName = itemName.substring(3);
    }
    if (itemName.startsWith("The ")) {
        itemName = itemName.substring(4);
    }
    if (KEYWORD_DICTIONARY.hasOwnProperty(itemName)) {
        inventory[itemName] = inventory.hasOwnProperty(itemName) ? parseInt(inventory[itemName])+increaseBy : increaseBy;
    }
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function saveCompletion() {
    console.log("Saving completion status...");
    var completion = [];
    $('#'+ELEMENT_ID_MAIN).find("input[type=checkbox]").each(function() {
        completion.push($(this).prop('checked'));
    });
    GM_setValue(GM_COMPLETION, JSON.stringify(completion));
}

function saveDisplay() {
    console.log("Saving display status...");
    var display = [];
    $('#'+ELEMENT_ID_MAIN).find("span:contains([)").parent("li").next("ul").each(function() {
        display.push($(this).css("display"));
    });
    GM_setValue(GM_DISPLAY, JSON.stringify(display));
}

// ---------------------
//  SETUP MAIN DISPLAYS
// ---------------------

function createRowsForTodoList(ongoingList, todoList) {
    if ((typeof todoList === 'string' || todoList instanceof String) && todoList != "") {
        // If we've hit a string, it means it's just a simple list item, so return it with a checkbox
        var li = $('<li>').css("list-style-type","none").html('<input type="checkbox"> ' + todoList + '</input>').appendTo(ongoingList);
    } else if (todoList instanceof Array) {
        // If if is an array, it means it has a nested listing, so recursively call the row creation
        if (todoList.length > 0) {
            if (todoList[0] != "") {
                if (todoList[1] == 0) {
                    ongoingList.append($('<li>').css("list-style-type","none").html('<input type="checkbox"> ' + todoList[0] + ' <span>[ See Recipe ]</span>'));
                } else {
                    ongoingList.append($('<li>').css("list-style-type","none").html('<input type="checkbox"> ' + todoList[0] + ' <span>[ ?/' + todoList[1] + ' ]</span>'));
                }
            }
            var newUl = $('<ul>').appendTo(ongoingList);
            for (var i = 0; i < todoList[2].length; i++) {
                createRowsForTodoList(newUl, todoList[2][i]);
            }
        }
    }
}

function setupMainTable() {
    // Create the main structure given our preconfigured todo lists
    createRowsForTodoList($('#'+ELEMENT_ID_MAIN), TODO_LIST_MAIN);

    // Iterate over each subtask checklist and add the click ability to open/close subtasks
    $("span:contains([)").attr("class",CLASS_SUBTASK_TOGGLE).css({
        "font-weight":"bold",
        "color":"orange",
        "cursor":"pointer"
    });

    // Since our spans are dynamically created, the click event has to be handled by the document via class name
    $(document).on('click', "."+CLASS_SUBTASK_TOGGLE, function(){
        $(this).parent("li").next("ul").slideToggle();
        setTimeout(function(){saveDisplay();}, 1000);
    });

    // Iterate over all keywords and link them to there known information
    for (var keyword in KEYWORD_DICTIONARY) {
        $("li:contains(" + keyword + ")").html(function(_, html) {
            return html.replace(new RegExp("(" + keyword + ")"), '<span class="' + CLASS_KEYWORD + '">' + keyword + "</span>");
        });
    }

    $(document).on('click', "."+CLASS_KEYWORD, function() {
        loadKeywordData($(this).text().trim());
    });
}

function setupSecondaryTable() {
    $('#'+ELEMENT_ID_SECONDARY).append($("<span id='clickToClose'>").css({"float":"right","margin":"5px","cursor":"pointer"}).text("X"));
    $(document).on('click', '#clickToClose', function(){ $('#'+ELEMENT_ID_SECONDARY).hide(); });
    for (var i = 0; i < KEYWORD_ENTRY_TITLES.length; i++) {
        $('#'+ELEMENT_ID_SECONDARY).append($("<table>").append($("<th>").text(KEYWORD_ENTRY_TITLES[i])).append($("<tr>").append($("<td>").text("test"))));
    }
    $('#'+ELEMENT_ID_SECONDARY).find("table").css({
        "text-align":"center",
        "padding":"5px 10px",
        "width":"100%"
    });
    $('#'+ELEMENT_ID_SECONDARY).find("th").css({
        "color":"gray",
        "text-decoration":"underline"
    });
}

// ---------------------
//  CHECKLIST MODIFYING
// ---------------------

// Replace the initial '?' with the counts of their complete subtasks
function calculateCompletionRates() {
    console.log("Recalculating completion rates...");

    // For each list element with a set of subtasks, see how close we are to completing required subtasks
    $($('#'+ELEMENT_ID_MAIN).find("li:contains(/)").not("ul").get().reverse()).each(function() {
        // Find all the li elements that are direct children and count number that are checked as complete
        var numOfCompletedSubtasks = $(this).next("ul").children('li').find('input[type=checkbox]:checked').length;
        var slashIndex = $(this).html().indexOf("/", $(this).html().indexOf("["))-1;

        if (slashIndex < 0) {
            return;
        }

        $(this).html(function() {
            return $(this).html().substr(0, slashIndex) + numOfCompletedSubtasks + $(this).html().substr(slashIndex+1);
        }).prop('checked', true);

        // If enough subtasks have been completed, mark the parent as complete
        var minRequiredSubtasks = $(this).html().substring(slashIndex + 2, slashIndex + 3);
        if (numOfCompletedSubtasks >= parseInt(minRequiredSubtasks)) {
            console.log("Subtasks complete, updating parent!");
            $(this).next("ul:visible").slideToggle();
            $(this).find("input[type=checkbox]").eq(0).prop('checked', true);
        }
    });

    saveCompletion();
    saveDisplay();
}

// Iterate over all checkboxes and apply their values from storage
function loadCompletionStatus() {
    console.log("Displaying completion status...");
    var defaultCompletion = new Array($('#'+ELEMENT_ID_MAIN).find("input[type=checkbox]").length);
    for (var i = 0; i < defaultCompletion.length; i++) { defaultCompletion[i] = false; }
    var completion = JSON.parse(GM_getValue(GM_COMPLETION, JSON.stringify(defaultCompletion)));
    var currentInventory = JSON.parse(GM_getValue(GM_CURRENT_INVENTORY, "{}"));

    var n = 0;
    $('#'+ELEMENT_ID_MAIN).find("input[type=checkbox]").each(function() {
        // If it's an item that we have, check it off
        var keyword = $(this).parent().find("span[class='AutoQuester-ProgressTracker-Keyword']").text();
        if (currentInventory.hasOwnProperty(keyword)) {
            completion[n] = parseInt(currentInventory[keyword]) > 0
        }
        $(this).prop('checked', completion[n++]);
        $(this).on('click', function() {
            calculateCompletionRates();
        });
    });
    
    saveCompletion();
}

// Iterate over all ul's and apply their display values from storage
function loadDisplayStatus() {
    console.log("Loading display status...");
    var defaultDisplay = new Array($('#'+ELEMENT_ID_MAIN).find("span:contains([)").parent("li").next("ul").length);
    for (var i = 0; i < defaultDisplay.length; i++) { defaultDisplay[i] = "none"; }
    var display = JSON.parse(GM_getValue(GM_DISPLAY, JSON.stringify(defaultDisplay)));
    
    var n = 0;
    $('#'+ELEMENT_ID_MAIN).find("span:contains([)").parent("li").next("ul").each(function() {
        $(this).css('display', display[n++]);
    });
}

function loadKeywordData(keyword) {
    console.log("Loading data for: " + keyword);
    var keywordInfoIndex = -1;
    $('#'+ELEMENT_ID_SECONDARY).find("table").each(function(){
        if (keywordInfoIndex < 0) {
            $(this).find("td").text(keyword);
        } else {
            $(this).find("td").text(KEYWORD_DICTIONARY[keyword][keywordInfoIndex]);
        }
        keywordInfoIndex++;
    });
    $('#'+ELEMENT_ID_SECONDARY).show();
}

// ---------------------
//   HARDCODED VALUES
// ---------------------

var KEYWORD_ENTRY_TITLES = ["Name", "Description", "Source", "Location"];
var KEYWORD_DICTIONARY = {
    // Healing Potions
    "Weak Healing Potion": ["Heals 10 Hp",  "Random Monsters", "Dank Cave, Jungle Ruins, Neopia City to Swamp"],
    "Standard Healing Potion": ["Heals 30 Hp",  "Random Monsters", "Dank Cave, Jungle Ruins, Haunted Plains to Swamp"],
    "Strong Healing Potion": ["Heals 60 Hp",  "Random Monsters", "Jungle Ruins, Temple of Roo, Northern Plains of Roo to Techo Mountain Caves"],
    "Greater Healing Potion": ["Heals 90 Hp",  "Random Monsters", "Jungle Ruins, Temple of Roo, Mountain Fortress, Kal Panning, Techo Caves to the areas outside the Two Rings"],
    "Superior Healing Potion": ["Heals 120 Hp",  "Random Monsters", "Mountain Fortress, Kal Panning, Techo Caves to Two Rings Palace"],
    "Spirit Healing Potion": ["Heals 150 Hp",  "Random Monsters", "Two Rings Palace"],

    // Raw Ingredients / Monster Drops
    "Glowing Stone": ["Use to make the Energy Shield, Cloth Robe, Mirrored Force Field, Magic Robe, Gold Wand, Steel Wand, Bronze Wand, Iron Wand, Silver Wand, Volcano Wand, Glacier Wand, Storm Wand, Mountain Wand, Nature Wand, Blazing Jewel, Chilling Jewel, Stunning Jewel, Radiant Jewel, and Growing Jewel", "Plains lupe, plains aisha, dirt golem, stone golem, iron golem, steel golem", "Plains of Neopia, The Grove, North Coast, Hills of Roo, Southern Plains of Roo, Ancient Foothills (before Techo Caves), Temple of Roo level 1"],
    "Chunk Of Metal": ["Use to make the Energy Shield", "Snow Imp", "Plains of Neopia, Training Grounds"],
    "Small Yellow Gem": ["Use to make the Energy Shield", "Fire Imp", "Plains of Neopia, Training Grounds"],
    "Plains Lupe Pelt": ["Use to make the Cloth Robe", "Plains Lupe", "Plains of Neopia, The Grove, North Coast"],
    "Blue Thread": ["Use to make the Cloth Robe", "Snow Imp", "Plains of Neopia, Training Grounds"],
    "Cave Lupe Pelt": ["Use to make the Magic Robe", "Cave Lupe", "Dank Cave levels 1, 2"],
    "Tiny Garnet": ["Use to make the Gold Wand and the Blazing Jewel", "Cave troll, cave ghoul, broken skeleton, burned skeleton, frozen skeleton, cave ogre", "Dank Cave levels 2, 3, 4"],
    "Tiny Lapis": ["Use to make the Steel Wand and the Chilling Jewel", "Cave troll, cave ghoul, broken skeleton, burned skeleton, frozen skeleton, cave ogre", "Dank Cave levels 2, 3, 4"],
    "Tiny Amber": ["Use to make the Bronze Wand and the Stunning Jewel", "Cave troll, cave ghoul, broken skeleton, burned skeleton, frozen skeleton, cave ogre", "Dank Cave levels 2, 3, 4"],
    "Tiny Obsidian": ["Use to make the Iron Wand and the Radiant Jewel", "Cave troll, cave ghoul, broken skeleton, burned skeleton, frozen skeleton, cave ogre", "Dank Cave levels 2, 3, 4"],
    "Tiny Beryl": ["Use to make the Silver Wand and the Growing Jewel", "Cave troll, cave ghoul, broken skeleton, burned skeleton, frozen skeleton, cave ogre", "Dank Cave levels 2, 3, 4"],
    "Corroded Pyrite Rod": ["Use to make the Gold Wand", "Metal Devourer", "Dank Cave level 4"],
    "Corroded Pewter Rod": ["Use to make the Steel Wand", "Metal Devourer", "Dank Cave level 4"],
    "Corroded Copper Rod": ["Use to make the Bronze Wand", "Metal Devourer", "Dank Cave level 4"],
    "Corroded Ore Rod": ["Use to make the Iron Wand", "Metal Devourer", "Dank Cave level 4"],
    "Corroded Aluminum Rod": ["Use to make the Silver Wand", "Metal Devourer", "Dank Cave level 4"],
    "Grey Lupe Fang": ["Use to make the Red Wand and the Blue Wand", "Grey lupe", "Plains of Neopia, The Grove, Hills of Jub, Southern Coast"],
    "Black Bearog Paw": ["Use to make the Red Wand, the Black Wand, and the White Wand", "Black bearog", "Plains of Neopia, The Grove, Hills of Jub, Southern Coast"],
    "Grizzly Bearog Tooth": ["Use to make the Red Wand and the Yellow Wand", "Grizzly bearog", "Plains of Neopia, The Grove, Hills of Jub, Southern Coast"],
    "Dire Lupe Pelt": ["Use to make the Blue Wand and the Black Wand", "Dire lupe", "Plains of Neopia, The Grove, Hills of Jub, Southern Coast"],
    "Piece Of Smooth Glass": ["Use to make the Mirrored Force Field", "Skeleton guard", "Dank Cave level 4 (Xantan's Lair)"],
    "Lodestone": ["Use to make the Mirrored Force Field", "Cave Ghoul", "Dank Cave levels 2, 3"],
    "Stretch Of Rotted Cloth": ["Use to make the Magic Robe", "Skeleton guard", "Dank Cave level 4 (Xantan's Lair)"],
    "Armored Stinger": ["Use to make the Volcano Wand", "Armored scorpion", "Jungle Ruins dungeon 1, 2"],
    "Noil's Mane": ["Use to make the Volcano Wand", "Noil", "Jungle Ruins dungeon 1"],
    "Shamanistic Totem": ["Use to make the Glacier Wand", "Shaman, Greater Shaman", "Jungle ruins dungeon 1, 2"],
    "Skeith Fang": ["Use to make the Glacier Wand", "Huge Skeith", "Jungle ruins dungeon 1"],
    "Buzz Wing": ["Use to make the Storm Wand", "Killer buzz", "Jungle ruins dungeon 1"],
    "Wadjet Skin": ["Use to make the Storm Wand", "Giant wadjet", "Jungle Ruins dungeons 1, 2,  tower level 2"],
    "Scorpion Carapace": ["Use to make the Mountain Wand", "Scorpion", "Jungle Ruins dungeon 1"],
    "Wooden Shield": ["Use to make the Mountain Wand", "Greater Shaman", "Jungle Ruins dungeon 1, 2"],
    "Jungle Beast Claw": ["Use to make the Nature Wand", "Jungle beast", "Jungle Ruins dungeon 1"],
    "Noil's Tooth": ["Use to make the Nature Wand", "Noil", "Jungle Ruins dungeons 1, 2, tower level 2"],
    "Jungle Gauntlet": ["Use to make the Volcano Wand", "Jungle knight/lord/battlelord/death-knight, skeletal guardian", "Jungle Ruins dungeons 2 (Gors' level), 3, tower level 3"],
    "Jungle Vambrace": ["Use to make the Glacier Wand", "Jungle knight/lord/battlelord/death-knight, skeletal guardian", "Jungle Ruins dungeons 2 (Gors' level), 3, tower level 3"],
    "Jungle Breastplate": ["Use to make the Storm Wand", "Jungle knight/lord/battlelord/death-knight, skeletal guardian", "Jungle Ruins dungeons 2 (Gors' level), 3, tower level 3"],
    "Jungle Helm": ["Use to make the Mountain Wand", "Jungle knight/lord/battlelord/death-knight, skeletal guardian", "Jungle Ruins dungeons 2 (Gors' level), 3, tower level 3"],
    "Jungle Pauldrons": ["Use to make the Nature Wand", "Jungle knight/lord/battlelord/death-knight, skeletal guardian", "Jungle Ruins dungeons 2 (Gors' level), 3, tower level 3"],
    "Giant Spider Leg": ["Use to trade for the Dawnshine Generator Shield", "Giant sand spyder", "Desert of Roo"],
    "Desert Cobra Fang": ["Use to trade for the Dawnshine Generator Shield", "Desert cobrall", "Desert of Roo"],
    "Sand Iguana Eye": ["Use to trade for the Dawnshine Generator Shield", "Sand skeith", "Desert of Roo"],
    "Dust Spider Pincer": ["Use to trade for the Dawnshine Generator Shield", "Giant dust spyder", "Desert of Roo"],
    "Drop Of Giant Spider Blood": ["Use to trade for the Sorcerous Robe", "Giant sand spyder", "Desert of Roo"],
    "Drop Of Desert Cobra Venom": ["Use to trade for the Sorcerous Robe", "Desert cobrall", "Desert of Roo"],
    "Glob Of Dried Iguana Spit": ["Use to trade for the Sorcerous Robe", "Sand skeith", "Desert of Roo"],
    "Pinch Of Crystallized Sand": ["Use to trade for the Sorcerous Robe", "Desert zombie", "Desert of Roo"],
    "Copper-Plated Key": ["Opens door to North-East room in Temple of Roo Level 2", "Ghastly initiate", "West Room in Temple of Roo Level 2"],
    "Bronze-Plated Key": ["Opens door to South-West room in Temple of Roo Level 2", "Ghastly adept", "North-East Room in Temple of Roo Level 2"],
    "Silver-Plated Key": ["Opens door to North-West room in Temple of Roo Level 2", "Ghastly priest", "South-West Room in Temple of Roo Level 2"],
    "Gold-Plated Key": ["Opens door to East room in Temple of Roo Level 2", "Ghastly master", "North-West Room in Temple of Roo Level 2"],
    "Platinum-Plated Key": ["Opens door to Center room in Temple of Roo Level 2", "Ghastly archon", "East Room in Temple of Roo Level 2"],
    "Crystalline-Plated Key": ["Opens door to South-East room in Temple of Roo Level 2 (leads to the Archmagus of Roo)", "Ghastly templar", "Center Room in Temple of Roo Level 2"],
    
    "Ruby": ["Use to make the Blazing Jewel", "'Ghastly' Monsters", "Temple of Roo Level 2"],
    "Sapphire": ["Use to make the Chilling Jewel", "'Ghastly' Monsters", "Temple of Roo Level 2"],
    "Topaz": ["Use to make the Stunning Jewel", "'Ghastly' Monsters", "Temple of Roo Level 2"],
    "Onyx": ["Use to make the Radiant Jewel", "'Ghastly' Monsters", "Temple of Roo Level 2"],
    "Emerald": ["Use to make the Growing Jewel", "'Ghastly' Monsters", "Temple of Roo Level 2"],
    "Carved Oak Staff": ["Use to make the Fire Staff, Ice Staff, Shock Staff, Spectral Staff, and Life Staff", "'Plains Grarrl' Monsters", "Southern Plains of Roo, Ancient Foothills (before Techo Caves)"],
    "Piece Of Living Crystal": ["Use to get Leirobas to tell about the Jewels of Power", "Crystal Golem", "Temple of Roo levels 1, 2 (outside rooms; rooms 1, 2)"],
    "Piece Of Agate": ["Use to make the Energy Absorber", "Agate dervish, greater agate dervish", "Techo Mountain Caves (Cave 1)"],
    "Piece Of Chrysolite": ["Use to make the Energy Absorber", "Chrysolite dervish, greater chrysolite dervish", "Techo Mountain Caves"],
    "Piece Of Serpentine": ["Use to make the Energy Absorber", "Serpentine dervish, greater serpentine dervish", "Techo Mountain Caves"],
    "Drakonid Eye": ["Use to make the Robe Of Protection", "'Drakonid Monsters", "Techo Mountain Caves"],
    "Drakonid Hide": ["Use to make the Robe Of Protection", "'Drakonid Monsters", "Techo Mountain Caves"],
    "Drakonid Heart": ["Use to make the Robe Of Protection", "'Drakonid Monsters", "Techo Mountain Caves"],

    // Artifacts
    "Xantan's Ring": ["Use to make the Gold Wand, Steel Wand, Bronze Wand, Iron Wand, and Silver Wand", "Xantan the Foul", "Dank Cave level 4"],
    "Rotting Wooden Key": ["Opens up the first locked door in the Jungle Ruins tower", "Kreai", "Jungle Ruins dungeon 1"],
    "Silver Horned Key": ["Opens up the second locked door in the Jungle Ruins tower", "Gors the Mighty", "Jungle Ruins dungeon 2"],
    "Jeweled Crystal Key": ["Opens up the third locked door in the Jungle Ruins tower", "Rollay Scaleback", "Jungle Ruins dungeon 3"],
    "Staff Of Ni-Tas": ["Use to make the Volcano Wand, Glacier Wand, Storm Wand, Mountain Wand, and Nature Wand", "Gors the Mighty", "Jungle Ruins dungeon 2"],
    "Rusty Medallion": ["Becomes the Keladrian Medallion after giving it to Gali Yoj", "Rollay Scaleback", "Jungle Ruins dungeon 3"],
    "Clouded Gem": ["Becomes the Corusating Gem after giving it to Erick", "Archmagus of Roo", "Temple of Roo level 2"],
    "Blazing Jewel": ["Use to make the Fire Staff", "Leirobas", "Swamp Edge City"],
    "Chilling Jewel": ["Use to make the Ice Staff", "Leirobas", "Swamp Edge City"],
    "Stunning Jewel": ["Use to make the Shock Staff", "Leirobas", "Swamp Edge City"],
    "Radiant Jewel": ["Use to make the Spectral Staff", "Leirobas", "Swamp Edge City"],
    "Growing Jewel": ["Use to make the Life Staff", "Leirobas", "Swamp Edge City"],
    "Coruscating Gem": ["Use to make the Fire Staff, Ice Staff, Shock Staff, Spectral Staff, and Life Staff", "Erick", "Temple of Roo (1st level)"],
    "Keladrian Medallion": ["Use to easily defeat Faleinn", "Gali Yoj", "Sunny Town"],
    "Key To The Two Rings": ["Opens up the locked door in the Two Rings Southern Cave", "Faleinn", "Kal Panning"],

    
    // Armour
    "Energy Shield": ["Def-3; No effects", "Morax Dorangis", "Neopia City - South West"],
    "Mirrored Force Field": ["Def-6; No effects", "Choras Tillie", "Neopia City - South East"],
    "Dawnshine Generator Shield": ["Def-10; Randomly reflects damage back", "Mokti", "Swamp Edge City"],
    "Energy Absorber": ["Def-14; Randomly converts regularr damage to health", "Mr. Irgo", "Techo Mountain Caves (Cave 1)"],
    "Evening Sun Shield": ["Def-18; Randomly does 20 damage to a monster when it does a regular attack", "Random Monsters", "Mountain Fortress"],

    "Cloth Robe": ["Def-3; No effects", "Morax Dorangis", "Neopia City - South West"],
    "Magic Robe": ["Def-6; No effects", "Choras Tillie", "Neopia City - South East"],
    "Sorcerous Robe": ["Def-10; Increases resistance to magical attacks", "Mokti", "Swamp Edge City"],
    "Robe Of Protection": ["Def-14; Randomly negates regular attacks", "Mr. Irgo", "Techo Mountain Caves (Cave 1)"],
    "Inferno Robe": ["Def-18; Adds 1-10 damage to each regular attack", "Random Monsters", "Mountain Fortress"],

    // Weapons
    "Red Wand": ["Str-3; Increases the chance of Fire Weapons and Firepower happening", "Lummock Sendent", "Neopia City - North East"],
    "Gold Wand": ["Str-6; Increases the chance of Fire Weapons and Firepower happening", "Eleus Batrin", "Neopia City - Central"],
    "Volcano Wand": ["Str-10; Increases the chance of Fire Weapons and Firepower happening; Randomly does 20 fire damage with Lava Flow", "Denethrir", "Jungle Ruins (tower)"],
    "Fire Staff": ["Str-15; Increases the chance of Fire Weapons and Firepower happening; Allows you to cast Magma Blast, which does 40 fire damage, takes 10-12 rounds before you can cast it again", "Erick", "Temple of Roo (1st level)"],
    "Firedrop Staff": ["Str-10; Increases the chance of Fire Weapons and Firepower happening; Randomly burns with Blast Furnace which does 30 fire damage per round for 3 rounds in a row", "Guardian of Fire Magic", "Mountain Fortress"],

    "Blue Wand": ["Str-3; Increases the chance of Ice Weapons and Heart of Ice happening", "Lummock Sendent", "Neopia City - North East"],
    "Steel Wand": ["Str-6; Increases the chance of Ice Weapons and Heart of Ice happening", "Eleus Batrin", "Neopia City - Central"],
    "Glacier Wand": ["Str-10; Increases the chance of Ice Weapons and Heart of Ice happening; Randomly does 20 ice damage with Avalanche", "Denethrir", "Jungle Ruins (tower)"],
    "Ice Staff": ["Str-15; Increases the chance of Ice Weapons and Heart of Ice happening; Allows you to cast Ice Shield, which lasts 6 rounds. During these rounds, it does 10 ice damage to a monster when it attacks you, increases your defence and decreases your attack, takes 12-14 rounds before you can cast it again", "Erick", "Temple of Roo (1st level)"],
    "Iceheart Staff": ["Str-20; Increases the chance of Fire Weapons and Firepower happening; Allows you to cast Ice Wind, which lasts 6-7 rounds. During these rounds, a monster has a chance of being stunned for one round. Takes 11-12 rounds before you can cast it again", "Guardian of Ice Magic", "Mountain Fortress"],

    "Yellow Wand": ["Str-3; No effects", "Lummock Sendent", "Neopia City - North East"],
    "Bronze Wand": ["Str-6; No effects", "Eleus Batrin", "Neopia City - Central"],
    "Storm Wand": ["Str-10; Randomly stuns monster for 1 round with Thunder Strike", "Denethrir", "Jungle Ruins (tower)"],
    "Shock Staff": ["Str-15; Allows you to cast Weakness, which lowers a monster's defence, takes 8-9 rounds before you can cast it again", "Erick", "Temple of Roo (1st level)"],
    "Thunderstar Staff": ["Str-20; Randomly stuns monster with Staggering Stun for 1 to 2 rounds", "Guardian of Shock Magic", "Mountain Fortress"],

    "Black Wand": ["Str-3; No effects", "Lummock Sendent", "Neopia City - North East"],
    "Iron Wand": ["Str-6; No effects", "Eleus Batrin", "Neopia City - Central"],
    "Mountain Wand": ["Str-10; Randomly allows you to avoid up to all of a monster's regular attack with Absorbing Stone", "Denethrir", "Jungle Ruins (tower)"],
    "Spectral Staff": ["Str-15; Allows you to cast Rage of Light, which increases your attack and defence, takes 11 rounds before you can cast it again", "Erick", "Temple of Roo (1st level)"],
    "Shadowgem Staff": ["Str-20; Allows you to cast Elemental Resistance, which increases your resistance to fire and ice damag, takes 10 rounds before you can cast it again", "Guardian of Spectral Magic", "Mountain Fortress"],

    "White Wand": ["Str-3; Allows you to heal while walking around", "Lummock Sendent", "Neopia City - North East"],
    "Silver Wand": ["Str-6; Allows you to heal while walking around", "Eleus Batrin", "Neopia City - Central"],
    "Nature Wand": ["Str-10; Allows you to heal while walking around; Randomly heals 25 hp with Sprit of Oak", "Denethrir", "Jungle Ruins (tower)"],
    "Life Staff": ["Str-15; Allows you to heal while walking around; Allows you to cast Spirit of Growth, which heals 100 hp, takes 21 rounds before you can cast it again", "Erick", "Temple of Roo (1st level)"],
    "Moonstone Staff": ["Str-20; Allows you to heal while walking around; Heals 4 hp each round when below full health. Randomly heals with Spirit of Life for 30 hp", "Guardian of Life Magic", "Mountain Fortress"],
    
    // Bosses
    "Xantan the Foul": ["Level 10; 80/96/96 HP; 20 fire, 20 ice", "Recommended Level: 11/12/13", "Dank Cave level 4"],
    "Kreai": ["Level 15; 130/156/156 HP; 40 fire, 40 ice, 2-round stun", "Recommended Level: 16/17/17", "Jungle Ruins dungeon 1"],
    "Gors the Mighty": ["Level 20; 150/180/180 HP; 30 fire + 2-round stun, 30 ice + 2-round stun, 15 poison for 5 rounds, 30/36 heal", "Recommended Level: 22/23/24", "Jungle Ruins dungeon 2"],
    "Rollay Scaleback": ["Level 25; 180/216/216 HP; 3-round stun, 45/54 heal", "Recommended Level: 26/27/27", "Jungle Ruins dungeon 3"],
    "Archmagus of Roo": ["Level 31; 200/240/240 HP; 50 fire, 50 ice, 40 fire + 3-round stun, 40 ice + 3-round stun, 50 drain, 80/96 heal", "Recommended Level: 33/34/35", "Temple of Roo level 2"],
    "Guardian of Fire Magic": ["Level 40; 320/384/384 HP; 90 fire, 70 drain", "Recommended Level: 40/41/42", "Mountain Fortress "],
    "Guardian of Ice Magic": ["Level 40; 320/384/384 HP; 70 ice, 70 drain", "Recommended Level: 40/41/42", "Mountain Fortress "],
    "Guardian of Shock Magic": ["Level 40; 320/384/384 HP; 4-round stun, 70 drain", "Recommended Level: 40/41/42", "Mountain Fortress "],
    "Guardian of Spectral Magic": ["Level 40; 320/384/384 HP; Disable, 70 drain", "Recommended Level: 40/41/42", "Mountain Fortress "],
    "Guardian of Life Magic": ["Level 40; 450/540/540 HP; 70 drain, 75 heal", "Recommended Level: 40/41/42", "Mountain Fortress "],
    "Faleinn": ["Level 45; 500/600/600 HP; 70 fire, 70 ice, 70 stun damage + 3-round stun, 90 drain", "Recommended Level: 43/44/45", "Kal Panning "],
    "Jahbal": ["Level 50; 700/840/840 HP; 90 fire, 90 ice, 70 stun damage + 3-round stun, 50 poison for 5 rounds, Disable, 100 drain, 150 heal", "Recommended Level: 50/50/50", "Palace of theTwo Rings level 3"],
    "Mastermind": ["Level 50; --/1000/1000 HP; 120 fire, 120 ice, 50 drain for 3 rounds", "Recommended Level: --/50/50", "Palace of the Two Rings level 3 (Evil/Insane Modes Only)"],
    "Xantan Reborn": ["Level 50; --/--/1000 HP; 50 damage per turn, ", "Recommended Level: --/--/50", "Palace of the Two Rings level 3 (Insane Mode Only)"]
};

var RECIPE_BLAZING_JEWEL = ["Blazing Jewel", 0, ["Glowing Stone", "Tiny Garnet", "Ruby"]];
var RECIPE_CHILLING_JEWEL = ["Chilling Jewel", 0, ["Glowing Stone", "Tiny Lapis", "Sapphire"]];
var RECIPE_SHOCKING_JEWEL = ["Stunning Jewel", 0, ["Glowing Stone", "Tiny Amber", "Topaz"]];
var RECIPE_RADIANT_JEWEL = ["Radiant Jewel", 0, ["Glowing Stone", "Tiny Obsidian", "Onyx"]];
var RECIPE_GROWING_JEWEL = ["Growing Jewel", 0, ["Glowing Stone", "Tiny Beryl", "Emerald"]];

var RECIPE_SHIELD_1 = ["Energy Shield", 0, ["Glowing Stone", "Chunk Of Metal", "Small Yellow Gem"]];
var RECIPE_SHIELD_2 = ["Mirrored Force Field", 0, ["Glowing Stone", "Piece Of Smooth Glass", "Lodestone", "Tiny Obsidian"]];
var RECIPE_SHIELD_3 = ["Dawnshine Generator Shield", 0, ["Giant Spider Leg", "Dust Spider Pincer", "Desert Cobra Fang", "Sand Iguana Eye"]];
var RECIPE_SHIELD_4 = ["Energy Absorber", 0, ["Piece Of Agate", "Piece Of Chrysolite", "Piece Of Serpentine"]];

var RECIPE_ROBE_1 = ["Cloth Robe", 0, ["Glowing Stone", "Plains Lupe Pelt", "Blue Thread"]];
var RECIPE_ROBE_2 = ["Magic Robe", 0, ["Glowing Stone", "Cave Lupe Pelt", "Stretch Of Rotted Cloth", "Tiny Obsidian"]];
var RECIPE_ROBE_3 = ["Sorcerous Robe", 0, ["Drop Of Desert Cobra Venom", "Drop Of Giant Spider Blood", "Glob Of Dried Iguana Spit", "Pinch Of Crystallized Sand"]];
var RECIPE_ROBE_4 = ["Robe Of Protection", 0, ["Drakonid Eye", "Drakonid Hide", "Drakonid Heart"]];

var RECIPE_WAND_FIRE_1 = ["Red Wand", 0, ["Grey Lupe Fang", "Grizzly Bearog Tooth"]];
var RECIPE_WAND_FIRE_2 = ["Gold Wand", 0, ["Glowing Stone", "Tiny Garnet", "Corroded Pyrite Rod", "Xantan's Ring"]];
var RECIPE_WAND_FIRE_3 = ["Volcano Wand", 0, ["Glowing Stone", "Armored Stinger", "Noil's Mane", "Jungle Gauntlet", "Staff Of Ni-Tas"]];
var RECIPE_WAND_FIRE_4 = ["Fire Staff", 0, ["Carved Oak Staff", RECIPE_BLAZING_JEWEL, "Coruscating Gem"]];

var RECIPE_WAND_ICE_1 = ["Blue Wand", 0, ["Grey Lupe Fang", "Dire Lupe Pelt"]];
var RECIPE_WAND_ICE_2 = ["Steel Wand", 0, ["Glowing Stone", "Tiny Lapis", "Corroded Pewter Rod", "Xantan's Ring"]];
var RECIPE_WAND_ICE_3 = ["Glacier Wand", 0, ["Glowing Stone", "Shamanistic Totem", "Skeith Fang", "Jungle Vambrace", "Staff Of Ni-Tas"]];
var RECIPE_WAND_ICE_4 = ["Ice Staff", 0, ["Carved Oak Staff", RECIPE_CHILLING_JEWEL, "Coruscating Gem"]];

var RECIPE_WAND_SHOCK_1 = ["Yellow Wand", 0, ["Black Bearog Paw", "Grizzly Bearog Tooth"]];
var RECIPE_WAND_SHOCK_2 = ["Bronze Wand", 0, ["Glowing Stone", "Tiny Amber", "Corroded Copper Rod", "Xantan's Ring"]];
var RECIPE_WAND_SHOCK_3 = ["Storm Wand", 0, ["Glowing Stone", "Buzz Wing", "Wadjet Skin", "Jungle Breastplate", "Staff Of Ni-Tas"]];
var RECIPE_WAND_SHOCK_4 = ["Shock Staff", 0, ["Carved Oak Staff", RECIPE_SHOCKING_JEWEL, "Coruscating Gem"]];

var RECIPE_WAND_SPECTRAL_1 = ["Black Wand", 0, ["Black Bearog Paw", "Dire Lupe Pelt"]];
var RECIPE_WAND_SPECTRAL_2 = ["Iron Wand", 0, ["Glowing Stone", "Tiny Obsidian", "Corroded Ore Rod", "Xantan's Ring"]];
var RECIPE_WAND_SPECTRAL_3 = ["Mountain Wand", 0, ["Glowing Stone", "Scorpion Carapace", "Wooden Shield", "Jungle Helm", "Staff Of Ni-Tas"]];
var RECIPE_WAND_SPECTRAL_4 = ["Spectral Staff", 0, ["Carved Oak Staff", RECIPE_RADIANT_JEWEL, "Coruscating Gem"]];

var RECIPE_WAND_LIFE_1 = ["White Wand", 0, ["Grey Lupe Fang", "Black Bearog Paw"]];
var RECIPE_WAND_LIFE_2 = ["Silver Wand", 0, ["Glowing Stone", "Tiny Beryl", "Corroded Aluminum Rod", "Xantan's Ring"]];
var RECIPE_WAND_LIFE_3 = ["Nature Wand", 0, ["Glowing Stone", "Jungle Beast Claw", "Noil's Tooth", "Jungle Pauldrons", "Staff Of Ni-Tas"]];
var RECIPE_WAND_LIFE_4 = ["Life Staff", 0, ["Carved Oak Staff", RECIPE_GROWING_JEWEL, "Coruscating Gem"]];

var TODO_LIST_NEOPIA_CITY = [
    ["Def-3 Armour", 1, [RECIPE_ROBE_1, RECIPE_SHIELD_1]]
];

var TODO_LIST_DANK_CAVE = [
    ["Def-6 Armour", 1, [RECIPE_ROBE_2, RECIPE_SHIELD_2]],
    "Defeat Xantan the Foul",
    ["Str-6 Weapon", 1, [RECIPE_WAND_FIRE_2, RECIPE_WAND_ICE_2, RECIPE_WAND_SHOCK_2, RECIPE_WAND_SPECTRAL_2, RECIPE_WAND_LIFE_2]]
];

var TODO_LIST_JUNGLE_RUINS = [
    "Defeat Kreai",
    "Defeat Gors the Mighty",
    ["Str-10 Weapon", 1, [RECIPE_WAND_FIRE_3, RECIPE_WAND_ICE_3, RECIPE_WAND_SHOCK_3, RECIPE_WAND_SPECTRAL_3, RECIPE_WAND_LIFE_3]],
    "Defeat Rollay Scaleback"
];

var TODO_LIST_SWAMP_EDGE_CITY = [
    ["Def-10 Armour", 1, [RECIPE_ROBE_3, RECIPE_SHIELD_3]]
];

var TODO_LIST_TEMPLE_OF_ROO = [
    ["Find Keys to Open Doors 1-6", 6, ["Find the Copper-Plated Key", "Find the Bronze-Plated Key", "Find the Silver-Plated Key", "Find the Gold-Plated Key", "Find the Platinum-Plated Key", "Find the Crystalline-Plated Key"]],
    "Defeat the Archmagus of Roo",
    "Trade the Clouded Gem for the Coruscating Gem",
    ["Talk to Leirobas in Swamp Edge City", 0, ["Piece Of Living Crystal"]],
    ["Str-15 Weapon", 1, [RECIPE_WAND_FIRE_4, RECIPE_WAND_ICE_4, RECIPE_WAND_SHOCK_4, RECIPE_WAND_SPECTRAL_4, RECIPE_WAND_LIFE_4]]
];

var TODO_LIST_TECHO_CAVES = [
    ["Def-14 Armour", 1, [RECIPE_ROBE_4, RECIPE_SHIELD_4]],
    "Trade Rusty Medallion for Keladrian Medallion",
    ["Obtain Def-18 Armour", 1, ["Inferno Robe", "Evening Sun Shield"]],
    ["Str-20 Weapon: Defeat a Mountain Gaurdian", 1, ["Firedrop Staff (Guardian of Fire Magic)", "Iceheart Staff (Guardian of Ice Magic)", "Thunderstar Staff (Guardian of Shock Magic)", "Shadowgem Staff (Guardian of Spectral Magic)", "Moonstone Staff (Guardian of Life Magic)"]],
];

var TODO_LIST_TWO_RINGS = [
    "Defeat Faleinn",
    "Defeat Jahbal",
    "Defeat Mastermind (Evil/Insane)",
    "Defeat Xantan Reborn (Insane)",
];

var TODO_LIST_MAIN = ["", 0, [
    ["Neopia City", TODO_LIST_NEOPIA_CITY.length, TODO_LIST_NEOPIA_CITY],
    ["Dank Cave", TODO_LIST_DANK_CAVE.length, TODO_LIST_DANK_CAVE],
    ["Jungle Ruins", TODO_LIST_JUNGLE_RUINS.length, TODO_LIST_JUNGLE_RUINS],
    ["Swamp Edge City", TODO_LIST_SWAMP_EDGE_CITY.length, TODO_LIST_SWAMP_EDGE_CITY],
    ["Temple Of Roo", TODO_LIST_TEMPLE_OF_ROO.length, TODO_LIST_TEMPLE_OF_ROO],
    ["Techo Caves", TODO_LIST_TECHO_CAVES.length, TODO_LIST_TECHO_CAVES],
    ["Two Rings", TODO_LIST_TWO_RINGS.length, TODO_LIST_TWO_RINGS]
]];




