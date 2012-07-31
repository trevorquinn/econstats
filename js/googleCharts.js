google.load("visualization", "1", {
    packages : [ "corechart" ]
});
google.setOnLoadCallback(drawChart);
function drawChart() {
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

    var cpiData = new google.visualization.DataTable();
    cpiData.addColumn('date', 'Month');
    cpiData.addColumn('number', 'Consumer Price Index');

    // Parsed blsCpiData
    var parsedBLSCpiData = [];
    _.each(blsCpiData, function(blsCpiDataItem) {
        var parsedBLSCpiDataItem = [
                new Date(blsCpiDataItem.year, blsCpiDataItem.month, 1),
                blsCpiDataItem.rate ];
        parsedBLSCpiData.push(parsedBLSCpiDataItem);
    }, this);

    cpiData.addRows(parsedBLSCpiData);

    var cpiOptions = {
        title : 'U.S. Consumer Price Index',
        chartArea : {
            width : '90%',
            height : '75%'
        },
        legend : {
            position : "none"
        }
    }

    var unempChart = new google.visualization.LineChart(document
            .getElementById('unempChart'));
    unempChart.draw(unempData, unempOptions);

    var cpiChart = new google.visualization.LineChart(document
            .getElementById('cpiChart'));
    cpiChart.draw(cpiData, cpiOptions);

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
}
