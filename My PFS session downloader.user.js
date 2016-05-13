// ==UserScript==
// @id         My-PFS-session-downloader
// @name         My PFS session downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Downloads PFS Sessions as JSON file
// @author       Michael Tracey
// @include https://secure.paizo.com/*
// @require http://code.jquery.com/jquery-latest.js
// @require     http://lightswitch05.github.io/table-to-json/javascripts/jquery.tabletojson.min.js
// ==/UserScript==

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

function copy(e) {
    var
    t = e.target,
        c = t.dataset.copytarget,
        inp = (c ? document.querySelector(c) : null);
    if (inp && inp.select) {
        inp.select();
        try {
            // copy text
            document.execCommand('copy');
            inp.blur();
        }
        catch (err) {
            alert('Error: please press Ctrl/Cmd+C to copy instead');
            return true;
        }
        alert ("Copied to clipboard, go import at https://tracker.campaigncodex.com/#/import");
    }
}

(function() {
    'use strict';
    $(document).ready(function() {
        if (  $('.bb-title > span:contains("Player Sessions")').length ) {
            document.body.addEventListener('click', copy, true);
           addGlobalStyle('#sessiontracker_overlay { width: 200px; position: fixed; top: 50px; right: 5px; text-align: center; z-index: 99999;  background-color: #FFEFDB;  border-radius: 15px; border: 2px solid #BA6B6B; margin: 10px 10px 0 10px; padding: 10px; }');
            addGlobalStyle('#sessiontracker_overlay button { -moz-border-radius: 10px; -webkit-border-radius: 0px; border-radius: 0px; -khtml-border-radius: 0px; background-image: none; display: inline-block; padding: 0 10px; font-size: 15px; font-weight: bold; line-height: 34px; text-decoration: none !important; text-shadow: none !important; color: #FFF;    background-color: #6E2D2D; transition: none; border: 0; } ');
            $("body").append ('<div id="sessiontracker_overlay"><h3>PFS Scenariotracker Export</h3><p>Make sure both the GM and Player tabs are open, then: <br /><br /><button id="export_sessiontracker_pc">export games played</button><div class="player_results"></div><br /><button id="export_sessiontracker_gm">export games run</button></p><div class="gm_results"></div></p><div style="clear:both"></div></div>');
            $("#export_sessiontracker_pc").click(function(){
                var foundin = $('.bb-title > span:contains("Player Sessions")');
                var table = foundin.parent().siblings(".bb-content").find('table');
                var tablejson = table.tableToJSON({
                    allowHTML: false,
                    headings: ['date','EventCode','EventName','Session','GM','Scenario','Player','Character','Faction','Prestige'],
                    ignoreColumns: [10,11],
                    textExtractor : {
                        0 : function(cellIndex, $cell) {
                            return $cell.find('time').attr('datetime');
                        },
                        2 : function(cellIndex, $cell) {
                            return $cell.find('a').text();
                        },
                        4 : function(cellIndex, $cell) {
                            return $cell.find('a').text();
                        },
                        5 : function(cellIndex, $cell) {
                            return $cell.find('a').text();
                        }
                    }
                });
                $.each(tablejson, function(i, item) {
                    if (tablejson[i].Scenario.length === 0){
                        delete tablejson[i];
                        return true;
                    }
                    if (tablejson[i].date.length === 0){
                        delete tablejson[i];
                        return true;
                    }
                    if (tablejson[i].Scenario.indexOf("(PFC)") !=-1) {
                        tablejson[i].campaign = 'PFC';
                    }
                    else {
                        tablejson[i].campaign = 'RPG';
                    }
                    tablejson[i].PFSNumber = tablejson[i].Player.replace(/[^0-9\-]/g,'');
                    delete tablejson[i].Player;
                    var chunks =  tablejson[i].Scenario.split(":");
                    if (chunks.length > 1 && chunks[0].substring(0,1) == '#'){
                        tablejson[i].ScenarioNumber = chunks[0].replace(/[^0-9\-]/g,'');
                    }
                    tablejson[i].Character = tablejson[i].Character.replace(/"/g, '');
                    tablejson[i].EventName = tablejson[i].EventName.replace(/"/g, '&quot;');
                    tablejson[i].GM = tablejson[i].GM.replace(/"/g, '&quot;');
                    tablejson[i].Scenario = tablejson[i].Scenario.replace(/"/g, '&quot;');
                });
                var str = JSON.stringify(tablejson, undefined, 4);
                var final = str.replace(/\\/g, "");
                final = final.substr(1);
                final = final.substr(0, final.length-1);
                console.log(final);
                $("#sessiontracker_overlay").animate( {width:'500'}, 500 );
                $("#sessiontracker_overlay > .player_results").html("<textarea id='player_json' class='player_json' style='width:98%; height: 200px; border: 1px solid black;'>"+ final +"</textarea><a href='#' data-copytarget='#player_json'>Copy Player Data to Clipboard</a>");
            });
            $("#export_sessiontracker_gm").click(function(){
                var foundin = $('.bb-title > span:contains("GM Sessions")');
                var table = foundin.parent().siblings(".bb-content").find('table');
                var tablejson = table.tableToJSON({
                    allowHTML: false,
                    headings: ['date','EventCode','EventName','Session','GM','Scenario','Player','Character','Faction','Prestige'],
                    ignoreColumns: [10,11],
                    textExtractor : {
                        0 : function(cellIndex, $cell) {
                            return $cell.find('time').attr('datetime');
                        },
                        2 : function(cellIndex, $cell) {
                            return $cell.find('a').text();
                        },
                        4 : function(cellIndex, $cell) {
                            return $cell.find('a').text();
                        },
                        5 : function(cellIndex, $cell) {
                            return $cell.find('a').text();
                        }
                    }
                });
                $.each(tablejson, function(i, item) {
                    if (tablejson[i].Scenario.length === 0){
                        delete tablejson[i];
                        return true;
                    }
                    if (tablejson[i].date.length === 0){
                        delete tablejson[i];
                        return true;
                    }
                    if (tablejson[i].Scenario.indexOf("(PFC)") !=-1) {
                        tablejson[i].campaign = 'PFC';
                    }
                    else {
                        tablejson[i].campaign = 'RPG';
                    }
                    tablejson[i].PFSNumber = tablejson[i].Player.replace(/[^0-9\-]/g,'');
                    delete tablejson[i].Player;
                    var chunks =  tablejson[i].Scenario.split(":");
                    if (chunks.length > 1 && chunks[0].substring(0,1) == '#'){
                        tablejson[i].ScenarioNumber = chunks[0].replace(/[^0-9\-]/g,'');
                    }
                    tablejson[i].Character = tablejson[i].Character.replace(/"/g, '');
                    tablejson[i].EventName = tablejson[i].EventName.replace(/"/g, '&quot;');
                    tablejson[i].GM = tablejson[i].GM.replace(/"/g, '&quot;');
                    tablejson[i].Scenario = tablejson[i].Scenario.replace(/"/g, '&quot;');
                });
                var str = JSON.stringify(tablejson, undefined, 4);
                var final = str.replace(/\\/g, "");
                final = final.substr(1);
                final = final.substr(0, final.length-1);
                console.log(final);
                $("#sessiontracker_overlay").animate( {width:'500'}, 500 );
                $("#sessiontracker_overlay > .gm_results").html("<textarea id='gm_json' class='gm_json' style='width:98%; height: 200px; border: 1px solid black;'>"+ final +"</textarea><a href='#' data-copytarget='#gm_json'>Copy GM Data to Clipboard</a>");
            });
        }
    });
})();
