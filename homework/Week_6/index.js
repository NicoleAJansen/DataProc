/*
This script will add two graphs, which are linked views, to an HTML-page.

Author: Nicole Jansen
Student number: 10963871
*/

window.onload = function() {
  getData();
};

function getData() {
  /*
  Function for acquiring the data and creating the linked views
  */

  // Get data
  var dataDeaths = d3.json("Doodsoorzaken.json");
  var genders = d3.json("geslacht.json");
  var ages = d3.json("leeftijd.json");
  var years = d3.json("perioden.json");
  var allRequests = [dataDeaths, genders, ages, years];

  Promise.all(allRequests).then(function(response) {
    // Create buttons
    var keysGender = Object.keys(response[1]);
    var valuesGender = Object.values(response[1]);
    var keysAge = Object.keys(response[2]);
    var valuesAge = Object.values(response[2]);
    var keysYears = Object.keys(response[3]);
    var valuesYears = Object.values(response[3]);

    // Button gender
    d3.select("body").append("div")
      .attr("class", "btn-group pull-right genderbtn").attr("value", keysGender[0]).append("button")
      .attr("type", "button").attr("class", "btn btn-light dropdown-toggle genderbtn")
      .attr("data-toggle", "dropdown").html("Geslacht  ")
      .append("span").attr("class", "caret");
    d3.select(".btn-group.pull-right.genderbtn")
      .append("ul").attr("class", "dropdown-menu")
      .attr("role", "menu").selectAll(".btn-group.pull-right.genderbtn")
      .data(keysGender).enter()
      .append("li").append("a").attr("class", "gender")
      .attr("value", function(d, i) { return keysGender[i]; })
      .html(function(d, i) { return valuesGender[i] });

    // Button age
    d3.select("body").append("div")
      .attr("class", "btn-group pull-right agebtn").attr("value", keysAge[0]).append("button")
      .attr("type", "button").attr("class", "btn btn-light dropdown-toggle agebtn")
      .attr("data-toggle", "dropdown").html("Leeftijd  ")
      .append("span").attr("class", "caret");
    d3.select(".btn-group.pull-right.agebtn")
      .append("ul").attr("class", "dropdown-menu")
      .attr("role", "menu").selectAll(".btn-group.pull-right.agebtn")
      .data(keysAge).enter()
      .append("li").append("a").attr("class", "age")
      .attr("value", function(d, i) { return keysAge[i]; })
      .html(function(d, i) { return valuesAge[i] });

    // Button year
    d3.select("body").append("div")
      .attr("class", "btn-group pull-right yearbtn").attr("value", keysYears[0]).append("button")
      .attr("type", "button").attr("class", "btn btn-light dropdown-toggle yearbtn")
      .attr("data-toggle", "dropdown").html("Jaar  ")
      .append("span").attr("class", "caret");
    d3.select(".btn-group.pull-right.yearbtn")
      .append("ul").attr("class", "dropdown-menu")
      .attr("role", "menu").selectAll(".btn-group.pull-right.yearbtn")
      .data(keysYears).enter()
      .append("li").append("a").attr("class", "years")
      .attr("value", function(d, i) { return keysYears[i]; })
      .html(function(d, i) { return valuesYears[i] });
    d3.select("body")
      .append("p").html("<br><br>");

    // Create Linked views
    createLinkedViews(response);
  });
};


