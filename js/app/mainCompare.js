'use strict'
define(function (require) {
    var $ = require('jquery'),
        d3 = require('d3'),
        noUiSlider = require('noUiSlider'),
        cScript = require('./customScript'),
        topLineChart = require('./charts/topLineChart'),
        gaugeChart = require('./charts/gaugeChart');

    // draw the top area line chart
    var graph1LineChart = new topLineChart("#line-chart-container-graph", "./data/topLineChart.json");
    // graph1LineChart.drawLineChart(370, 290);
    var graph2LineChart = new topLineChart("#line-chart-container-graph2", "./data/topLineChartGraph2.json");

    if(cScript.checkWindowSize()) {
        graph1LineChart.drawLineChart(330, 260);
        graph2LineChart.drawLineChart(330, 260);
    } else {
        graph1LineChart.drawLineChart(370, 290);
        graph2LineChart.drawLineChart(370, 290);
    }
    // draw the top gauge chart for graph1
    d3.json("./data/gauge.json", function(error, data) {
        if(error) return error;
        data.parameters.forEach(function(gData) {
            if(cScript.checkWindowSize()) {
                gaugeChart.drawGaugeChart(gData, gData.color, "#gauge-graph1-" + gData.name + "-chart", 98, 98);
            } else {
                gaugeChart.drawGaugeChart(gData, gData.color, "#gauge-graph1-" + gData.name + "-chart", 122, 122);
            }
        });
    })
    // draw the top gauge chart for graph2
    d3.json("./data/gaugeGraph2.json", function(error, data) {
        if(error) return error;
        data.parameters.forEach(function(gData) {
            if(cScript.checkWindowSize()) {
                gaugeChart.drawGaugeChart(gData, gData.color, "#gauge-graph2-" + gData.name + "-chart", 98, 98);
            } else {
                gaugeChart.drawGaugeChart(gData, gData.color, "#gauge-graph2-" + gData.name + "-chart", 122, 122);
            }
        });
    })

    // Render the table body for graph 1
    cScript.displayTablesData("./data/tableGraph1.json", "bermuda-table-graph1", "table-container")
    // paginate the table
    cScript.paginateTable(1, "table-container");// pass number of rows per page
    // Render the table body for graph 2
    cScript.displayTablesData("./data/tableGraph2.json", "bermuda-table-graph2", "table-container2")
    // paginate the table
    cScript.paginateTable(1, "table-container2");// pass number of rows per page


    // Operational parameters container
    var operaParamContainer = $("#operational-container");
    // Append the operational parameters
    cScript.appendParameters("./data/operationalParameters.json", operaParamContainer, "operational");

    // Operational parameters container for graph 2
    var operaParamContainer2 = $("#operational-container2");
    // Append the operational parameters
    cScript.appendParameters("./data/operationalParameters.json", operaParamContainer2, "operational2");

    // Tactical parameters container
    var tacticalParamContainer = $("#tactical-container");
    // Append the Tactical parameters
    cScript.appendParameters("./data/tacticalParameters.json", tacticalParamContainer, "tactical");

    // Tactical parameters container for graph 2
    var tacticalParamContainer2 = $("#tactical-container2");
    // Append the Tactical parameters
    cScript.appendParameters("./data/tacticalParameters.json", tacticalParamContainer2, "tactical2");

    // Strategical parameters container
    var strategicParamContainer = $("#strategic-container");
    // Append the Strategical parameters
    cScript.appendParameters("./data/strategicParameters.json", strategicParamContainer, "strategic");

    // Strategical parameters container for graph 2
    var strategicParamContainer2 = $("#strategic-container2");
    // Append the Strategical parameters
    cScript.appendParameters("./data/strategicParameters.json", strategicParamContainer2, "strategic2");

    // Change the graph type.
    cScript.changeGraphType();

    // Toggle graph 1 drop down
    cScript.graphDropDown('#graph2-nav', '#graph-dd-2');
    // Toggle graph 2 drop down
    cScript.graphDropDown('#graph1-nav', '#graph-dd-1');

    // display save modal
    cScript.displaySaveModal();

    // display export modal
    cScript.displayExportModal();

    // render the loaded rows
    cScript.renderLoadRows("./data/load.json", "graph-notifications");

    $(function() {
        var doc = $(document);
        doc.find('.graph1-parameters .hasHoldValueLi').addClass('active');
        doc.find('.graph1-parameters .hold-value').show();
        doc.find('.graph1-parameters .hasHoldValue').find('.input-value.jq-input-value').hide();
        doc.find('.graph1-parameters .hasHoldValue').find('.cost-input.jq-cost-input').removeClass('hidden-input');
    })

});
