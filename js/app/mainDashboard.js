define(function (require) {
    var $ = require('jquery'),
        d3 = require('d3'),
        noUiSlider = require('noUiSlider'),
        cScript = require('./customScript');
        topLineChart = require('./charts/topLineChart');
        sensitivityLineChart = require('./charts/sensitivityLineChart');
        gaugeChart = require('./charts/gaugeChart');

    // draw the top area line chart
    graph1LineChart = new topLineChart("#line-chart-container", "./data/topLineChart.json");
    graph1LineChart.drawLineChart(370, 290);
    // draw the sensitivity line chart
    sensitivityLineChart = new sensitivityLineChart("sensitivity-chart-container", "./data/sensitivityChart.json")
    sensitivityLineChart.drawSensitivityChart();
    // draw the top gauge chart
    d3.json("./data/gauge.json", function(error, data) {
        if(error) return error;
        data.parameters.forEach(function(gData) {
            if(cScript.checkWindowSize()) {
                gaugeChart.drawGaugeChart(gData, gData.color, "#gauge-" + gData.name + "-chart", 98, 98);
            } else {
                gaugeChart.drawGaugeChart(gData, gData.color, "#gauge-" + gData.name + "-chart", 122, 122);
            }
        });
    })

    // Operational parameters container
    var operaParamContainer = $("#operational-container");
    // Append the operational parameters
    cScript.appendParameters("./data/operationalParameters.json", operaParamContainer, "operational");

    // Tactical parameters container
    var operaParamContainer = $("#tactical-container");
    // Append the Tactical parameters
    cScript.appendParameters("./data/tacticalParameters.json", operaParamContainer, "tactical");

    // Strategical parameters container
    var operaParamContainer = $("#strategic-container");
    // Append the Strategical parameters
    cScript.appendParameters("./data/strategicParameters.json", operaParamContainer, "strategic");

    // Render the table body for graph 1
    cScript.displayTablesData("./data/tableGraph1.json", "bermuda-table-body", "paginated-table")
    // paginate the table
    cScript.paginateTable(1, "paginated-table");// pass number of rows per page

    // Toggle actions drop down
    cScript.actionsDropDown();

    // display save modal
    cScript.displaySaveModal();

    // display export modal
    cScript.displayExportModal();

    // display export modal
    cScript.displayLoadModal();

        //
    // display add modal
    cScript.displayAddModal();

    // render the loaded rows
    cScript.renderLoadRows("./data/load.json", "jq-graph-notifications");

    // Toggle graph drop down for tablet
    cScript.graphDropDownTablet();

    // Toggle between table and gauge
    cScript.toggleTableGauge();

    // show hold values
   cScript.showHoldValues();

    $(function() {
        // sensitivity functionality
        cScript.sensitivityToggler();

        $('.automate-checkbox').on('click', function() {
            var n = $( "#automate-inputoperational:checked" ).length;
            var aut = $(document).find('.automate-value');
            n === 1 ? aut.text('Yes') : aut.text('No');
        })
    })

});
