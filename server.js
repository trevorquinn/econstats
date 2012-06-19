var express = require("express");
var zombie = require("zombie");

var retrieveUnemployment = function(callback) {
	// Screen scrape BLS web page for latest unemployment information	
	zombie.visit("http://data.bls.gov/timeseries/LNS14000000", function (err, 
	            browser, status) {
		var unemploymentData = [];
		
		// Grab the unemployment table
		var ths = browser.querySelectorAll("table.regular-data tbody th");
		for (var i = 0; i < ths.length; i++) {
			var unemploymentEntry = {};
			
			// Grab each row header and use it to set the year
			var th = ths.item(i);
			var year = th.innerHTML.trim();
			
			// Grab each cell in the row and use it to set the month and 
			// unemployment rate
			var tds = th.parentNode.getElementsByTagName("td");
			for(var j = 0; j < tds.length && j < 12; j++) {
				var monthData = tds.item(j).innerHTML.trim();
				if (monthData && monthData !== "&nbsp;") {
					unemploymentEntry = {
					    month: j + 1,
					    year: parseFloat(year),
					    rate: parseFloat(monthData)
					};
					unemploymentData.push(unemploymentEntry);
				}
			}
		}
		console.log("Retrieved unemployment data from BLS.");
		callback(unemploymentData);
	});
}

var retrieveGDP = function(callback) {
    // Screen scrape BEA table for GDP data   
    zombie.visit("http://www.bea.gov/iTable/iTable.cfm?ReqID=9&step=1", function (err, 
                browser, status) {
        var gdpData = [];
        
        // Grab the GDP row from the table
        var tr = browser.querySelectorAll("table.oneg_1 tbody tr")[0];
        var gdpEntry = {};
        
        // Grab each row header and use it to set the year
        //var th = ths.item(i);
        //var year = th.innerHTML.trim();
        
        // Grab each cell in the row and use it to set the month and 
        // unemployment rate
        var tds = th.parentNode.getElementsByTagName("td");
        for(var j = 0; j < tds.length; j++) {
            var quarterData = tds.item(j).innerHTML.trim();
            if (quarterData && monthData !== "&nbsp;") {
                gdpEntry = {
                    //month: j + 1,
                    //year: parseFloat(year),
                    pctChangeFromPrev: parseFloat(monthData)
                };
                gdpData.push(unemploymentEntry);
            }
        }
        console.log("Retrieved GDP data from BEA.");
        callback(gdpData);
    });
}

var app = express.createServer();

app.set('view options', {
    layout : false
});

// Expose the static resources on two non-route URLs
app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));

//Route: GET /unemployment -> Unemployment JSON data
app.get("/unemployment", function(req, res) {
	retrieveUnemployment(function(unemploymentData) {
		res.json(unemploymentData);		
	});	
});

//Route: GET /unemployment -> Unemployment JSON data
app.get("/gdp", function(req, res) {
    retrieveGDP(function(gdpData) {
        res.json(gdpData);      
    }); 
});

//Route: GET /dashboard -> Jade template
app.get("/dashboard", function(req, res) {
    retrieveUnemployment(function(unemploymentData) {
        res.render("index.jade", {
            blsData : JSON.stringify(unemploymentData)
        });
    });
});

//Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_INTERNAL_IP || "127.0.0.1";
var port    = process.env.OPENSHIFT_INTERNAL_PORT || "3000";

//And start the app on that interface (and port).
app.listen(port, ipaddr, function() {
   console.log('%s: Node server started on %s:%d ...', Date(Date.now() ),
               ipaddr, port);
});