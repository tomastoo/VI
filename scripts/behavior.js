var table_1_incidents_src = "data/table1-Incidentes.csv";
var table_1_offenses_src = "data/table1-Offenses.csv";
var table_1_victims_src = "data/table1-Victims.csv";
var table_1_offenders_src = "data/table1-Known Offender.csv";

var table_1_incidents;
var table_1_offenses;
var table_1_victims;
var table_1_offenders;

var map = "data/countries-110m.json";

var tooltip;
var topology;
var currentFilter;
var lastClickedYear = 2019;

Promise.all([d3.json(map), d3.csv(table_1_offenses_src)]).then(function ([
  map,
  table_1_offenses_,
]) {
  //console.log(typeof table_1_offenses_);
  table_1_offenses = table_1_offenses_;
  // table_1_offenses = Object.assign({}, table_1_offenses_);

  topology = map;
  //console.log(table_1_offenses);
  //console.log(map);
  //trableReformatYearsSingleBias(table_11_offenses[1]);
  tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  createLineChart(table_1_offenses, false);
  changeViewNewData("offenses");

  createBarChart(table_1_offenses, false, lastClickedYear, "CATEGORY");
  currentFilter = "offenses";
  handleLineChartClick(null, "2019");
});

/*************    CREATE LINE CHART   *************/

/*This function converts a line from table with format |2005,..2019, singleBias|
to |singleBias, years|*/
function trableReformatYearsSingleBias(data) {
  //console.log(data);
  out = [];
  for (const [key, value] of Object.entries(data)) {
    if (key != "Bias motivation" && key != "YEAROW") {
      out.push({ year: key, total: value });
    }
  }
  // var max = d3.max(out, (d) => d.total);
  //
  // for (var i = 0; i < out.length; i++) {
  //   out[i]["norm"] = out[i].total / max;
  // }
  //console.log(out);
  return out;
}

function changeViewNewData(button) {
  switch (button) {
    case "victims":
      Promise.all([d3.csv(table_1_victims_src)]).then(function ([
        table_1_victims_,
      ]) {
        table_1_victims = table_1_victims_;
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_victims, true);
        createBarChart(table_1_victims, true, lastClickedYear, "CATEGORY");

        currentFilter = "victims";
      });
      break;
    case "offenders":
      Promise.all([d3.csv(table_1_offenders_src)]).then(function ([
        table_1_offenders_,
      ]) {
        table_1_offenders = table_1_offenders_;
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_offenders, true);
        createBarChart(table_1_offenders, true, lastClickedYear, "CATEGORY");
        currentFilter = "offenders";
      });
      break;

    case "offenses":
      Promise.all([d3.csv(table_1_offenses_src)]).then(function ([
        table_1_offenses_,
      ]) {
        table_1_offenses = table_1_offenses_;
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_offenses, true);
        createBarChart(table_1_offenses, true, lastClickedYear, "CATEGORY");

        currentFilter = "offenses";
      });
      break;
    case "incidents":
      Promise.all([d3.csv(table_1_incidents_src)]).then(function ([
        table_1_incidents_,
      ]) {
        table_1_incidents = table_1_incidents_;
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_incidents, true);
        createBarChart(table_1_incidents, true, lastClickedYear, "CATEGORY");

        currentFilter = "incidents";
      });
      break;
    default:
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

  // console.log(table_11[1]);
  data = trableReformatYearsSingleBias(table_11[1]);
  var max = d3.max(data, (d) => d.total);
  line = d3
    .line()
    .defined(function (d) {
      //   console.log(d);
      return d.year;
    })
    .x((d) => x(d.year))
    .y((d) => y(d.total / max));

  // the domain line with the extent will make the min value the lowest year to the max
  x = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return d.year;
      })
    )
    .range([50, width - margin.right]);
  // 0 to max
  // y = d3
  //   .scaleLinear()
  //   .domain([d3.min(data, (d) => d.total), d3.max(data, (d) => d.total)])
  //   .range([height - margin.bottom, margin.top]);

  y = d3
    .scaleLinear()
    .domain([0, 1])
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
          .tickFormat((i) => Math.round(i * max))
          .ticks(5)
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
  d3.select(".lineXAxis").attr("font-size", 13);

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
      //console.log(d);
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
            .attr("cy", (d) => y(d.total / max))
            .attr("r", 5)
            .on("click", handleLineChartClick)
            .on("mouseover", handleMouseHoverLineChart)
            .on("mouseleave", handleMouseLeave)
        );
      },
      (update) => {
        update
          .attr("cx", (d) => x(d.year))
          .attr("cy", (d) => y(d.total / max))
          .attr("r", 5);
      },
      (exit) => {
        exit.remove();
      }
    );
}

var selectedYears = [];

