var svgWidth = 960;
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

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]),
      d3.max(data, d => d[chosenXAxis])
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]),
        d3.max(data, d => d[chosenYAxis])
      ])
      .range([0, width]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
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

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
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
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data/data.csv", function(err, data) {
  if (err) throw err;

  // parse data
  data.forEach(function(data) {
    data.id = +data.id;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    console.log(data);
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("class", "stateCircle")
    .attr("opacity", ".5")
    .text(d => d.abbr)
    .attr("class", "stateText");

  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    .classed("aText", true);

  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${height / 2}, ${svgWidth - 880})`)
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
    .attr("x", 60)
    .attr("y", 0-margin.left)
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obesity %");

    var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 40)
    .attr("y", 0-margin.left)
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes %");

    var healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 20)
    .attr("y", 0-margin.left)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Lacks Healthcare %");

  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
  xlabelsGroup.selectAll("text")
    .on("click", function () {
      var xvalue = d3.select(this).attr("value");
      if (xvalue !== chosenxAxis) {
        chosenxAxis = xvalue;
        xLinearScale = xScale(data, chosenxAxis);
        xAxis = renderAxes(xLinearScale, xAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenxAxis);
        circlesGroup = updateToolTip(chosenxAxis, circlesGroup);
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
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenyAxis);
        circlesGroup = updateToolTip(chosenyAxis, circlesGroup);
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
