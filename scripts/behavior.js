var table_11_incidents_src = "data/table11-Incidents.csv";
var table_11_offenses_src = "data/table11-Offenses.csv";
var map = "data/countries-110m.json";

var topology;

Promise.all([d3.json(map), d3.csv(table_11_offenses_src)]).then(function ([
  map,
  table_11_offenses,
]) {
  topology = map;
  console.log(table_11_offenses);
  console.log(map);
  //trableReformatYearsSingleBias(table_11_offenses[1]);
  createLineChart(table_11_offenses);
});

/*************    CREATE LINE CHART   *************/

/*This function converts a line from table with format |2005,..2019, singleBias|
to |singleBias, years|*/
function trableReformatYearsSingleBias(data) {
  console.log(data);
  out = [];
  for (const [key, value] of Object.entries(data)) {
    if (key != "Bias motivation") {
      out.push({ year: key, total: value });
    }
  }
  console.log(out);
  return out;
}

function createLineChart(table_11) {
  const width = 1450;
  const height = 150;
  margin = { top: 10, right: 15, bottom: 20, left: 35 };

  console.log(table_11[1]);
  data = trableReformatYearsSingleBias(table_11[1]);

  line = d3
    .line()
    .defined(function (d) {
      console.log(d);
      return d.year;
    })
    .x((d) => x(d.year))
    .y((d) => y(d.total));

  // the domain line with the extent will make the min value the lowest year to the max
  x = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return d.year;
      })
    )
    .range([margin.left, width - margin.right]);

  // 0 to max
  y = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.total), d3.max(data, (d) => d.total)])
    .range([height - margin.bottom, margin.top]);

  function xAxis(g) {
    g.attr("transform", `translate(0, ${height - margin.bottom})`).call(
      d3.axisBottom(x).tickFormat((x) => x)
      //.ticks(5)
    );
    //.call((g) => g.select(".domain").remove());
  }

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left}, 0)`)
      .call(
        d3
          .axisLeft(y)
          .tickFormat((i) => i)
          .ticks(4)
      )
      .call((g) => g.select(".domain").remove());
  }

  const svg = d3
    .select("div#lineChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);

  // datum picks all the data
  // if we wanted more than one line (more than one dataset) then we would need
  // to use the data() method
  svg
    //  .append("g#line")
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    // to lines above are not needed for this case said the dude on the video
    // .attr("stroke-linejoin", "round")
    // .attr("stroke-linecap", "round")
    .attr("d", line);

  data = data.filter(function (dataItem) {
    if (dataItem.total >= 0) return dataItem;
  });
  const extent = d3.extent(data, (d) => d.total);
  const extentMaxYear = d3.maxIndex(data, (d) => d.total);
  const extentMinYear = d3.minIndex(data, (d) => d.total);

  console.log(data[extentMaxYear].year);
  console.log(data[extentMinYear].year);
  console.log(extent);

  svg
    .append("circle")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("cx", x(data[extentMaxYear].year))
    .attr("cy", y(extent[1]))
    .attr("r", 3);

  svg
    .append("circle")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("cx", x(data[extentMinYear].year))
    .attr("cy", y(extent[0]))
    .attr("r", 3);
}

/***********************************************************************************/
function createBarChart(data) {
  const width = 600;
  const height = 1100;

  margin = { top: 30, right: 30, bottom: 10, left: 30 };

  x = d3
    .scaleLinear()
    .domain([0, 10])
    .range([margin.left, width - margin.right]);

  y = d3
    .scaleBand()
    .domain(d3.range(data.length))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  var color = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.budget)])
    .range(["lightblue", "steelblue"]);

  //function that creates the x axis
  // no video o caralhinho nao explicou oque raio faz a ultima linha mas pronto jesus ha de me ajudar
  function xAxis(g) {
    g.attr("transform", `translate(0, ${margin.top})`)
      .call(d3.axisTop(x).ticks(10))
      .call((g) => g.select(".domain").remove());
  }

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left}, 0)`).call(
      d3
        .axisLeft(y)
        .tickFormat((i) => data[i].year)
        .tickSizeOuter(0)
    );
  }

  const svg = d3
    .select("div#barChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // NEXT GIANT LINE OF CODE CREATES THE BARS
  // g element is a grouping element
  // .selectAll will be empty
  // the function will gather the names of the data set and bound them to
  // the id of each bar element class.
  // everything that comes after the join is applied to each bar.
  //
  svg
    .append("g")
    .attr("class", "bars")
    //.style("fill", "steelblue")
    .selectAll("rect")
    .data(data, function (d) {
      return d.name;
    })
    .join("rect")
    .attr("x", x(0))
    .attr("y", function (d, i) {
      //this log is only to show that every
      //data element will go through this function
      console.log(d);
      return y(i);
    })
    .attr("width", (d) => x(d.rating) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", function (d) {
      return color(d.budget);
    })
    .append("svg:title")
    .text(function (d) {
      return d.title;
    });

  // NEXT GIANT LINE OF CODE CREATES THE TEXT INSIDE THE BAR
  // svg
  //   .append("g")
  //   .attr("class", "values")
  //   .style("fill", "white")
  //   .attr("text-anchor", "end")
  //   .attr("font-size", 10)
  //   .selectAll("text")
  //   .data(data, function (d) {
  //     return d.name;
  //   })
  //   .join("rect")
  //   .attr("x", (d) => x(d.rating))
  //   .attr("y", function (d, i) {
  //     //this log is only to show that every
  //     //data element will go through this function
  //     console.log(d);
  //     return y(i) + y.bandwidth() / 2;
  //   })
  //   .attr("dy", 4)
  //   .attr("dx", -4)
  //   .text((d) => d.title);

  svg.append("g").attr("class", "xAxis").call(xAxis);
  svg.append("g").attr("class", "yAxis").call(yAxis);
}

