
// set the dimensions and margins of the graph
var margin = {top: 20, right: 80, bottom: 30, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%Y%m");

// set the ranges

var y = d3.scaleLinear().range([height, 0]);
var x2 = d3.scaleTime().range([0, width]);
var y2 = d3.scaleLinear().range([height, 0]);
var x = techan.scale.financetime()
        .range([0, width]);
var candlestick = techan.plot.candlestick()
        .xScale(x)
        .yScale(y);
var priceDataArr;
var monthEarnDataArr;
var loadType;


var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.4);
var yScale = d3.scaleLinear().rangeRound([height, 0]);

var xAxis = d3.axisBottom()
            .scale(x);
var yAxis = d3.axisLeft()
            .scale(y);

var ohlcAnnotation = techan.plot.axisannotation()
        .axis(xAxis)
        .orient('left')
        .format(d3.format(',.2f'));

var timeAnnotation = techan.plot.axisannotation()
        .axis(yAxis)
        .orient('bottom')
        .format(d3.timeFormat('%Y%m'))
        .width(20)
        .translate([0, height]);

var crosshair = techan.plot.crosshair()
        .xScale(x)
        .yScale(y)
//        .xAnnotation(timeAnnotation)
//        .yAnnotation(ohlcAnnotation)
        .on("move", move);
var textSvg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// define the line
// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var svgText = textSvg.append("g")
            .attr("class", "description")
            .append("text")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "start")
            .text("");
var theData = undefined;
loadJSON("earn1102.json", "price1102.json");


function draw(data, origindata) {
    data = data.reverse();
    priceDataArr = data;
    x.domain(origindata.map(candlestick.accessor().d));
//    xScale.domain(d3.extent(data, function(d) { 
//    return d.date; }));
    xScale.domain(data.map(function(d){return d.date;}));
    
    var maxData = d3.max(data, function(d){return d.price}) / 10;
    yScale.domain([d3.min(data, function(d){return d.price - maxData;}), d3.max(data, function(d){ return d.price + maxData;})])

//    y.domain(techan.scale.plot.ohlc(data, candlestick.accessor()).domain());
    y.domain([d3.min(data, function(d){return d.price - maxData;}), d3.max(data, function(d){ return d.price + maxData;})])

    var line = d3.line()
        .x(function(d){return x(d.date)})
    .y(function(d) {return yScale(d.price);})
    
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("class", "line")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2.5)
//        .attr("transform", "translate(" + (xScale.bandwidth() / 2) + ",0)")
        .attr("d", line);
    
    svg.append("g")
    .call(yAxis.ticks(5));
    
    svg.append("g")
        .append("text")
        .attr("y", -10)
        .style("text-anchor", "end")
        .text("Price (TWD)");
   
    svg.append("g")
        .attr("class", "crosshair")
        .call(crosshair)
  }
    
function drawBar(data, priceData) {
    svg.selectAll("*").remove();
    monthEarnDataArr = data;
    data.reverse();
    x.domain(priceData.map(candlestick.accessor().d));
    x2.domain(d3.extent(data, function(d) { 
    return d.date; }));
    var minData = d3.min(data, function(d){return d.earn}) / 10;
//    console.log(minData)
    
    y2.domain([d3.min(data, function(d) {return d.earn - minData;}), d3.max(data, function(d) {return d.earn + minData;})]);
//    y2.domain(d3.extent(data, function(d) {return d.price;}))
    xScale.domain(data.map(function(d){return d.date;}));
    
    
    var chart = svg.selectAll("bar")
        .data(data)
        .enter().append("g");
    chart.append("rect")
        .attr("class", "bar")
        .attr("x", function(d){return x(d.date) - xScale.bandwidth() / 2;})
        .attr("height", function(d){return height - y2(d.earn);})
        .attr("y", function(d){return y2(d.earn);})
        .attr("width", xScale.bandwidth());
    
      // Add the X Axis
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
//        .call(xAxis.ticks(20).tickFormat(d3.timeFormat("%Y%m")).tickSize(-height, -height));
    
        .call(d3.axisBottom(x).ticks(20).tickFormat(d3.timeFormat("%Y%m")).tickSize(-height, -height));    
    
    // Add the Y2 Axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ",0)")
        .call(d3.axisRight(y2).ticks(5).tickSize(-width, -width));
    svg.append("g")
        .attr("transform", "translate(" + (width + 40) + ",0)")
        .append("text")
        .attr("y", -10)
        .style("text-anchor", "end")
        .text("(百萬元)");
}