function handleLineChartClick(event, d) {
  //console.log(selectedYears.length);
  //console.log(typeof selectedYears.length);

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
        //console.log(c);
        if (clickedYear == c.year || clickedYear == c) {
          return c;
        }
      })
      .style("fill", "orange");

    lineChartXaxis
      .selectAll("text")
      .filter(function (c) {
        //console.log(c);
        if (clickedYear == c.year || clickedYear == c) {
          return c;
        }
      })
      .attr("class", "text-danger")
      .style("font-weight", "bold");
  } else {
    clearLineChartSelections(clickedYear);
  }

  //console.log(table_1_offenses);
  switch (currentFilter) {
    case "offenses":
      Promise.all([d3.csv(table_1_offenses_src)]).then(function ([
        table_1_offenses,
      ]) {
        createBarChart(table_1_offenses, true, clickedYear, "CATEGORY");
      });
      break;
    case "victims":
      Promise.all([d3.csv(table_1_victims_src)]).then(function ([
        table_1_victims,
      ]) {
        createBarChart(table_1_victims, true, clickedYear, "CATEGORY");
      });
      break;
    case "offenders":
      Promise.all([d3.csv(table_1_offenders_src)]).then(function ([
        table_1_offenders,
      ]) {
        createBarChart(table_1_offenders, true, clickedYear, "CATEGORY");
      });
      break;
    case "incidents":
      Promise.all([d3.csv(table_1_incidents_src)]).then(function ([
        table_1_incidents,
      ]) {
        createBarChart(table_1_incidents, true, clickedYear, "CATEGORY");
      });
      break;
    default:
      break;
  }

  lastClickedYear = clickedYear;
  let element = document.getElementById("magicButton");
  element.setAttribute("hidden", "hidden");
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

function parseDataTable(data, year) {
  //console.log(data);
  var out = [];
  var out_value;
  var bias_type;
  var domain_type;
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
      if (kkey == "YEAROW") {
        domain_type = vvalue;
      }
      if (kkey == "Bias motivation") {
        bias_type = vvalue;
      }
    }
    out.push({ line: bias_type, value: out_value, domain: domain_type});
    //break;
  }
  //console.log(out);
  return out;
}

