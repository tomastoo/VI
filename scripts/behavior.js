var table_1_incidents_src = "data/table1-Incidentes.csv";
var table_1_offenses_src = "data/table1-Offenses.csv";
var table_1_victims_src = "data/table1-Victims.csv";
var table_1_offenders_src = "data/table1-Known Offender.csv";

var table_11_incidents_src = "data/table11-Incidents.csv";
var table_11_offenses_src = "data/table11-Offenses.csv";
var map = "data/countries-110m.json";

var tooltip;
var topology;
var currentFilter;


xDefault = d3
    .scaleBand()
    .domain([
      "Race",
      "Religion",
      "Sexual Orientation",
      "Ethnicity/National Origin",
      "Disability",
    ]);

Promise.all([d3.json(map), d3.csv(table_1_offenses_src)]).then(function ([
  map,
  table_1_offenses,
]) {
  topology = map;
  //console.log(table_1_offenses);
  //console.log(map);
  //trableReformatYearsSingleBias(table_11_offenses[1]);
  createLineChart(table_1_offenses, false);
  handleLineChartClick(null, "2019");
  createBarChart(table_1_offenses, false, 2019, defaultDataFilter, xDefault, 600);
  currentFilter = "offenses";
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
        createBarChart(table_1_victims, true, 2019, defaultDataFilter, xDefault, 600);
        currentFilter = "victims";
      });
      break;
    case "offenders":
      Promise.all([d3.csv(table_1_offenders_src)]).then(function ([
        table_1_offenders,
      ]) {
        createLineChart(table_1_offenders, true);
        createBarChart(table_1_offenders, true, 2019, defaultDataFilter, xDefault, 600);
        currentFilter = "offenders";
      });
      break;

    case "offenses":
      Promise.all([d3.csv(table_1_offenses_src)]).then(function ([
        table_1_offenses,
      ]) {
        createLineChart(table_1_offenses, true);
        createBarChart(table_1_offenses, true, 2019, defaultDataFilter, xDefault, 600);
        currentFilter = "offenses";
      });
      break;
    case "incidents":
      Promise.all([d3.csv(table_1_incidents_src)]).then(function ([
        table_1_incidents,
      ]) {
        createLineChart(table_1_incidents, true);
        createBarChart(table_1_incidents, true, 2019, defaultDataFilter, xDefault, 600);
        currentFilter = "incidents";
      });
      break;
    default:
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
      .style("fill", "orange")
      .attr("r", 8);

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
  //console.log(out);
  return out;
}



