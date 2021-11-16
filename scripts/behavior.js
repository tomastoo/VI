var table_1_incidents_src = "data/table1-Incidentes.csv";
var table_1_offenses_src = "data/table1-Offenses.csv";
var table_1_victims_src = "data/table1-Victims.csv";
var table_1_offenders_src = "data/table1-Known Offender.csv";

var table_2_incidents_src = "data/table-2-incidents.csv";
var table_2_offenses_src = "data/table-2-offenses.csv";
var table_2_victims_src = "data/table-2-victims.csv";
var table_2_offenders_src = "data/table-2-offenders.csv";

var table_4_srcs = [
  "data/table-4/table4-2005.csv",
  "data/table-4/table4-2006.csv",
  "data/table-4/table4-2007.csv",
  "data/table-4/table4-2008.csv",
  "data/table-4/table4-2009.csv",
  "data/table-4/table4-2010.csv",
  "data/table-4/table4-2011.csv",
  "data/table-4/table4-2013.csv",
  "data/table-4/table4-2014.csv",
  "data/table-4/table4-2015.csv",
  "data/table-4/table4-2016.csv",
  "data/table-4/table4-2017.csv",
  "data/table-4/table4-2018.csv",
  "data/table-4/table4-2019.csv",
];

var table_1_incidents;
var table_1_offenses;
var table_1_victims;
var table_1_offenders;

var table_2_incidents;
var table_2_offenses;
var table_2_victims;
var table_2_offenders;

var map = "data/countries-110m.json";

/*COLORS*/
var ballColor = "#dc3545";
var selectedBallColor = "black";
var lineColor = "red";

var biasColors = {
  Race: "#e31e1e",
  "Anti-White": "red",
  "Anti-Black": "red",
  "Anti-Native": "red",
  "Anti-Asian": "red",
  "Anti-Multiple": "red",
  "Anti-Arab": "red",
  "Anti-Hispanic": "red",
  "Anti-Other": "red",
  Religion: "#a30000",
  "Anti-Jewish": "red",
  "Anti-Catholic": "red",
  "Anti-Protestant": "red",
  "Anti-Islamic": "red",
  "Anti-Others": "red",
  "Anti-Multiple": "red",
  "Anti-Atheism": "red",
  "Sexual Orientation": "#d42a2a",
  "Anti-Male Homosexual": "red",
  "Anti-Female Homosexual": "red",
  "Anti-Homosexual": "red",
  "Anti-Heterosexual": "red",
  "Anti-Bisexual": "red",
  Disability: "#6b0d0d",
  "Anti-Physical": "red",
  "Anti-Mental": "red",
  Gender: "#000000",
  "Anti-Male": "red",
  "Anti-Female": "red",
  "Gender Identity": "#a00d0d",
  "Anti-Transgender": "red",
  "Anti-Gender Non-Conforming": "red",
};

var tooltip;
var topology;
var currentLollipopCategory;
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

