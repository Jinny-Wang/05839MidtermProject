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
      .range([height, 0]); 
  
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
        // console.log(x0);
        // console.log(i);
        // console.log(d);
        focus.select("circle.y")                           // **********
            .attr("transform",                             // **********
                  "translate(" + x(d.Train_loss_index) + "," +         // **********
                                 y(d.Train_loss) + ")");        // **********
    

    focus.select("text.y1")
        .attr("transform",
              "translate(" + x(d.Train_loss_index) + "," +
                             y(d.Train_loss) + ")")
        .text("Loss: "+d.Train_loss);

    focus.select("text.y2")
        .attr("transform",
              "translate(" + x(d.Train_loss_index) + "," +
                             y(d.Train_loss) + ")")
        .text("Loss: "+ d.Train_loss);

    focus.select("text.y3")
        .attr("transform",
              "translate(" + x(d.Train_loss_index) + "," +
                             y(d.Train_loss) + ")")
        .text("Batch: "+ d.Train_loss_index);

    focus.select("text.y4")
        .attr("transform",
              "translate(" + x(d.Train_loss_index) + "," +
                             y(d.Train_loss) + ")")
        .text("Batch: " + d.Train_loss_index);

    focus.select(".x")
        .attr("transform",
              "translate(" + x(d.Train_loss_index) + "," +
                             y(d.Train_loss) + ")")
                   .attr("y2", height - y(d.Train_loss));

    focus.select("line.y")
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
  
  var focus = g.append("g")               
                 .style("display", "none");  
    focus.append("circle")                                 // **********
        .attr("class", "y_eval")                                // **********
        .style("fill", "none")                             // **********
        .style("stroke", "blue")                           // **********
        .attr("r", 3);                                     // **********

    // append the x line
    focus.append("line")
        .attr("class", "x_eval")
        .style("stroke", "orange")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);

    // append the y line
    focus.append("line")
        .attr("class", "y_eval")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", width)
        .attr("x2", width);

    // append the circle at the intersection
    focus.append("circle")
        .attr("class", "y_eval")
        .style("fill", "none")
        .style("stroke", "blue")
        .attr("r", 4);

    // place the value at the intersection
    focus.append("text")
        .attr("class", "y1_eval")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");
    focus.append("text")
        .attr("class", "y2_eval")
        .attr("dx", 8)
        .attr("dy", "-.3em");

    // place the date at the intersection
    focus.append("text")
        .attr("class", "y3_eval")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");
    focus.append("text")
        .attr("class", "y4_eval")
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
        .on("mousemove", mousemove1);                       // **********

    var bisect = d3.bisector(function(d) { return d.Eval_loss_index; }).left;
    function mousemove1() {                                 // **********
        var x0 = x.invert(d3.mouse(this)[0]),    // **********
            i = bisect(data, x0),                   // **********
            d0 = data[i - 1],                              // **********
            d1 = data[i],                                  // **********
            d = x0 - d0.Eval_loss_index > d1.Eval_loss_index - x0 ? d1 : d0;     // **********
        console.log(x0);
        console.log(i);
        console.log(d);
        focus.select("circle.y_eval")                           // **********
            .attr("transform",                             // **********
                  "translate(" + x(d.Eval_loss_index) + "," +         // **********
                                 y(d.Eval_loss) + ")");        // **********
    

    focus.select("text.y1_eval")
        .attr("transform",
              "translate(" + x(d.Eval_loss_index) + "," +
                             y(d.Eval_loss) + ")")
        .text("Loss: "+d.Eval_loss);

    focus.select("text.y2_eval")
        .attr("transform",
              "translate(" + x(d.Eval_loss_index) + "," +
                             y(d.Eval_loss) + ")")
        .text("Loss: "+ d.Eval_loss);

    focus.select("text.y3_eval")
        .attr("transform",
              "translate(" + x(d.Eval_loss_index) + "," +
                             y(d.Eval_loss) + ")")
        .text("Batch: "+ d.Eval_loss_index);

    focus.select("text.y4_eval")
        .attr("transform",
              "translate(" + x(d.Eval_loss_index) + "," +
                             y(d.Eval_loss) + ")")
        .text("Batch: " + d.Eval_loss_index);

    focus.select(".x_eval")
        .attr("transform",
              "translate(" + x(d.Eval_loss_index) + "," +
                             y(d.Eval_loss) + ")")
                   .attr("y2", height - y(d.Eval_loss));

    focus.select("line.y_eval")
        .attr("transform",
              "translate(" + width * -1 + "," +
                             y(d.Eval_loss) + ")")
                   .attr("x2", width + width);  


    } 



    var legend_keys = ["Train Loss", "Evaluation Loss"]


    var lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
        .enter().append("g")
        .attr("class","lineLegend")
        .attr("transform", function (d,i) {
                return "translate(" + width*0.8 + "," + (5+(i*20))+")";
            });

    lineLegend.append("text").text(function (d) {return d;})
        .attr("transform", "translate(20,10)"); //align texts with boxes

    lineLegend.append("rect")
        .attr("fill", function (d, i) {
          console.log(d);
          if (d=="Train Loss"){
            console.log("is train loss");
            return "#668cff";
          }
          else if(d=="Evaluation Loss"){
            console.log("is eval loss")
            return "#ff9933";
          }
              
          else
              return "black";
        })
        .attr("width", 10).attr("height", 10)
        .attr("margin-right", "10px");            

    }


