var map = "data/countries-110m.json";
var data_source = "data/gapminder_data.csv";

var topology;
var dataset;

var width = 1000;
var height = 400;

margin = { top: 30, right: 20, bottom: 20, left: 40 };

var radius = 5;

// Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
// Its opacity is set to 0: we don't see it by default.
var tooltip;

var selectedCountries = [];

function init() {}
Promise.all([d3.json(map), d3.csv(data_source)]).then(function ([map, data]) {
  topology = map;
  dataset = data;
  console.log(data);
  console.log(map);
  //createColorScale();
  scatterplot(data);

  geo_map();
  //drawer();
  addZoom();
  tooltip = d3
    .select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");
  console.log("passei");
  console.log(tooltip);
});

function drawer(selectedCountries1, insert) {
  var ul = d3.select("#geoMap").append("div").append("ul");
  if (insert) {
    ul.selectAll("li")
      .data(selectedCountries1)
      .enter()
      .append("li")
      .html(String);
  } else {
    ul.selectAll("li")
      .data(selectedCountries1)
      .enter()
      .remove("li")
      .html(String);
  }
}

function geo_map() {
  var projection = d3
    .geoMercator()
    .scale(height / 2)
    .rotate([0, 0])
    .center([0, 0])
    .translate([width / 2, height / 2]);

  var path = d3.geoPath().projection(projection);

  var colorScale = d3
    .scaleThreshold()
    .domain([0, 10, 20, 30, 40, d3.max(dataset, (d) => d.internetuserate)])
    .range(d3.schemeBlues[7]);

  d3.select("#geoMap")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .selectAll("path")
    .data(topojson.feature(topology, topology.objects.countries).features)
    .join("path")
    .attr("class", "country")
    // .attr("fill", function (d) {
    //   // console.log(d);
    //   dataset1 = dataset.filter(function (dataItem) {
    //     if (dataItem.country == d.properties.name) return dataItem;
    //   });
    //   //console.log(dataset1[0].in);
    //   if (dataset1[0] == null) return colorScale(0);
    //   //console.log(dataset1[0].internetuserate);
    //   return colorScale(dataset1[0].internetuserate);
    // })
    .attr("fill", "black")
    .attr("d", path)
    .on("mouseover", handleMouseOver)
    .on("mousemove", handleMouseMove)
    .on("mouseleave", handleMouseLeave)
    .on("click", handleClick)
    .attr("id", function (d, i) {
      return d.properties.name;
    })
    .append("title")
    .text(function (d) {
      return d.properties.name;
    });

  var legend = d3
    .select("#colorScale")
    .selectAll("g.legendEntry")
    .data(colorScale.range().reverse())
    .enter()
    .append("g")
    .attr("class", "legendEntry");

  legend
    .append("rect")
    .attr("x", width - 780)
    .attr("y", function (d, i) {
      return i * 20;
    })
    .attr("width", 10)
    .attr("height", 10)
    .style("stroke", "black")
    .style("stroke-width", 1)
    .style("fill", function (d) {
      console.log(d.internetuserate);
      return colorScale(d.internetuserate);
    });
  //the data objects are the fill colors

  legend
    .append("text")
    .attr("x", width - 765) //leave 5 pixel space after the <rect>
    .attr("y", function (d, i) {
      return i * 20;
    })
    .attr("dy", "0.8em") //place text one line *below* the x,y point
    .text(function (d, i) {
      var extent = colorScale.invertExtent(d);
      //extent will be a two-element array, format it however you want:
      var format = d3.format("0.2f");
      return format(+extent[0]) + " - " + format(+extent[1]);
    });
}