Promise.all([
  d3.json(map),
  d3.csv(table_1_offenses_src),
  d3.csv(table_2_offenses_src),
]).then(function ([map, table_1_offenses_, table_2_offenses_]) {
  prepareInfoButtons();

  table_1_offenses = table_1_offenses_;
  table_2_offenses = table_2_offenses_;
  topology = map;
  tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  createLineChart(table_1_offenses, false);
  changeViewNewData("offenses");
  createBarChart(table_1_offenses, false, selectedYears, "CATEGORY");
  createLollipop(table_2_offenses, false, selectedYears, "category");
  currentFilter = "offenses";
  currentLollipopCategory = "category";
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
      Promise.all([
        d3.csv(table_1_victims_src),
        d3.csv(table_2_victims_src),
      ]).then(function ([table_1_victims_, table_2_victims_]) {
        table_1_victims = table_1_victims_;
        table_2_victims = table_2_victims_;
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_victims, true);
        createBarChart(table_1_victims, true, selectedYears, "CATEGORY");
        createLollipop(table_2_victims, true, selectedYears, "category");
        currentFilter = "victims";
      });
      break;
    case "offenders":
      Promise.all([
        d3.csv(table_1_offenders_src),
        d3.csv(table_2_offenders_src),
      ]).then(function ([table_1_offenders_, table_2_offenders_]) {
        table_1_offenders = table_1_offenders_;
        table_2_offenders = table_2_offenders_;
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_offenders, true);
        createBarChart(table_1_offenders, true, selectedYears, "CATEGORY");
        createLollipop(table_2_offenders, true, selectedYears, "category");
        currentFilter = "offenders";
      });
      break;

    case "offenses":
      Promise.all([
        d3.csv(table_1_offenses_src),
        d3.csv(table_2_offenses_src),
      ]).then(function ([table_1_offenses_, table_2_offenses_]) {
        table_1_offenses = table_1_offenses_;
        table_2_offenses = table_2_offenses_;
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_offenses, true);
        createBarChart(table_1_offenses, true, selectedYears, "CATEGORY");
        createLollipop(table_2_offenses, true, selectedYears, "category");

        currentFilter = "offenses";
      });
      break;
    case "incidents":
      Promise.all([
        d3.csv(table_1_incidents_src),
        d3.csv(table_2_incidents_src),
      ]).then(function ([table_1_incidents_, table_2_incidents_]) {
        table_1_incidents = table_1_incidents_;
        table_2_incidents = table_2_incidents_;
        unselectAllButtons();
        selectButton(button);
        createLineChart(table_1_incidents, true);
        createBarChart(table_1_incidents, true, selectedYears, "CATEGORY");
        createLollipop(table_2_incidents, true, selectedYears, "category");

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

/************************    CREATE LOLLIPOP   **************************************/

function createLollipop(data, update, years, category) {
  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 90, left: 40 },
    width = 600 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  filtered_data = filterDataLolipop(data, category, years);
  // Parse the Data
  // console.log(filtered_data);
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(
      filtered_data.map(function (d) {
        return d.Crimes;
      })
    )
    .padding(1);
  var max = d3.max(out, (d) => d.Value);
  // console.log(max);
  const y = d3
    .scaleLinear()
    .domain([0, roundup(max)])
    .range([height, 0]);

  var svg = d3
    .select("#lollipop")
    .select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  if (!update) {
    svg = svg
      .append("g")
      .attr("id", "main")
      .attr("transform", `translate(${margin.left + 30},${margin.top + 20})`);

    svg.append("g").attr("id", "x");
    svg.append("g").attr("id", "y");
  }
  // append the svg object to the body of the page
  svg = svg.select("g#main");
  svg
    .select("g#x")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(+35,0)")
    .style("text-anchor", "end");

  // Add Y axis
  svg.select("g#y").call(d3.axisLeft(y).ticks(5));

  // console.log(svg.selectAll("line").data(filtered_data));
  // Lines
  svg
    .selectAll("line#lolliLines")
    .data(filtered_data)
    .join(
      (enter) => {
        return enter
          .append("line")
          .attr("id", "lolliLines")
          .attr("x1", function (d) {
            return x(d.Crimes);
          })
          .attr("x2", function (d) {
            return x(d.Crimes);
          })
          .attr("y1", function (d) {
            return y(d.Value);
          })
          .attr("y2", y(0))
          .attr("stroke", "grey")
          .on("click", function (event, d) {
            handleLollipopClick(d, data);
          });
      },
      (update) => {
        update
          .attr("x1", function (d) {
            console.log(d);
            return x(d.Crimes);
          })
          .attr("x2", function (d) {
            return x(d.Crimes);
          })
          .attr("y1", function (d) {
            return y(d.Value);
          })
          .attr("y2", y(0))
          .attr("stroke", "grey");
      },
      (exit) => {
        exit.remove();
      }
    );

  // Circles
  svg
    .selectAll("circle")
    .data(filtered_data)
    .join(
      (enter) => {
        return (
          enter
            .append("circle")
            .attr("cx", function (d) {
              return x(d.Crimes);
            })
            .attr("cy", function (d) {
              return y(d.Value);
            })
            .attr("id", (d) => d.Crimes)
            // .attr("r", "4")
            // .style("fill", "#69b3a2")
            // .attr("stroke", "black")
            .on("click", function (event, d) {
              handleLollipopClick(d, data);
            })
        );
      },
      (update) => {
        update
          .attr("cx", function (d) {
            return x(d.Crimes);
          })
          .attr("cy", function (d) {
            return y(d.Value);
          })
          .attr("id", (d) => d.Crimes);
        // .attr("r", "4")
        // .style("fill", "#69b3a2")
        // .attr("stroke", "black");
      },
      (exit) => {
        exit.remove();
      }
    );

  changeCirclesLollipop(selectedYears, filtered_data);
}

function changeCirclesLollipop(selectedYears, filtered_data, bias) {
  // console.log(selectedYears);
  // console.log(filtered_data);
  // console.log(bias);
  var svg = d3.select("div#lollipop").select("svg").select("g#main");
  console.log(filtered_data);
  var promiseData = getCrossedDataTable4(selectedYears, filtered_data, bias);
  //  console.log(promiseData);

  promiseData.then((data) => {
    //    console.log(data);
    console.log(filtered_data);

    svg
      .selectAll("circle")
      .data(filtered_data)
      .attr("r", function (d) {
        for (var i = 0; i < data.length; i++) {
          if (d.Crimes == data[i].category) {
            var radius = d3.scaleLinear().domain([0, 1]).range([3, 15]);
            //        console.log(d.Crimes);
            return radius(data[i].Value / d.Value);
          }
        }
      })
      .style("fill", function (d) {
        for (var i = 0; i < data.length; i++) {
          if (d.Crimes == data[i].category) {
            // console.log(d.Crimes);
            return biasColors[data[i].bias];
          }
        }
      })
      .attr("stroke", "black");
  });
}

// null = Race cuz it is the biggest for all
function getCrossedDataTable4(selectedYears, filtered_data, bias) {
  // console.log(selectedYears);
  // console.log(table_4_srcs[0]);
  // console.log(filtered_data);
  years = [];
  var tokenPromise;
  for (var j = 0; j < selectedYears.length; j++) {
    for (var i = 0; i < table_4_srcs.length; i++) {
      if (table_4_srcs[i].includes(String(selectedYears[j]))) {
        tokenPromise = Promise.all([
          d3.csv(table_4_srcs[i]),
          selectedYears[j],
          years,
        ]).then(function ([table_4, selectedYear, years]) {
          var year = [];
          for (var k = 0; k < filtered_data.length; k++) {
            // console.log(filtered_data[k].Crimes);
            var biasAndValue = getBiasAndValue(
              table_4,
              filtered_data[k].Crimes,
              bias,
              selectedYear
            );
            // console.log(biasAndValue);
            if (biasAndValue != null) {
              year.push(biasAndValue);
            }
          }
          // console.log(year);
          if (year.lenght == 0) {
            return;
          }
          years.push(year);
          if (years.length == selectedYears.length) {
            //console.log(years);
            var out = years.shift();
            //console.log(out);
            for (var i = 0; i < years.length; i++) {
              for (var j = 0; j < years[i].length; j++) {
                //console.log(years[i][j]);
                //console.log(out[j]);
                out[j].Value += years[i][j].Value;
                out[j].year = selectedYears;
              }
            }
            // console.log(out);
            return out;
          }
        });
        // console.log(tokenPromise);
      }
    }
  }
  return tokenPromise;
}

//supostamente para o estado inicial devia ter somado as tabelas dos anos Primeiro
// mas como é sempre race caguei e andei nao tenho tempo
function getBiasAndValue(table, category, bias, year) {
  // console.log(table);
  // console.log(category);
  // console.log(bias);
  // console.log(year);
  if (bias != null) {
    table = table.filter(function (d) {
      if (d["Bias motivation"] == bias) {
        return d;
      }
    });
  }
  // console.log(table);
  var max = d3.max(table, function (d) {
    // if (d[category] != bias)
    return parseInt(d[category]);
  });
  //console.log(max);
  var element = table.filter(function (d) {
    if (parseInt(d[category]) == max) return d;
  });
  if (element.length < 1) {
    return;
  }
  // console.log(element);
  var out = {};
  out["Value"] = max;
  out["category"] = category;
  out["bias"] = element[0]["Bias motivation"];
  out["year"] = year;
  // console.log(out);
  return out;
}
function filterDataForLollipopMouseHover(category) {
  //console.log(years);
  switch (currentFilter) {
    case "victims":
      return filterDataLolipop(table_2_victims, category, selectedYears);
      break;
    case "offenders":
      return filterDataLolipop(table_2_offenders, category, selectedYears);
      break;
    case "offenses":
      return filterDataLolipop(table_2_offenses, category, selectedYears);
      break;
    case "incidents":
      return filterDataLolipop(table_2_incidents, category, selectedYears);
      break;
    default:
      break;
  }
}

function handleMouseHoverText(event, d) {
  // console.log(d);
  // console.log(selectedYears);
  filtered_data = filterDataForLollipopMouseHover(currentLollipopCategory);
  // console.log(filtered_data);

  changeCirclesLollipop(selectedYears, filtered_data, d);
}
function handleMouseLeaveText(event, d) {
  changeCirclesLollipop(selectedYears, filtered_data);
}
function handleLollipopClick(d, dataset) {
  // console.log(d);
  var bias_type = d.Crimes;

  switch (bias_type) {
    case "Against persons":
      // Show barchart related to race crimes
      // console.log("1");
      currentLollipopCategory = "against persons";
      createLollipop(dataset, true, selectedYears, "against persons");
      showBackButton2();
      break;
    case "Against property":
      // console.log("2");
      currentLollipopCategory = "against property";
      createLollipop(dataset, true, selectedYears, "against property");
      showBackButton2();
      break;
    default:
      break;
  }
}

function showBackButton2() {
  let element = document.getElementById("magicButton2");
  element.removeAttribute("hidden");
}
function hideBackButton2() {
  let element = document.getElementById("magicButton2");
  element.setAttribute("hidden", "hidden");
}

function moveBackLollipop() {
  switch (currentFilter) {
    case "offenses":
      Promise.all([d3.csv(table_2_offenses_src)]).then(function ([
        table_2_offenses,
      ]) {
        hideBackButton2();
        currentLollipopCategory = "category";
        createLollipop(table_2_offenses, true, selectedYears, "category");
      });
      break;
    case "victims":
      Promise.all([d3.csv(table_2_victims_src)]).then(function ([
        table_2_victims,
      ]) {
        hideBackButton2();
        currentLollipopCategory = "category";
        createLollipop(table_2_victims, true, selectedYears, "category");
      });
      break;
    case "offenders":
      Promise.all([d3.csv(table_2_offenders_src)]).then(function ([
        table_2_offenders,
      ]) {
        hideBackButton2();
        currentLollipopCategory = "category";
        createLollipop(table_2_offenders, true, selectedYears, "category");
      });
      break;
    case "incidents":
      Promise.all([d3.csv(table_2_incidents_src)]).then(function ([
        table_2_incidents,
      ]) {
        hideBackButton2();
        currentLollipopCategory = "category";
        createLollipop(table_2_incidents, true, selectedYears, "category");
      });
      break;
    default:
      break;
  }
}

function roundup(v) {
  var number = String(v);
  // console.log(
  //   number + " first n = " + number[0] + " length = " + number.length
  // );
  var out = "";
  for (var i = 0; i < number.length; i++) {
    if (i == 0) {
      if (parseInt(number[1]) > 4) {
        out = out + String(parseInt(number[0]) + 1);
      } else {
        out = out + number[0];
        out = out + "5";
        i++;
      }
    } else {
      out = out + "0";
    }
  }
  // console.log(out);
  return parseInt(out);
}

function filterDataLolipop(data, category, years) {
  // console.log(data);
  out = [];
  var data2 = data.filter(function (d) {
    if (d.Category == category) {
      return d;
    }
  });
  console.log(data);
  data2.forEach(function (d) {
    var element = { Crimes: d.Crimes, Value: 0 };
    console.log(years);
    for (var i = 0; i < years.length; i++) {
      element.Value += parseInt(d[years[i]]);
    }
    out.push(element);
  });
  out.sort(function (b, a) {
    return a.Value - b.Value;
  });

  console.log(out);
  return out;
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
      Promise.all([
        d3.csv(table_1_offenses_src),
        d3.csv(table_2_offenses_src),
      ]).then(function ([table_1_offenses, table_2_offenses]) {
        createBarChart(table_1_offenses, true, selectedYears, "CATEGORY");
        createLollipop(table_2_offenses, true, selectedYears, "category");
      });
      break;
    case "victims":
      Promise.all([
        d3.csv(table_1_victims_src),
        d3.csv(table_2_victims_src),
      ]).then(function ([table_1_victims, table_2_victims]) {
        createBarChart(table_1_victims, true, selectedYears, "CATEGORY");
        createLollipop(table_2_victims, true, selectedYears, "category");
      });
      break;
    case "offenders":
      Promise.all([
        d3.csv(table_1_offenders_src),
        d3.csv(table_2_offenders_src),
      ]).then(function ([table_1_offenders, table_2_offenders]) {
        createBarChart(table_1_offenders, true, selectedYears, "CATEGORY");
        createLollipop(table_2_offenders, true, selectedYears, "category");
      });
      break;
    case "incidents":
      Promise.all([
        d3.csv(table_1_incidents_src),
        d3.csv(table_2_incidents_src),
      ]).then(function ([table_1_incidents, table_2_incidents]) {
        createBarChart(table_1_incidents, true, selectedYears, "CATEGORY");
        createLollipop(table_2_incidents, true, selectedYears, "category");
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

  // var color = d3.scaleOrdinal().range(biasColors);

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
            // console.log(d);
            return biasColors[d.line.replace(":", "")];
            // return color(i);
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
            return biasColors[d.line.replace(":", "")];
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
    })
    .on("mouseover", handleMouseHoverText)
    .on("mouseleave", handleMouseLeaveText);

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
      break;
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
  // console.log(filtered_data);
  // console.log(selectedYears);
  filtered_data = filterDataForLollipopMouseHover(currentLollipopCategory);
  console.log(filtered_data);

  changeCirclesLollipop(selectedYears, filtered_data, d.line.replace(":", ""));
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
  changeCirclesLollipop(selectedYears, filtered_data);
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