function createLinkedViews(data) {
  /*
  Function for creating the linked views
  */

  // Get processed data for initial left plot
  var processedDataLeft = processData(data);

  // Create left chart
  var leftChart = chartLeft(data, processedDataLeft);
  leftChartUpdate = leftChart.update;
  leftChartUpdate(processedDataLeft);

  // Get processed data for initial right plot
  var processedDataRight = processData(data, gender="all", age="all", years=getYearKey(data, "1950"), ids="sub");

  // Create right chart
  var rightChart = chartRight(data, processedDataRight[0]);
  rightChartUpdate = rightChart.update;
  rightChartUpdate(processedDataRight[0], "1950");

  // Update right chart for gender
  d3.selectAll(".gender")
    .on("click", function() {
      var gender = this.getAttribute("value");
      d3.selectAll(".btn-group.genderbtn").attr("value", gender);
      d3.selectAll(".dropdown-toggle.genderbtn").html(data[1][gender] + "  ")
        .append("span").attr("class", "caret");

      var age = d3.selectAll(".btn-group.agebtn").node();
      age = age.getAttribute("value");
      var years = d3.selectAll(".btn-group.yearbtn").node();
      years = years.getAttribute("value");

      processedDataRight = processData(data, gender, age, years, ids="sub");
      rightChartUpdate(processedDataRight[0], data[3][years]);

    });

  // Update right chart for age
  d3.selectAll(".age")
    .on("click", function() {
      var age = this.getAttribute("value");
      d3.selectAll(".btn-group.agebtn").attr("value", age);
      d3.selectAll(".dropdown-toggle.agebtn").html(data[2][age] + "  ")
        .append("span").attr("class", "caret");
      var gender = d3.selectAll(".btn-group.genderbtn").node();
      gender = gender.getAttribute("value");
      var years = d3.selectAll(".btn-group.yearbtn").node();
      years = years.getAttribute("value");

      processedDataRight = processData(data, gender, age, years, ids="sub");
      rightChartUpdate(processedDataRight[0], data[3][years]);
    });

    // Update right chart for years
    d3.selectAll(".years")
      .on("click", function() {
        var years = this.getAttribute("value");
        d3.selectAll(".btn-group.yearbtn").attr("value", years);
        d3.selectAll(".dropdown-toggle.yearbtn").html(data[3][years] + "  ")
          .append("span").attr("class", "caret");
        var gender = d3.selectAll(".btn-group.genderbtn").node();
        gender = gender.getAttribute("value");
        var age = d3.selectAll(".btn-group.agebtn").node();
        age = age.getAttribute("value");

        processedDataRight = processData(data, gender, age, years, ids="sub");
        rightChartUpdate(processedDataRight[0], data[3][years]);
      });

};


