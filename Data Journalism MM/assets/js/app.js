var svgWidth = 900;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]),
      d3.max(data, d => d[chosenXAxis])
    ])
    .range([0, width]);
  return xLinearScale;
}

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]),
        d3.max(data, d => d[chosenYAxis])
      ])
      .range([0, width]);
    return yLinearScale;
  
  }

function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }

function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

function updateToolTip(chosenXAxis, circlesGroup) {
  if (chosenXAxis === "poverty") {
    var xLabel = "Poverty %";
  }
  else if (chosenXAxis === "age") {
      var xLabel = "Age";
  }
  else {
    var xLabel = "Household Income";
  }

  if (chosenYAxis === "obesity") {
    var yLabel = "Obsesity %";
  }
  else if (chosenYAxis === "smokes") {
      var yLabel = "Smokes %";
  }
  else {
    var yLabel = "Lacks Healthcare %";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`);
    });

  svg.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function(data) {
  data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    console.log(data);
  });

  var xLinearScale = xScale(data, chosenXAxis);

  var yLinearScale = yScale(data, chosenYAxis);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 5)
    .attr("class", "stateCircle")
    .attr("opacity", ".5");

  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    .classed("aText", true);

  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${height / 2}, ${svgWidth - 900})`)
    .classed("aText", true);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty %");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

    var obesityLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-(height/2))
    .attr("x", 0-margin.left)
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obesity %");

    var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-(height/2))
    .attr("x", 0-margin.left)
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes %");

    var healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left-50)
    .attr("x", 0-(height/2))
    .attr("dy", "1em")
    .attr("value", "age")
    .classed("inactive", true)
    .text("Lacks Healthcare %");

  var updatedCirclesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
  xlabelsGroup.selectAll("text")
    .on("click", function () {
      var xvalue = d3.select(this).attr("value");
      if (xvalue !== chosenxAxis) {
        chosenxAxis = xvalue;
        xLinearScale = xScale(data, chosenxAxis);
        xAxis = renderAxes(xLinearScale, xAxis);
        updatedCirclesGroup = renderCircles(circlesGroup, xLinearScale, chosenxAxis);
        updatedCirclesGroup = updateToolTip(chosenxAxis, circlesGroup);
        if (chosenxAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);

        }
        else if (chosenxAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false)
        }
      }
    });
    
  ylabelsGroup.selectAll("text")
    .on("click", function () {
      var yvalue = d3.select(this).attr("value");
      if (yvalue !== chosenyAxis) {
        chosenyAxis = yvalue;
        yLinearScale = yScale(data, chosenyAxis);
        yAxis = renderAxes(yLinearScale, yAxis);
        updatedCirclesGroup = renderCircles(circlesGroup, yLinearScale, chosenyAxis);
        updatedCirclesGroup = updateToolTip(chosenyAxis, circlesGroup);
        if (chosenyAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenyAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel 
            .classed("active", false)
            .classed("inactive", true)
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  })
