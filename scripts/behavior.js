var table_1_incidents_src = "data/table1-Incidentes.csv";
var table_1_offenses_src = "data/table1-Offenses.csv";
var table_1_victims_src = "data/table1-Victims.csv";
var table_1_offenders_src = "data/table1-Known Offender.csv";
var table_12_combination_scr = "data/table12-combination.csv";
var table_11_combination_scr = "data/table11-combination.csv";

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
var table_12_combination;
var table_11_combination;
var lastMap;

var table_2_incidents;
var table_2_offenses;
var table_2_victims;
var table_2_offenders;
var map = "data/states-albers-10m.json";

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
var selectedStates = [];
var tooltip;
var tooltip2;
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
var lineMax = 10;

Promise.all([
  d3v7.json(map),
  d3v7.csv(table_1_offenses_src),
  d3v7.csv(table_2_offenses_src),
  d3v7.csv(table_11_combination_scr),
]).then(function ([
  map,
  table_1_offenses_,
  table_2_offenses_,
  table_11_combination_,
]) {
  prepareInfoButtons();

  table_1_offenses = table_1_offenses_;
  table_2_offenses = table_2_offenses_;
  table_11_combination = table_11_combination_;
  topology = map;
  tooltip = d3v7
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  //for tooltip

  tooltip2 = d3v7
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  currentFilter = "offenses";
  createLineChart(table_1_offenses, false);
  changeViewNewData("offenses");
  createBarChart(table_1_offenses, false, selectedYears, "CATEGORY");
  createLollipop(table_2_offenses, false, selectedYears, "category");
  currentFilter = "offenses";
  currentLollipopCategory = "category";
  lastMap = "offenses";
  createUSMap(table_11_combination, false, selectedYears);
  addZoom();
});

function prepareInfoButtons() {
  //////////console.log("isto esta a ser chamado");
  var a = d3v7.selectAll(".infoBox");
  //////////console.log(a);
  d3v7
    .selectAll(".infoBox")
    .style("display", "none")
    .on("mouseover", function () {
      d3v7.select(this).style("display", null);
    })
    .on("mouseleave", function () {
      d3v7.select(this).style("display", "none");
    });

  d3v7
    .selectAll(".idiom img")
    .on("mouseover", function () {
      d3v7.select(this.parentNode).select(".infoBox").style("display", null);
    })
    .on("mouseleave", function () {
      d3v7.select(this.parentNode).select(".infoBox").style("display", "none");
    });
}
/***************************BUTTONS HANDLING AREA (VICTIMS, OFFENDERS, OFFENSES, INCIDENTS) **************************************/
function changeViewNewData(button) {
  switch (button) {
    case "victims":
      Promise.all([
        d3v7.csv(table_1_victims_src),
        d3v7.csv(table_2_victims_src),
      ]).then(function ([table_1_victims_, table_2_victims_]) {
        table_1_victims = table_1_victims_;
        table_2_victims = table_2_victims_;
        unselectAllButtons();
        selectButton(button);
        currentFilter = "victims";
        createLineChart(table_1_victims, true);
        createBarChart(table_1_victims, true, selectedYears, "CATEGORY");
        createLollipop(table_2_victims, true, selectedYears, "category");
        currentFilter = "victims";
      });
      break;
    case "offenders":
      Promise.all([
        d3v7.csv(table_1_offenders_src),
        d3v7.csv(table_2_offenders_src),
      ]).then(function ([table_1_offenders_, table_2_offenders_]) {
        table_1_offenders = table_1_offenders_;
        table_2_offenders = table_2_offenders_;
        unselectAllButtons();
        selectButton(button);
        currentFilter = "offenders";
        createLineChart(table_1_offenders, true);
        createBarChart(table_1_offenders, true, selectedYears, "CATEGORY");
        createLollipop(table_2_offenders, true, selectedYears, "category");
        currentFilter = "offenders";
      });
      break;

    case "offenses":
      Promise.all([
        d3v7.csv(table_1_offenses_src),
        d3v7.csv(table_2_offenses_src),
        d3v7.csv(table_11_combination_scr),
      ]).then(function ([
        table_1_offenses_,
        table_2_offenses_,
        table_11_combination_,
      ]) {
        table_1_offenses = table_1_offenses_;
        table_2_offenses = table_2_offenses_;
        table_11_combination = table_11_combination_;
        unselectAllButtons();
        selectButton(button);
        currentFilter = "offenses";
        createLineChart(table_1_offenses, true);
        createBarChart(table_1_offenses, true, selectedYears, "CATEGORY");
        createLollipop(table_2_offenses, true, selectedYears, "category");
        createUSMap(table_11_combination, true, selectedYears);
        lastMap = "offenses";

        currentFilter = "offenses";
      });
      break;
    case "incidents":
      Promise.all([
        d3v7.csv(table_1_incidents_src),
        d3v7.csv(table_2_incidents_src),
        d3v7.csv(table_12_combination_scr),
      ]).then(function ([
        table_1_incidents_,
        table_2_incidents_,
        table_12_combination_,
      ]) {
        table_1_incidents = table_1_incidents_;
        table_2_incidents = table_2_incidents_;
        table_12_combination = table_12_combination_;
        unselectAllButtons();
        selectButton(button);
        currentFilter = "incidents";
        createLineChart(table_1_incidents, true);
        createBarChart(table_1_incidents, true, selectedYears, "CATEGORY");
        createLollipop(table_2_incidents, true, selectedYears, "category");

        currentFilter = "incidents";
        createUSMap(table_12_combination, true, selectedYears);
        lastMap = "incidents";
      });
      break;
    default:
      break;
  }
}

