var capacity_output = d3.select("#capacity_value"),
    bus_output = d3.select("#bus_value"),
    carpool_output = d3.select("#carpool_value"),
    commuter_output = d3.select("#commuter_value"),
    output_div = d3.select('#total_output .outputInner'),
    lane_output_div = d3.select('#lanes .outputInner'),
    lane_animation_div = d3.select("#lane_animation"),
    capacity = d3.select("#capacity").on("change", capacity_changed).each(capacity_changed),
    commuters = d3.select("#commuters").on("change", commuters_changed).each(commuters_changed),
    carpool = d3.select("#carpool").on("change", carpool_changed).each(carpool_changed),
    buses = d3.select("#buses").on("change", bus_changed).each(bus_changed);

var bus_input;
var capacity_input;
var carpool_input;
var commuter_input;

var format = d3.format(",");
function parseit(string) {
  return parseFloat(string.replace(",",""));
}
var button = d3.select('#buttonButton');

button.on('click', function() {
  var selection = d3.selectAll('.input_button');
  selection
    .transition()
      .style('background-color', 'steelblue')
    .transition()
      .style('background-color', '#fbb437')
    .transition()
      .style('background-color', 'steelblue')
    .transition()
      .style('background-color', '#fbb437');
});

function capacity_changed() {
  capacity_input = +this.value;
  capacity_output.html("<strong>" + capacity_input + '</strong> '+ _( 'person' ).pluralize(capacity_input) + ' per car');
  recalculate();
}

function carpool_changed() {
  carpool_input = +this.value;
  carpool_output.html("<strong>" + carpool_input + '</strong>% riders carpool');
  recalculate();
}

function bus_changed() {
  //get the input
  bus_input = +this.value;
  bus_output.html("<strong>" + bus_input + '</strong> ' +_( 'bus' ).pluralize(bus_input));
  recalculate();
}

function commuters_changed() {
  //get the input
  commuter_input = +this.value;
  commuter_output.html("<strong>" + commuter_input + '</strong>% riders stay home');
  recalculate();
}



function recalculate() {
  var original = 92000;
  var value = original;
  
  var capacity_of_a_bus = 42; //self-explanatory i hope

  var number_of_stay_at_homes = value * 0.01 * commuter_input;

  value = value - number_of_stay_at_homes;

  //number of people who would fit on a bus
  var buses_people = capacity_of_a_bus * bus_input;
  //subtract that from total
  value = value - buses_people;
  
  //remaining total times (input to percent)
  var carpoolers = Math.ceil(value * carpool_input * 0.01);

  //number of cars is the number of carpoolers divided by carpoolers to car
  var carpool_cars = Math.ceil(carpoolers / capacity_input);
  //subtract the carpoolers...
  value = value - carpoolers;
  //...but don't forget to add the cars!
  value += carpool_cars;
  //..and the buses!
  value += bus_input;

  //don't be silly. You can't have less than 0 more cars.  
  //sets value to 0 if it's less than 0. 
  if (value < 0) {
      value = 0;
  }
  //if there's nothing in there... start at 0
  if ((output_div.text + '').length < 1) {
    output_div.text = original;
  }

  output_div
    .transition()
    .duration(750)
        .tween("text", function(d) {
            var i = d3.interpolate(+this.textContent.replace(",",""), +value),
                prec = (value + "").split("."),
                round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

            return function(t) {
                this.textContent = format(Math.round(i(t) * round) / round);
            };
        });

  //output_div.append('text').text('additional vehicles on the road');
  updateLanes(value);
}

function updateLanes(val) {
  var base_number_of_cars = 24000;
  var new_number_of_cars = base_number_of_cars + val;
  
  var number_of_LIEs = Math.round(val/base_number_of_cars*100);
  console.log(number_of_LIEs);

  lane_output_div
      .transition()
      .duration(750)
        .tween("text", function(d) {
            var i = d3.interpolate(+this.textContent.replace("%",""), +number_of_LIEs),
                prec = (number_of_LIEs + "").split("."),
                round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

            return function(t) {
              this.textContent = (format(Math.round(i(t) * round) / round) +'%');
            };
        });
}
$( document ).ready(function() { recalculate(); });


$('#lorem').waypoint(function(direction) {
  console.log('im in')
  var bar = d3.select('.fixed_bar_container');
  if (direction === 'up') {
    $('.fixed_bar_container').slideDown();
  }
  else {
    $('.fixed_bar_container').slideUp();
  }
}, { offset: '50%' });
  //function() {
  //  console.log(this.height())
  //  return -$(this).height() - 1000; } });  