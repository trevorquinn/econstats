google.load("visualization", "1", {
    packages : [ "corechart" ]
});
google.setOnLoadCallback(drawChart);
function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('date', 'Month');
    data.addColumn('number', 'Unemployment');

    // Parsed blsData
    var parsedBLSData = [];
    _.each(blsData, function(blsDataItem) {
        var parsedBLSDataItem = [
                new Date(blsDataItem.year, blsDataItem.month, 1),
                blsDataItem.rate 
        ];
        parsedBLSData.push(parsedBLSDataItem);
    }, this);

    data.addRows(parsedBLSData);

    var options = {
        title : 'U.S. Unemployment Rate',
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

    var chart = new google.visualization.LineChart(document
            .getElementById('unempChart'));
    chart.draw(data, options);
}