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
    xMax = 32340, 
    xMin = 0;


function plot_loss(){
  console.log("in plot loss");
  var svg = d3.select("#loss_visualization"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    console.log("height is"+height);
 //  var tip = d3.tip()
 //     .attr('class', 'd3-tip')
 //     .offset([-10, 0])
 //     .html(function (d) {
 //     return "<strong>Loss($):</strong> <span style='color:red'>" + d.Train_loss + "</span>";
 // })

  //svg.call(tip);

  var x = d3.scale.linear()
      .domain([xMin, xMax])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([yMin, yMax])
      .range([height, 0]); //x.domain([xMin, xMax]);
  

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
  // x.domain([xMin, xMax]);
  // y.domain([yMin, yMax]);

  console.log(data);
  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.svg.axis(x))
    .select(".domain")
      .remove();

  g.append("g")
      .call(d3.svg.axis(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Mean Square Error");

  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line1);
  });



  d3.csv("data/eval_loss.csv", function(d) {
    d.Eval_loss = +d.Eval_loss;
    d.Eval_loss_index = +d.Eval_loss_index;
  return d;
    
}, function(error, data) {
  console.log(data);
  if (error) throw error;
  
  console.log(data);
  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.svg.axis(x))
    .select(".domain")
      .remove();

  g.append("g")
      .call(d3.svg.axis(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Mean Square Error");

  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line2);
});
}




$(document).ready(function() {
  plot_loss();
});






