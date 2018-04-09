var map;
var svg;
var g;
var centreMap;
var initialZoom;
var hoverPinned = false;
var div;
var value;
var menu;
var icon_div;


function setupMap(_centreMap, _initialZoom, _neighbourhoodZoom) {
    // set parameters
    centreMap = _centreMap;
    if (_initialZoom) {
        initialZoom = _initialZoom;
    } else {
        initialZoom = 11;
    }
    if (_neighbourhoodZoom) {
        neighbourhoodZoom = _neighbourhoodZoom;
    }

    // set up the map
    map = new L.Map("map", {
            center: centreMap,
            zoom: initialZoom,
            maxZoom: 15,
            minZoom: initialZoom,
            scrollWheelZoom: false
        })
        .addLayer(new L.TileLayer("https://{s}.tiles.mapbox.com/v3/murraycox.3edcb23d/{z}/{x}/{y}.png"));

    //initialize the SVG layer
    map._initPathRoot();

    // pick the SVG from the map object
    svg = d3.select("#map").select("svg"), 
    g = svg.append("g");

    //    load listings on the map
//     loadListings('map_listings.csv');
    loadListings('map_listings_short.csv');
}

function showHover(d) {
    if (!hoverPinned) {
        div.transition()
            .duration(200)
            .style("opacity", .9);
        var string =
            "<img style='width:180px;height:150px;' src=" + d.picture_url + "/>" +
            "</br>" +
            "<a href=" + d.listing_url + " target='_blank' id='hover_name'>" + d.name + "</a></br>" +
            "Neighbourhood: " + d.neighbourhood + "</br>" +
            "Overall Rating: " + d.review_scores_rating + "  " + getStarRating(d.review_scores_rating) + "</br>" +
            "Price per Night: $" + getPrice(d) + "</br>" +
            "Number of Reviews: " + d.number_of_reviews + "</br>" +
            "Yearly Available Days: " + d.availability_365;
        div.html(string) //this will add the image on mouseover
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY + 50) + "px")
            .style("font-color", "white");
    }

}

function getPrice(d) {
    if (!isNaN(d.price)) {
        return d.price;
    } else {
        return "Unknown";
    }
}

function getStarRating(d) {
    var star_string = '<span class="fa fa-star checked"></span>';
    var non_star_string = '<span class="fa fa-star"></span>';
    var total_string = '';
    var i;
    for (i = 0; i < d / 20; i++) {
        total_string += star_string;
    }
    var j;
    for (j = i + 1; j < 6; j++) {
        total_string += non_star_string;
    }
    return total_string;
}

function showOut(d) {
    div.transition()
        .duration(1000)
        .style("opacity", 0);
}

function getColor(value, d) {
    //    console.log(value); 
    switch (value) {
        case "price":
            //                    return "#FF383F";
            var color = d3.scale.log()
                .clamp(true)
                .domain([1, 10000])
                .range(["white", "red"]);
            return color(d.price);
            break;
        case "ratings":
            //                    return "green"; 
            var color = d3.scale.log()
                .clamp(true)
                .domain([20, 100])
                .range(["white", "green"]);
            return color(d.review_scores_rating);
            break;
        case "number_of_reviews":
            var color = d3.scale.log()
                .clamp(true)
                .domain([1, 521])
                .range(["white", "blue"]);
            //            console.log(d.number_of_reviews);
            return color(d.number_of_reviews);
            break;
        case "availability":
            var color = d3.scale.log()
                .clamp(true)
                .domain([1, 365])
                .range(["white", "orange"]);
            //            console.log(d.availability_365); 
            return color(d.availability_365);
            break;
        default:
            return "white";
    }
}

function updateColor(value) {
    //    console.log("update!");
    //    console.log("value is " + value);
    d3.selectAll("circle")
        .transition()
        .duration(1000)
        .style('fill', function (d) {
            //            console.log(getColor(value, d)); 
            //            return getColor(value, d);
            return getColor(value, d);
        });
}

function loadListings(listingsFile) {
    // load the csv file of listings
    d3.csv(listingsFile, function (airbnb_data) {
//        console.log("HAHA: the airbnb data is " + airbnb_data);
        // convert values from string to proper data type
        airbnb_data.forEach(function (d) {
            // remove the leading $ sign of price
            // e.g. $216 gives you 216
            d.price = +d.price.replace('$', ''); // coerce to number
            d.weekly_price = +d.weekly_price.replace('$', '');
            d.monthly_price = +d.monthly_price.replace('$', '');
            d.number_of_reviews = +d.number_of_reviews;
            d.availability_365 = +d.availability_365;
            d.review_scores_rating = +d.review_scores_rating;
            // add a LatLng object to each item in the dataset
            d.LatLng = new L.LatLng(d.latitude, d.longitude);
        })
        //        console.log(airbnb_data[0]);
        setupListingsData(airbnb_data);
    })
}

