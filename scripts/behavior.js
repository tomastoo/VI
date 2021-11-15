var table_1_incidents_src = "data/table1-Incidentes.csv";
var table_1_offenses_src = "data/table1-Offenses.csv";
var table_1_victims_src = "data/table1-Victims.csv";
var table_1_offenders_src = "data/table1-Known Offender.csv";

var table_1_incidents;
var table_1_offenses;
var table_1_victims;
var table_1_offenders;

var map = "data/countries-110m.json";

/*COLORS*/
var ballColor = "#dc3545";
var selectedBallColor = "black";
var lineColor = "red";

var tooltip;
var topology;
var currentFilter;
var lastClickedYear = 2019;
var selectedYears = [
  2005,
  2006,
  2007,
  2008,
  2009,
  2010,
  2011,
  2013,
  2014,
  2015,
  2016,
  2017,
  2018,
  2019,
];

var getBallsX;

Promise.all([d3.json(map), d3.csv(table_1_offenses_src)]).then(function ([
  map,
  table_1_offenses_,
]) {
  prepareInfoButtons();

  table_1_offenses = table_1_offenses_;

  topology = map;
  tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  createLineChart(table_1_offenses, false);
  changeViewNewData("offenses");

  createBarChart(table_1_offenses, false, selectedYears, "CATEGORY");
  currentFilter = "offenses";
});

function prepareInfoButtons() {
  ////console.log("isto esta a ser chamado");
  var a = d3.selectAll(".infoBox");
  ////console.log(a);
  d3.selectAll(".infoBox")
    .style("display", "none")
    .on("mouseover", function () {
      d3.select(this).style("display", null);
    })
    .on("mouseleave", function () {
      d3.select(this).style("display", "none");
    });

  d3.selectAll(".idiom img")
    .on("mouseover", function () {
      d3.select(this.parentNode).select(".infoBox").style("display", null);
    })
    .on("mouseleave", function () {
      d3.select(this.parentNode).select(".infoBox").style("display", "none");
    });
}
/***************************BUTTONS HANDLING AREA (VICTIMS, OFFENDERS, OFFENSES, INCIDENTS) **************************************/
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
        createBarChart(table_1_victims, true, selectedYears, "CATEGORY");

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
        createBarChart(table_1_offenders, true, selectedYears, "CATEGORY");
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
        createBarChart(table_1_offenses, true, selectedYears, "CATEGORY");

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
        createBarChart(table_1_incidents, true, selectedYears, "CATEGORY");

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
/**************************************************************************************/

/*************    CREATE LINE CHART   *************/

/*This function converts a line from table with format |2005,..2019, singleBias|
to |singleBias, years|*/
function trableReformatYearsSingleBias(data) {
  //////////console.log(data);
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
  //////////console.log(out);
  return out;
}

