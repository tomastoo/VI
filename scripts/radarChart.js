var table_5_src = "data/table-5.csv";
var table_5;
var container;
var parsed_data;
var cfg;
white_flag = false;
black_flag = false;
asian_flag = false;
native_flag = false;
latino_flag = false;

var empty_flag;

var white_color;


function init(first) {
    Promise.all([d3v7.csv(table_5_src)]).then(function ([
        table_5_
      ]) {
        table_5 = table_5_;
        createRadarChart(table_5, first);
    });
}

function radar_data_parser(data) {
    out = [];
    classNames = [];
    empty_flag = true;

    for (const[key, value] of Object.entries(data[0])) {
      if ( (key == "White" && white_flag) || (key == "Black" && black_flag) || (key == "American Native" && native_flag) || 
            (key == "Asian" && asian_flag) || (key == "Latino" && latino_flag) ) {
          empty_flag = false;
          classNames.push(key);
      }
    }
    if (empty_flag) {
      classNames.push("White");
    }
    
  
    for (let i = 0; i < classNames.length; i++) {
      axisArray = []
      for (const [key, value] of Object.entries(data)) {
        if (value.classnames == "axis") {
          for (const[kkey, vvalue] of Object.entries(value)) {
            if (kkey == classNames[i]) {
              axisArray.push({axis: value.Bias_motivation, value: parseInt(vvalue)})
            }
          }
        }
      }
      out.push({className: classNames[i], axes: axisArray});
    }
    //console.log("out", out);
    return out;
}

function normalize_data(data) {
  // get extremes
  extremes = getExtremes(data, "Race");
  var maxRace = extremes[0], minRace = extremes[1];
  extremes = getExtremes(data, "Religion");
  var maxRelgion = extremes[0], minRelgion = extremes[1];
  extremes = getExtremes(data, "Sexual Orientation");
  var maxSexual =  extremes[0], minSexual = extremes[1];
  extremes = getExtremes(data, "Disability");
  var maxDis = extremes[0], minDis = extremes[1];
  extremes = getExtremes(data, "Gender");
  var maxGender = extremes[0], minGender = extremes[1];
  // get ranges
  var raceRange = maxRace - 0;
  var religionRange = maxRelgion - 0;
  var sexualRange = maxSexual - 0;
  var disRange = maxDis - 0;
  var genderRange = maxGender - 0;

  //normalize
  for (const[key, value] of Object.entries(data)) {
    for (const[kkey, vvalue] of Object.entries(value.axes)) {
      if (vvalue.axis == "Race") {
        //console.log("value=" + vvalue.value);
        //console.log("min= " + minRace);
        //console.log("range =" + raceRange);
        //if (vvalue.value == maxRace) {
          //vvalue.value = (parseInt(vvalue.value) -  parseInt(minRace)) / parseFloat(raceRange);
        //} else {
          vvalue.value = (parseInt(vvalue.value) - minRace) / parseFloat(raceRange);
        //}
        //console.log("out: ", (parseInt(vvalue.value) -  0) / parseFloat(raceRange) );
      } else if (vvalue.axis == "Religion") {
        vvalue.value = (vvalue.value - minRelgion) / religionRange;
      } else if (vvalue.axis == "Sexual Orientation") {
        vvalue.value = (vvalue.value - minSexual) / sexualRange;
      } else if (vvalue.axis == "Disability") {
        vvalue.value = (vvalue.value - minDis) / disRange;
      } else if (vvalue.axis == "Gender") {
        vvalue.value = (vvalue.value - minGender) / genderRange;
      }
    }
  }
  //console.log("after norm:", data);
}

function getExtremes(data, axis) {
  i = 0;
  var max = 0;
  var min = 10000;
  for (const[key, value] of Object.entries(data)) {
    for (const[kkey, vvalue] of Object.entries(value.axes)) {
      if (vvalue.axis == axis){
        if (vvalue.value > max) {
          max = vvalue.value;
        } else if(vvalue.value < min) {
          min = vvalue.value;
        }
      }
    }
  }
  //console.log([max, min]);
  return [max, min];
}

// Start of var radar