function updateBarChart(data) {
  const width = 600;
  const height = 900;

  margin = { top: 30, right: 30, bottom: 10, left: 30 };

  x = d3
    .scaleLinear()
    .domain([0, 10])
    .range([margin.left, width - margin.right]);

  y = d3
    .scaleBand()
    .domain(d3.range(data.length))
    .range([margin.top, height - margin.bottom])
    .padding(0.3);

  //function that creates the x axis
  // no video o caralhinho nao explicou oque raio faz a ultima linha mas pronto jesus ha de me ajudar
  function xAxis(g) {
    g.attr("transform", `translate(0, ${margin.top})`)
      .call(d3.axisTop(x).ticks(10))
      .call((g) => g.select(".domain").remove());
  }

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left}, 0)`).call(
      d3
        .axisLeft(y)
        .tickFormat((i) => data[i].year)
        .tickSizeOuter(0)
    );
  }

  const svg = d3
    .select("body")
    .select("svg")
    .attr("width", width)
    .attr("height", height);

  // NEXT GIANT LINE OF CODE CREATES THE BARS
  // g element is a grouping element
  // .selectAll will be empty
  // the function will gather the names of the data set and bound them to
  // the id of each bar element class.
  // everything that comes after the join is applied to each bar.
  //
  svg
    .select("g.bars")
    .selectAll("rect")
    .data(data, function (d) {
      return d.name;
    })
    .join(
      (enter) => {
        return enter
          .append("rect")
          .attr("x", x(0))
          .attr("y", function (d, i) {
            //this log is only to show that every
            //data element will go through this function
            //console.log(d);
            return y(i);
          })
          .attr("width", (d) => x(d.rating) - x(0))
          .attr("height", y.bandwidth());
      },
      (update) => {
        update
          .attr("x", x(0))
          .attr("y", function (d, i) {
            //this log is only to show that every
            //data element will go through this function
            console.log(d);
            return y(i);
          })
          .attr("width", (d) => x(d.rating) - x(0))
          .attr("height", y.bandwidth());
      },
      (exit) => {
        exit.remove();
      }
    );

  svg
    .select("g.values")
    .selectAll("text")
    .data(data, function (d) {
      return d.name;
    })
    .join(
      (enter) => {
        return enter
          .append("text")
          .attr("x", (d) => x(d.rating))
          .attr("y", function (d, i) {
            //this log is only to show that every
            //data element will go through this function
            //console.log(d);
            return y(i) + y.bandwidth() / 2;
          })
          .attr("dy", 4)
          .attr("dx", -4)
          .text((d) => d.title);
      },
      (update) => {
        update
          .attr("x", (d) => x(d.rating))
          .attr("y", function (d, i) {
            //this log is only to show that every
            //data element will go through this function
            //console.log(d);
            return y(i) + y.bandwidth() / 2;
          })
          .attr("dy", 4)
          .attr("dx", -4)
          .text((d) => d.title);
      },
      (exit) => {
        exit.remove();
      }
    );

  svg
    .append("g")
    .attr("class", "values")
    .style("fill", "white")
    .attr("text-anchor", "end")
    .attr("font-size", 15)
    .selectAll("text")
    .data(data, function (d) {
      return d.name;
    })
    .join("rect")
    .attr("x", (d) => x(d.rating))
    .attr("y", function (d, i) {
      //this log is only to show that every
      //data element will go through this function
      console.log(d);
      return y(i) + y.bandwidth() / 2;
    })
    .attr("dy", 4)
    .attr("dx", -4)
    .text((d) => d.rating);

  svg.select("g.xAxis").call(xAxis);
  svg.select("g.yAxis").call(yAxis);
}