function selectButton(button) {
  var select = "button#" + button;
  var buttonEl = d3v7.select(select).attr("class", "btn btn-danger btn-sm");
}

function unselectAllButtons() {
  var buttonEl = d3v7
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
  const x = d3v7
    .scaleBand()
    .range([0, width])
    .domain(
      filtered_data.map(function (d) {
        return d.Crimes;
      })
    )
    .padding(1);
  var max = d3v7.max(out, (d) => d.Value);
  // console.log(max);
  const y = d3v7
    .scaleLinear()
    .domain([0, roundup(max)])
    .range([height, 0]);

  var svg = d3v7
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
    .call(d3v7.axisBottom(x))
    .selectAll("text#tick")
    .attr("id", "tick")
    .attr("transform", "translate(+35,0)")
    .style("text-anchor", "end");

  // Add Y axis
  svg.select("g#y").call(d3v7.axisLeft(y).ticks(5));

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

  svg
    .select("g#x")
    .append("text")
    .attr("id", "legendaX")
    .attr("y", height - 110)
    .attr("x", width - 250)
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .attr("font-size", "12")
    .text("Type of Crime");

  svg
    .select("g#y")
    .append("text")
    .attr("id", "legendaY")
    .attr("transform", "rotate(-90)")
    .attr("y", 15)
    .attr("dy", "-5.1em")
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .attr("font-size", "12")
    .text("Number of crimes");

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
  var svg = d3v7.select("div#lollipop").select("svg").select("g#main");
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
            var radius = d3v7.scaleLinear().domain([0, 1]).range([3, 15]);
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
          d3v7.csv(table_4_srcs[i]),
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
  var max = d3v7.max(table, function (d) {
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
      Promise.all([d3v7.csv(table_2_offenses_src)]).then(function ([
        table_2_offenses,
      ]) {
        hideBackButton2();
        currentLollipopCategory = "category";
        createLollipop(table_2_offenses, true, selectedYears, "category");
      });
      break;
    case "victims":
      Promise.all([d3v7.csv(table_2_victims_src)]).then(function ([
        table_2_victims,
      ]) {
        hideBackButton2();
        currentLollipopCategory = "category";
        createLollipop(table_2_victims, true, selectedYears, "category");
      });
      break;
    case "offenders":
      Promise.all([d3v7.csv(table_2_offenders_src)]).then(function ([
        table_2_offenders,
      ]) {
        hideBackButton2();
        currentLollipopCategory = "category";
        createLollipop(table_2_offenders, true, selectedYears, "category");
      });
      break;
    case "incidents":
      Promise.all([d3v7.csv(table_2_incidents_src)]).then(function ([
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
  ////////////////console.log(data);
  out = [];
  for (const [key, value] of Object.entries(data)) {
    if (key != "Bias motivation" && key != "YEAROW") {
      out.push({ year: key, total: value });
    }
  }
  // var max = d3v7.max(out, (d) => d.total);
  //
  // for (var i = 0; i < out.length; i++) {
  //   out[i]["norm"] = out[i].total / max;
  // }
  ////////////////console.log(out);
  return out;
}
function trableReformatYearsCombination(data) {
  //////////console.log(data);
  out = [];
  for (const [key, value] of Object.entries(data)) {
    if (key != "state" && key != "YEAROW") {
      out.push({ year: key, total: value });
    }
  }

  return out;
}

function createLineChart(table_11, update) {
  const width = 1430;
  const height = 130;
  margin = { top: 10, right: 15, bottom: 20, left: 35 };

  data = trableReformatYearsSingleBias(table_11[1]);
  var max = d3v7.max(data, (d) => d.total);
  line = d3v7
    .line()
    .defined(function (d) {
      return d.year;
    })
    .x((d) => x(d.year))
    .y((d) => y(d.total / max));

  // the domain line with the extent will make the min value the lowest year to the max
  x = d3v7
    .scaleLinear()
    .domain(
      d3v7.extent(data, function (d) {
        return d.year;
      })
    )
    .range([50, width - margin.right]);

  getBallsX = x;

  y = d3v7
    .scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);

  function xAxis(g) {
    g.attr("transform", `translate(0, ${height - margin.bottom})`).call(
      d3v7.axisBottom(x).tickFormat((x) => x)
      //.ticks(5)
    );
    //.call((g) => g.select(".domain").remove());
  }

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left + 13}, 0)`).call(
      d3v7
        .axisLeft(y)
        .tickFormat((i) => Math.round(i * max))
        .ticks(5)
    );
  }

  yRight = d3v7
    .scaleLinear()
    .domain([0, lineMax])
    .range([height - margin.bottom, margin.top]);

  function yAxisRight(g) {
    g.attr("transform", `translate(${width - margin.right + 8}, 0)`).call(
      d3v7
        .axisRight(yRight)
        .tickFormat((i) => i)
        .ticks(5)
    );
  }

  if (!update) {
    var line = d3v7
      .select("div#lineChart")
      .select("svg")
      //.attr("viewbox", "0 0 " + width + " " + height)
      .append("g")
      .attr("class", "line")
      .attr("fill", "steelblue")
      .attr("clip-path", "url(#clip)");
  }

  const svg = d3v7
    .select("div#lineChart")
    .select("svg")
    .attr("width", width)
    .attr("height", height);

  if (!update) {
    svg.append("g").attr("class", "lineXAxis");
    svg.append("g").attr("class", "lineYAxis");
    svg.append("g").attr("class", "lineYAxisRight");
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
    var brush = d3v7
      .brushX() // Add the brush feature using the d3v7.brush function
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
  svg.select("g.lineYAxisRight").call(yAxisRight);

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

  d3v7
    .select(".lineXAxis")
    .selectAll(".tick")
    .on("click", handleLineChartClick);
  d3v7.select(".lineXAxis").attr("font-size", 13);

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
  circles = d3v7
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
  lineChart = d3v7.select("div#lineChart").select("svg");
  lineChartXaxis = d3v7.select(".lineXAxis");

  // Visto que a data pode vir do eixo dos anos como pode vir da bolinha
  // depende onde clicamos entao temos de uniformizar a coisa.
  if (typeof [] === typeof d) {
    if (d.year != null) {
      if (selectedYears.indexOf(d.year) == -1) selectedYears.push(d.year);
      ////////////////console.log("circle click");
    } else {
      //////////////console.log(selectedYears);
      //////////////console.log("selectedYears.length = " + selectedYears.length);
      for (let i = 0; i < selectedYears.length; i++) {
        //////////////console.log(i);
        ////////////console.log(selectedYears[i]);
        clearLineChartSelections(selectedYears[i]);
        //after a splice if you continue the iteration i-- is necessary other wise
        // mayem will happen on deselecting years DO NOT DELETE THIS
        i--;
      }
      selectedYears = d;
      //////////////console.log("array selection");
    }
  } else {
    //////////////console.log("text click");
    d = parseInt(d);
    if (selectedYears.indexOf(d) == -1) selectedYears.push(d);
  }

  selectedYears.forEach(function (clickedYear) {
    lineChart
      .selectAll("circle")
      .filter(function (c) {
        ////////////////console.log(c);
        if (clickedYear == c.year || clickedYear == c) {
          return c;
        }
      })
      .style("fill", selectedBallColor);

    lineChartXaxis
      .selectAll("text")
      .filter(function (c) {
        ////////console.log("c ", c);
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
  ////////////////console.log(table_1_offenses);
  switch (currentFilter) {
    case "offenses":
      Promise.all([
        d3v7.csv(table_1_offenses_src),
        d3v7.csv(table_12_combination_scr),
        d3v7.csv(table_11_combination_scr),
        d3v7.csv(table_2_offenses_src),
      ]).then(function ([
        table_1_offenses,
        table_12_combination,
        table_11_combination,
        table_2_offenses,
      ]) {
        createBarChart(table_1_offenses, true, selectedYears, "CATEGORY");
        createLollipop(table_2_offenses, true, selectedYears, "category");
        if (lastMap == "incidents") {
          createUSMap(table_12_combination, true, selectedYears);
        } else {
          createUSMap(table_11_combination, true, selectedYears);
        }
      });
      break;
    case "victims":
      Promise.all([
        d3v7.csv(table_1_victims_src),
        d3v7.csv(table_12_combination_scr),
        d3v7.csv(table_11_combination_scr),
        d3v7.csv(table_2_victims_src),
      ]).then(function ([
        table_1_victims,
        table_12_combination,
        table_11_combination,
        table_2_victims,
      ]) {
        createBarChart(table_1_victims, true, selectedYears, "CATEGORY");
        createLollipop(table_2_victims, true, selectedYears, "category");
        if (lastMap == "incidents") {
          createUSMap(table_12_combination, true, selectedYears);
        } else {
          createUSMap(table_11_combination, true, selectedYears);
        }
      });
      break;
    case "offenders":
      Promise.all([
        d3v7.csv(table_1_offenders_src),
        d3v7.csv(table_2_offenders_src),
        d3v7.csv(table_11_combination_scr),
      ]).then(function ([
        table_1_offenders,
        table_2_offenders,
        table_11_combination,
      ]) {
        createBarChart(table_1_offenders, true, selectedYears, "CATEGORY");
        createLollipop(table_2_offenders, true, selectedYears, "category");
        createUSMap(table_11_combination, true, selectedYears);
      });
      break;
    case "incidents":
      Promise.all([
        d3v7.csv(table_1_incidents_src),
        d3v7.csv(table_12_combination_scr),
        d3v7.csv(table_2_incidents_src),
      ]).then(function ([
        table_1_incidents,
        table_12_combination,
        table_2_incidents,
      ]) {
        createBarChart(table_1_incidents, true, selectedYears, "CATEGORY");
        createLollipop(table_2_incidents, true, selectedYears, "category");
        createUSMap(table_12_combination, true, selectedYears);
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
      ////////////console.log("c", c);
      //////////console.log("year", year);

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

  // var color = d3v7.scaleOrdinal().range(biasColors);

  x = d3v7
    .scaleBand()
    .range([margin.left, width - margin.right])
    .domain(
      filtered_data.map(function (d) {
        return d.line.replace(":", "");
      })
    );

  y = d3v7
    .scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);
  //.padding(0.5);

  function xAxis(g) {
    g.attr("transform", `translate(25, ${height - margin.bottom})`).call(
      d3v7.axisBottom(x).ticks(6)
    );
  }

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left + 25}, 0)`).call(
      d3v7
        .axisLeft(y)
        .tickFormat((i) => {
          return Math.round(i * lineMax);
        })
        .tickSizeOuter(0)
    );
  }

  if (!update) {
    d3v7
      .select("div#barChart")
      .select("svg")
      .append("g")
      .attr("class", "bars")
      .attr("fill", "steelblue");
  }

  const svg = d3v7
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
            //console.log("event behaviour", event);
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

  d3v7
    .select(".xAxis")
    .selectAll(".tick")
    .on("click", function (event, d) {
      handleBarClick(d, data);
    })
    .on("mouseover", handleMouseHoverText)
    .on("mouseleave", handleMouseLeaveText);

  d3v7.select(".xAxis").attr("font-size", 11);
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
      Promise.all([d3v7.csv(table_1_offenses_src)]).then(function ([
        table_1_offenses,
      ]) {
        createBarChart(table_1_offenses, true, selectedYears, "CATEGORY");
      });
      break;
    case "victims":
      Promise.all([d3v7.csv(table_1_victims_src)]).then(function ([
        table_1_victims,
      ]) {
        createBarChart(table_1_victims, true, selectedYears, "CATEGORY");
      });
      break;
    case "offenders":
      Promise.all([d3v7.csv(table_1_offenders_src)]).then(function ([
        table_1_offenders,
      ]) {
        createBarChart(table_1_offenders, true, selectedYears, "CATEGORY");
      });
      break;
    case "incidents":
      Promise.all([d3v7.csv(table_1_incidents_src)]).then(function ([
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

  barchart = d3v7.select("div#barChart").select("svg");

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
  d3v7
    .select("div#barChart")
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

function createUSMap(data, update, years) {
  height = 200;
  width = 600;
  var offsetL = document.getElementById("usMap").offsetLeft + 10;
  var offsetT = document.getElementById("usMap").offsetTop + 10;

  var path = d3v7.geoPath();

  // var dict_lines = parseDataTable(data, [2005]);

  let svg = d3v7
    .select("div#usMap")
    .select("svg")
    //.attr("height", height)
    //.attr("width", width)
    .attr("viewBox", [0, 0, 975, 710]);

  if (!update) {
    svg
      .append("g")
      .selectAll("path")
      .data(topojson.feature(topology, topology.objects.states).features)
      .join("path")
      .attr("class", "state")
      .attr("id", function (d, i) {
        //console.log(d.properties.name)
        return d.properties.name;
      })
      .attr("fill", "gray")
      .attr("d", path)
      .style("stroke", "black")
      .style("stroke-width", 1)
      //.attr("stroke-linejoin", "round")
      //.attr("pointer-events", "none")
      .on("mousemove", function (event, d) {
        var dir_data = parseDataTableMap(data, years);
        // console.log(d.properties.name);
        item = dir_data.filter(function (dataItem) {
          if (dataItem.line == d.properties.name) return dataItem;
        });
        //console.log(item);
        //console.log(item[0].value);

        if (item != null) {
          /*
        var mouse = d3v7.pointer(event)
        .map( function(d) { return parseInt(d); } );
        tooltip.classed("hidden", false)
        .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
        .html("State: " +
        item[0].line +
        "<br>" +
        "Value: " +
        item[0].value);*/
          /* tooltip2.transition().duration(400).style("opacity", 0.9);
        tooltip2
          .html(
            "State: " +
              item[0].line +
              "<br>" +
              "Value: " +
              item[0].value

          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");*/
        }
        if (!d3v7.select(this).classed("selected"))
          d3v7.select(this).style("stroke-width", 2);
      })
      .on("click", function (event, d) {
        d3v7.select(this).classed("selected", function (c, i) {
          return !d3v7.select(this).classed("selected");
        });

        console.log(d);
        item = data.filter(function (dataItem) {
          if (dataItem.state == d.properties.name) return dataItem;
        });
        drawer_text = "";

        dat = trableReformatYearsCombination(item[0]);
        console.log(dat);
        console.log(selectedStates);
        if (selectedStates.includes(d.properties.name)) {
          removeStateLine(d.properties.name);
          selectedStates.splice(selectedStates.indexOf(d.properties.name), 1);
          console.log(selectedStates);
        } else {
          appendNewStateLine(dat, d.properties.name);
          selectedStates.push(d.properties.name);
          console.log(selectedStates);
        }

        svg.selectAll(".selected").each(function (d, i) {
          d3v7.select(this).style("stroke-width", 5);
          // selectedStates.push(d.properties.name);
        });
        selectedStates.sort();
        selectedStates.forEach(function (e) {
          drawer_text += "<li>";
          drawer_text += e;
          drawer_text += "</li>";
        });
        //d3v7.select("#drawer").html(drawer_text);
        //add line to line chart

        var dir_data = parseDataTableMap(data, years);
        updateMap(dir_data);
      })
      .on("mouseout", function (d, i) {
        tooltip2.classed("hidden", true);
      });
    /*
    .on("mouseleave", function (d) {
      if (!d3v7.select(this).classed("selected"))
        d3v7.select(this).style("stroke-width", 1);
    })*/
  }
  var dir_data = parseDataTableMap(data, years);
  var max = getMax(dir_data);
  updateMap(dir_data);

  function ramp(color, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }

  var l_domain = [0, max];

  var l_margin = -190;
  var l_spacing = 10;
  var l_height = 40;
  var l_width = 400;
  var c_b = d3v7.scaleSequential(l_domain, d3v7.interpolateBlues);
  const n_b = Math.min(c_b.domain().length, c_b.range().length);

  var c_r = d3v7.scaleSequential(l_domain, d3v7.interpolateReds);
  const n_r = Math.min(c_r.domain().length, c_r.range().length);

  if (!update) {
    var grad = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "grad1")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    grad
      .append("stop")
      .attr("offset", "0%")
      .style("stop-color", d3v7.interpolateReds(0));

    grad
      .append("stop")
      .attr("offset", "100%")
      .style("stop-color", d3v7.interpolateReds(1));

    svg
      .append("rect")
      .attr("width", l_width)
      .attr("height", l_height)
      .style("fill", "transparent")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("fill", "url('#grad1')")
      .attr(
        "transform",
        `translate(${l_margin + l_height + l_spacing},${
          height - l_margin
        })rotate(270)`
      );
  }

  var l_title = "Incidents by state";
  if (!update) {
    svg
      .append("text")
      .style("font-size", "34px")
      .text(l_title)
      .attr(
        "transform",
        `translate(${l_margin - 5},${height - l_margin - l_width - 10})`
      );
  }

  var l_y = d3v7.scaleLinear().domain(l_domain).range([l_width, 0]);

  if (!update) {
    svg
      .append("g")
      .style("font-size", "20px")
      .attr(
        "transform",
        `translate(${l_margin + l_height + l_spacing},${
          height - l_margin - l_width
        })`
      )
      .call(d3v7.axisLeft().scale(l_y));
  } else {
    svg
      .select("svg.g")
      .style("font-size", "20px")
      .attr(
        "transform",
        `translate(${l_margin + l_height + l_spacing},${
          height - l_margin - l_width
        })`
      )
      .call(d3v7.axisLeft().scale(l_y));
  }
  //updateMap(table_12_combination, selectedYears);

  /*--------------------------*/
  /*
  .append("title")
  .text(function (d) {
    return d.properties.name;
  });
  */
  //console.log(data)
  /*
  data.forEach(function (d) {

    if (d.state == "Total"){
      return;
    }
    console.log(d.state);
    console.log(d.cinco);
    d3v7.select("div#map")
      .select("svg")
      .select("path[id='" + d.state + "']")
      .style("fill", d3v7.interpolateBlues(d.cinco/8));
  });
*/
}

function removeStateLine(stateName) {
  stateName = stateName.replace(" ", "_");
  d3v7
    .select("div#lineChart")
    .select("svg")
    .select("g.line")
    .select("path#" + stateName)
    .remove();
}

function appendNewStateLine(dat, stateName) {
  stateName = stateName.replace(" ", "_");
  const width = 1430;
  const height = 130;
  margin = { top: 10, right: 15, bottom: 20, left: 35 };
  x1 = d3v7
    .scaleLinear()
    .domain(
      d3v7.extent(dat, function (d) {
        return d.year;
      })
    )
    .range([50, width - margin.right]);

  getBallsX = x;

  y1 = d3v7
    .scaleLinear()
    .domain([0, lineMax])
    .range([height - margin.bottom, margin.top]);

  line1 = d3v7
    .line()
    .defined(function (d) {
      return d.year;
    })
    .x((d) => x1(d.year))
    .y((d) => y1(d.total));

  d3v7
    .select("div#lineChart")
    .select("svg")
    .select("g.line")
    .append("path")
    .attr("id", stateName)
    .datum(dat)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.5)
    .attr("d", line1);
}

function updateMap(data) {
  //console.log(data);
  //var cincod = '2005';
  var max = getMax(data);
  //console.log(max);
  data.forEach(function (d) {
    if (d.state == "Total") {
      return;
    }
    //console.log(d.value);
    d3v7
      .select("div#usMap")
      .select("svg")
      .select("path[id='" + d.line + "']")
      .style("fill", d3v7.interpolateReds(d.value / max));
  });
  /*data.forEach(function (d) {
    if (d.state == "Total"){
      return;
    }
    d3v7.select("div#usMap")
      .select("svg")
      .select("path[id='" + d.state + "']")
      .style("fill", d3v7.interpolateReds(d[cincod]/8));
  });*/
}

function parseDataTableMap(data, years) {
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
        } else if (kkey == "state") {
          state = vvalue;
        }
      }
    }
    out.push({ line: state, value: out_value, domain: domain_type });
  }
  return out;
}

