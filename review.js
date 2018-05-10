/* 05-839 Interactive Data Science Midterm project 
   Task : Visualizing Train and Validation Loss
   Name : Jingyu Wang 
   Date : April 7th 2018
   Dependency : d3.js  , crossfilter.js
 */

/*
reference:
http://bl.ocks.org/peterssonjonas/4a0e7cb8d23231243e0e

*/

/*
Global Variables Section
*/


var yMax =  1000,
    yMin = 0,
    xMax = 15000,//32340, 
    xMin = 0;


function plot_loss(){
  console.log("in plot loss");
  var svg = d3.select("#loss_visualization"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    console.log("height is"+height);
    var train_tip  = d3.tip()
       .attr('class', 'd3-tip')
       .offset([-10, 0])
       .html(function (d) {
       return "<strong>Loss($):</strong> <span style='color:red'>" + d.Train_loss + "</span>";
   })

    var eval_tip = d3.tip()
       .attr('class', 'd3-tip')
       .offset([-10, 0])
       .html(function (d) {
       return "<strong>Loss($):</strong> <span style='color:red'>" + d.Train_loss + "</span>";
   })

    svg.call(train_tip);
    svg.call(eval_tip);

  var x = d3.scale.linear()
      .domain([xMin, xMax])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([yMin, yMax])
      .range([height, 0]); //x.domain([xMin, xMax]);
  
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize(-height);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSize(-width);


  // the train loss line
  var line1 = d3.svg.line()
      .x(function(d) { return x(d.Train_loss_index); })
      .y(function(d) { return y(d.Train_loss); });

  // the validation loss line
  var line2 = d3.svg.line()
      .x(function(d) { return x(d.Eval_loss_index);})
      .y(function(d) { return y(d.Eval_loss);})

d3.csv("data/tran_loss.csv", function(d) {
  d.Train_loss = +d.Train_loss;
  d.Train_loss_index = +d.Train_loss_index;
  if(d.Train_loss_index > 0){
    //console.log(d);
    return d;
  }
    
}, function(error, data) {
  if (error) throw error;


  console.log(data);


  g.append("g")
      .classed("x axis", true)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .classed("label", true)
      .attr("x", width)
      .attr("y", margin.bottom )
      .style("text-anchor", "end")
      .text("Batches");

  g.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2)
      .attr("y", -margin.left)
      .attr("dy", ".68em")
      .style("text-anchor", "end")
      .text("Mean Square Error");

  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", line1);

    var focus = g.append("g")               
                 .style("display", "none");  
    focus.append("circle")                                 // **********
        .attr("class", "y")                                // **********
        .style("fill", "none")                             // **********
        .style("stroke", "blue")                           // **********
        .attr("r", 3);                                     // **********

    // append the x line
    focus.append("line")
        .attr("class", "x")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);

    // append the y line
    focus.append("line")
        .attr("class", "y")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", width)
        .attr("x2", width);

    // append the circle at the intersection
    focus.append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", "blue")
        .attr("r", 4);

    // place the value at the intersection
    focus.append("text")
        .attr("class", "y1")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");
    focus.append("text")
        .attr("class", "y2")
        .attr("dx", 8)
        .attr("dy", "-.3em");

    // place the date at the intersection
    focus.append("text")
        .attr("class", "y3")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");
    focus.append("text")
        .attr("class", "y4")
        .attr("dx", 8)
        .attr("dy", "1em");
    
    // append the rectangle to capture mouse               // **********
    g.append("rect")                                     // **********
        .attr("width", width)                              // **********
        .attr("height", height)                            // **********
        .style("fill", "none")                             // **********
        .style("pointer-events", "all")                    // **********
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);                       // **********

    var bisect = d3.bisector(function(d) { return d.Train_loss_index; }).left;
    function mousemove() {                                 // **********
        var x0 = x.invert(d3.mouse(this)[0]),    // **********
            i = bisect(data, x0),                   // **********
            d0 = data[i - 1],                              // **********
            d1 = data[i],                                  // **********
            d = x0 - d0.Train_loss_index > d1.Train_loss_index - x0 ? d1 : d0;     // **********
        console.log(x0);
        console.log(i);
        console.log(d);
        focus.select("circle.y")                           // **********
            .attr("transform",                             // **********
                  "translate(" + x(d.Train_loss_index) + "," +         // **********
                                 y(d.Train_loss) + ")");        // **********
    

    focus.select("text.y1")
        .attr("transform",
              "translate(" + x(d.Train_loss_index) + "," +
                             y(d.Train_loss) + ")")
        .text(d.Train_loss);

    focus.select("text.y2")
        .attr("transform",
              "translate(" + x(d.Train_loss_index) + "," +
                             y(d.Train_loss) + ")")
        .text(d.Train_loss);

    focus.select("text.y3")
        .attr("transform",
              "translate(" + x(d.Train_loss_index) + "," +
                             y(d.Train_loss) + ")")
        .text("Batch: "+ d.Train_loss_index);

    focus.select("text.y4")
        .attr("transform",
              "translate(" + x(d.Train_loss_index) + "," +
                             y(d.Train_loss) + ")")
        .text("Loss: " + d.Train_loss_index);

    focus.select(".x")
        .attr("transform",
              "translate(" + x(d.Train_loss_index) + "," +
                             y(d.Train_loss) + ")")
                   .attr("y2", height - y(d.Train_loss));

    focus.select(".y")
        .attr("transform",
              "translate(" + width * -1 + "," +
                             y(d.Train_loss) + ")")
                   .attr("x2", width + width);     
    }             

  });



  d3.csv("data/eval_loss.csv", function(d) {
    d.Eval_loss = +d.Eval_loss;
    d.Eval_loss_index = +d.Eval_loss_index;
  return d;
    
}, function(error, data) {
  console.log(data);
  if (error) throw error;
  
  console.log(data);


  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", line2);
});
}




$(document).ready(function() {
  plot_loss();
});






