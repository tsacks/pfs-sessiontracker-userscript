// ==UserScript==
// @id         My-PFS-session-downloader
// @name         My PFS session downloader
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Downloads PFS Sessions as JSON file
// @author       Michael Tracey
// @include https://secure.paizo.com/people/*/sessions
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
        if ( $('.tp-front-tab > .bb-content:contains("Sessions")').length ){
            console.log('Starting EXPORT stuff for Sessiontracker');
            document.body.addEventListener('click', copy, true);
            addGlobalStyle('#clickme { border-radius: 12px 12px 0px 0px; font-weight: 600; background-color: #6E2D2D; color: #FFF;  position: absolute; left: -50px; bottom: 50px; height: 20px; width: 120px; writing-mode: sideways-lr; -webkit-transform: rotate(-90deg);	-moz-transform: rotate(-90deg); -ms-transform: rotate(-90deg); -o-transform: rotate(-90deg); transform: rotate(-90deg);}');
            addGlobalStyle('#sessiontracker_overlay { min-height: 100px; width: 200px; position: fixed; top: 50px; right: -212px; text-align: center; z-index: 99999;  background-color: #FFEFDB;  border-radius: 15px; border: 2px solid #BA6B6B; margin: 10px 10px 0 10px; padding: 10px; }');
            addGlobalStyle('#sessiontracker_overlay button { -moz-border-radius: 10px; -webkit-border-radius: 0px; border-radius: 0px; -khtml-border-radius: 0px; background-image: none; display: inline-block; padding: 0 10px; font-size: 15px; font-weight: bold; line-height: 34px; text-decoration: none !important; text-shadow: none !important; color: #FFF;    background-color: #6E2D2D; transition: none; border: 0; } ');
            $("body").append ('<div id="sessiontracker_overlay"><div id="clickme">&uarr; Export &uarr;</div><h3>PFS Sessions Export</h3><br /><button id="export_sessiontracker">Export Games</button><div class="player_results"></div><div style="clear:both"></div></div>');
            var rightVal = -280;
            $("#clickme").click(function () {
                if (rightVal === 0){
                    rightVal = -212;
                    $(this).parent().animate({right: rightVal + 'px'}, {queue: false, duration: 500});
                    $(this).html("&uarr; EXPORT &uarr;");
                }
                else {
                    rightVal = 0;
                    $(this).html("&darr; EXPORT &darr;");
                    $(this).parent().animate({right: rightVal + 'px'}, {queue: false, duration: 500});
                }
            });
            $("#export_sessiontracker").click(function(){
                var table = $('div.bordered-box.tp-content > .bb-content').find('table');
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
                        console.log("REMOVING EMPTY ROW");
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
                    if (tablejson[i].Prestige.indexOf("GM") !=-1) {
                        tablejson[i].role = 'GM';
                    }
                    else {
                        tablejson[i].role = 'Player';
                    }
                    tablejson[i].Prestige = tablejson[i].Prestige.replace(/\D/g,'');
                    tablejson[i].PFSNumber = tablejson[i].Player.replace(/[^0-9\-]/g,'');
                    delete tablejson[i].Player;
                    tablejson[i].season = '';
                    tablejson[i].senario = '';
                    tablejson[i].FullScenarioNumber ='';
                    tablejson[i].ScenarioName = tablejson[i].Scenario.replace(/\–/,'-');
                    delete tablejson[i].Scenario;
                    var chunks =  tablejson[i].ScenarioName.split(":");
                    if (chunks.length > 1 && chunks[0].substring(0,1) == '#'){
                        tablejson[i].FullScenarioNumber = chunks[0].replace(/[^0-9\-]/g,'');
                        var chunks2 = tablejson[i].FullScenarioNumber.split("-");
                        if (chunks2.length > 1){
                            tablejson[i].season = chunks2[0].replace(/\D/g,'');
                            tablejson[i].senario = chunks2[1].replace(/\D/g,'');
                        }
                        else{
                            tablejson[i].senario = chunks[0].replace(/\D/g,'');
                            if (tablejson[i].senario >= 29){
                                tablejson[i].season = '1';
                            }
                            else {
                                tablejson[i].season = '0';
                            }
                        }
                    }
                    tablejson[i].Character = tablejson[i].Character.replace(/"/g, '');
                    tablejson[i].EventName = tablejson[i].EventName.replace(/"/g, '&quot;');
                    tablejson[i].GM = tablejson[i].GM.replace(/"/g, '&quot;');
                    tablejson[i].ScenarioName = tablejson[i].ScenarioName.replace(/"/g, '&quot;');
                });
                var str = JSON.stringify(tablejson, undefined, 4);
                var final = str.replace(/\\/g, "");
                final = final.substr(1);
                final = final.substr(0, final.length-1);
                console.log(final);
                $("#export_sessiontracker").hide();
                $("#sessiontracker_overlay > .player_results").html("<textarea id='player_json' class='player_json' style='width:80%; border: 1px solid black;'>"+ final +"</textarea><br /><a href='#' data-copytarget='#player_json'>Copy Data to Clipboard</a>");
            });

        }
        if (  $('.bb-title > span:contains("Player Sessions")').length ) {
            addGlobalStyle('#sessiontracker_overlay { width: 200px; position: fixed; top: 50px; right: 5px; text-align: center; z-index: 99999;  background-color: #FFEFDB;  border-radius: 15px; border: 2px solid #BA6B6B; margin: 10px 10px 0 10px; padding: 10px; }');
            addGlobalStyle('#sessiontracker_overlay button { -moz-border-radius: 10px; -webkit-border-radius: 0px; border-radius: 0px; -khtml-border-radius: 0px; background-image: none; display: inline-block; padding: 0 10px; font-size: 15px; font-weight: bold; line-height: 34px; text-decoration: none !important; text-shadow: none !important; color: #FFF;    background-color: #6E2D2D; transition: none; border: 0; } ');
            $("body").append ('<div id="sessiontracker_overlay"><h3>PFS Scenariotracker Export</h3>Import has moved to your account menu.  Make sure you are logged in, click on your name, then your "Sessions" tab to export to PFS Session Tracker</div>');
        }

    });
})();
