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
  handleLineChartClick(null, "2019");
  createBarChart(table_1_offenses, false, 2019);
});

/*************    CREATE LINE CHART   *************/

/*This function converts a line from table with format |2005,..2019, singleBias|
to |singleBias, years|*/
function trableReformatYearsSingleBias(data) {
  //console.log(data);
  out = [];
  for (const [key, value] of Object.entries(data)) {
    if (key != "Bias motivation") {
      out.push({ year: key, total: value });
    }
  }
  //console.log(out);
  return out;
}

function changeViewNewData(button) {
  switch (button) {
    case "victims":
      Promise.all([d3.csv(table_1_victims_src)]).then(function ([
        table_1_victims,
      ]) {
        createLineChart(table_1_victims, true);
      });
      break;
    case "offenders":
      Promise.all([d3.csv(table_1_offenders_src)]).then(function ([
        table_1_offenders,
      ]) {
        createLineChart(table_1_offenders, true);
      });
      break;

    case "offenses":
      Promise.all([d3.csv(table_1_offenses_src)]).then(function ([
        table_1_offenses,
      ]) {
        createLineChart(table_1_offenses, true);
      });
      break;
    case "incidents":
      Promise.all([d3.csv(table_1_incidents_src)]).then(function ([
        table_1_incidents,
      ]) {
        createLineChart(table_1_incidents, true);
      });
      break;
  }
}

function createLineChart(table_11, update) {
  const width = 1450;
  const height = 150;
  margin = { top: 10, right: 15, bottom: 20, left: 35 };

  // console.log(table_11[1]);
  data = trableReformatYearsSingleBias(table_11[1]);

  line = d3
    .line()
    .defined(function (d) {
      //   console.log(d);
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

/*function tableGetX(data) {
    //console.log(data);
    var out;
    for (const [key, value] of Object.entries(data)) {
        if (key == "Bias motivation" && value == 'Race:') {
            out = value;
        }
        if (key == "Bias motivation" && value == 'Religion:') {
            out = value;
        }
        if (key == "Bias motivation" && value == 'Sexual Orientation:') {
            out = value;
        }
        if (key == "Bias motivation" && value == 'Ethnicity/National Origin:') {
            out = value;
        }
        if (key == "Bias motivation" && value == 'Disability:') {
            out = value;
        }
      if (key != "Bias motivation") {
        out.push({ year: key, total: value });
      }
    }
    //console.log(out);
    return out.replace(":", "");
}*/

function tableGetInfo(data, year) {
  //console.log(data);
  var out = [];
  var out_value;
  var bias_type;
  for (const [key, value] of Object.entries(data)) {
    //console.log(value);
    //for (const [kkey, vvalue] of Object.entries(value)) {
    //  console.log(kkey);
    //    console.log(vvalue);
    //}~
    out_value = -1;
    for (const [kkey, vvalue] of Object.entries(value)) {
      if (kkey == year) {
        out_value = vvalue;
      }
      bias_type = vvalue;
    }
    out.push({ line: bias_type, value: out_value });
    //break;
  }
  console.log(out);
  return out;
}

function createBarChart(data, update, year) {
  width = 600;
  height = 350;

  margin = { top: 20, right: 20, bottom: 20, left: 40 };

  //console.log(data);
  /* x_values = []
    x_values.push(tableGetX(data[2]));
    x_values.push(tableGetX(data[8]));
    x_values.push(tableGetX(data[16]));
    x_values.push(tableGetX(data[22]));
    x_values.push(tableGetX(data[25]));*/
  //console.log(x_values);

  x = d3
    .scaleBand()
    .domain([
      "Race",
      "Religion",
      "Sexual Orientation",
      "Ethnicity/National Origin",
      "Disability",
    ])
    .range([margin.left, width - margin.right]);

  y = d3
    .scaleLinear()
    .domain([0, 10000])
    .range([height - margin.bottom, margin.top]);
  //.padding(0.5);

  function xAxis(g) {
    g.attr("transform", `translate(0, ${height - margin.bottom})`).call(
      d3.axisBottom(x)
    );
  }

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left}, 0)`).call(
      d3
        .axisLeft(y)
        //.tickFormat((i) => {
        //  if (data[i].oscar_year % 3 == 0) return data[i].oscar_year;
        //})
        .tickSizeOuter(0)
    );
  }

  if (!update) {
    d3.select("div#barChart")
      .append("svg")
      .append("g")
      .attr("class", "bars")
      .attr("fill", "steelblue");
  }

  const svg = d3
    .select("div#barChart")
    .select("svg")
    .attr("width", width)
    .attr("height", height);

  var dict_lines = tableGetInfo(data, year);
  //console.log(dict_lines);

  new_data = dict_lines.filter(function (d) {
    if (
      d.line == "Race:" ||
      d.line == "Religion:" ||
      d.line == "Sexual Orientation:" ||
      d.line == "Ethnicity/National Origin:" ||
      d.line == "Disability:"
    ) {
      return d;
    }
  });
  // bars
  svg
    .select("g.bars")
    .selectAll("rect")
    .data(new_data, function (d) {
      return d.value;
    })
    .join(
      (enter) => {
        return enter
          .append("rect")
          .attr("x", function (d) {
            console.log(d);
            return x(d.line.replace(":", ""));
          })
          .attr("y", (d) => y(d.value))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - margin.bottom - y(d.value));
        //.on("mouseover", handleMouseHover)
        //.on("mouseleave", handleMouseLeave)
        //.on("click", handleClick);
      },
      (update) => {
        update
          .attr("x", (d) => x(d.line))
          .attr("y", (d) => y(d.value))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d.value));
        /*.attr("x", x(0))
            .attr("y", (d, i) => y(i))
            .attr("width", (d) => x(d.rating) - x(0))
            .attr("height", x.bandwidth());*/
      },
      (exit) => {
        exit.remove();
      }
    );

  if (!update) {
    svg.append("g").attr("class", "xAxis");
    svg.append("g").attr("class", "yAxis");
  }

  svg.select("g.xAxis").call(xAxis);

  svg.select("g.yAxis").call(yAxis);
}