function createLineChart(table_11, update) {
  const width = 1430;
  const height = 130;
  margin = { top: 10, right: 15, bottom: 20, left: 35 };

  data = trableReformatYearsSingleBias(table_11[1]);
  var max = d3.max(data, (d) => d.total);
  line = d3
    .line()
    .defined(function (d) {
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

  getBallsX = x;

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
    g.attr("transform", `translate(${margin.left + 13}, 0)`).call(
      d3
        .axisLeft(y)
        .tickFormat((i) => Math.round(i * max))
        .ticks(5)
    );
  }

  if (!update) {
    var line = d3
      .select("div#lineChart")
      .select("svg")
      //.attr("viewbox", "0 0 " + width + " " + height)
      .append("g")
      .attr("class", "line")
      .attr("fill", "steelblue")
      .attr("clip-path", "url(#clip)");
  }

  const svg = d3
    .select("div#lineChart")
    .select("svg")
    .attr("width", width)
    .attr("height", height);

  if (!update) {
    svg.append("g").attr("class", "lineXAxis");
    svg.append("g").attr("class", "lineYAxis");
    var clip = svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    // Add brushing
    var brush = d3
      .brushX() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [width, height],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", handleLineChartSelection); // Each time the brush selection changes, trigger the 'updateChart' function

    // Add the brushing
    line.append("g").attr("class", "brush").call(brush);
    line.append("path");
  }

  svg.select("g.lineXAxis").call(xAxis);
  svg
    .select("g.lineXAxis")
    .append("text")
    .attr("y", height - 90)
    .attr("x", width - 700)
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .attr("font-size", "12")
    .text("Year");

  svg.select("g.lineYAxis").call(yAxis);

  svg
    .select("g.lineYAxis")
    .append("text")
    .attr("transform", "rotate(-90)")
    //.attr("y", 10)
    //.attr("x", 10)
    //.attr("dy", "-5.1em")
    .attr("y", width - 1465)
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .attr("font-size", "12")
    .text("Number of crimes");

  d3.select(".lineXAxis").selectAll(".tick").on("click", handleLineChartClick);
  d3.select(".lineXAxis").attr("font-size", 13);

  svg
    .select("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", lineColor)
    .attr("stroke-width", 1.5)
    .attr("d", line);

  svg
    .select("g.line")
    .selectAll("circle")
    .data(data, function (d) {
      return d.year;
    })
    .join(
      (enter) => {
        return (
          enter
            .append("circle")
            .attr("stroke", ballColor)
            .attr("fill", ballColor)
            // .attr("stroke-width", 1.5)
            .attr("cx", (d) => x(d.year))
            .attr("cy", (d) => y(d.total / max))
            .attr("r", 5)
            .on("click", handleLineChartClick)
            //.on("mouseover", handleMouseHoverLineChart)
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

function handleLineChartSelection(event, d) {
  selection = event.selection;
  if (selection === null) return;

  years = [];
  circles = d3
    .select("div#lineChart")
    .select("svg")
    .select("g.line")
    .selectAll("circle")
    .filter(function (c) {
      var cx = getBallsX(c.year);

      if (cx >= selection[0] && cx <= selection[1]) {
        years.push(c.year);
      }
    });

  if (typeof years === null) {
    return;
  }
  if (years.length < 1) return;

  handleLineChartClick(null, years);
}

function handleLineChartClick(event, d) {
  //  Primeiro vou filtrar todas as selections

  // vou chamar o desenho do linechart tal e o eixo dos x porque quero
  //     meter a bold e noutra cor o texto
  lineChart = d3.select("div#lineChart").select("svg");
  lineChartXaxis = d3.select(".lineXAxis");

  // Visto que a data pode vir do eixo dos anos como pode vir da bolinha
  // depende onde clicamos entao temos de uniformizar a coisa.
  if (typeof [] === typeof d) {
    if (d.year != null) {
      if (selectedYears.indexOf(d.year) == -1) selectedYears.push(d.year);
      //////////console.log("circle click");
    } else {
      ////////console.log(selectedYears);
      ////////console.log("selectedYears.length = " + selectedYears.length);
      for (let i = 0; i < selectedYears.length; i++) {
        ////////console.log(i);
        //////console.log(selectedYears[i]);
        clearLineChartSelections(selectedYears[i]);
        //after a splice if you continue the iteration i-- is necessary other wise
        // mayem will happen on deselecting years DO NOT DELETE THIS
        i--;
      }
      selectedYears = d;
      ////////console.log("array selection");
    }
  } else {
    ////////console.log("text click");
    d = parseInt(d);
    if (selectedYears.indexOf(d) == -1) selectedYears.push(d);
  }

  selectedYears.forEach(function (clickedYear) {
    lineChart
      .selectAll("circle")
      .filter(function (c) {
        //////////console.log(c);
        if (clickedYear == c.year || clickedYear == c) {
          return c;
        }
      })
      .style("fill", selectedBallColor);

    lineChartXaxis
      .selectAll("text")
      .filter(function (c) {
        //console.log("c ", c);
        if (c != undefined) {
          if (clickedYear == c.year || clickedYear == c) {
            return c;
          }
        }
      })
      .attr("class", "text-danger")
      .style("font-weight", "bold");
  });
  var clickedYear = 2019;
  //////////console.log(table_1_offenses);
  switch (currentFilter) {
    case "offenses":
      Promise.all([d3.csv(table_1_offenses_src)]).then(function ([
        table_1_offenses,
      ]) {
        createBarChart(table_1_offenses, true, selectedYears, "CATEGORY");
      });
      break;
    case "victims":
      Promise.all([d3.csv(table_1_victims_src)]).then(function ([
        table_1_victims,
      ]) {
        createBarChart(table_1_victims, true, selectedYears, "CATEGORY");
      });
      break;
    case "offenders":
      Promise.all([d3.csv(table_1_offenders_src)]).then(function ([
        table_1_offenders,
      ]) {
        createBarChart(table_1_offenders, true, selectedYears, "CATEGORY");
      });
      break;
    case "incidents":
      Promise.all([d3.csv(table_1_incidents_src)]).then(function ([
        table_1_incidents,
      ]) {
        createBarChart(table_1_incidents, true, selectedYears, "CATEGORY");
      });
      break;
    default:
      break;
  }

  lastClickedYear = clickedYear;
}

function clearLineChartSelections(year) {
  selectedYears.splice(selectedYears.indexOf(year), 1);
  // isto esta aqui porque a linha acima nao apaga para arrays com um so elemento
  lineChart
    .selectAll("circle")
    .filter(function (c) {
      if (year == c.year || year == c) {
        return c;
      }
    })
    .style("fill", ballColor)
    .attr("r", 5);

  lineChartXaxis
    .selectAll("text")
    .filter(function (c) {
      //////console.log("c", c);
      ////console.log("year", year);

      if (c != undefined) {
        if (year == c.year || year == c) {
          return c;
        }
      }
    })
    .attr("class", "text-dark")
    .style("font-weight", "");
}

/***********************************************************************************/

function parseDataTable(data, years) {
  var out = [];
  var out_value = 0;
  var bias_type;
  var domain_type;
  for (const [key, value] of Object.entries(data)) {
    out_value = 0;
    for (const [kkey, vvalue] of Object.entries(value)) {
      for (let i = 0; i < years.length; i++) {
        if (kkey == years[i]) {
          out_value += parseInt(vvalue);
        } else if (kkey == "YEAROW") {
          domain_type = vvalue;
        } else if (kkey == "Bias motivation") {
          bias_type = vvalue;
        }
      }
    }
    out.push({ line: bias_type, value: out_value, domain: domain_type });
  }
  return out;
}

function barTranslateFunction(ticks, x) {
  if (ticks == 8 || ticks == 7) {
    return x.bandwidth() / ticks + 20;
  } else if (ticks == 2) {
    return x.bandwidth() / ticks - 5;
  } else {
    return x.bandwidth() / ticks + 25;
  }
}

function createBarChart(data, update, years, category) {
  height = 200;
  width = 600;

  margin = { top: 8, right: 30, bottom: 20, left: 35 };

  var dict_lines = parseDataTable(data, years);

  filtered_data = dict_lines.filter(function (d) {
    if (d.domain == category && d.value > 0) {
      return d;
    }
  });

  filtered_data.sort(function (b, a) {
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
    .domain(
      filtered_data.map(function (d) {
        return d.line.replace(":", "");
      })
    );

  y = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);
  //.padding(0.5);

  function xAxis(g) {
    g.attr("transform", `translate(25, ${height - margin.bottom})`).call(
      d3.axisBottom(x).ticks(6)
    );
  }

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left + 25}, 0)`).call(
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
      .select("svg")
      .append("g")
      .attr("class", "bars")
      .attr("fill", "steelblue");
  }

  const svg = d3
    .select("div#barChart")
    .select("svg")
    .attr("width", width)
    .attr("height", 220);

  var max = getMax(filtered_data);
  var min = 0;
  var range = max - min;

  // Small corrections on the position of the bars
  var ticks = filtered_data.length;

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
          .attr("width", () => {
            return 60;
          })
          .attr(
            "height",
            (d) => height - margin.bottom - y((d.value - min) / range)
          )
          .style("fill", function (d, i) {
            return color(i);
          })
          .style("opacity", 0.8)
          .attr(
            "transform",
            "translate(" + barTranslateFunction(ticks, x) + ",0)"
          )
          .on("mouseover", handleMouseHover)
          .on("mouseleave", handleMouseLeave)
          .on("click", function (event, d) {
            handleBarClick(d, data);
          });
      },
      (update) => {
        update
          .attr("x", function (d) {
            return x(d.line.replace(":", ""));
          })
          .attr("y", (d) => y((d.value - min) / range))
          .attr("width", () => {
            return 60;
          })
          .attr(
            "height",
            (d) => height - margin.bottom - y((d.value - min) / range)
          )
          .style("background-color", function (d, i) {
            return color(i);
          })
          .style("opacity", 0.8)
          .attr(
            "transform",
            "translate(" + barTranslateFunction(ticks, x) + ",0)"
          )
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
    .append("text")
    .attr("y", height - 165)
    .attr("x", width - 250)
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .attr("font-size", "12")
    .text("Bias motivation");

  svg
    .select("g.yAxis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 15)
    .attr("dy", "-5.1em")
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .attr("font-size", "12")
    .text("Number of crimes");

  d3.select(".xAxis")
    .selectAll(".tick")
    .on("click", function (event, d) {
      handleBarClick(d, data);
    });
  d3.select(".xAxis").attr("font-size", 11);
}

function handleBarClick(d, dataset) {
  var bias_type;
  tooltip.transition().duration(400).style("opacity", 0);

  if (d.line == undefined) {
    bias_type = d + ":";
  } else {
    bias_type = d.line;
  }

  switch (bias_type) {
    case "Race:":
      // Show barchart related to race crimes
      createBarChart(dataset, true, selectedYears, "RACE");
      showBackButton();
      break;
    case "Religion:":
      // Show barchart related to religion crimes
      createBarChart(dataset, true, selectedYears, "RELIGION");
      showBackButton();
      break;
    case "Sexual Orientation:":
      createBarChart(dataset, true, selectedYears, "SEXUAL");
      showBackButton();
      break;
    case "Disability:":
      createBarChart(dataset, true, selectedYears, "DISABILITY");
      showBackButton();
      break;
    case "Gender:":
      createBarChart(dataset, true, selectedYears, "GENDER");
      showBackButton();
    case "Gender Identity:":
      createBarChart(dataset, true, selectedYears, "GENDERI");
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
        createBarChart(table_1_offenses, true, selectedYears, "CATEGORY");
      });
      break;
    case "victims":
      Promise.all([d3.csv(table_1_victims_src)]).then(function ([
        table_1_victims,
      ]) {
        createBarChart(table_1_victims, true, selectedYears, "CATEGORY");
      });
      break;
    case "offenders":
      Promise.all([d3.csv(table_1_offenders_src)]).then(function ([
        table_1_offenders,
      ]) {
        createBarChart(table_1_offenders, true, selectedYears, "CATEGORY");
      });
      break;
    case "incidents":
      Promise.all([d3.csv(table_1_incidents_src)]).then(function ([
        table_1_incidents,
      ]) {
        createBarChart(table_1_incidents, true, selectedYears, "CATEGORY");
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
    .html("Bias-Motiv: " + d.line.replace(":", "") + "\nTotal: " + d.value)
    .style("left", event.pageX + "px")
    .style("top", event.pageY + "px");

  barchart = d3.select("div#barChart").select("svg");

  barchart.selectAll("rect").style("opacity", 0.2);

  barchart
    .selectAll("rect")
    .filter(function (b) {
      if (d.line == b.line) {
        return b;
      }
    })
    .style("opacity", 1);
}

function handleMouseLeave(event, d) {
  tooltip.transition().duration(400).style("opacity", 0);
  d3.select("div#barChart")
    .select("svg")
    .selectAll("rect")
    .style("opacity", 0.8);
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