function chartLeft(data, processedData) {
  /*
  Function for creating the left, stacked bar graph
  Based on: https://observablehq.com/@d3/stacked-to-grouped-bars
  */

  // SVG variables
  var width = 680;
  var height = 435;
  var offsetLeft = 50;
  var offsetRight = 0;
  var offsetTop = 65;
  var offsetBottom = 50;

  // Get amount of categories and maximum amount of deaths
  var xAmount = processedData.length;
  var yMax = d3.max(processedData, function(y) {
              return d3.max(y, function(d) {
                return d[1]; }); });

  // Create scales
  var color = d3.scaleSequential(d3.interpolateRdYlBu)
                .domain([-0.5 * xAmount, 1.5 * xAmount]);
  var yearLabels = Object.values(data[3]);
  var scaleX = d3.scaleBand()
                 .domain(yearLabels)
                 .range([offsetLeft, width - offsetRight]);
  var scaleY = d3.scaleLinear()
                 .domain([0, yMax])
                 .range([height - offsetBottom, offsetTop]);

  // Initialize SVG
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("class", "svg-left left");

  // Create list with labels of subcategories
  var subLabels = getLabels(data[0], labeltype="main");

  // Initialize tiptool; credits: http://bl.ocks.org/Caged/6476579
  var tip = d3.tip()
              .attr("class", "d3-tip left")
              .offset([-10, 0])
              .html(function(d, i) {
                return subLabels[i];
              });
  svg.call(tip);

  // Initialize stacked bar graph
  var rect = svg.selectAll("g")
                .data(processedData)
                .enter()
                .append("g")
                  .attr("fill", function(d, i) { return color(i); })
                  .on('mouseover', tip.show)
                  .on('mouseout', tip.hide)
                .selectAll("rect")
                .attr("class", "stacked")
                .data(function(d) { return d; })
                .join("rect")
                  .attr("x", function(d, i) { return scaleX(yearLabels[i]); })
                  .attr("y", scaleY(0))
                  .attr("width", scaleX.bandwidth())
                  .attr("height", 0)
                  .on('click', function(d, i) {
                    var gender = d3.selectAll(".btn-group.genderbtn").node();
                    gender = gender.getAttribute("value");
                    var age = d3.selectAll(".btn-group.agebtn").node();
                    age = age.getAttribute("value");
                    let theseProcessedData = processData(data, gender, age, years=getYearKey(data, yearLabels[i]), ids="sub");
                    d3.selectAll(".btn-group.yearbtn").attr("value", years);
                    d3.selectAll(".dropdown-toggle.yearbtn").html(data[3][years] + "  ")
                      .append("span").attr("class", "caret");
                    rightChartUpdate(theseProcessedData[0], yearLabels[i]);
                  } );

  // Create x-axis; credits rotating text: https://bl.ocks.org/d3noob/3c040800ff6457717cca586ae9547dbf
  var xAxis = d3.axisBottom(scaleX);
  svg.append("g")
     .attr("class", "x axis left")
     .attr("transform", "translate(0," + scaleY(0) + ")")
     .call(xAxis)
     .selectAll("text")
     .style("text-anchor", "end")
     .attr("dx", "-.8em")
     .attr("dy", ".15em")
     .attr("transform", "rotate(-65)");
  svg.append("text")
     .text("Jaar")
     .attr("class", "font labels")
     .attr("transform", "translate(" + (width - 40) + "," + (scaleY(0) + 45) + ")");

  // Create y-axis
  var yAxis = d3.axisLeft(scaleY)
                .ticks(10);
  svg.append("g")
     .attr("class", "y axis left")
     .attr("transform", "translate(" + offsetLeft + ", 0)")
     .call(yAxis);
  svg.append("text")
     .text("Hoeveelheid overledenen")
     .attr("class", "font labels")
     .attr("transform", "translate(" + (offsetLeft + 5) + "," + offsetTop + ")");

  // Create title
  svg.append("text")
     .text("Aantal overledenen per categorie per jaar")
     .attr("class", "font titleGraph left")
     .attr("transform", "translate(" + (width / 3) + "," + (offsetTop / 2) + ")");


  function update(newProcessedData) {
    var yMaxNew = d3.max(newProcessedData, function(y) {
                return d3.max(y, function(d) {
                  return d[1]; }); });
    scaleY.domain([0, yMaxNew]);

    rect.data(newProcessedData)
        .data(function(d) { return d; });

    rect.transition()
        .duration(500)
        .delay(function(d, i) { return (i * 20); })
        .attr("x", function(d, i) { return scaleX(yearLabels[i]); })
        .attr("y", function(d) { return scaleY(d[1]); })
        .attr("width", scaleX.bandwidth())
        .attr("height", function(d) { return (scaleY(d[0]) - scaleY(d[1])); });
  };

  return Object.assign(svg.node(), {update});
};


