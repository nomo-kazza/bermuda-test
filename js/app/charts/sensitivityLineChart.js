define(['d3'], function (d3) {
    function sensitivityLineChart(chartContainer, dataUrl) {
        this.chartContainer = chartContainer;
        this.dataUrl = dataUrl;
    }
    function createSensitivityChart(chartContainer, dataUrl) {
            // set the dimensions and margins of the graph
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 617 - margin.left - margin.right,
            height = 290 - margin.top - margin.bottom;

        // set the ranges
        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        // updated value
        var newTime = 0;
        var newCost = 0;

        // append the svg object to the chart container of the page
        // appends a 'group' element to 'svg'
        var svg = d3.select("#"+chartContainer).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .classed("line-chart", true);

        // this group is for transparent background of the chart
        var bgGroup = svg.append("g")
            .classed("bg-group", true)
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")
            .append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#5C7676")
            .attr("fill-opacity", "0.05");

        var chartGroup =  svg.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // define the line for cost
        var costLine = defineLine("cost");
        // define the area for cost
        var areaTotal = defineArea("cost");

        // line colors
        var lineColors = d3.scaleOrdinal(d3.schemeCategory20);
        // area colors
        var areaColors = d3.scaleOrdinal(d3.schemeCategory20);

        /**
        * This method define the line.
        */
        function defineLine() {
            return d3.line().curve(d3.curveCatmullRom)
                .x(function(d) { return x(d.time); })
                .y(function(d) { return y(d.cost); });
        }
        /**
        * This method define the area.
        */
        function defineArea(prop) {
            return d3.area().curve(d3.curveCatmullRom)
                .x(function(d) { return x(d.time); })
                .y0(height)
                .y1(function(d) { return y(d.cost); });
        }
        /**
        * This method define the path for line.
        */
        function defineLinePath(parameters) {
            // var parameters = paramsData.parameters;
            var line = d3.line()
                .curve(d3.curveCatmullRom)
                .x(function(d) { return x(d.time); })
                .y(function(d) { return y(d.cost); });
            var lGroup = chartGroup.selectAll(".group-line")
                .data(parameters)
                .enter().append("g")
                .attr("class", "group-line")

            lGroup.append("path")
                .attr("class", "line-path")
                .attr("d", function(d) { return line(d.values); })
                .attr("stroke-width", 2)
                .attr("id", function(d) { return "line-id_" + d.paramType + d.paramId })
                .style("stroke", function(d) { return lineColors(d.id); })
                .attr("opacity", 0);
        }
        /**
        * This method define the path for area.
        */
        function defineAreaPath(parameters) {
            var area = d3.area().curve(d3.curveCatmullRom)
                .x(function(d) { return x(d.time); })
                .y0(height)
                .y1(function(d) { return y(d.cost); });
            var aGroup = chartGroup.selectAll(".group-area")
                .data(parameters)
                .enter().append("g")
                .attr("class", "group-area")

            aGroup.append("path")
                .attr("class", "area-path")
                .attr("d", function(d) { return area(d.values); })
                .attr("id", function(d) { return "area-id_" + d.paramType + d.paramId })
                .style("fill", function(d) { return lineColors(d.id); })
                .attr("fill-opacity", 0.1)
                .attr("opacity", 0);
        }

        /**
         * This method draw the x-axis and y-axis with their grids
         */
        function drawAxis(data) {
            // Scale the range of the data
            x.domain([0, 100]);
            y.domain([0, 30]);
            // Add the X Axis
            var xAxis = d3.axisBottom(x)
                .ticks(5)
                .tickPadding(10)
                .tickFormat(function(d, i) { return i === 0 ? d : d + "%"; })
                .tickSize(-height);
            chartGroup.append("g")
                .attr("transform", "translate(0," + height + ")")
                .classed("x-axis", true)
                .call(xAxis);

            // Add the Y Axis
            var yAxis = d3.axisLeft(y)
                .ticks(6)
                .tickPadding(10)
                .tickFormat(function(d,i) { return i === 0 ? d : d + " M"; })
                .tickSize(-width);
            chartGroup.append("g")
                .classed("y-axis", true)
                .call(yAxis);
            // wait until svg fully generated by d3 and append the line between ticks
            setTimeout(function() {
                svg.selectAll("g.y-axis g.tick:not(:nth-child(2))")
                    .append("line")
                    .classed("grid-line", true)
                    .attr("x1", 0)
                    .attr("y1", height/12)
                    .attr("x2", width)
                    .attr("y2", height/12);

                svg.selectAll("g.x-axis g.tick:not(:last-child)")
                    .append("line")
                    .classed("grid-line", true)
                    .attr("x1", width/10)
                    .attr("y1", 0)
                    .attr("x2", width/10)
                    .attr("y2", -height);

                svg.selectAll("g.x-axis g.tick:nth-child(2) > line:first-child")
                    .attr("y2", -height - 15) // left top (y-axis) extra line
                    .classed("first-grid-line", true);
                svg.selectAll("g.y-axis g.tick:nth-child(2) > line")
                    .attr("x2", width + 15)  // bottom right (x-axis) extra line
                    .classed("first-grid-line", true);

                svg.selectAll("g.y-axis g.tick:not(:nth-child(2)) > line:first-child")
                    .attr("x1", 1);

            }, 10);
        } // drawAxis function end here //

        /**
         * This method define the button on the line path.
         *
         * @param data the chart data
         * @param name the name of the line path (legend)
         */
        function defineBtnOnLine(parameters) {
            var btnG = svg.append("g")
                .attr("class", "btn-drag");

            btnG.append("path") // this is the black vertical line to follow btn
                .attr("class", "btn-line")
                .style("stroke", "#B2B2B2")
                .style("stroke-width", "1px")
                .attr("transform", "translate(50,20)")
                .style("opacity", "1");

            var btnPerLine = btnG.selectAll('.btn-per-line')
                .data(parameters)
                .enter()
                // .filter(function(d,i) { return (i === 4); })
                .append("g")
                .attr("class", "btn-per-line");


            var rect = btnPerLine.append("rect")
                .attr("width", 13)
                .attr("height", 14)
                .attr("x", function(d,i) {
                    if(d.xPos) {
                        return x(d.xPos);
                    }
                })
                .attr("y", function(d,i) {
                    if(d.yPos) {
                        return y(d.yPos);
                    }
                })
                .attr("transform", "translate(44,13)")
                .attr("id", function(d,i) {
                    return "drag-id_" + d.paramType + d.paramId;
                })
                .classed("rect-btn", true)
                .attr("rx", 4)
                .attr("ry", 4)
                .style("stroke-width", "2px")
                .attr('stroke', '#fff')
                .attr("opacity", 0)
                .attr("fill", function(d) { return lineColors(d.id); })
                .style("cursor", "pointer")
                .call(drag)
        } // defineBtnOnLine function end here //

        /**
        * This method create drag listener.
        */
        var drag = d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded);
        /**
        * This method called when the drag started.
        */
        function dragStarted(d) {
            d3.select(this).raise().classed('active', true);
        }
        /**
        * This method called while the element dragged.
        */
        var tempY = 0;
        function dragged(d) {
            var xPos = d3.event.x;
            var yPos = d3.event.y;
            var idLine = d3.select(this).attr("id").split("_")[1];
            var line = document.getElementById("line-id_" + idLine);

            // find the position of the button
            var pathEl = line;
            var pathLength = pathEl.getTotalLength();
            var BBox = pathEl.getBBox();
            var scale = pathLength/BBox.width;
            var offsetLeft = document.getElementById(chartContainer).offsetLeft;


            var newX = d3.event.x - offsetLeft - 45;
            var beginning = newX, end = pathLength, target,
                            pos, newY, xZero;
            while (true) {
                target = Math.floor((beginning + end) / 2);
                pos = pathEl.getPointAtLength(target);
                if ((target === end || target === beginning) && pos.x !== x) {
                    break;
                }
                if (pos.x > newX)      end = target;
                else if (pos.x < newX) beginning = target;
                else break; //position found
            }

            if(pos) {
                newY = pos.y;
            }

            if(newX <= 0) {
                newX = 0;
            }
            if(newY <= 0) {
                newY = 0;
            }
            var xBound = width;
            if(newX >= xBound) {
                newX = xBound;
            }
            var yBound = height;
            if(newY >= yBound) {
                newY = yBound;
            }

            newTime = x.invert(newX);
            newCost = y.invert(newY);

            d3.select(this) // new button position
                .attr("opacity", 1)
                .attr("x", newX)
                .attr("y", newY);

            d3.select(".btn-line") // new horizontal line position
                .attr("d", function() {
                    var d = "M" + width + "," + (newY);
                    d += " " + 0 + "," + (newY);
                    return d;
                });
            // update the date
            updateData(newTime, newCost, idLine);
        }

        /**
        * This method called when the drag ended.
        */
        function dragEnded(d) {
            d3.select(this).classed('active', false);
        }


        // Get the data
        d3.json(dataUrl, function(error, paramsData) {
            if (error) throw error;
            drawAxis();
            var parameters = paramsData.parameters;
            defineLinePath(parameters);
            defineAreaPath(parameters);
            defineBtnOnLine(parameters);
        });

        /**
        * This method update the line path based on the event.
        */
        function updateData(newTime, newCost, name) {
            var retData = { "name": name, "time": newTime, "cost": newCost };
            console.log(retData);
            return retData;
        }
    }


    sensitivityLineChart.prototype = {
        drawSensitivityChart: function() {
            createSensitivityChart(this.chartContainer, this.dataUrl);
        }
    }
    return sensitivityLineChart;
});