var RadarChart = {
    defaultConfig: {
      containerClass: 'radar-chart',
      w: 300,
      h: 200,
      factor: 0.95,
      factorLegend: 1,
      levels: 3,
      levelTick: false,
      TickLength: 10,
      maxValue: 0,
      minValue: 0,
      radians: 2 * Math.PI,
      color: d3version3.scale.category10(),
      axisLine: true,
      axisText: true,
      circles: true,
      radius: 5,
      open: false,
      backgroundTooltipColor: "black",
      backgroundTooltipOpacity: "0.7",
      tooltipColor: "steelblue",
      axisJoin: function(d, i) {
        return d.className || i;
      },
      tooltipFormatValue: function(d) {
        return d;
      },
      tooltipFormatClass: function(d) {
        return d;
      },
      transitionDuration: 300
    },
    chart: function() {
      // default config
      cfg = Object.create(RadarChart.defaultConfig);
      // Color the buttons
      function setTooltip(tooltip, msg, event){
        if(msg === false || msg == undefined){
          /*tooltip.classed("visible", 0);
          tooltip.select("rect").classed("visible", 0);*/
          tooltip.transition().duration(300).style("opacity", 0);
        }else{
          ////console.log("estou vivo aqui");
          tooltip.transition().duration(300).style("opacity", 0.6);
          tooltip
                .html(msg)
                .style("left", 200 + "px")
                .style("top", 20 + "px");
        }
      }
      function radar(selection) {
        selection.each(function(data) {
          container = d3version3.select(this);
          //var container = d3v7.select(this);
          //var tooltip = container.selectAll('g.tooltip').data([data[0]]);
          var tooltip = d3v7
            .select("body")
            .select("#vis")
            .select("#radar")
            .append("div")
            .attr("class", "tooltipradar")
            .style("opacity", 0);
  
          data = data.map(function(datum) {
            if(datum instanceof Array) {
              datum = {axes: datum};
            }
            return datum;
          });
  
          var maxValue = Math.max(cfg.maxValue, d3version3.max(data, function(d) {
            return d3version3.max(d.axes, function(o){ return o.value; });
          }));
          maxValue -= cfg.minValue;
  
          var allAxis = data[0].axes.map(function(i, j){ return {name: i.axis, xOffset: (i.xOffset)?i.xOffset:0, yOffset: (i.yOffset)?i.yOffset:0}; });
          var total = allAxis.length;
          var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
          var radius2 = Math.min(cfg.w / 2, cfg.h / 2);
  
          container.classed(cfg.containerClass, 1);
  
          function getPosition(i, range, factor, func){
            factor = typeof factor !== 'undefined' ? factor : 1;
            return range * (1 - factor * func(i * cfg.radians / total));
          }
          function getHorizontalPosition(i, range, factor){
            return getPosition(i, range, factor, Math.sin);
          }
          function getVerticalPosition(i, range, factor){
            return getPosition(i, range, factor, Math.cos);
          }
  
          // levels && axises
          var levelFactors = d3version3.range(0, cfg.levels).map(function(level) {
            return radius * ((level + 1) / cfg.levels);
          });
  
          var levelGroups = container.selectAll('g.level-group').data(levelFactors);
  
          levelGroups.enter().append('g');
          levelGroups.exit().remove();
  
          levelGroups.attr('class', function(d, i) {
            return 'level-group level-group-' + i;
          });
  
          var levelLine = levelGroups.selectAll('.level').data(function(levelFactor) {
            return d3version3.range(0, total).map(function() { return levelFactor; });
          });
  
          levelLine.enter().append('line');
          levelLine.exit().remove();
  
          if (cfg.levelTick){
            levelLine
            .attr('class', 'level')
            .attr('x1', function(levelFactor, i){
              if (radius == levelFactor) {
                return getHorizontalPosition(i, levelFactor);
              } else {
                return getHorizontalPosition(i, levelFactor) + (cfg.TickLength / 2) * Math.cos(i * cfg.radians / total);
              }
            })
            .attr('y1', function(levelFactor, i){
              if (radius == levelFactor) {
                return getVerticalPosition(i, levelFactor);
              } else {
                return getVerticalPosition(i, levelFactor) - (cfg.TickLength / 2) * Math.sin(i * cfg.radians / total);
              }
            })
            .attr('x2', function(levelFactor, i){
              if (radius == levelFactor) {
                return getHorizontalPosition(i+1, levelFactor);
              } else {
                return getHorizontalPosition(i, levelFactor) - (cfg.TickLength / 2) * Math.cos(i * cfg.radians / total);
              }
            })
            .attr('y2', function(levelFactor, i){
              if (radius == levelFactor) {
                return getVerticalPosition(i+1, levelFactor);
              } else {
                return getVerticalPosition(i, levelFactor) + (cfg.TickLength / 2) * Math.sin(i * cfg.radians / total);
              }
            })
            .attr('transform', function(levelFactor) {
              return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
            })
            .attr("stroke", "black");
          }
          else{
            levelLine
            .attr('class', 'level')
            .attr('x1', function(levelFactor, i){ return getHorizontalPosition(i, levelFactor); })
            .attr('y1', function(levelFactor, i){ return getVerticalPosition(i, levelFactor); })
            .attr('x2', function(levelFactor, i){ return getHorizontalPosition(i+1, levelFactor); })
            .attr('y2', function(levelFactor, i){ return getVerticalPosition(i+1, levelFactor); })
            .attr('transform', function(levelFactor) {
              return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
            })
            .attr("stroke", "grey");
          }
          if(cfg.axisLine || cfg.axisText) {
            var axis = container.selectAll('.axis').data(allAxis);
  
            var newAxis = axis.enter().append('g');
            if(cfg.axisLine) {
              newAxis.append('line');
            }
            if(cfg.axisText) {
              newAxis.append('text');
            }
  
            axis.exit().remove();
  
            axis.attr('class', 'axis');
  
            if(cfg.axisLine) {
              axis.select('line')
              .attr('x1', cfg.w/2)
              .attr('y1', cfg.h/2)
              .attr('x2', function(d, i) { return (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factor); })
              .attr('y2', function(d, i) { return (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factor); })
              .attr("stroke", "#36454F");
            }
  
            if(cfg.axisText) {
              axis.select('text')
              .attr('class', function(d, i){
                var p = getHorizontalPosition(i, 0.5);
  
                return 'legend ' +
                ((p < 0.4) ? 'left' : ((p > 0.6) ? 'right' : 'middle'));
              })
              .attr('dy', function(d, i) {
                var p = getVerticalPosition(i, 0.5);
                return ((p < 0.1) ? '1em' : ((p > 0.9) ? '0' : '0.5em'));
              })
              .text(function(d) { return d.name; })
              .attr('x', function(d, i){
                var p = getHorizontalPosition(i, 0.5);
                if (p > 0.2 && p < 0.4) {
                    return d.xOffset+ (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factorLegend) - 70;
                }
                else if (p > 0.4 && p < 0.6) {
                    return d.xOffset+ (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factorLegend) - 19;
                }
                else if (p < 0.2) {
                    return d.xOffset+ (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factorLegend) - 56;
                }
                else if (p>=0.8) {
                    return d.xOffset+ (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factorLegend) + 3;
                }
                else {
                    return d.xOffset+ (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factorLegend);
                } 
                })
              .attr('y', function(d, i){ 
                var p = getHorizontalPosition(i, 0.5);
                if (p > 0.4 && p < 0.6) {
                    return d.yOffset+ (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factorLegend) -20; 
                }
                else if (p > 0.6 && p < 0.8) {
                    return d.yOffset+ (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factorLegend) +15;
                }
                else if (p < 0.2) {
                    return d.yOffset+ (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factorLegend) -4;
                }
                else if (p > 0.2 && p < 0.4) {
                    return d.yOffset+ (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factorLegend) + 17;
                }
                else {
                    return d.yOffset+ (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factorLegend) - 3;
                }
                });
            }
          }
  
          // content
          data.forEach(function(d){
            d.axes.forEach(function(axis, i) {
              //console.log((cfg.w/2-radius2)+getHorizontalPosition(i, radius2, (parseFloat(Math.max(axis.value - cfg.minValue, 0))/maxValue)*cfg.factor));
              axis.x = (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, (parseFloat(Math.max(axis.value - cfg.minValue, 0))/maxValue)*cfg.factor);
              axis.y = (cfg.h/2-radius2)+getVerticalPosition(i, radius2, (parseFloat(Math.max(axis.value - cfg.minValue, 0))/maxValue)*cfg.factor);
            });
          });
          var polygon = container.selectAll(".area").data(data, cfg.axisJoin);
          ////console.log("polygon cima", polygon);
          var polygonType = 'polygon';
          if (cfg.open) {
            polygonType = 'polyline';
          }
  
          polygon.enter().append(polygonType)
          .classed({area: 1, 'd3version3-enter': 1})
          .on('mouseover', function (dd, event){
          })
          .on('mouseout', function(dd, event){
          }); 
          polygon.exit()
          .classed('d3version3-exit', 1) // trigger css transition
          .transition().duration(cfg.transitionDuration)
          .remove();
  
         // ISTO ESTAVA TUDO FORA DE UM IF SEM ELSE
          if (empty_flag) {
            console.log("empty flag");
            polygon
          .each(function(d, i) {
            var classed = {'d3version3-exit': 0}; // if exiting element is being reused
            classed['radar-chart-serie' + i] = 1;
            if(d.className) {
              classed[d.className] = 1;
            }
            d3version3.select(this).classed(classed);
          })        // styles should only be transitioned with css
          .style('stroke', function(d, i) {
            //buscar o butao e pintalo com esta cor
            //console.log("d", d);
            //if (d.className == "White") {
              //console.log("entrei aqui");
              //a = d3version3.select("#whiteButton");
              //console.log("button", a);
              //a.style("fill", cfg.color(i));
            return cfg.color(i); 
          })
          .style('fill', function(d, i) { return cfg.color(i); })
          .attr("opacity", 0)
          //.style("display", 'none')
          .transition().duration(cfg.transitionDuration)
          // svg attrs with js
          .attr('points',function(d) {
            return d.axes.map(function(p) {
              return [p.x, p.y].join(',');
            }).join(' ');
          })
          .each('start', function() {
            d3version3.select(this).classed('d3version3-enter', 0); // trigger css transition
          });
          } else {
            console.log("else");
            polygon
          .each(function(d, i) {
            var classed = {'d3version3-exit': 0}; // if exiting element is being reused
            classed['radar-chart-serie' + i] = 1;
            if(d.className) {
              classed[d.className] = 1;
            }
            d3version3.select(this).classed(classed);
          })        // styles should only be transitioned with css
          .style('stroke', function(d, i) { 
            if (d.className == "White") {
              return "rgb(31, 119, 180)";
            } else if (d.className == "Black") {
              return "rgb(255, 127, 14)";
            } else if (d.className == "Asian") {
              return "rgb(44, 160, 44)";
            }else if (d.className == "American Native") {
              return "rgb(214, 39, 40)";
            }else if (d.className == "Latino") {
              return "rgb(148, 103, 189)";
            }
            //return cfg.color(i); 
          })
          .style('fill', function(d, i) { 
            if (d.className == "White") {
              return "rgb(31, 119, 180)";
            } else if (d.className == "Black") {
              return "rgb(255, 127, 14)";
            } else if (d.className == "Asian") {
              return "rgb(44, 160, 44)";
            }else if (d.className == "American Native") {
              return "rgb(214, 39, 40)";
            }else if (d.className == "Latino") {
              return "rgb(148, 103, 189)";
            }
           })
          .attr("opacity", 0.2)
          //.style("display", 'none')
          .transition().duration(cfg.transitionDuration)
          // svg attrs with js
          .attr('points',function(d) {
            return d.axes.map(function(p) {
              return [p.x, p.y].join(',');
            }).join(' ');
          })
          .each('start', function() {
            d3version3.select(this).classed('d3version3-enter', 0); // trigger css transition
          });
          }
          
  
          if(cfg.circles && cfg.radius) {
  
            var circleGroups = container.selectAll('g.circle-group').data(data, cfg.axisJoin);
  
            circleGroups.enter().append('g').classed({'circle-group': 1, 'd3version3-enter': 1});
            circleGroups.exit()
            .classed('d3version3-exit', 1) // trigger css transition
            .transition().duration(cfg.transitionDuration).remove();
  
            // TUDO DENTRODE UM IF SEM ELSE
            if (empty_flag) {
              circleGroups
            .each(function(d) {
              var classed = {'d3version3-exit': 0}; // if exiting element is being reused
              if(d.className) {
                classed[d.className] = 1;
              }
              d3version3.select(this).classed(classed);
            })
            .attr("opacity", 0)
            .transition().duration(cfg.transitionDuration)
            .each('start', function() {
              d3version3.select(this).classed('d3version3-enter', 0); // trigger css transition
            });
  
            var circle = circleGroups.selectAll('.circle').data(function(datum, i) {
              return datum.axes.map(function(d) { return [d, i]; });
            });
            } else {
              circleGroups
            .each(function(d) {
              var classed = {'d3version3-exit': 0}; // if exiting element is being reused
              if(d.className) {
                classed[d.className] = 1;
              }
              d3version3.select(this).classed(classed);
            })
            .attr("opacity", 0.6)
            .transition().duration(cfg.transitionDuration)
            .each('start', function() {
              d3version3.select(this).classed('d3version3-enter', 0); // trigger css transition
            });
  
            var circle = circleGroups.selectAll('.circle').data(function(datum, i) {
              return datum.axes.map(function(d) { return [d, i]; });
            });
            }
            
            //console.log("passei aui crl");
            circle.enter().append('circle')
            .classed({circle: 1, 'd3version3-enter': 1})
            .on('mouseover', function(dd, event){
              if (white_flag) {
                new_data = parsed_data.filter(function(b) {
                  if (b.className == "White") {
                    for (const[key, value] of Object.entries(b.axes)) {
                      if (value.axis == dd[0].axis && value.value == dd[0].value) {
                        return b;
                      }
                    }
                  }
                });
                container.selectAll(".area").data(new_data, cfg.axisJoin).attr("opacity", 0.8);
                setTooltip(tooltip, dd[0].value, event);
              } if (black_flag) {
                  new_data = parsed_data.filter(function(b) {
                    if (b.className == "Black") {
                      for (const[key, value] of Object.entries(b.axes)) {
                        if (value.axis == dd[0].axis && value.value == dd[0].value) {
                          return b;
                        }
                      }
                    }
                    });
                  container.selectAll(".area").data(new_data, cfg.axisJoin).attr("opacity", 0.8);
                  setTooltip(tooltip, dd[0].value, event);
              } if (native_flag) {
                new_data = parsed_data.filter(function(b) {
                  if (b.className == "American Native") {
                    for (const[key, value] of Object.entries(b.axes)) {
                      if (value.axis == dd[0].axis && value.value == dd[0].value) {
                        return b;
                      }
                    }
                  }
                  });
                container.selectAll(".area").data(new_data, cfg.axisJoin).attr("opacity", 0.8);
                setTooltip(tooltip, dd[0].value, event);
              } if (asian_flag) {
                new_data = parsed_data.filter(function(b) {
                  if (b.className == "Asian") {
                    for (const[key, value] of Object.entries(b.axes)) {
                      if (value.axis == dd[0].axis && value.value == dd[0].value) {
                        return b;
                      }
                    }
                  }
                  });
                container.selectAll(".area").data(new_data, cfg.axisJoin).attr("opacity", 0.8);
                setTooltip(tooltip, dd[0].value, event);
              } if (latino_flag) {
                new_data = parsed_data.filter(function(b) {
                  if (b.className == "Latino") {
                    for (const[key, value] of Object.entries(b.axes)) {
                      if (value.axis == dd[0].axis && value.value == dd[0].value) {
                        return b;
                      }
                    }
                  }
                  });
                container.selectAll(".area").data(new_data, cfg.axisJoin).attr("opacity", 0.8);
                setTooltip(tooltip, dd[0].value, event);
              }
            })
            .on('mouseout', function(event, dd){
              //console.log("registo out");
              setTooltip(tooltip, false, event);
              if (white_flag) {
                new_data = parsed_data.filter(function(b) {
                  if (b.className == "White") {
                      return b;
                  }
                  });
                  container.selectAll(".area").data(new_data, cfg.axisJoin).attr("opacity", 0.2);
              } if (black_flag) {
                new_data = parsed_data.filter(function(b) {
                  if (b.className == "Black") {
                      return b;
                  }
                  });
                container.selectAll(".area").data(new_data, cfg.axisJoin).attr("opacity", 0.2);
              } if (native_flag) {
                new_data = parsed_data.filter(function(b) {
                  if (b.className == "American Native") {
                      return b;
                  }
                  });
                container.selectAll(".area").data(new_data, cfg.axisJoin).attr("opacity", 0.2);
              } if (asian_flag) {
                new_data = parsed_data.filter(function(b) {
                  if (b.className == "Asian") {
                      return b;
                  }
                  });
                container.selectAll(".area").data(new_data, cfg.axisJoin).attr("opacity", 0.2);
              } if (latino_flag) {
                new_data = parsed_data.filter(function(b) {
                  if (b.className == "Latino") {
                      return b;
                  }
                  });
                container.selectAll(".area").data(new_data, cfg.axisJoin).attr("opacity", 0.2);
              }
            });
  
            circle.exit()
            .classed('d3version3-exit', 1) // trigger css transition
            .transition().duration(cfg.transitionDuration).remove();
  
            circle
            .each(function(d, i) {
              var classed = {'d3version3-exit': 0}; // if exit element reused
              classed['radar-chart-serie'+d[1]] = 1;
              d3version3.select(this).classed(classed);
            })
            // styles should only be transitioned with css
            .style('fill', function(d, i) {
              //console.log("d", d);
              //console.log("i", i); 
              return cfg.color(d[1]);
              /*
              if (white_flag) {
                console.log("entrei aqui");
                new_data = parsed_data.filter(function(b) {
                  if (b.className == "White") {
                    console.log("white");
                    for (const[key, value] of Object.entries(b.axes)) {
                      if (value.axis == d[0].axis && value.value == d[0].value) {
                        console.log("pintei");
                        return "rgb(31, 119, 180)";
                      }
                    }
                  }
                });
              } else {
                console.log("sem cor");
                return "white";
              }*/

             })
            .transition().duration(cfg.transitionDuration)
            // svg attrs with js
            .attr('r', cfg.radius)
            .attr('cx', function(d) {
              return d[0].x;
            })
            .attr('cy', function(d) {
              return d[0].y;
            })
            .each('start', function() {
              d3version3.select(this).classed('d3version3-enter', 0); // trigger css transition
            });
  
            //Make sure layer order is correct
            ////console.log(polygon);
            ////console.log(polygon.node());
            var poly_node = polygon.node();
            poly_node.parentNode.appendChild(poly_node);
  
            var cg_node = circleGroups.node();
            cg_node.parentNode.appendChild(cg_node);
  
            // ensure tooltip is upmost layer
            var tooltipEl = tooltip.node();
            tooltipEl.parentNode.appendChild(tooltipEl);
          }
        });
      }
  
      radar.config = function(value) {
        if(!arguments.length) {
          return cfg;
        }
        if(arguments.length > 1) {
          cfg[arguments[0]] = arguments[1];
        }
        else {
          d3version3.entries(value || {}).forEach(function(option) {
            cfg[option.key] = option.value;
          });
        }
        return radar;
      };
  
      return radar;
    },
    draw: function(id, d, options) {
      var chart = RadarChart.chart().config(options);
      var cfg = chart.config();
  
      d3version3.select(id).select('svg').remove();
      d3version3.select(id)
      .append("svg")
      .attr("width", cfg.w)
      .attr("height", cfg.h)
      .datum(d)
      .call(chart);
    }
  };

