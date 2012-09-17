var express = require("express");
var zombie = require("zombie");
var request = require("request");

var retrieveUnemployment = function(callback) {
    // Screen scrape BLS web page for latest unemployment information
    zombie.visit("http://data.bls.gov/timeseries/LNS14000000", function(err,
            browser, status) {
        var unemploymentData = [];

        // Grab the unemployment table
        var ths = browser.querySelectorAll("table.regular-data tbody th");
        for ( var i = 0; i < ths.length; i++) {
            var unemploymentEntry = {};

            // Grab each row header and use it to set the year
            var th = ths.item(i);
            var year = th.innerHTML.trim();

            // Grab each cell in the row and use it to set the month and
            // unemployment rate
            var tds = th.parentNode.getElementsByTagName("td");
            for ( var j = 0; j < tds.length && j < 12; j++) {
                var monthData = tds.item(j).innerHTML.trim();
                if (monthData && monthData !== "&nbsp;") {
                    unemploymentEntry = {
                        month : j + 1,
                        year : parseFloat(year),
                        rate : parseFloat(monthData)
                    };
                    unemploymentData.push(unemploymentEntry);
                }
            }
        }
        console.log("Retrieved unemployment data from BLS.");
        callback(unemploymentData);
    });
}

var retrieveConsumerPriceIndex8284 = function(callback) {
    // Screen scrape BLS web page for latest cpi information
    zombie.visit("http://data.bls.gov/timeseries/CUUR0000SA0", function(err,
            browser, status) {
        var cpiData = [];

        // Grab the cpi table
        var ths = browser.querySelectorAll("table.regular-data tbody th");
        for ( var i = 0; i < ths.length; i++) {
            var cpiEntry = {};

            // Grab each row header and use it to set the year
            var th = ths.item(i);
            var year = th.innerHTML.trim();

            // Grab each cell in the row and use it to set the month and
            // cpi index
            var tds = th.parentNode.getElementsByTagName("td");
            for ( var j = 0; j < tds.length && j < 12; j++) {
                var monthData = tds.item(j).innerHTML.trim();
                if (monthData && monthData !== "&nbsp;") {
                    cpiEntry = {
                        month : j + 1,
                        year : parseFloat(year),
                        rate : parseFloat(monthData)
                    };
                    cpiData.push(cpiEntry);
                }
            }
        }
        console.log("Retrieved cpi data from BLS.");
        callback(cpiData);
    });
}

var retrieveGDP = function(callback) {
    var url = "http://www.bea.gov//national/nipaweb/GetCSV.asp?GetWhat=SS_Data/Section1All_csv.csv&Section=2";
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var i = 0;
            var lineNumber = 0;
            var quarterlyDataFound = false;
            var years, quarters, gdp;
            while (i < body.length) {
                var j = body.indexOf("\n", i);
                if (j == -1)
                    j = body.length;
                var line = body.substr(i, j - i);
                if (lineNumber === 39 && line.indexOf("Quarterly data") === 0) {
                    quarterlyDataFound = true;
                } else if (lineNumber === 44 && quarterlyDataFound) {
                    years = line.split(",");
                } else if (lineNumber === 45 && quarterlyDataFound) {
                    quarters = line.split(",");
                } else if (lineNumber === 46 && quarterlyDataFound
                        && line.indexOf("Gross domestic product") !== -1) {
                    gdp = line.split(",");
                }
                i = j + 1;
                lineNumber++;
            }
        }
        var gdpJson = [];
        for (var i = 3; i < gdp.length; i++) {
            gdpJson.push({
               quarter: parseInt(quarters[i].trim()),
               year: parseInt(years[i].trim()),
               gdp: parseFloat(gdp[i].trim())
            });
        }
        console.log("Retrieved GDP data from BEA.");
        callback(gdpJson);
    });

}

var retrieveEarnings = function(callback) {
    // Screen scrape BLS web page for latest unemployment information
    zombie.visit("http://data.bls.gov/cgi-bin/srgate", function(err,
            browser, status) {
        var earningsData = [];

        // Fill in a text area with the name "series_id" with the series for
        // weekly earnings, press the submit button, then press the "Retrieve Data"
        // button on the resulting page
        browser.
            fill("series_id", "LES1252881600").
            pressButton(".submit-button", function(err, browser, status) {
                browser.pressButton("Retrieve Data", function(err, browser, status) {
                    // Define the processing function for earnings data 
                    var ths = browser.querySelectorAll("table.regular-data tbody th");
                    for ( var i = 0; i < ths.length; i++) {
                        var earningsEntry = {};

                        var th = ths.item(i);
                        var year = th.innerHTML.trim();

                        var tds = th.parentNode.getElementsByTagName("td");
                        for ( var j = 0; j < tds.length && j < 4; j++) {
                            var quarterData = tds.item(j).innerHTML.trim();
                            if (quarterData && quarterData !== "&nbsp;") {
                                earningsEntry = {
                                    quarter : j + 1,
                                    year : parseFloat(year),
                                    earnings : parseFloat(quarterData)
                                };
                                earningsData.push(earningsEntry);
                            }
                        }
                    }
                    console.log("Retrieved earnings data from BLS.");
                    callback(earningsData);
                });
            });
    });
}

var app = express.createServer();

app.set('view options', {
    layout : false
});

// Expose the static resources on two non-route URLs
app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));

// Route: GET /unemployment -> Unemployment JSON data
app.get("/unemployment", function(req, res) {
    retrieveUnemployment(function(unemploymentData) {
        res.json(unemploymentData);
    });
});

// Route: GET /cpi -> CPI JSON data
app.get("/cpi", function(req, res) {
    retrieveConsumerPriceIndex8284(function(cpiData) {
        res.json(cpiData);
    });
});

// Route: GET /gdp -> GDP JSON data
app.get("/gdp", function(req, res) {
    retrieveGDP(function(gdpData) {
        res.json(gdpData);
    });
});

//Route: GET /gdp -> GDP JSON data
app.get("/earnings", function(req, res) {
    retrieveEarnings(function(earnings) {
        res.json(earnings);
    });
});

// Route: GET /dashboard -> Jade template
app.get("/dashboard", function(req, res) {
    retrieveUnemployment(function(unemploymentData) {
        retrieveGDP(function(beaData) {
            retrieveConsumerPriceIndex8284(function(cpiData) {
                retrieveEarnings(function(earningsData) {
                    res.render("index.jade", {
                        blsData : JSON.stringify(unemploymentData),
                        blsCpiData : JSON.stringify(cpiData),
                        beaData : JSON.stringify(beaData),
                        blsEarningsData : JSON.stringify(earningsData)
                    });    	
                });
            });
        });
    });
});

// Get the environment variables we need.
var ipaddr = process.env.OPENSHIFT_INTERNAL_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_INTERNAL_PORT || "3000";

// And start the app on that interface (and port).
app.listen(port, ipaddr, function() {
    console.log('%s: Node server started on %s:%d ...', Date(Date.now()),
            ipaddr, port);
});
