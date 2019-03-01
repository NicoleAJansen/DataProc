/*
Name: Nicole Jansen
Student number: 10963871

This script reformats the data so it could be plotted and thereafter plots the
data.
Late day wildcard
*/

var fileName = "food-allergy-tiny.json";
var txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function() {
  if (txtFile.readyState === 4 && txtFile.status == 200) {
    console.log(JSON.parse(txtFile.responseText));
    [milkData, peanutData, maxAge] = reformatData();
    plotData(milkData, peanutData, maxAge);
  }
}
txtFile.open("GET", fileName);
txtFile.send();


var reformatData = function() {
  /*
  Format the data so it can be plotted
  */
  var fileParsed = JSON.parse(txtFile.responseText);

  // Get arrays for ages at which the milk and peanut allergy started
  var milkStart = getStart(fileParsed, "milk");
  var peanutStart = getStart(fileParsed, "peanut");

  // Determine the maximum age that should be used
  var maxMilk = Math.ceil(Math.max.apply(null,milkStart));
  var maxPeanut = Math.ceil(Math.max.apply(null,peanutStart));
  if (maxMilk > maxPeanut) {
    var max = maxMilk;
  }
  else {
    var max = maxPeanut;
  }

  // Get the number of subjects at which the allergy started in increments
  // of half a year
  var milk = getAmount(milkStart, 0, 0.5, max);
  var peanut = getAmount(peanutStart, 0, 0.5, max);

  console.log(milk, peanut);

  return [milk, peanut, max];
}


var getStart = function(data, allergy) {
  /*
  Create array with ages at which given allergy started
  */
  var start = [];
  var allergyString = allergy.toUpperCase() + "_ALG_START";
  for (let key in data) {
    // Include only valid ages
    if ((data[key][allergyString] !== "NA") && (data[key][allergyString] >= "0")) {
      start.push(Number(data[key][allergyString]));
    }
  }

  return start;
}

var getAmount = function(ages, start, step, stop) {
  /*
  Get for each age (determined by range) the amount of subject by whom the
  allery started
  */

  var ageRange = Array((stop - start)*(1/step));
  ageRange.fill(0);

  for (thisAge in ages) {
    let thisIndex = findRange(ages[thisAge], start, step);
    ageRange[thisIndex] += 1;
  }

  return ageRange
}


var findRange = function(age, value, step, index=0) {
  /*
  For age, find the index corresponend to the range it belongs in; starting
  from value (should be upper bound of first age range) which is increased by
  a given stepsize (step)
  */
  if (age <= value) {
    let indexHere = index;
    return indexHere;
  }
  else {
    var valueNew = value + step
    var indexNew = index + 1
    return findRange(age, valueNew, step, indexNew)
  }
}



function createTransform(domain, range){
	// domain is a two-element array of the data bounds [domain_min, domain_max]
	// range is a two-element array of the screen bounds [range_min, range_max]
	// this gives you two equations to solve:
	// range_min = alpha * domain_min + beta
	// range_max = alpha * domain_max + beta
 		// a solution would be:

    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // formulas to calculate the alpha and the beta
   	var alpha = (range_max - range_min) / (domain_max - domain_min)
    var beta = range_max - alpha * domain_max

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    }
}