function chartRight(data, processedData) {
  /*
  Function for creating horizontal bar chart on the right.
  */

  // SVG variables
  var width = 650;
  var height = 435;
  var offsetLeft = 250;
  var offsetRight = 20;
  var offsetTop = 60;
  var offsetBottom = 45;

  // Get amount of categories and maximum amount of deaths
  var xMax = d3.max(processedData);
  var yAmount = processedData.length;

  // Create list with labels of subcategories
  var subLabels = getLabels(data[0], labeltype="sub");

  // Create scales
  var scaleX = d3.scaleLinear()
                 .domain([0, xMax])
                 .range([offsetLeft, (width - offsetRight)]);
  var scaleY = d3.scaleBand()
                 .domain(subLabels)
                 .range([offsetTop, height - offsetBottom]);

  // Initialize SVG
  var svg = d3.select("body")
               .append("svg")
               .attr("width", width)
               .attr("height", height)
               .attr("class", "svg-right right");

  // Initialize tiptool; credits: http://bl.ocks.org/Caged/6476579
  var tip = d3.tip()
              .attr("class", "d3-tip right")
              .offset([-10, 0])
              .html(function(d, i) {
                return subLabels[i];
              });
  svg.call(tip);

  // Initialize bar graph
  var rect = svg.selectAll("rect")
                 .data(processedData)
                 .enter()
                 .append("rect")
                 .attr("class", "bar")
                 .on('mouseover', tip.show)
                 .on('mouseout', tip.hide);

  // Add label x-axis
  svg.append("text")
    .text("Hoeveelheid overledenen")
    .attr("class", "font labels right")
    .attr("transform", "translate(" + (width - 155) + "," + (height - 4) + ")");

  function update(newProcessedData, year) {
    // Get amount of categories and maximum amount of deaths
    var xMaxNew = d3.max(newProcessedData);

    // Update scale for x-axis
    scaleX.domain([0, xMaxNew]);

    // Update bar graph
    rect.data(newProcessedData);
    rect.transition()
        .duration(300)
        .delay(function(d, i) { return (i * 20); })
        .attr("x", function(d) { return scaleX(0); })
        .attr("y", function(d, i) { return scaleY(subLabels[i]); })
        .attr("width", function(d) { return scaleX(d) - scaleX(0); })
        .attr("height", scaleY.bandwidth())
        .attr("fill", "rgb(240, 89, 46)");

    // Create new x-axis
    svg.select(".x.axis").remove();
    var xAxis = d3.axisBottom(scaleX)
                  .ticks(10);
    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + (height - offsetBottom) + ")")
       .call(xAxis);

    // Create new y-axis
    svg.select(".y.axis.right").remove();
    var yAxis = d3.axisLeft(scaleY);
    svg.append("g")
       .attr("class", "y axis right")
       .attr("transform", "translate(" + scaleX(0) + ", 0)")
       .call(yAxis);

    // Add new title
    svg.select(".titleGraph.right").remove();
    svg.append("text")
       .text("Aantal overledenen per subcategorie in " + year)
       .attr("class", "font titleGraph right")
       .attr("transform", "translate(" + (width / 2.5) + "," + (offsetTop / 1.5) + ")")
  };

   return Object.assign(svg.node(), {update});
};


function processData(dataset, gender="all", age="all", years="all", ids="main") {
  /*
  Function for processing data.
  */

  // Get keys if none are given
  if (gender === "all") {
    gender = Object.keys(dataset[1])[0];
  };
  if (age === "all") {
    age = Object.keys(dataset[2])[0];
  };
  if (years === "all") {
    years = Object.keys(dataset[3]);
  }
  else if (typeof(years) === typeof(String())) {
    years = [years];
  };

  // Create list with IDs of categories wanted
  var mainSubcategoriesID = [2, 8, 31, 32, 35, 39, 43, 50, 57, 63, 64, 67, 70, 71, 72, 76, 80];
  if (ids === "main") {
    var subcategoriesID = mainSubcategoriesID;
  }
  else {
    var subcategoriesID = d3.range(2,93);
    for (let i in mainSubcategoriesID) {
      let index = subcategoriesID.indexOf(mainSubcategoriesID[i]);
      subcategoriesID.splice(index, 1);
    };
  };

  // Create list with data for output
  var dataList = [];
  var data = dataset[0][gender][age];
  for (var year in years) {
    var thisDataDict = data[years[year]];
    var thisList = [];
    var keys = Object.keys(thisDataDict);
    for (var key in keys) {
      for (var i in subcategoriesID) {
        var j = subcategoriesID[i];
        var thisKey = keys[key];
        if (thisKey.endsWith(("_" + String(j)))) {
          if (j === mainSubcategoriesID[i]) {
            thisList.push(parseInt(thisDataDict[thisKey]));
          }
          else {
            var index = 0;
            while (j > mainSubcategoriesID[index]) {
              index++;
            }

            if ((((thisKey.startsWith("k")) && ((String(parseInt(thisKey.slice(2))).length == (String(index).length + 1))))) || (!thisKey.startsWith("k"))) {
              if (Number.isNaN(parseInt(thisDataDict[thisKey]))) {
                thisList.push(0);
              }
              else {
                thisList.push(parseInt(thisDataDict[thisKey]));
              };
            };

          }

        };
      };
    };
    if (thisList.length != 0) {
      dataList.push(thisList);
    };
  };


  if (subcategoriesID === mainSubcategoriesID) {
    // Change for creating stacked bar graph
    var returnData = d3.stack()
                      .keys(d3.range(subcategoriesID.length))
                      (dataList)
                      .map(function(data, i) {
                        return data.map( function([y0, y1]) {
                          return [y0, y1, i];
                        });
                      });
  }
  else {
    var returnData = dataList;
  };

  return returnData;
};