function createBarChart(data, update, year, category) {
  height = 200;
  width = 600;

  margin = { top: 20, right: 30, bottom: 20, left: 35 };

  var dict_lines = parseDataTable(data, year);
  filtered_data = dict_lines.filter(function(d) {
    if (d.domain == category && d.value!=-1) {
      return d;
    }
  });
  filtered_data.sort(function(b, a) {
    return a.value - b.value;
  });

  var color = d3
    .scaleOrdinal()
    .range([
      "#6b486b",
      "#a05d56",
      "#d0743c",
      "#ff8c00",
      "steelblue",
      "#2132b9",
    ]);

  x = d3
    .scaleBand()
    .range([margin.left, width - margin.right])
    .domain(filtered_data.map(function(d) { 
      return d.line.replace(":", "");
    }));
  
  y = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);
  //.padding(0.5);

  function xAxis(g) {
    g.attr("transform", `translate(0, ${height - margin.bottom})`).call(
      d3.axisBottom(x).ticks(6)
    );
  }

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left}, 0)`).call(
      d3
        .axisLeft(y)
        .tickFormat((i) => {
          return Math.round(i * max);
        })
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




  var max = getMax(filtered_data);
  var min = 0;

  var range = max - min;
  //console.log("range: " + range);
  //console.log("height: " + (height - margin.bottom - y((d.value-min + 1) / range)))
  //200 - 20 - y((53-53)/63)
  // console.log(new_data);
  // new_data = new_data.sort((a, b) => d3.descending(a.value, b.value));
  // console.log(new_data);

  svg
    .select("g.bars")
    .selectAll("rect")
    .data(filtered_data, function (d) {
      return d.value;
    })
    .join(
      (enter) => {
        return enter
          .append("rect")
          .attr("x", function (d, i) {
            return x(d.line.replace(":", ""));
          })
          .attr("y", (d) => y((d.value - min) / range))
          .attr("width", x.bandwidth()-5)
          .attr(
            "height",
            (d) => height - margin.bottom - y((d.value - min) / range)
          )
          .style("fill", function (d, i) {
            return color(i);
          })
          .style("opacity", 0.8)
          .on("mouseover", handleMouseHover)
          .on("mouseleave", handleMouseLeave)
          .on("click", function (d, i) {
            handleBarClick(i, data);
          });
      },
      (update) => {
        update
          .attr("x", function (d) {
            //console.log(d);
            return x(d.line.replace(":", ""));
          })
          .attr("y", (d) => y((d.value - min) / range))
          .attr("width", x.bandwidth() - 20)
          .attr(
            "height",
            (d) => height - margin.bottom - y((d.value - min) / range)
          )
          .style("background-color", function (d, i) {
            return color(i);
          })
          .style("opacity", 0.8)
          .on("mouseover", handleMouseHover)
          .on("mouseleave", handleMouseLeave);
      },
      (exit) => {
        exit.remove();
      }
    );

  if (!update) {
    svg.append("g").attr("class", "xAxis");
    svg.append("g").attr("class", "yAxis");
  }

  svg
    .select("g.xAxis")
    .call(xAxis)
    .selectAll(".tick")
    .attr("y", 6)
    .attr("x", 6)
    .style("text-anchor", "middle");

  svg.select("g.yAxis").call(yAxis);
  //  svg.select("g.yAxis").attr("font-size", 13);

  //console.log(svg.select("g.XAxis").selectAll(".tick"));
  svg
    .select("g.xAxis")
    .selectAll(".tick")
    .on("click", function (event, i) {
      //console.log("tou vivo oh maninho " + i);
      handleBarClick(i, data);
    });
  //svg.select("g.xAxis").attr("font-size", 13);
}

function handleBarClick(d, dataset) {
  //console.log(d);
  //console.log(dataset);

  tooltip.transition().duration(400).style("opacity", 0);

  var bias_type;
  if (d.line == null) {
    bias_type = d + ":";
  } else {
    bias_type = d.line;
  }
  //console.log(bias_type);
  switch (bias_type) {
    case "Race:":
      // Show barchart related to race crimes
      createBarChart(dataset, true, lastClickedYear, "RACE");
      showBackButton();
      break;
    case "Religion:":
      // Show barchart related to religion crimes
      createBarChart(dataset, true, lastClickedYear, "RELIGION");
      showBackButton();
      break;
    case "Sexual Orientation:":
      createBarChart(dataset, true, lastClickedYear, "SEXUAL");
      showBackButton();
      break;
    case "Disability:":
      createBarChart(dataset, true, lastClickedYear, "DISABILITY");
      showBackButton();
      break;
    case "Gender:":
      createBarChart(dataset, true, lastClickedYear, "GENDER");
      showBackButton();
    case "Gender Identity:":
      createBarChart(dataset, true, lastClickedYear, "GENDERI");
      showBackButton();
      break;
    default:
      break;
  }
}

function showBackButton() {
  let element = document.getElementById("magicButton");
  element.removeAttribute("hidden");
}

function moveBackChart() {
  switch (currentFilter) {
    case "offenses":
      Promise.all([d3.csv(table_1_offenses_src)]).then(function ([
        table_1_offenses,
      ]) {
        createBarChart(table_1_offenses, true, lastClickedYear, "CATEGORY");
      });
      break;
    case "victims":
      Promise.all([d3.csv(table_1_victims_src)]).then(function ([
        table_1_victims,
      ]) {
        createBarChart(table_1_victims, true, lastClickedYear, "CATEGORY");
      });
      break;
    case "offenders":
      Promise.all([d3.csv(table_1_offenders_src)]).then(function ([
        table_1_offenders,
      ]) {
        createBarChart(table_1_offenders, true, lastClickedYear, "CATEGORY");
      });
      break;
    case "incidents":
      Promise.all([d3.csv(table_1_incidents_src)]).then(function ([
        table_1_incidents,
      ]) {
        createBarChart(table_1_incidents, true, lastClickedYear, "CATEGORY");
      });
      break;
    default:
      break;
  }

  let element = document.getElementById("magicButton");
  element.setAttribute("hidden", "hidden");
}

function handleMouseHoverLineChart(event, d) {
  tooltip.transition().duration(400).style("opacity", 1);

  tooltip
    .html("Total: " + d.total)
    .style("left", event.pageX + "px")
    .style("top", event.pageY + "px");
}

function handleMouseHover(event, d) {
  tooltip.transition().duration(400).style("opacity", 1);

  tooltip
    .html("Bias-Motiv: " + d.line.replace(":", "") +"\nTotal: " + d.value)
    .style("left", event.pageX + "px")
    .style("top", event.pageY + "px");

  barchart = d3.select("div#barChart").select("svg");

  barchart.selectAll("rect").style("opacity", 0.2);

  barchart.selectAll("rect")
          .filter(function (b) {
              if (d.line == b.line) {
                return b;
              }
          })
          .style("opacity", 1);
}

function handleMouseLeave(event, d) {
  tooltip.transition().duration(400).style("opacity", 0);
  d3.select("div#barChart").select("svg").selectAll("rect").style("opacity", 0.8);
}

function getMax(data) {
  max = 0;
  for (const [key, value] of Object.entries(data)) {
    if (parseInt(value.value) > max) {
      max = parseInt(value.value);
    }
  }
  return max;
}

function getMin(data) {
  min = 100000;
  for (const [key, value] of Object.entries(data)) {
    if (parseInt(value.value) < min) {
      min = parseInt(value.value);
    }
  }
  return min;
}