var plotData = function(milkData, peanutData, maxAge) {
  /*
  Plots the data and creates the axes, ticks and labels
  */
  var domainX = [0, maxAge*2];

  // Determine domain of y-values
  var minMilk = Math.min.apply(null, milkData);
  var minPeanut = Math.min.apply(null, peanutData);
  var maxMilk = Math.max.apply(null, milkData);
  var maxPeanut = Math.max.apply(null, peanutData);

  if (minMilk < minPeanut) {
    var minDomY = minMilk;
  }
  else {
    var minDomY = minPeanut;
  }

  if (maxMilk > maxPeanut) {
    var maxDomY = maxMilk;
  }
  else {
    var maxDomY = maxPeanut;
  }
  var domainY = [minDomY, maxDomY];

  // Set starting and ending values for x- and y-axis
  startX = 50;
  endX = 400;
  startY = 50;
  endY = 400;

  // Get functions for linear transformation of x- and y-axis
  var linTransX = createTransform(domainX, [startX, endX]);
  var linTransY = createTransform(domainY, [startY, endY]);

  // Create an array with age intervals
  var ages = [];
  for (let i = 0; i < domainX[1]; i++) {
    ages.push((i/2));
  }
  console.log(ages);

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // Draw x-axis and y-axis
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(linTransX(ages[0]),linTransY(0));
  ctx.lineTo(linTransX(ages[0]),linTransY(domainY[1]));
  ctx.lineTo(linTransX(domainX[1]), linTransY(domainY[1]));
  ctx.stroke();

  // Draw ticks and labels x-axis
  ctx.lineWidth = 2;
  ctx.textAlign = 'middle';
  ctx.font = "10px Palatino";
  ctx.beginPath();
  for (let i = 0; i < domainX[1]; i++) {
    ctx.moveTo(linTransX(i), linTransY(maxDomY - 20));
    ctx.lineTo(linTransX(i), linTransY(maxDomY + 20));
    if (i%2 == 0) {
      ctx.fillText(String(ages[i]), linTransX(i) - 2, linTransY(maxDomY) + 18);
    }
  }
  ctx.stroke();

  ctx.font = "14px Palantino";
  ctx.fillText("Age (years)", linTransX(domainX[1]/2.5), linTransY(maxDomY) + 40);

  // Draw ticks and labels y-axis
  ctx.lineWidth = 2;
  ctx.textAlign = 'right';
  ctx.font = "10px Palatino";
  ctx.beginPath();
  for (let i = 0; i < maxDomY; i += 50) {
    ctx.moveTo(linTransX(domainX[0] - 1), linTransY(i));
    ctx.lineTo(linTransX(domainX[0] + 1), linTransY(i));
    ctx.fillText(String(i), linTransX(domainX[0]) - 15, linTransY(maxDomY - i) - 6);
  }
  ctx.stroke();

  ctx.font = "14px Palantino";
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Number of people diagnosed", linTransX(domainX[0]) - 175, linTransY(domainY[0]) - 40);
  ctx.restore();

  // Draw milk allergy data
  ctx.lineWidth = 2;
  ctx.strokeStyle = "green";
  ctx.beginPath();
  ctx.moveTo(linTransX(ages[0]), linTransY(maxDomY - milkData[0]));
  for (i in ages) {
    ctx.lineTo(linTransX(ages[i]*2), linTransY(maxDomY - milkData[i]));
  }
  ctx.stroke();

  // Draw peanut allergy data
  ctx.lineWidth = 2;
  ctx.strokeStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(linTransX(ages[0]), linTransY(maxDomY - peanutData[0]));
  for (i in ages) {
    ctx.lineTo(linTransX(ages[i]*2), linTransY(maxDomY - peanutData[i]));
  }
  ctx.stroke();

  // Draw legend
  ctx.font = "11px Palatino";
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "green";
  ctx.textAlign = 'right';
  ctx.beginPath();
  ctx.moveTo(linTransX(domainX[1] - 13), linTransY(domainY[0]) + 50);
  ctx.lineTo(linTransX(domainX[1] - 11), linTransY(domainY[0]) + 50);
  ctx.stroke();
  ctx.fillText("milk allergy", linTransX(domainX[1]) - 10, linTransY(domainY[0]) + 50);

  ctx.font = "11px Palatino";
  ctx.strokeStyle = "orange";
  ctx.textAlign = 'right';
  ctx.beginPath();
  ctx.moveTo(linTransX(domainX[1] - 13), linTransY(domainY[0]) + 60);
  ctx.lineTo(linTransX(domainX[1] - 11), linTransY(domainY[0]) + 60);
  ctx.stroke();
  ctx.fillText("peanut allergy", linTransX(domainX[1]) - 10, linTransY(domainY[0]) + 60);

  // Draw title
  ctx.font = "15px Palatino";
  ctx.strokeStyle = "Black";
  ctx.textAlign = "middle";
  ctx.fillText("Age at which milk and peanut allergy get diagnosed", linTransX(domainX[1] -2), linTransY(domainY[0])-5)
}
