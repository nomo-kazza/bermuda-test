define(['d3'], function (d3) {
    function topLineChart(chartContainer, dataUrl) {
        this.chartContainer = chartContainer;
        this.dataUrl = dataUrl;
    }
    function createChart(id, dataUrl, chartWidth, chartHeight) {
        // set the dimensions and margins of the graph
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = chartWidth - margin.left - margin.right,
            height = chartHeight - margin.top - margin.bottom;

        // set the ranges
        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);
        // new data holder
        var newData = []
        // append the svg object to the chart container of the page
        // appends a 'group' element to 'svg'
        var svg = d3.select(id).append("svg")
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
            .attr("fill", "#fff")
            .attr("fill-opacity", "0.1");

        var chartGroup =  svg.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        // line colors
        var lineColors = d3.scaleOrdinal()
            .domain(0,4)
            .range(["#ffffff", "#007FFF", "#77FF00", "#00E7FF", "#FF15AB", "rgba(255,255,255,0.5)"]);
        // area colors
        var areaColors = d3.scaleOrdinal()
            .domain(0,4)
            .range(["rgba(0,0,0,0.1)", "rgba(0,87,165,0.25)", "rgba(59,170,0,0.25)",
                "rgba(2,124,137,0.64)", "rgba(255,21,171,0.25)", "rgba(255,255,255,0.1)"]);

        // define the line for cost
        var costLine = defineLine("cost");
        // define the area for cost
        var areaTotal = defineArea("cost");

        /**
        * This method define the line.
        */
        function defineLine(prop) {
            return d3.line().x(function(d) { return x(d.time); })
                .y(function(d) { return y(d[prop]); });
        }
        /**
        * This method define the area.
        */
        function defineArea(prop) {
            return d3.area().x(function(d) { return x(d.time); })
                .y0(height)
                .y1(function(d) { return y(d[prop]); });
        }
        /**
        * This method define the path for line.
        */
        function defineLinePath(parameters) {
            var line = d3.line()
                .x(function(d) { return x(d.time); })
                .y(function(d) { return y(d.cost); });
            var lGroup = chartGroup.selectAll(".group-line")
                .data(parameters)
                .enter().append("g")
                .filter(function(d,i) {return i < parameters.length-1})
                .attr("class", "group-line")

            lGroup.append("path")
                .attr("class", "line-path")
                .attr("d", function(d) { return line(d.values); })
                .attr("stroke-width", 2)
                .style("stroke", function(d) { return lineColors(d.name); });
        }
        /**
        * This method define the path for area.
        */
        function defineAreaPath(parameters) {
            var area = d3.area()
                .x(function(d) { return x(d.time); })
                .y0(height)
                .y1(function(d) { return y(d.cost); });
            var aGroup = chartGroup.selectAll(".group-area")
                .data(parameters)
                .enter().append("g")
                .filter(function(d,i) {return i < parameters.length-1})
                .attr("class", "group-area")

            aGroup.append("path")
                .attr("class", "area-path")
                .attr("d", function(d) { return area(d.values); })
                .style("fill", function(d) { return areaColors(d.name); })
                .attr("fill-opacity", 1)
        }
        /**
        * This method define the path for yellow line indicator.
        */
        function defineYellowLinePath(data, chartGroup, prop, className) {
            chartGroup.transition().duration(750);
                data[3].time += 50;
                var yGroup = chartGroup.append("g");
                yGroup.append("path")
                    .data([data])
                    .classed("path-line "+className, true)
                    .attr('id', 'yellow-indicator')
                    .attr('opacity', 0)
                    .attr("d", prop)
                    .attr("stroke", "#FFD800")

                yGroup.selectAll("dot") // append yellow circle
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr('opacity', 0)
                    .classed("circle_"+className, true)
                    .attr('id', function(d,i) { return  })
                    .attr("r", function(d,i) { return (i < 3 ? 0 : 5) })
                    .attr("fill", "#FFD800")
                    .attr("cx", function(d,i) { return (i < 3 ? 0 : x(d.time)) })
                    .attr("cy", function(d,i) { return (i < 3 ? 0 : y(d.cost)) })
                    .style("cursor", "pointer")
                    .call(drag);
        }
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
        * This method called when the line dragged.
        */
        function dragged(d) {
            d["time"] = x.invert(d3.event.x);
            d["cost"] = y.invert(d3.event.y);

            newData = [
                {   "id": 1,
                    "time": 0,
                    "cost": 0 },
                {   "id": 2,
                    "time": 200,
                    "cost": 4 },
                {    "id": 3,
                    "time": 400,
                    "cost": 15 },
                {   "id": 4,
                    "time": 1000,
                    "cost": 15 }
            ]
            // circle position
            var thisCircle = d3.select(this);
            var nCost3 = newData[3];
            var nCost2 = newData[2];
            thisCircle.attr('cx', x(nCost3.time + 50))
                .attr('cy', y(d["cost"]))

            nCost3.time = nCost3.time + 50;

            nCost2.cost = d["cost"];
            nCost3.cost = d["cost"];
            if(nCost3.cost < 0) {
                nCost3.cost = 0;
                nCost2.cost = 0;
                thisCircle.attr('cy', height)
            }
            if(nCost3.cost > height || thisCircle.attr("cy") < 0) {
                nCost3.cost = 30;
                nCost2.cost = 30;
                thisCircle.attr('cy', 0)
            }

            var line = d3.line()
                .x(function(d) { return x(d["time"]); })
                .y(function(d) { return y(d["cost"]); });

            svg.select("path.line-indicator")
                .data([newData])
                .transition()
                .duration(0)
                .attr("d", line);
        }
        /**
        * This method called when the drag ended.
        */
        function dragEnded(d) {
            d3.select(this).classed('active', false);
        }

        /*
        * This method draw the line chart.
        */
        function applyColorsToLine(data) {

            // format the data
            data.forEach(function(d) {
                d.time = +d.time;
                d.cost = +d.cost;
            });

            // sort years ascending
            data.sort(function(a, b){
                return a["time"]-b["time"];
            })

            // wait until svg fully generated by d3 and append the line between ticks
            setTimeout(function() {
                // apply the line colors
                svg.selectAll("path.path-line")
                    .data(data)
                    .exit().remove();
                svg.selectAll("path.path-line")
                    .data(data)
                    .style("stroke", function(d) {
                        return lineColors(d.time)
                    })
                svg.selectAll("path.line-indicator")
                    .style("stroke", "#FFD800")
                svg.selectAll("path.path-area")
                    .data(data)
                    .style("fill", function(d) {
                        return areaColors(d.name)
                    })
            }, 10)

        } // draw function end here //

        /**
         * This method draw the x axis and y axis;
         * @param  data the data
         */
        function drawAxis(data) {
            // Scale the range of the data
            x.domain([0, 1000]); // the maximum range of time(X) axis.
            y.domain([0, 30]); // the maximum range of cost(Y) axis.

            // Add the X Axis
            var xAxis = d3.axisBottom(x)
                .ticks(5)
                .tickPadding(10)
                .tickFormat(function(d) { return d + ""; })
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
                svg.selectAll("g.x-axis g.tick:not(:last-child)")
                    .append("line")
                    .classed("grid-line", true)
                    .attr("x1", width/10)
                    .attr("y1", 0)
                    .attr("x2", width/10)
                    .attr("y2", -height);

                svg.selectAll("g.y-axis g.tick:not(:nth-child(2))")
                    .append("line")
                    .classed("grid-line", true)
                    .attr("x1", 0)
                    .attr("y1", height/12)
                    .attr("x2", width)
                    .attr("y2", height/12);

                svg.selectAll("g.x-axis g.tick:nth-child(2) > line:first-child")
                    .attr("y2", -height - 15) // left top (y-axis) extra line
                    .classed("first-grid-line", true);
                svg.selectAll("g.y-axis g.tick:nth-child(2) > line")
                    .attr("x2", width + 15)  // bottom right (x-axis) extra line
                    .classed("first-grid-line", true);
            }, 10);
        }

        /**
         * This method draw the line and area of the chart
         * @param newData the data from json
         */
        function drawLineAndArea(data) {
            var parameters = data.parameters;
            defineAreaPath(parameters);
            defineLinePath(parameters);
            parameters.forEach(function(item, index) {
                var data = item.values;

                if(item.name === "indicator") {
                    // Add the line path for indicatorLine.
                    defineYellowLinePath(data, chartGroup, costLine, "line-"+item.name);
                }
            });
        }
        /**
         * This method draw the line chart using the provided data from external json file.
         *
         * @param dataUrl the json file url.
         */
        function drawLineChart(dataUrl) {
            // Get the data
            d3.json(dataUrl, function(error, paramsData) {
                if (error) throw error;

                drawAxis();

                // trigger render of the line and area.
                drawLineAndArea(paramsData)
            });
        }
        // drawLineChart method called.
        drawLineChart(dataUrl);
        /**
        * This method update the line path based on the event.
        */
        function updateData() {
            // Get the data
            d3.json("data.2.json", function(error, newData) {
                if (error) throw error;
                var parameters = newData.parameters;

                parameters.forEach(function(item, index) {
                    updateLinePath(item.values, costLine, areaTotal, item.name)
                })
            });
        }
        /**
        * This method update the line and area path.
        */
        function updateLinePath(data, line, area, className) {
            var newData = data;

            svg.select("path.line-"+className)
                .data([newData])
                .transition()
                .duration(750)
                .attr("d", line);
            svg.select("path.area-"+className)
                .data([newData])
                .transition()
                .duration(750)
                .attr("d", area)
        }
    }

    topLineChart.prototype = {

        drawLineChart: function(width, height) {
            createChart(this.chartContainer, this.dataUrl, width, height);
        }
    }
    return topLineChart;
});