// End

function createRadarChart(data, first) {

    parsed_data = radar_data_parser(data);
    //normalize_data(parsed_data);
    var chart = RadarChart.chart();
    var cfgd = chart.config();

    margin = { top: 10, right: 30, bottom: 20, left: 35 };

    if (first) {
      var svg = d3version3.select('div#radar').select('svg')
                  .attr('width', cfgd.w + margin.right + margin.left)
                  .attr('height', cfgd.h + cfgd.h / 4 + margin.top + margin.left +50);
      //console.log(svg);
      svg.append('g');
    } else {
      var svg = d3version3.select("div#radar").select("svg")
    }
    svg.classed('single', true).datum(parsed_data).call(chart)
    .attr("transform", `translate(${margin.right +80},${cfgd.h/3 - margin.bottom - 5})`);
    
}

function radarbuttonClicked(button) {
    switch (button) {
        case "white":
          // Show white polygon and buttons
          white_flag = !white_flag;
          init(false);
          //Quero colorir o botao
          break;
        case "black":
          black_flag = !black_flag;
          init(false);
          break;
        case "native":
            //Vem tirar ou meter
            native_flag = !native_flag;
            init(false);
            break;
        case "asian":
            //Vem tirar ou meter
            asian_flag = !asian_flag;
            init(false);
            break;
        case "latino":
              //Vem tirar ou meter
              latino_flag = !latino_flag;
              init(false);
              break;
        default:
            break;
    }
}