function createBarChart(data, update, year, func, x, width) {
  height = 350;

  margin = { top: 20, right: 20, bottom: 20, left: 40 };


  x.range([margin.left, width - margin.right]);
  //console.log(data);
  /* x_values = []
    x_values.push(tableGetX(data[2]));
    x_values.push(tableGetX(data[8]));
    x_values.push(tableGetX(data[16]));
    x_values.push(tableGetX(data[22]));
    x_values.push(tableGetX(data[25]));*/
  //console.log(x_values);


  var color = d3.scaleOrdinal().range(["#6b486b", "#a05d56", "#d0743c", "#ff8c00", "steelblue"]);

  tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

  y = d3
    .scaleLinear()
    .domain([0, 5000])
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

  var dict_lines = parseDataTable(data, year);
  //console.log(dict_lines);

  new_data = dict_lines.filter(function(d) {
      return func(d);
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
          .attr("x", function (d,i) {
            //console.log(d);
           // console.log(i);
            //console.log(x(i));
            return (x(d.line.replace(":", "")))
            //return x(i);
          })
          .attr("y", (d) => y(d.value))
          .attr("width", x.bandwidth() - 10)
          .attr("height", (d) => height - margin.bottom - y(d.value))
          .style("fill", function(d, i) {
            return color(i);
          })
        .on("mouseover", handleMouseHover)
        .on("mouseleave", handleMouseLeave)
        .on("click", function(d, i) {;
           handleBarClick(i, data);
        });
      },
      (update) => {
        update
        .attr("x", function (d) {
            //console.log(d);
            return x(d.line.replace(":", ""));
        })
        .attr("y", (d) => y(d.value))
        .attr("width", x.bandwidth() - 10)
        .attr("height", (d) => height - margin.bottom - y(d.value))
        .style("background-color", function(d, i) {
        return color(i);
        })
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

  svg.select("g.xAxis").call(xAxis);

  svg.select("g.yAxis").call(yAxis);
}

function handleBarClick(d, dataset) {
    //console.log(d);
    //console.log(dataset);

    tooltip.transition()
            .duration(400)
			.style("opacity", 0)


    switch(d.line) {
        case "Race:":
            // Show barchart related to race crimes
            xRace = d3
                .scaleBand()
                .domain([
                    "Anti-White",
                    "Anti-Black",
                    "Anti-Native American",
                    "Anti-Asian",
                    "Anti-Multiple Races"
                ]);
            createBarChart(dataset, true, 2019, raceDataFilter, xRace, 600);
            showBackButton();
            break;
        case "Religion:":
            // Show barchart related to religion crimes
            xReligion = d3
                .scaleBand()
                .domain([
                    "Anti-Jewish",
                    "Anti-Catholic",
                    "Anti-Protestant",
                    "Anti-Islamic",
                    "Anti-Other Religion", 
                    "Anti-Multiple Religions",
                    "Anti-Atheism"
                ]);
            createBarChart(dataset, true, 2019, religionDataFilter, xReligion, 710);
            showBackButton();
            break;
        case "Sexual Orientation:":
            xSexual = d3
                .scaleBand()
                .domain([
                    "Anti-Male Homosexual",
                    "Anti-Female Homosexual",
                    "Anti-Homosexual",
                    "Anti-Heterosexual",
                    "Anti-Bisexual"
                ]);
            createBarChart(dataset, true, 2019, sexualDataFilter, xSexual, 600);
            showBackButton();
            break;
        case "Ethnicity/National Origin:":
            xE = d3
                .scaleBand()
                .domain([
                    "Anti-Hispanic",
                    "Anti-Other Ethnicity"
                ]);
            createBarChart(dataset, true, 2019, ethnicityDataFilter, xE, 300);
            showBackButton();
            break;
        case "Disability:":
            xDisability = d3
                .scaleBand()
                .domain([
                    "Anti-Physical",
                    "Anti-Mental"
                ]);
            createBarChart(dataset, true, 2019, disabilityDataFilter, xDisability, 300);
            showBackButton();
            break;
        default:
            break;
    }
}

function defaultDataFilter(d) {
    if (
        d.line == "Race:" ||
        d.line == "Religion:" ||
        d.line == "Sexual Orientation:" ||
        d.line == "Ethnicity/National Origin:" ||
        d.line == "Disability:"
      ) {
        return d;
      }
}

function raceDataFilter(d) {
    if (
        d.line == "Anti-White" ||
        d.line == "Anti-Black" ||
        d.line == "Anti-Native American" ||
        d.line == "Anti-Asian" ||
        d.line == "Anti-Multiple Races"
    ) {
        return d;
    }
}

function religionDataFilter(d) {
    if (
        d.line == "Anti-Jewish" ||
        d.line == "Anti-Catholic" ||
        d.line == "Anti-Protestant" ||
        d.line == "Anti-Islamic" ||
        d.line == "Anti-Other Religion" ||
        d.line == "Anti-Multiple Religions" ||
        d.line == "Anti-Atheism"
    ) {
        return d;
    }
}

function sexualDataFilter(d) {
    if (
        d.line == "Anti-Male Homosexual" ||
        d.line == "Anti-Female Homosexual" ||
        d.line == "Anti-Homosexual" ||
        d.line == "Anti-Heterosexual" ||
        d.line == "Anti-Bisexual"
    ) {
        return d;
    }
}

function ethnicityDataFilter(d) {
    if (
        d.line == "Anti-Hispanic" ||
        d.line == "Anti-Other Ethnicity" 
    ) {
        return d;
    }
}

function disabilityDataFilter(d) {
    if (
        d.line == "Anti-Physical" ||
        d.line == "Anti-Mental"
    ) {
        return d;
    }
}

function showBackButton() {
    let element = document.getElementById("magicButton");
    element.removeAttribute("hidden");
}

function moveBackChart() {
    
    switch (currentFilter) {
        case "offenses":
            Promise.all([d3.csv(table_1_offenses_src)]).then(function([
                table_1_offenses
            ]) {
                createBarChart(table_1_offenses, true, 2019, defaultDataFilter, xDefault, 600);
            })
            break;
        case "victims":
            Promise.all([d3.csv(table_1_victims_src)]).then(function([
                table_1_victims
            ]) {
                createBarChart(table_1_victims, true, 2019, defaultDataFilter, xDefault, 600);
            })
            break;
        case "offenders":
            Promise.all([d3.csv(table_1_offenders_src)]).then(function([
                table_1_offenders
            ]) {
                createBarChart(table_1_offenders, true, 2019, defaultDataFilter, xDefault, 600);
            })
            break;      
        case "incidents":
            Promise.all([d3.csv(table_1_incidents_src)]).then(function([
                table_1_incidents
            ]) {
                createBarChart(table_1_incidents, true, 2019, defaultDataFilter, xDefault, 600);
            })
            break;
        default:
            break;
    }    

    let element = document.getElementById("magicButton");
    element.setAttribute("hidden", "hidden");
}

function handleMouseHover(event, d) {
    tooltip.transition()
            .duration(400)
			.style("opacity", 1)
        
    tooltip.html("Total: " + d.value)	
    .style("left", (event.pageX) + "px")		
    .style("top", (event.pageY) + "px")
}

function handleMouseLeave(event, d) {
    tooltip.transition()
            .duration(400)
			.style("opacity", 0)
}