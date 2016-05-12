// ==UserScript==
// @id         My-PFS-session-downloader
// @name         My PFS session downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Downloads PFS Sessions as JSON file
// @author       Michael Tracey
// @include https://secure.paizo.com/store/byCompany/p/paizoInc/pathfinder/pathfinderSociety/myAccount/sessions
// @include https://secure.paizo.com/cgi-bin/WebObjects/Store.woa/wa/browse
// @include https://secure.paizo.com/cgi-bin/WebObjects/Store.woa/wa/browse?path=pathfinderSociety/myAccount/sessions#tabs
// @include https://secure.paizo.com/cgi-bin/WebObjects/Store.woa/ajax/39.StandardPageTemplate.1.29.3.1.1.2.5.1.1.2.2.3.4.1.1.MAPathfinderSociety.4.3.1.2.3.2.1.3.1.1.3.1.5.1.2.1.3.1.1.1.0.1.1
// @include https://secure.paizo.com/cgi-bin/WebObjects/Store.woa/ajax/*
// @include https://secure.paizo.com/cgi-bin/WebObjects/Store.woa/wa/browse?path=pathfinderSociety/myAccount/sessions#tabs
// @match        https://secure.paizo.com/cgi-bin/WebObjects/Store.woa/wa/browse?path=pathfinderSociety/myAccount/sessions#tabs
// @match https://secure.paizo.com/cgi-bin/WebObjects/Store.woa/wa/browse
// @require http://code.jquery.com/jquery-latest.js
// @require     http://lightswitch05.github.io/table-to-json/javascripts/jquery.tabletojson.min.js
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    $(document).ready(function() {
        $("body").append ('<div id="sessiontracker_overlay" style="background: #ccc; width: 200px; position: fixed; top: 50px; right: 5px; border: 1px solid black; z-index: 59999;"><h3 style="text-align:center">Sessiontracker Export</h3><p style="text-align:center">Make sure both the GM and Player tabs are open, then: <br /><button id="export_sessiontracker_pc">export games played</button><div class="player_results"></div><button id="export_sessiontracker_gm">export games run</button></p><div class="gm_results"></div></p></div>');
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
            $("#sessiontracker_overlay").animate( {width:'500',height:'500'}, 2000 );
            $("#sessiontracker_overlay > .player_results").html("<textarea class='player_json' style='width:98%; height: 200px; border: 1px solid black;'>"+ final +"</textarea>");
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
            $("#sessiontracker_overlay").animate( {width:'500',height:'500'}, 2000 );
            $("#sessiontracker_overlay > .gm_results").html("<textarea class='player_json' style='width:98%; height: 200px; border: 1px solid black;'>"+ final +"</textarea>");
        });

    });
})();