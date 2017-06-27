define(['d3'], function (d3) {
    function gaugeChart(data, color, id, chartWidth, chartHeight) {
        // set the dimensions and margins of the graph
        var margin = { top: 10, right: 10, bottom: 10, left: 10 },
            width = chartWidth - margin.left - margin.right,
            height = chartHeight - margin.top - margin.bottom;

        var radius = Math.min(width, height) / 2;
        var fullAngle = 2 * Math.PI;
        var label = data.label;
        var costs = round(data.costs, 2);
        var textCosts = (""+costs+"").split(".")[1].length < 2 ? costs+"0" : costs;
        var percent = (costs / 30) * 100;
        var arcStartAngle = Math.PI;
        var arcEndAngle = percent * fullAngle / 100;

        var svg = d3.select(id)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr("text-anchor", "middle")
            .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');
        // arc for background
        var bgArc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
            .startAngle(0)
            .endAngle(fullAngle);
        // arc for dark border
        var borderArc = d3.arc()
            .innerRadius(radius - 8)
            .outerRadius(radius)
            .startAngle(0)
            .endAngle(fullAngle);
        // background group
        var bgGroup = svg.append("g")
            .append("path")
            .classed("bg-group", true)
            .attr("d", bgArc)
            .attr("fill", "#BDC8C8")
            .attr("fill-opacity", 0.5)
            .style("mix-blend-mode", "multiply")
        // dark border group
        var darkBorderGroup = svg.append("g")
            .append("path")
            .classed("border-group", true)
            .attr("d", borderArc)
            .attr("fill", "#BDC8C8")
            .attr("fill-opacity", 0.5)
            .style("mix-blend-mode", "multiply")
        // gauge arc
        var arc = d3.arc()
            .innerRadius(radius - 6)
            .outerRadius(radius - 2);
        // gauge group
        var gaugeGroup = svg.append("g");

        // draw the arc path
        var path = gaugeGroup.append('path')
            .attr('fill', color)
            .transition().duration(1000).attrTween("d", arcTween);

        // center text group
        var cTextGroup = svg.append("text")
            .attr("id", "center-text")
            .text(textCosts)
        // center text
        var textH = cTextGroup.node().getBBox().height / 2;
        textH === 0 ? textH = 12 : textH -= 5;
        cTextGroup.attr("transform", "translate(0,"+textH+")");
        // round a number to 2 decimal number
        function round(value, decimals) {
            return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
        }
        // arc for animation
        function arcTween() {
            var endAngle = arcEndAngle + arcStartAngle // to start the arc from bottom of the circle
            var i = d3.interpolate(arcStartAngle, endAngle); // interpolate start to end
            return function(t) {
                return arc({ // return arc at each iteration from start to interpolate end
                    startAngle: arcStartAngle,
                    endAngle: i(t)
                });
            };
        }

        // legend group
        var legendGroup = svg.append("g")
        legendGroup.append("text")
            .attr("id", "gauge-legend")
            .text(label)

        var triGroup = svg.append("g")

        var nArc = arc.startAngle(arcStartAngle)
            .endAngle(arcEndAngle);
        var triRadius = radius + 5;
        var triGroup = svg.append("g")
        triGroup.append("polygon")
            .attr("points", "3.838,7.12 15.481,1.691 14.69,15.193")
            .attr("fill", "#FFD800")
            .attr("class", "triangle")
            .attr("opacity", 0)
            .attr("transform", function(d) {
                var c = nArc.centroid(d),
                    x = c[0],
                    y = c[1],
                    // pythagorean theorem for hypotenuse
                    h = Math.sqrt(x*x + y*y);
                        return "translate(" + (x/h * triRadius) +  ',' +
                            (y/h * triRadius) +  ")";
            })
            .attr("dy", ".35em")

    }

    return {
        drawGaugeChart: function(data, color, id, width, height) {
            gaugeChart(data, color, id, width, height);
        }
    }
})