/**
 * Created by Shirley on 3/18/17.
 */

var timeline, brush;
var timeSelectBegin = new Date(2007,1,21);
var timeSelectEnd = new Date(2007,4,14);
var timeBegin = new Date(2007,1,21);
var timeEnd = new Date(2015,11,14);


function bubbleChart() {

    var width = window.innerHeight+200;
    var height = window.innerHeight;
    // var width = 1080;
    // var height = 1000;
    var tooltip = floatingTooltip('gates_tooltip', 240);

    var center = { x: width / 2-50, y: height / 2 };

    var yearCenters = {
        2008: { x: width / 3, y: height / 2 },
        2009: { x: width / 2, y: height / 2 },
        2010: { x: 2 * width / 3, y: height / 2 }
    };

    var yearsTitleX = {
        2008: 160,
        2009: width / 2,
        2010: width - 160
    };


    var damper = 0.102;
    var svg = null;
    var bubbles = null;
    var nodes = [];


    function charge(d) {
        return -Math.pow(d.radius, 2.0) / 8;
    }


    var force = d3.layout.force()
            .size([width, height])
            .charge(charge)
            .gravity(1)
            .friction(0.95);


    // encode the difference
    var fillColor = d3.scale.linear()
            .domain([0,75])
            .range(['#92dbb4','#e77777']);


    //encode the rating
    var radiusScale = d3.scale.pow()
            .exponent(2)
            .range([20, 120]);
    // var linearRadiusScale = d3.scale.linear()
    //         .domain([0,100])
    //         .range([2,50]);


    function wordFreq(string) {
      var words = string.replace(/[.]/g, '').split(/\s/);
      var freqMap = {};
      words.forEach(function(w) {
        if (!freqMap[w]) {
            freqMap[w] = 0;
        }
        freqMap[w] += 1;
      });

      var totalFreq = 0;
      for (var word in freqMap){
        totalFreq += freqMap[word];
      }

      //normalizing
      for (var word in freqMap){
        freqMap[word] = freqMap[word].toFixed(2) / totalFreq.toFixed(2);

      }
      console.log(freqMap);
      return freqMap;
  }

    function createNodes(rawData) {

        var myNodes = rawData.map(function (d) {

            //'text', 'rating', 'id', 'predicted_rating', 'difference'
            return {
                id: d.id, //listing id
                radius: radiusScale(+d.rating),
                rating: +d.rating,
                predicted_rating : +d.predicted_rating,
                review : d.text,
                difference : d.difference,
                frequency : wordFreq(d.text),
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
            };
        });

        // sort them to prevent occlusion of smaller nodes.
        myNodes.sort(function (a, b) { return b.rating - a.rating; });

        return myNodes;
    }

    // selector : #review_visualization
    var chart = function chart(selector, rawData) {

        var maxAmount = d3.max(rawData, function (d) { return +d.rating; });
        radiusScale.domain([0, maxAmount]);

        nodes = createNodes(rawData);
        // Set the force's nodes to our newly created nodes array.
        force.nodes(nodes);

        svg = d3.select(selector)
                .append('svg')
                .attr("id","main-svg")
                .attr('width', width)
                .attr('height', height);


        // Bind nodes data to what will become DOM elements to represent them.
        bubbles = svg.selectAll('.star')
                .data(nodes, function (d) { return d.id; });


        bubbles.enter().append('circle')
                .attr('r', 0)
                .attr('fill', function (d) { return fillColor(d.difference); })
                .attr('stroke', function (d) { return fillColor(d.difference);})
                .attr('stroke-width', 3)
                .attr('stroke-opacity',0.5)
                .on('mouseover', showDetail)
                .on('mouseout', hideDetail);


        bubbles.transition()
                .duration(3000)
                .attr('r', function (d) { return d.radius/5; })
                .attr('stroke-width', function (d) { return d.radius/5; });

        // Set initial layout to single group.
        groupBubbles();
    };


    function groupBubbles() {
        hideYears();

        force.on('tick', function (e) {
            bubbles.each(moveToCenter(e.alpha))
                    .attr('cx', function (d) { return d.x; })
                    .attr('cy', function (d) { return d.y; });
        });

        force.start();
    }


    function moveToCenter(alpha) {
        return function (d) {
            d.x = d.x + (center.x - d.x) * damper * alpha;
            d.y = d.y + (center.y - d.y) * damper * alpha;
        };
    }


    function splitBubbles() {
        showYears();

        force.on('tick', function (e) {
            bubbles.each(moveToYears(e.alpha))
                    .attr('cx', function (d) { return d.x; })
                    .attr('cy', function (d) { return d.y; });
        });

        force.start();
    }

    function moveToYears(alpha) {
        return function (d) {
            var target = yearCenters[d.year];
            d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
            d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
        };
    }

    /*
     * Hides Year title displays.
     */
    function hideYears() {
        svg.selectAll('.year').remove();
    }

    /*
     * Shows Year title displays.
     */
    function showYears() {
        // Another way to do this would be to create
        // the year texts once and then just hide them.
        var yearsData = d3.keys(yearsTitleX);
        var years = svg.selectAll('.year')
                .data(yearsData);

        years.enter().append('text')
                .attr('class', 'year')
                .attr('x', function (d) { return yearsTitleX[d]; })
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .text(function (d) { return d; });
    }


    
    function showWordCloud(d, selector){
      var fill = d3.scale.category20();
      var layout = d3.layout.cloud()
                   .size([500, 500])
                    .words(Object.keys(d.frequency).map(
                      function(e) {
                        return {text: e, size: d.frequency[e]};
                      }))
                    .padding(5)
                    .fontStyle("color", function(d) { return fill(d.text.toLowerCase()); })
                    .rotate(function() { return ~~(Math.random() * 2) * 90; })
                    .font("Impact")
                    .fontSize(function(d) { return 5000*d.size; })
                    .on("end", draw);

      layout.start();

      function draw(words) {
        d3.select(selector).append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
          .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
      }
    }


    /*
     * Function called on mouseover to display the
     * details of a bubble in the tooltip.
     */
    function showDetail(d) {
        // change outline to indicate hover state.
        d3.select(this).attr('stroke', 'white')
                    .style("cursor", "pointer");

        var content = '<p><span class="name">ID: </span><span class="value">' +
                d.id +
                '</span></p>'+
                '<p><span class="name">Real Rating: </span><span class="value">' +
                d.rating +
                '</span></p>'+
                '<p><span class="name">Predicted Rating: </span><span class="value">' +
                d.predicted_rating +
                '</span></p>';
        tooltip.showTooltip(content, d3.event);

        d3.select("#detail").style("display","block");
        showWordCloud(d,"#detail")
        // d3.select("#detail-id").html(d.id);
        // d3.select("#detail-rating").html("Real Rating: "+d.rating);
        // d3.select("#detail-prediction").html("Predicted Rating: "+d.predicted_rating);
        // d3.select("#detail-comments").html("Comments: "+d.review);
        
    }


    function hideDetail(d) {
        // reset outline
        d3.select(this)
                .attr('stroke', d3.rgb(fillColor(d.difference)))
                .style("cursor", "default");
          
        if( $("#detail svg")){
          $("#detail svg").remove();
        }      
        d3.select("#detail").style("display","none");
        // document.getElementById("wordcloud-img").src = "image/temp.png";
        tooltip.hideTooltip();
    }


    chart.toggleDisplay = function (displayName) {
        if (displayName === 'year') {
            splitBubbles();
        } else {
            groupBubbles();
        }
    };


    // return the chart function from closure.
    return chart;
}

