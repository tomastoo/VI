var table_1_incidents_src = "data/table1-Incidentes.csv";
var table_1_offenses_src = "data/table1-Offenses.csv";
var table_1_victims_src = "data/table1-Victims.csv";
var table_1_offenders_src = "data/table1-Known Offender.csv";

var table_11_incidents_src = "data/table11-Incidents.csv";
var table_11_offenses_src = "data/table11-Offenses.csv";
var map = "data/countries-110m.json";

var topology;

Promise.all([d3.json(map), d3.csv(table_1_offenses_src)]).then(function ([
  map,
  table_1_offenses,
]) {
  topology = map;
  console.log(table_1_offenses);
  console.log(map);
  //trableReformatYearsSingleBias(table_11_offenses[1]);
  createLineChart(table_1_offenses, false);
  changeViewNewData("offenses");
  handleLineChartClick(null, "2019");
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

function changeViewNewData(button) {
  switch (button) {
    case "victims":
      Promise.all([d3.csv(table_1_victims_src)]).then(function ([
        table_1_victims,
      ]) {
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_victims, true);
      });
      break;
    case "offenders":
      Promise.all([d3.csv(table_1_offenders_src)]).then(function ([
        table_1_offenders,
      ]) {
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_offenders, true);
      });
      break;

    case "offenses":
      Promise.all([d3.csv(table_1_offenses_src)]).then(function ([
        table_1_offenses,
      ]) {
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_offenses, true);
      });
      break;
    case "incidents":
      Promise.all([d3.csv(table_1_incidents_src)]).then(function ([
        table_1_incidents,
      ]) {
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_incidents, true);
      });
      break;
  }
}

function selectButton(button) {
  var select = "button#" + button;
  var buttonEl = d3.select(select).attr("class", "btn btn-danger btn-sm");
}

function unselectAllButtons() {
  var buttonEl = d3
    .select("div#mainButtons")
    .selectAll("button")
    .attr("class", "btn btn-secondary btn-sm");
}

function createLineChart(table_11, update) {
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
        d3.axisLeft(y).tickFormat((i) => i)
        //.ticks(4)
      )
      .call((g) => g.select(".domain").remove());
  }

  if (!update) {
    d3.select("div#lineChart")
      .append("svg")
      .append("g")
      .attr("class", "line")
      .attr("fill", "steelblue")
      .append("path");
  }

  const svg = d3
    .select("div#lineChart")
    .select("svg")
    .attr("width", width)
    .attr("height", height);

  if (!update) {
    svg.append("g").attr("class", "lineXAxis");
    svg.append("g").attr("class", "lineYAxis");
  }

  svg.select("g.lineXAxis").call(xAxis);
  svg.select("g.lineYAxis").call(yAxis);
  d3.select(".lineXAxis").selectAll(".tick").on("click", handleLineChartClick);
  d3.select(".lineXAxis").selectAll("text").style("font-size", 14);

  // datum picks all the data
  // if we wanted more than one line (more than one dataset) then we would need
  // to use the data() method
  svg
    .select("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    // to lines above are not needed for this case said the dude on the video
    // .attr("stroke-linejoin", "round")
    // .attr("stroke-linecap", "round")
    .attr("d", line);

  svg
    .select("g.line")
    .selectAll("circle")
    .data(data, function (d) {
      console.log(d);
      return d.year;
    })
    .join(
      (enter) => {
        return (
          enter
            .append("circle")
            .attr("stroke", "black")
            .attr("fill", "black")
            // .attr("stroke-width", 1.5)
            .attr("cx", (d) => x(d.year))
            .attr("cy", (d) => y(d.total))
            .attr("r", 5)
            .on("click", handleLineChartClick)
        );
        //.on("mouseover", handleMouseHover)
        //.on("moseleave", handleMouseLeave)
      },
      (update) => {
        update
          .attr("cx", (d) => x(d.year))
          .attr("cy", (d) => y(d.total))
          .attr("r", 5);
      },
      (exit) => {
        exit.remove();
      }
    );
}

var selectedYears = [];

function handleLineChartClick(event, d) {
  console.log(selectedYears.length);
  console.log(typeof selectedYears.length);

  // Primeiro vou filtrar todas as selections
  if (selectedYears.length != 0) {
    selectedYears.forEach(function (year, index) {
      clearLineChartSelections(year);
    });
  }

  // vou chamar o desenho do linechart tal e o eixo dos x porque quero
  //     meter a bold e noutra cor o texto
  lineChart = d3.select("div#lineChart").select("svg");
  lineChartXaxis = d3.select(".lineXAxis");

  // Visto que a data pode vir do eixo dos anos como pode vir da bolinha
  // depende onde clicamos entao temos de uniformizar a coisa.
  var clickedYear;
  if (d.year != null) {
    clickedYear = d.year;
  } else {
    clickedYear = d;
  }

  //console.log(clickedYear);
  // se o ano clicado ja tiver selecionado vou apagar so
  if (selectedYears.indexOf(clickedYear) === -1) {
    selectedYears.push(clickedYear);
    lineChart
      .selectAll("circle")
      .filter(function (c) {
        console.log(c);
        if (clickedYear == c.year || clickedYear == c) {
          return c;
        }
      })
      .style("fill", "orange")
      .attr("r", 8);

    lineChartXaxis
      .selectAll("text")
      .filter(function (c) {
        console.log(c);
        if (clickedYear == c.year || clickedYear == c) {
          return c;
        }
      })
      .attr("class", "text-danger")
      .style("font-weight", "bold");
  } else {
    clearLineChartSelections(clickedYear);
  }
}

function clearLineChartSelections(year) {
  selectedYears.splice(selectedYears.indexOf(year), 1);
  lineChart
    .selectAll("circle")
    .filter(function (c) {
      if (year == c.year || year == c) {
        return c;
      }
    })
    .style("fill", "black")
    .attr("r", 5);

  lineChartXaxis
    .selectAll("text")
    .filter(function (c) {
      if (year == c.year || year == c) {
        return c;
      }
    })
    .attr("class", "text-dark")
    .style("font-weight", "");
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