function addZoom() {
  d3v7
    .select("#usMap")
    .selectAll("g")
    .call(d3v7.zoom().scaleExtent([1, 8]).on("zoom", zoomed));
}

function zoomed({ transform }) {
  d3v7
    .select("#usMap")
    .selectAll("g")
    .selectAll("path")
    .attr("transform", transform);
}

function dropDownMenu(data) {
  // Create a div for the Input and its label
  d3v7.select("#selectContainer").append("div").attr("id", "selection");
  d3v7
    .select("#selection")
    .append("div")
    .attr("class", "labelSelect")
    .html("Select a City:");

  // Create the Select Input
  var refSelect = d3v7
    .select("#selection")
    .append("select")
    .attr("id", "citySelect")
    .on("change", changeCity);

  // Set the options for the Select Input
  var refOptions = refSelect.selectAll("option").data(allCityObjects);
  refOptions
    .enter()
    .append("option")
    .attr("selected", function (d) {
      // logic that returns true for the city that should initially be selected, if need-be
    })
    .text(function (d) {
      return d.cityName;
    });
}

function changeCity() {
  // Grab currently selected option
  var s = d3v7.select(this);
  var i = s.property("selectedIndex");
  var d = s.selectAll("option").data()[i];

  // Call function that shows Tooltip for specific city 'd'
}
