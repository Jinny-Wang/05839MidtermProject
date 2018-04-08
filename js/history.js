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



function loadListings(listingsFile) {
    // load the csv file of listings
    d3.csv(listingsFile, function (airbnb_data) {
        // convert values from string to proper data type
        airbnb_data.forEach(function (d) {
            d.price = +d.price; // coerce to number
            d.reviews_per_month = +d.reviews_per_month;
            d.number_of_reviews = +d.number_of_reviews;
            d.last_review = d.last_review == "" ? null : d3.time.format('%Y-%m-%d').parse(d.last_review);
            d.last_review_month = d.last_review ? d3.time.month(d.last_review) : null;
            d.availability_365 = +d.availability_365;
            d.minimum_nights = +d.minimum_nights;
            d.calculated_host_listings_count = +d.calculated_host_listings_count;
            d.estimated_nights_per_year = +d3.round(d.estimated_occupancy * 365, 0);
            d.idVerified = d.calculated_host_listings_count / 5 * Math.random() > 1 ? "t" : "f";
            // add a LatLng object to each item in the dataset
            d.LatLng = new L.LatLng(d.latitude, d.longitude);
        })
        console.log(airbnb_data[0]);
        setupMapData(airbnb_data);
    })
}



