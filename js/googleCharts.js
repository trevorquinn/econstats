google.load("visualization", "1", {
    packages : [ "corechart" ]
});
google.setOnLoadCallback(drawChart);
function drawChart() {
    
    
    //UNEMPLOYMENT DATA AND CHART
    
    var unempData = new google.visualization.DataTable();
    unempData.addColumn('date', 'Month');
    unempData.addColumn('number', 'Unemployment');

    // Parsed blsData
    var parsedBLSData = [];
    _.each(blsData, function(blsDataItem) {
        var parsedBLSDataItem = [
                new Date(blsDataItem.year, blsDataItem.month, 1),
                blsDataItem.rate ];
        parsedBLSData.push(parsedBLSDataItem);
    }, this);

    unempData.addRows(parsedBLSData);

    var unempOptions = {
        title : 'U.S. Unemployment Rate (%)',
        chartArea : {
            width : '90%',
            height : '75%'
        },
        vAxis : {
            maxValue : 11.0,
            minValue : 0.0
        },
        legend : {
            position : "none"
        }
    };
    
    var unempChart = new google.visualization.LineChart(document
            .getElementById('unempChart'));
    unempChart.draw(unempData, unempOptions);
    
    
    //CPI DATA AND CHART

    var cpiData = new google.visualization.DataTable();
    cpiData.addColumn('date', 'Month');
    cpiData.addColumn('number', 'Consumer Price Index');

    // Parsed blsCpiData
    var parsedBLSCpiData = [];
    // Start at idx = 1 because we are using percentage
    // change from previous data point
    for (var idx = 1; idx < blsCpiData.length; idx++) {
        var prevBlsCpiDataItem = blsCpiData[idx - 1];
        var blsCpiDataItem = blsCpiData[idx];
        var percentChange = ((blsCpiDataItem.rate - prevBlsCpiDataItem.rate) / prevBlsCpiDataItem.rate) * 100;
        var parsedBLSCpiDataItem = [ 
            new Date(blsCpiDataItem.year, blsCpiDataItem.month, 1),
            percentChange ];
        parsedBLSCpiData.push(parsedBLSCpiDataItem);    
    }
    cpiData.addRows(parsedBLSCpiData);

    var cpiOptions = {
        title : 'U.S. Consumer Price Index (% change from previous month)',
        chartArea : {
            width : '90%',
            height : '75%'
        },
        legend : {
            position : "none"
        }
    }

    var cpiChart = new google.visualization.ColumnChart(document
            .getElementById('cpiChart'));
    cpiChart.draw(cpiData, cpiOptions);

    
    //GDP DATA AND CHART
    
    var gdpData = new google.visualization.DataTable();
    gdpData.addColumn('string', 'Quarter');
    gdpData.addColumn('number', 'GDP');

    // Parsed blsData
    var parsedGDPData = [];
    for (var i = beaData.length - 40; i < beaData.length; i++) {
        parsedGDPData.push([ "Q" + beaData[i].quarter + " " + beaData[i].year.toString().substring(2,4),
                             beaData[i].gdp ]);
    }

    gdpData.addRows(parsedGDPData);

    var gdpOptions = {
        title : 'U.S. GDP (% change from previous quarter)',
        chartArea : {
            width : '90%',
            height : '75%'
        },
        legend : {
            position : "none"
        }
    };

    var gdpChart = new google.visualization.ColumnChart(document
            .getElementById('gdpChart'));
    gdpChart.draw(gdpData, gdpOptions);
    
    
    //WEEKLY EARNINGS DATA AND CHART
    
    var earningsData = new google.visualization.DataTable();
    earningsData.addColumn('string', 'Quarter');
    earningsData.addColumn('number', 'Earnings');

    
    var parsedEarningsData = [];
    for (var i = 0; i < blsEarningsData.length; i++) {
        parsedEarningsData.push([ "Q" + blsEarningsData[i].quarter + " " + blsEarningsData[i].year.toString().substring(2,4),
                                  blsEarningsData[i].earnings ]);
    }

    earningsData.addRows(parsedEarningsData);
    
    var earningsOptions = {
            title : 'U.S. Median Weekly Earnings (in constant 1982-84 dollars)',
            chartArea : {
                width : '90%',
                height : '75%'
            },
            vAxis : {
                maxValue : 450,
                minValue : 0
            },
            legend : {
                position : "none"
            }
        };
    
    var earningsChart = new google.visualization.LineChart(document
            .getElementById('earningsChart'));
    earningsChart.draw(earningsData, earningsOptions);
}
