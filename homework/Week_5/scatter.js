// Nicole Jansen; Student number: 10963871

window.onload = function() {
  getData();
};

function getData() {
  // Get data
  var tourismInbound = d3.json("tourismInbound.json");
  var purchasingPowerParities = d3.json("purchasingPowerParities.json");
  var requests = [tourismInbound, purchasingPowerParities];

  // Use data
  Promise.all(requests).then(function(response) {
      // Process data
      return processData(response);
  }).then(function(data) {
    // Create initial scatterplot
    createScatter(data);

    // Update scatterplot
    d3.selectAll(".m")
      .on("click", function() {
        var year = this.getAttribute("value");
        d3.selectAll('svg').remove();
        createScatter(data, year);
      })
  }).catch(function(e) {
    throw(e);
  });
};

function processData(data) {
  console.log(data);
  var years = [];
  var yearStart = 2009;
  var yearEnd = 2018;
  var x = [];
  var y = [];
  var countries = [];
  for (var i = yearStart; i <= yearEnd; i++) {
    years.push(String(i));
    x.push([]);
    y.push([]);
    countries.push([]);
  };


  var keys = Object.keys(data[0]);
  for (k in keys) {
    var key = keys[k];
    if (key in data[1]) {
      for (i in data[0][key]) {
        for (j in data[1][key]) {
          if (data[0][key][i]["Time"] == data[1][key][j]["Time"]) {
            var thisYear = data[0][key][i]["Time"];
            var index = years.indexOf(thisYear);
            x[index].push(data[0][key][i]["Datapoint"]);
            y[index].push(data[1][key][j]["Datapoint"]);
            countries[index].push(key);
          };
        };
      };
    };
  };

  var xlabel = data[0][keys[0]][0]["Indicator"];
  var ylabel = data[1][keys[0]][0]["Indicator"];

  var processedData = {"x": x, "y": y, "countries": countries, "years": years,
                       "xlabel": xlabel, "ylabel": ylabel};
  console.log(processedData);
  return processedData;

};


function createScatter(dataset, year="2009") {
  // Get data of year
  var index = dataset["years"].indexOf(year);
  var xData = dataset["x"][index];
  var yData = dataset["y"][index];
  var countries = dataset["countries"][index];
  console.log(xData, yData, countries);

  // Initialize SVG
  var width = 700;
  var height = 300;
  var offsetLeft = 50;
  var offsetRight = 0;
  var offsetTop = 50;
  var offsetBottom = 50;
  var radius = 4;
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

  // Create scales
  var scaleX = d3.scaleLinear()
                 .domain([Math.min(...xData), Math.max(...xData)])
                 .range([(offsetLeft - radius), (width - offsetRight - radius)]);

  var scaleY = d3.scaleLinear()
                 .domain([Math.min(...yData), Math.max(...yData)])
                 .range([(height - offsetBottom - radius), (offsetTop + radius)]);

// Initialize tiptool; credits: http://bl.ocks.org/Caged/6476579
  var tip = d3.tip()
              .attr("class", "d3-tip")
              .offset([-10, 0])
              .html(function(d, i) {
                return countries[i];
              });
  svg.call(tip);

  // Create circles
  svg.selectAll("circle")
     .data(xData)
     .enter()
     .append("circle")
     .attr("cx", function(d) {
       return scaleX(d);
     })
     .attr("cy", function(d, i) {
       return scaleY(yData[i]);
     })
     .attr("r", radius)
     .attr("class", function(d, i) {
       var color = "q" + String(i) + "-25";
       return color;
     })
     .on('mouseover', tip.show)
     .on('mouseout', tip.hide);

  // Create x-axis
  var xAxis = d3.axisBottom(scaleX)
                .ticks(10);
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + scaleY(0) + ")")
     .call(xAxis);
  svg.append("text")
     .text(dataset["xlabel"])
     .attr("class", "labels")
     .attr("transform", "translate(" + (width - 150) + "," + (scaleY(0) + 40)  + ")");

  // Create y-axis
  var yAxis = d3.axisLeft(scaleY)
                .ticks(10);
  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(" + scaleX(0) + ", 0)")
     .call(yAxis);
  svg.append("text")
     .text(dataset["ylabel"])
     .attr("class", "labels")
     .attr("transform", "translate(" + scaleX(0) + "," + offsetTop + ")");

  // Create title
  svg.append("text")
     .text("Purchasing Power Parities vs Total international arrivals (" + year + ")")
     .attr("class", "titleGraph")
     .attr("transform", "translate(" + (width / 3.25) + "," + (offsetTop / 2) + ")");

};