function getYearKey(data, year) {
  /*
  Funtion for getting the ID corresponding to the year.
  If a year is chosen that isn't in the data, "all" is returned
  */

  // Use the year object
  var yearKeys = Object.keys(data[3]);

  // Go through the object to find the right ID
  for (let i in yearKeys) {
    let thisKey = yearKeys[i];
    if (year === data[3][thisKey]) {
      var yearKey = thisKey;
    }
  };

  if (yearKey === undefined) {
    var yearKey = "all";
  }

  return yearKey;
};


function getLabels(data, labeltype="main") {
  /*
  Function for creating a list with the labels for the categories.
  Data should be an object with structure
    {"keyGender" : {"keyAge" : {"keyYear" : {data}}}}
  If labeltype = "main" the list will contain the labels of the main categories,
  if labeltype = "sub" the list will contain the labels of the subcategories
  */

  // Get to data of the first year, as labels are the same in each year
  for (let i = 0; i < 3; i++) {
    let thisKey = Object.keys(data)[0];
    data = data[thisKey];
  };

  // The ID number of the main categories
  var mainCategoriesID = [2, 8, 31, 32, 35, 39, 43, 50, 57, 63, 64, 67, 70, 71, 72, 76, 80];

  // Create list with category IDs that should be used
  if (labeltype === "main") {
    var categoryIDs = mainCategoriesID;
  }
  else if (labeltype === "sub") {
    // Get all numbers inbetween the main category IDs
    var categoryIDs = d3.range(2,93);
    for (let i in mainCategoriesID) {
      let index = categoryIDs.indexOf(mainCategoriesID[i]);
      categoryIDs.splice(index, 1);
    };
  };

  // Initialize list for labels
  var subLabels = [];

  var keys = Object.keys(data);
  for (let i in keys) {
    for (let j in categoryIDs) {
      let k = categoryIDs[j];
      let thisKey = keys[i];
      if (thisKey.endsWith(("_" + String(k)))) {
        if (labeltype === "main") {
          // Remove ID number and underscore
          var newKey = thisKey.slice(0, (thisKey.length - 1 - String(k).length));

          // Remove "k_x" from beginning string if category has no subcategories
          if (newKey.startsWith("k")) {
            let index = parseInt(j) + 1;
            let number = (String(index)).length;
            number += 2;
            newKey = newKey.slice(number);
          }

          subLabels.push(newKey)
        }
        else if (labeltype === "sub") {
          // Determine the number of the category the subcategory belongs to (start counting from 1)
          var index = 0;
          while (k > mainCategoriesID[index]) {
            index++;
          };

          // Determine if it is a subcategory and not a subsubcategory
          if ((thisKey.startsWith("k") && (String(parseInt(thisKey.slice(2))).length == (String(index).length + 1)))) {
            // Remove numbers from beginning and end of string
            let number = (String(index)).length;
            number += 3;
            var newKey = thisKey.slice(number);
            newKey = newKey.slice(0, (newKey.length - 1 - String(k).length));

            subLabels.push(newKey);
          }
          else if (!(thisKey.startsWith("k"))) {
            // This is a subcategory that itself has subcategories,
            // so there are only numbers on the end of the string
            var newKey = thisKey.slice(0, (thisKey.length - 1 - String(k).length));

            subLabels.push(newKey);
          };
        };
      };
    };
  };

  return subLabels;
};