// 畫月營收年增率Bar條
function drawBar2(data, priceData) {
    data.reverse();
    monthEarnDataArr = data;
//    console.log(data);
    x2.domain(d3.extent(data, function(d) { 
    return d.date; }));
    // 
    y2.domain([-50, 75]);
//    y2.domain(d3.extent(data, function(d){ return d.revenue;})).nice();
    x.domain(priceData.map(candlestick.accessor().d));
    xScale.domain(data.map(function(d){return d.date;}));
    
    svg.append("g")
        .attr("class", "x axis")
        .append("line")
        .attr("y1", y2(0))
        .attr("y2", y2(0))
        .attr("x2", width);
      // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(20).tickFormat(d3.timeFormat("%Y%m")).tickSize(-height, -height));
    
    
    // Add the Y2 Axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ",0)")
        .call(d3.axisRight(y2).ticks(5).tickSize(-width, -width));
    
    svg.append("g")
        .attr("transform", "translate(" + (width + 20) + ",0)")
        .append("text")
        .attr("y", -10)
        .style("text-anchor", "end")
        .text("(%)");
    

    var chart = svg.selectAll("bar")
        .data(data)
        .enter().append("g");
    
    chart.append("rect")
        .attr("class", "bar")
        .attr("x", function(d){return x(d.date) - xScale.bandwidth() / 2;})
        .attr("height", function(d){return Math.abs(y2(d.revenue) - y2(0));})
        .attr("y", function(d){
            if (d.revenue > 0) {
                return y2(d.revenue);
            } else {
                return y2(0);
            }
        })
        .attr("width", xScale.bandwidth());

}
   


function loadJSON(earnData, priceData) {
    svg.selectAll("*").remove();  
    loadType = "monthRate";
    d3.json(earnData ,function(error, data) {
        if (error) throw error;
        var jsonData = data["Data"];
        var newEarnData = jsonData.map(function(d) {
            return {
                date: parseTime(d[0]),
                earn: +(Math.round(d[5]/ 1000))
            };
        });

        d3.json(priceData , function(error, priceData) {
            var jsonData = priceData["Data"];
    //    console.log(jsonData);

            var newData = jsonData.map(function(d) {
                return {
                    date: parseTime(d[0]),
                    price: +d[6]
                };
            });
            jsonData = jsonData.reverse();

            jsonData = jsonData.map(function(d) {
            return {
                date: parseTime(d[0]),
                open: +d[3],
                high: +d[4],
                low: +d[5],
                close: +d[6],
                volume: +d[10]
                }                          
            })
    //        monthEarnDataArr = newData;
    //    console.log(newData);
    //    drawBar(newData);
            drawBar(newEarnData, jsonData);
            draw(newData, jsonData);

        }) 
    });

  
   
    

}
    
function loadRateJSON(earnData, priceData) {
    svg.selectAll("*").remove();
    loadType = "yearRate";
   d3.json(earnData ,function(error, data) {
    if (error) throw error;
    var jsonData = data["Data"];
    var newEarnData = jsonData.map(function(d) {
        return {
            date: parseTime(d[0]),
            earn: +d[5],
            revenue: +d[7]
        };
    });

    d3.json(priceData , function(error, priceData) {
//        console.log(data);
        var jsonData = priceData["Data"];
//    console.log(jsonData);
        
        var newData = jsonData.map(function(d) {
            return {
                date: parseTime(d[0]),
                price: +d[6]
            };
        });
        jsonData = jsonData.reverse();
    
        jsonData = jsonData.map(function(d) {
        return {
            date: parseTime(d[0]),
            open: +d[3],
            high: +d[4],
            low: +d[5],
            close: +d[6],
            volume: +d[10]
            }                          
        })
//    console.log(newData);
//    drawBar(newData);
//        drawBar2(newData2, jsonData);
         drawBar2(newEarnData, jsonData);
        draw(newData, jsonData);
    
        }) 
    }); 
    

}
    
 function move(coords, index) {    
    var i;
//        console.log(coords.x)
//        console.log("coord: " + coords.x + "date: " + priceDataArr[0].date);
    console.log()
//        console.log(coords.x === monthEarnDataArr[0].date)
        for (i = 0; i < monthEarnDataArr.length; i ++) {
//            console.log(monthEarnDataArr[i].date);
            
            if ((d3.timeFormat("%Y/%m/%d")(coords.x) === d3.timeFormat("%Y/%m/%d")(priceDataArr[i].date))) {
                console.log(coords.y);
                if (loadType == "monthRate") {
                    svgText.text(d3.timeFormat("%Y/%m")(coords.x) + " 股價：" + priceDataArr[i].price + " 月營收：" + monthEarnDataArr[i].earn + " (百萬)"); 
                } else {
                    svgText.text(d3.timeFormat("%Y/%m")(coords.x) + " 股價：" + priceDataArr[i].price + " 月營收年增率：" + monthEarnDataArr[i].revenue + "(%)"); 
                }
                
                
                             
            }
        }

}   


    