function scatterplot(data) {
  const width = 400;
  const height = 400;
  margin = { top: 20, right: 20, bottom: 20, left: 40 };

  x = d3
    .scaleLinear()
    .domain([0, 23])
    .range([margin.left, width - margin.right]);

  y = d3
    .scaleLinear()
    .domain([40, 90])
    .range([height - margin.bottom, margin.top]);

  function xAxis(g) {
    g.attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((x) => x)
          .ticks(5)
      )
      .call((g) => g.select(".domain").remove());
  }

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left}, 0)`)
      .call(
        d3.axisLeft(y)
        //.tickFormat((i) => data[i].year)
        //.tickSizeOuter(0)
      )
      .call((g) => g.select(".domain").remove());
  }

  const svg = d3
    .select("div#scatterPlot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  //svg.append("g").call(grid);

  // var radius = d3
  //   .scaleLinear()
  //   .domain(d3.extent(data, (d) => d.year))
  //   .range([3, 10]);
  tooltip = d3
    .select("#geoMap")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

  var radius = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.armedforcesrate))
    .range([3, 10]);

  //console.log();
  svg
    .append("g")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2.5)
    .attr("fill", "black")
    .selectAll("circle")
    .data(data, function (d) {
      //console.log(d.country);
      return d.country;
    })
    .join("circle")
    .on("mouseover", handleMouseOver)
    .on("mouseleave", handleMouseLeave)
    .on("mousemove", handleMouseMove)
    .attr("id", function (d, i) {
      return d.country;
    })
    .attr("cx", (d) => x(d.alcconsumption))
    .attr("cy", (d) => y(d.lifeexpectancy))
    .attr("r", function (d) {
      //console.log(d);
      return radius(d.armedforcesrate);
    });

  // data = data.filter(function (dataItem) {
  //   if (dataItem.year > 2010) return dataItem;
  // });

  // svg
  //   .append("g")
  //   .attr("stroke", "red")
  //   .attr("stroke-width", 1.5)
  //   .attr("fill", "none")
  //   .selectAll("circle")
  //   .data(data, function (d) {
  //     return d.oscar_year;
  //   })
  //   .join("circle")
  //   .attr("cx", (d) => x(d.budget))
  //   .attr("cy", (d) => y(d.rating))
  //   .attr("r", function(d){return radius()});
}

function handleMouseOver(event, d) {
  geo_map = d3.select("div#geoMap").select("svg");
  scatterplot = d3.select("div#scatterPlot").select("svg");
  //  console.log(d);
  if (selectedCountries.indexOf(d.properties.name) === -1) {
    geo_map
      .selectAll("path")
      .filter(function (c) {
        if (d.properties == null) {
          if (d.country == c.properties.name) return c;
        } else {
          if (d.id == c.id) return c;
        }
      })
      .style("fill", "red");
  }

  scatterplot
    .selectAll("circle")
    .filter(function (c) {
      if (d.properties == null) {
        if (d.country == c.country) {
          // console.log("circle");
          // console.log(c);
          return c;
        }
      } else {
        if (d.properties.name == c.country) {
          // console.log("circle");
          // console.log(c);
          return c;
        }
      }
    })
    .style("fill", "red");
  tooltip.html(d.properties.name);
  tooltip.style("opacity", 1);
}

function handleMouseLeave(event, d) {
  geo_map = d3.select("div#geoMap").select("svg");
  scatterplot = d3.select("div#scatterPlot").select("svg");

  if (selectedCountries.indexOf(d.properties.name) === -1) {
    geo_map
      .selectAll("path")
      .filter(function (c) {
        if (d.properties == null) {
          if (d.country == c.properties.name) return c;
        } else {
          if (d.id == c.id) return c;
        }
      })
      .style("fill", "black");
  }

  scatterplot
    .selectAll("circle")
    .filter(function (c) {
      if (d.properties == null) {
        if (d.country == c.country) {
          // console.log("circle");
          // console.log(c);
          return c;
        }
      } else {
        if (d.properties.name == c.country) {
          // console.log("circle");
          // console.log(c);
          return c;
        }
      }
    })
    .style("fill", "black");
  // .style("z-index", -1)
  // .style("positions", "relative");

  dataset1 = dataset.filter(function (dataItem) {
    if (dataItem.country == d.properties.name) return dataItem;
  });

  // tooltip.html(
  //   "country :" +
  //     d.properties.name +
  //     "<br> alcconsumption = " +
  //     dataset1[0].alcconsumption +
  //     "<br> life expectancy = " +
  //     dataset1[0].lifeexpectancy
  // );
  tooltip.transition().duration(200).style("opacity", 0);
}

function handleMouseMove(event, d) {
  dataset1 = dataset.filter(function (dataItem) {
    if (dataItem.country == d.properties.name) return dataItem;
  });
  console.log(dataset1[0]);
  tooltip
    .html(
      "country :" +
        d.properties.name +
        "<br> alcconsumption = " +
        dataset1[0].alcconsumption +
        "<br> life expectancy = " +
        dataset1[0].lifeexpectancy
    )
    .style("left", d3.pointer(this)[0] + 90 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
    .style("top", d3.pointer(this)[1] + "px");
}

function handleClick(event, d) {
  geo_map = d3.select("div#geoMap").select("svg");

  if (selectedCountries.indexOf(d.properties.name) === -1) {
    selectedCountries.push(d.properties.name);
    drawer([d.properties.name], True);
    geo_map
      .selectAll("path")
      .filter(function (c) {
        if (d.properties == null) {
          if (d.country == c.properties.name) return c;
        } else {
          if (d.id == c.id) return c;
        }
      })
      .style("fill", "green");
  } else {
    selectedCountries.splice(selectedCountries.indexOf(d.properties.name), 1);
    geo_map
      .selectAll("path")
      .filter(function (c) {
        if (d.properties == null) {
          if (d.country == c.properties.name) return c;
        } else {
          if (d.id == c.id) return c;
        }
      })
      .style("fill", "black");
    console.log("This item already exists");
    drawer([d.properties.name], False);
  }

  console.log(selectedCountries);
}

function addZoom() {
  d3.select("#geoMap")
    .selectAll("svg")
    .call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed));
}

function zoomed({ transform }) {
  d3.select("#geoMap")
    .selectAll("svg")
    .selectAll("path")
    .attr("transform", transform);
}