function setupListingsData(airbnb_data) {
    var circleRadius = (map.getZoom() >= 14) ? 4 : 3;
    value = "price";
    // Define the div for the tooltip
    div = d3.select("body").append("div")
        .attr("id", "listingHover")
        .attr("class", "tooltip")
        .style("opacity", 0);
    var feature = g.selectAll("circle")
        .data(airbnb_data)
        .enter().append("circle")
        .style("opacity", .6)
        .style("fill", function (d) {
            return getColor(value, d);
        })
        .attr("r", circleRadius)
        .on("mouseover", showHover)
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    map.on("viewreset", update);
    update();

    function update() {
        feature.attr('transform',
            function (d) {
                return "translate(" +
                    map.latLngToLayerPoint(d.LatLng).x + "," +
                    map.latLngToLayerPoint(d.LatLng).y + ")";
            }
        )
    }
}

// load a single site file 
function loadSite(siteFile) {
    //    console.log("now loading " + siteFile);
    var height = (map.getZoom() >= 14) ? 15 : 25;
    var width = (map.getZoom() >= 14) ? 18 : 30;
    d3.csv(siteFile, function (site_data) {
        site_data.forEach(function (d) {
            //            console.log(d);
            // add a LatLng object to each item in the dataset
            d.LatLng = new L.LatLng(d.latitude, d.longitude);
        })
        // Define the div for the tooltip
        icon_div = d3.select("body").append("div")
            .attr("id", "iconListingHover")
            .attr("class", "tooltip")
            .style("opacity", 0);
        var feature = g.selectAll("image")
            .data(site_data)
            .enter().append("svg:image")
            .attr("class", function (d) {
                return d.type;
            })
            .attr('x', -10)
            .attr('y', -15)
            .attr('width', width)
            .attr('height', height)
            .attr('xlink:href', function (d) {
                if (d.type == "food") {
                    //                    console.log("food");
                    return "food.png"
                } else if (d.type == "sightseeing") {
                    //                    console.log("sightseeing");
                    return "sightseeing.png";
                } else if (d.type == "nightlife") {
                    //                    console.log("nightlifet");
                    return "nightlife.png";
                } else {
                    // park 
                    //                    console.log("park");
                    return "park.png";
                }
            })
            .on("mouseover", function (d) {
                icon_div.transition()
                    .duration(200)
                    .style("opacity", .9);
                var string =
                    "<a href=" + d.website + " target='_blank' id='hover_name'>" + d.name + "</a></br>" +
                    "Address: " + d.address + "</br>" +
                    "Type: " + d.type;

                icon_div.html(string) //this will add the image on mouseover
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY + 50) + "px")
                    .style("font-color", "white");
            })
            .on("mouseout", function (d) {
                icon_div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        map.on("viewreset", update);
        update();

        function update() {
            feature.attr('transform',
                function (d) {
                    return "translate(" +
                        map.latLngToLayerPoint(d.LatLng).x + "," +
                        map.latLngToLayerPoint(d.LatLng).y + ")";
                }
            )
        }
    });
}

$(document).ready(function () {
    //var city = "New York City";
    setupMap([40.7369, -73.9700], 11, 14);

    var header = document.getElementById("myDIV");
    console.log(header);
    //        console.log(header); 
    var active_block = header.getElementsByClassName("block_active")[0]
        .addEventListener('click', function () {
            var current = document.getElementsByClassName("block_active");
            //                console.log(current);
            current[0].className = current[0].className.replace("_active", "");;
            this.className += "_active";
            //                console.log("load sites");
            // remove all the exisitng listings points
            var feature = g.selectAll("image")
                .remove();
            if (this.id == 'food') {
                loadSite("map_food.csv");
            } else if (this.id == 'sightseeing') {
                loadSite("map_sightseeing.csv");
            } else if (this.id == 'nightlife') {
                loadSite("map_nightlife.csv");
            } else if (this.id == 'park') {
                loadSite("map_parks_nature.csv");
            }
        });
    var blocks = header.getElementsByClassName("block");
    //        console.log(blocks.length); 
    for (var i = 0; i < blocks.length; i++) {
        blocks[i].addEventListener('click', function () {
            var current = document.getElementsByClassName("block_active");
            //                console.log(current);
            current[0].className = current[0].className.replace("_active", "");;
            this.className += "_active";
            //                console.log("load sites");
            // remove all the exisitng listings points
            var feature = g.selectAll("image")
                .remove();
            if (this.id == 'food') {
                loadSite("map_food.csv");
            } else if (this.id == 'sightseeing') {
                loadSite("map_sightseeing.csv");
            } else if (this.id == 'nightlife') {
                loadSite("map_nightlife.csv");
            } else if (this.id == 'park') {
                loadSite("map_parks_nature.csv");
            }
        })
    }
});