var myBubbleChart = bubbleChart();


function display(error, data) {
    if (error) {
        console.log(error);
    }
    myBubbleChart('#review_visualization', data);
}

/*
 * Creates tooltip with provided id that
 * floats on top of visualization.
 * Most styling is expected to come from CSS
 * so check out bubble_chart.css for more details.
 */
function floatingTooltip(tooltipId, width) {
  // Local variable to hold tooltip div for
  // manipulation in other functions.
  var tt = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', tooltipId)
    .style('pointer-events', 'none');

  // Set a width if it is provided.
  if (width) {
    tt.style('width', width);
  }

  // Initially it is hidden.
  hideTooltip();

  /*
   * Display tooltip with provided content.
   *
   * content is expected to be HTML string.
   *
   * event is d3.event for positioning.
   */
  function showTooltip(content, event) {
    tt.style('opacity', 1.0)
      .html(content);

    updatePosition(event);
  }

  /*
   * Hide the tooltip div.
   */
  function hideTooltip() {
    tt.style('opacity', 0.0);
    tt.style('animation','none')
  }

  /*
   * Figure out where to place the tooltip
   * based on d3 mouse event.
   */
  function updatePosition(event) {
    var xOffset = 20;
    var yOffset = 10;

    var ttw = tt.style('width');
    var tth = tt.style('height');

    var wscrY = window.scrollY;
    var wscrX = window.scrollX;

    var curX = (document.all) ? event.clientX + wscrX : event.pageX;
    var curY = (document.all) ? event.clientY + wscrY : event.pageY;
    var ttleft = ((curX - wscrX + xOffset * 2 + ttw) > window.innerWidth) ?
                 curX - ttw - xOffset * 2 : curX + xOffset;

    if (ttleft < wscrX + xOffset) {
      ttleft = wscrX + xOffset;
    }

    var tttop = ((curY - wscrY + yOffset * 2 + tth) > window.innerHeight) ?
                curY - tth - yOffset * 2 : curY + yOffset;

    if (tttop < wscrY + yOffset) {
      tttop = curY + yOffset;
    }

    tt.style({ top: tttop + 'px', left: ttleft + 'px' });
  }

  return {
    showTooltip: showTooltip,
    hideTooltip: hideTooltip,
    updatePosition: updatePosition
  };
}




// d3.tsv('data/stories.tsv', display);

$(document).ready(function() {

  plot_loss();  
  //load data
  d3.csv('data/reviews_rating_predicted_sample.csv', display);
});






