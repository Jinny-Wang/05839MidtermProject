/* 05-839 Interactive Data Science Midterm project 
   Task : Visualizing Airbnb Data
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

var timeBegin = null;
var timeEnd = null;




function setupScatterPlot(data){
  var margin = { top: 50, right: 300, bottom: 50, left: 50 },
    outerWidth = 1250,
    outerHeight = 650,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

  var x = d3.scale.linear() //linear scale for continuous quantitative data
      .range([0, width]).nice(); // a linear mapping!

  var y = d3.scale.linear()
      .range([height, 0]).nice();

  var xCat = "reviews_per_month",
      yCat = "review_scores_rating",
      rCat = "num_reviews_sqrt",
      colorCat = "first_review_year", // TODO : modify later
      first_review = "first_review",
      number_of_reviews = "number_of_reviews";

  // var xMax = d3.max(data, function(d) { return d[xCat]; }) * 1.05,
  //    xMin = d3.min(data, function(d) { return d[xCat]; }),
  //    xMin = xMin > 0 ? 0 : xMin,
  //    yMax = d3.max(data, function(d) { return d[yCat]; }) * 1.05, // d3.max(array[,accessor]) -> accessor function is equivalent to calling array.map(accessor)
  //    // yMin = d3.min(data, function(d) { return d[yCat]; }),
  //    // yMin = yMin > 0 ? 0 : yMin;
  //    yMin = 60;

   var xMax =  40 * 1.05,
      xMin = 0,
      yMax = 100 * 1.05, 
      yMin = 60;

  x.domain([xMin, xMax]); // set the domain of mapping
  y.domain([yMin, yMax]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize(-height);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSize(-width);

  var custom_colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728','#9467bd', '#8c564b' , '#e377c2','#7f7f7f', '#ff9896','#17becf']

  //var color = d3.scale.category10(); // color setting of the points!!
  var color = d3.scale.ordinal()
          .range(custom_colors);

  var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10, 0]) //offset is computed from [top, left]
      .html(function(d) {
        return xCat + ": " + d[xCat] + "<br>" + yCat + ": " + d[yCat]+ "<br>" + number_of_reviews + ": " +d[number_of_reviews] + "<br>"+ first_review + ": " + d[first_review];
      });

  var zoomBeh = d3.behavior.zoom()
      .x(x)
      .y(y)
      .scaleExtent([0, 500])//Specifies the zoom scale's allowed range as a two-element array,
      .on("zoom", zoom);

  var svg = d3.select("#scatter")
    .append("svg")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoomBeh);

  svg.call(tip);

  svg.append("rect")
      .attr("class","history")
      .attr("width", width)
      .attr("height", height);

  svg.append("g")
      .classed("x axis", true)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .classed("label", true)
      .attr("x", width)
      .attr("y", margin.bottom - 10)
      .style("text-anchor", "end")
      .text(xCat);

  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(yCat);

  var objects = svg.append("svg")
      .classed("objects", true)
      .attr("width", width)
      .attr("height", height);

  objects.append("svg:line")
      .classed("axisLine hAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", 0)
      .attr("transform", "translate(0," + height + ")");

  objects.append("svg:line")
      .classed("axisLine vAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

  objects.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .classed("dot", true)
      .attr("r", function (d) { return 2.5*d[rCat]; })
      .attr("transform", transform)
      .style("fill", function(d) { return color(d[colorCat]); })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);

  var legend = svg.selectAll(".legend")
      .data(color.domain().sort())
    .enter().append("g")
      .classed("legend", true)
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("circle")
      .attr("r", 7.5)
      .attr("cx", width + 20)
      .attr("fill", color)
      .style("margin", "2px");

  legend.append("text")
      .attr("x", width + 26)
      .attr("dy", ".35em")
      .text(function(d) {  console.log(d);return d; })
      .style("margin","2px");

  d3.select("input").on("click", change);
  drawTimeline(data);

  function change() {
    xCat = "reviews_per_month";
    xMax = d3.max(data, function(d) { return d[xCat]; });
    xMin = d3.min(data, function(d) { return d[xCat]; });

    zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));

    var svg = d3.select("#scatter").transition();

    svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);

    objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
  }

  function zoom() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    svg.selectAll(".dot")
        .attr("transform", transform);
  }

  function transform(d) {
    return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
  }



  function drawTimeline(data) {
            var timelineWidth = 500;
            var timelineHeight = 20;

            timeline = d3.select("#timeline")
                    .append('svg')
                    .attr('width', 650)
                    .attr('height', 100);

            timeline.append("g")
                    .attr("width", timelineWidth)
                    .attr("height", timelineHeight)
                    .attr("class", "timeline");


            var timeXScale = d3.time.scale()
                    .domain([timeBegin, timeEnd])
                    .range([0, timelineWidth]);


            var timelineXAxis = d3.svg.axis()
                    .orient("bottom")
                    .scale(timeXScale)
                    .tickFormat(d3.time.format("%Y"));

            //draw frame
            timeline.append("rect")
                    .attr("width", timelineWidth)
                    .attr("height", timelineHeight)
                    .attr("transform", "translate(20,40)")
                    .attr("fill","#222222")
                    .attr("fill-opacity",0.5)
                    .attr("stroke-width", 1)
                    .attr("stroke", "white");

            //draw description
            timeline.append("text")
                    .attr("class", "timeline-text")
                    .attr("transform", "translate("+(timelineWidth+10)+",20)")
                    .attr("text-anchor","end")
                    .text("Timeline ("+timeBegin.toLocaleDateString()+" - "+timeEnd.toLocaleDateString()+")");

            //draw axis
            timeline.append("g")
                    .attr("class", "timeline-axis")
                    .attr("transform", "translate(20,"+(timelineHeight+40)+")")
                    .call(timelineXAxis);

            var timeData = [];
            data.forEach(function (entry) {
                var time = new Date(entry.year);
                timeData.push(time);
            });

            var bins = d3.layout.histogram()
                    .bins(timeXScale.ticks(24*4))
                    (timeData);

            var timeYScale = d3.scale.linear()
                    .domain([200, 0])
                    .range([0, timelineHeight]);

            var area = d3.svg.area()
                    .x(function(d) { return (timeXScale(d.x)+20); })
                    .y0(timelineHeight+40)
                    .y1(function(d) { return timeYScale(d.y)+40; });

            timeline.append("path")
                    .datum(bins)
                    .attr("class", "area")
                    .attr("d", area)
                    .attr("fill","#CAEBF2")
                    .attr("fill-opacity",1)
                    .attr("stroke","#CAEBF2");


            //brush
            brush = d3.svg.brush()
                    .x(timeXScale)
                    .on("brush", updateTime);
            //draw brush
            timeline.append("g")
                    .attr("class", "brush")
                    .call(brush)
                    .selectAll("rect")
                    .attr("y", 1)
                    .attr("height", timelineHeight - 1)
                    .attr("transform", "translate(20,40)")
                    .attr("fill","rgba(255,56,63,0.7)")
                    .attr("stroke-width", 1)
                    .attr("stroke", "#CAEBF2")
                    .attr("background-color","#FFFFFF");


            function updateTime() {
                timeline.select(".brush")
                        .call(brush.extent([brush.extent()[0], brush.extent()[1]]));
                timeSelectBegin = brush.extent()[0];
                timeSelectEnd = brush.extent()[1];
                d3.select(".timeline-text").text(timeSelectBegin.toLocaleDateString()+" "+timeSelectBegin.toLocaleTimeString()
                        +" - "+timeSelectEnd.toLocaleDateString()+" "+timeSelectEnd.toLocaleTimeString());
                //update data TODO : change this to work with our visualization
                updateScatterPlot(data);

            }

            function updateScatterPlot(data) {
                        svg.selectAll("circle")
                                .data(data)
                                .attr("display", function (d) {

                                    var time = new Date(d.first_review);
                                    if (time < timeSelectEnd && time > timeSelectBegin) {
                                        //display
                                        return "block";
                                    } else {
                                        //hide
                                        return "none";
                                    }

                                });
            }

}

}









function loadListings(listingsFile) {
    // load the csv file of listings
    d3.csv(listingsFile, function (airbnb_data) {
        // convert values from string to proper data type
        airbnb_data.forEach(function (d) {
            // d.price = +d.price; // coerce to number
            d.reviews_per_month = +d.reviews_per_month;
            d.number_of_reviews = +d.number_of_reviews;
            d.num_reviews_sqrt = +d.num_reviews_sqrt;
            d.review_scores_rating = +d.review_scores_rating;
            // d.last_review = d.last_review == "" ? null : d3.time.format('%Y-%m-%d').parse(d.last_review);
            // d.last_review_month = d.last_review ? d3.time.month(d.last_review) : null;
            d.first_review = d.first_review=="" ? null : d3.time.format('%Y-%m-%d').parse(d.first_review);
            //d.first_review_year =  d.first_review ? d3.time.year(d.first_review) : null;
            d.first_review_year = d.first_review.getFullYear();
            //d.availability_365 = +d.availability_365;
            // d.minimum_nights = +d.minimum_nights;
            // d.calculated_host_listings_count = +d.calculated_host_listings_count;
            // d.estimated_nights_per_year = +d3.round(d.estimated_occupancy * 365, 0);
            // d.idVerified = d.calculated_host_listings_count / 5 * Math.random() > 1 ? "t" : "f";
            // // add a LatLng object to each item in the dataset
            // d.LatLng = new L.LatLng(d.latitude, d.longitude);
        })
        console.log(airbnb_data[0]);
        //setupMapData(airbnb_data);
        timeBegin = d3.min(airbnb_data, function(d) { return d['first_review']; });
        timeEnd = d3.max(airbnb_data, function(d) { return d['first_review']; });
        setupScatterPlot(airbnb_data);

        
        //drawTimeline(airbnb_data);
    })
}




$(document).ready(function() {
  loadListings("listings_history_dropna_sqrt_3000.csv")
});






