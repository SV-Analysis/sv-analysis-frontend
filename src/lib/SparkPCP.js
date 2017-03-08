/**
 * Created by qshen on 3/3/2017.
 */

import * as d3 from 'd3'

let SparkPCP = function(el, attrs, data, featureColor ){
  console.log('data', data);
  this.$el = el;
  d3.select(this.$el).selectAll('g').remove();
  this.attrs = attrs;
  this.data = data; // Image list
  this.svFeatures2Color = featureColor;
  this.isRendered = false;
  this.isChartDisplayed = false;
  this.pcpColor = ['#fdae61', '#66c2a5']
  this.id2Data = {};
};

SparkPCP.prototype.initRender = function(){
  let _this = this;
  this.width = this.$el.clientWidth;
  this.height = this.$el.clientHeight;
  this.margin = {top: 40, right: this.width / 5, bottom: 40, left: 100};
  this.pcpRegion = {
    areaHeight: 40,
    pcpWidth: (this.width - this.margin.right - this.margin.left) / 2,
    pcpHeight: this.height - this.margin.bottom - this.margin.top,
    overallHeight: this.height,
    overallWidth: this.width
  };

  this.x = d3.scalePoint().range([0, this.pcpRegion.pcpWidth]);
  this.x.domain(this.attrs);

  this.y = {};
  this.attrs.forEach(function(attr){
    _this.y[attr] = d3.scaleLinear().domain([0, _this.largestRatio]).range([_this.height - _this.margin.bottom,  _this.margin.top]);
  });

  this.svgContainer = d3.select(this.$el);

  this.pcpContainer = this.svgContainer
    .append("g")
    .attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

  this.dimensionContainer = this.pcpContainer.selectAll(".dimension")
    .data(this.attrs)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) {
      return "translate(" + _this.x(d) + ")";
    });
};

SparkPCP.prototype.initData = function(){
  let _this = this;
  this.data.forEach(function(d, i){
    d.forEach(function(e, j){
      e['group'] = i;
    })
  });
  this.imageList = this.data[0].concat(this.data[1]);
  let largestRatio = -1;
  this.imageList.forEach(function(d){
    let ratio = d['max_attr']['value'] / 100;
    largestRatio = largestRatio < ratio ? ratio : largestRatio
  });
  this.largestRatio = largestRatio;

  // ratio bar data
  let ratioBarData = {};
  for(var i = 0, ilen = this.attrs.length; i < ilen; i++){
    ratioBarData[this.attrs[i]] = [];
    for(var j = 0; j < 20; j++){
      ratioBarData[this.attrs[i]][j] = 0
    }
  }
  let largestIndex = 0;
  for(var i = 0, ilen = this.imageList.length; i < ilen; i++){
    let imageObj = this.imageList[i];
    this.attrs.forEach(function(attr){
      let value = parseInt(parseInt(imageObj[attr]) / 5);
      if(largestIndex < value){
        largestIndex = value;
      }
      ratioBarData[attr][value] += 1;
    })
  }
  let imageNumber = this.imageList.length;

  largestIndex = 20;
  this.attrs.forEach(function(attr){
    for(var i = 0, ilen = ratioBarData[attr].length; i < ilen; i++){
      let ratio = ratioBarData[attr][i] / imageNumber;
      ratioBarData[attr][i] = ratio;

    }
  });

  this.ratioBarData = ratioBarData;
  this.largestIndex = largestIndex;
  let areaData = [];
  for(var i = 0, ilen = this.data.length; i < ilen; i++){
    let areaObj = {};
    let imgList = this.data[i];
    let largestValue = -1;
    this.attrs.forEach(function(attr){
      areaObj[attr] = [];
      imgList.forEach(function(img){
        areaObj[attr].push(img[attr])
        largestValue = largestValue < img[attr]? img[attr]: largestValue;
      })
      areaObj[attr]['largest'] = largestValue;
    });
    areaData.push(areaObj)
  }
  this.areaData = areaData;
};

SparkPCP.prototype.drawAxis = function(){
  let _this = this;
  let axis = d3.axisLeft();
  axis.ticks(2);

  this.dimensionContainer.append("g")
    .attr("class", "axis")
    .each(function(d) { d3.select(this).call(axis.scale(_this.y[d])); })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
};

SparkPCP.prototype.drawPCPBars = function(){
  let _this = this;
  let barHeight = (this.height - 60) / 20;
  let largestIndex = this.largestIndex;
  let ratioBarData = this.ratioBarData;

  this.dimensionContainer.each(function(d){
    let barContainers = d3.select(this).append('g');
    let dataArr = ratioBarData[d];

    barContainers.selectAll('.rationbar')
      .data(dataArr)
      .enter()
      .append('rect').attr('class', 'rationbar')
      .attr('x', (d, i) => - d * 50 / 2)
      .attr('y', (r, i)=> {
        return _this.y[d](i / largestIndex) - barHeight})
      .attr('fill', 'steelblue')
      .attr('opacity', 0.9)
      .attr('height',barHeight - 1)
      .attr('width', (d, i) => d * 50)
      .on('mouseover', function(ss){
        d3.select(this).attr('opacity', 1)
      })
      .on('mouseout', function(){
        d3.select(this).attr('opacity', 0.9)
      })
  });
};

SparkPCP.prototype.drawPCPLines = function(){
  let _this = this;
  let line = d3.line();

  var lines = this.pcpContainer
    .attr("class", "background")
    .selectAll("path")
    .data(this.imageList)
    .enter().append("path")
    .attr("d", path)
    .attr('class', 'parallel-path')
    .attr('stroke', function(d){
      return _this.pcpColor[d['group']]
    })
    .attr('fill', 'none')
    .attr('opacity', '0.05');
  lines.each(function(d){
    let iid = d['index']
    if(_this.id2Data[iid] == undefined){
      _this.id2Data[iid] = {}
    }
    _this.id2Data[iid]['data'] = d;
    _this.id2Data[iid]['iel'] = this;
  })

  function position(d) {
    return _this.x(d);
  }
  function path(d) {
    var _arrs = _this.attrs.map(function(p){
      return [position(p), _this.y[p](d[p] / 100)];
    })
    return line(_arrs);
  }
};

SparkPCP.prototype.onSelectedImages = function(selectedImages){
  if(selectedImages['sign'] == true){
    this.highlightSelected(selectedImages);
  }else if(selectedImages['sign'] == false){
    this.removeHighlightSelected(selectedImages);
  }
};

SparkPCP.prototype.highlightSelected = function(selectedImages){
  let _this = this;
  let iids = selectedImages['iids'];
  iids.forEach(function(iid){
    if(_this.id2Data[iid]!= undefined){
      d3.select(_this.id2Data[iid]['iel']).attr('stroke-width', 2).attr('opacity', '1')
    }
  })
};
SparkPCP.prototype.removeHighlightSelected = function(selectedImages){
  let _this = this;
  let iids = selectedImages['iids'];
  iids.forEach(function(iid){
    if(_this.id2Data[iid]!= undefined){
      d3.select(_this.id2Data[iid]['iel']).attr('stroke-width', 1).attr('opacity', '0.05')
    }
  })
};
SparkPCP.prototype.drawLineArea = function(){
  let _this = this;
  let areaChartWidth = (this.pcpRegion.pcpWidth) / 6;
  let areaChartHeight = this.margin.top * 2 / 3;

  let lineAreaContainer = this.dimensionContainer.append('g');

  let areax = d3.scaleLinear().range([0, areaChartWidth]);//.domain([0, 600])
  let areay = d3.scaleLinear().range([areaChartHeight, 0]); //domain([0, 100]).

  let areaxs = [];
  let areays = [];
  let areaRenders = [];
  for(var i = 0, ilen = this.areaData.length; i < ilen; i++){
    areaxs[i] = {};
    areays[i] = {};
    areaRenders[i] = {};
    this.attrs.forEach(function(attr){
      let _areax = d3.scaleLinear().range([0, areaChartWidth]).domain([0, _this.areaData[i][attr].length]);
      let _areay = d3.scaleLinear().range([areaChartHeight, 0]).domain([0, _this.areaData[i][attr].largest]);//_this.areaData[i][attr].largest]
      areaRenders[i][attr] = d3.area()
        .x(function(d, j) {
          return _areax(j);
        })
        .y0(areaChartHeight)
        .y1(function(d, j) {
          return _areay(d);
        });
    });
  }


  lineAreaContainer.each(function(attr){
    let areaPairContainers = d3.select(this).selectAll('.areaContainer')
      .data(_this.areaData)
      .enter()
      .append('g')
      .attr('class', 'areaContainer')
      .attr('transform', function(d, i){
        if(i == 0){
          return "translate(" + (-areaChartWidth / 2) + "," + (_this.margin.top * 1 / 3 - 5) + ")"
        }else{
          return "translate(" + (-areaChartWidth / 2) + "," + (_this.height - _this.margin.bottom + _this.margin.top * 1 / 3 - 5) + ")"
        }
      });

    // areaPairContainers
    //   .append('rect').attr('width', areaChartWidth)
    //   .attr('height', areaChartHeight)
    //   .attr('stroke', 'steelblue')
    //   .attr('fill', 'none')

    areaPairContainers.append("path")
      .attr("class", "areachart")
      .attr("d", function(d, i){
        return areaRenders[i][attr](d[attr])
      })
      .attr('fill',function(){
        return _this.svFeatures2Color[attr];
      })
      .attr('fill-opacity', 0.6);


    // areaPairContainers.each(function(d){
    //   d3.select(this).append('path')
    //
    //     .attr("class", "areachart")
    //     .attr("d", area);
    // })
    // areaPairContainers.append('path')
    //   .datum([data])
    //   .attr("class", "area")
    //   .attr("d", area);

  })
};

SparkPCP.prototype.init = function(){

  this.initData();
  this.initRender();
  this.drawAxis();

  this.drawPCPLines();
  this.drawLineArea();
  this.drawPCPBars();
  this.drawRemarkIcon();
};

SparkPCP.prototype.updateDisplay = function(sign){
  if(sign == true){
    this.svgContainer.attr('opacity', 0);
    this.isChartDisplayed = false;
    return
  }else if(sign == false){
    this.svgContainer.attr('opacity', 1);
    return
  }else if(this.isRendered == false){

  }
};

SparkPCP.prototype.drawRemarkIcon = function(){
  let _this = this;

  let remarkPanel = d3.select(this.$el).append('g').attr('class', 'remarkIconContainer')
    .attr('transform', 'translate(' + (this.pcpRegion.pcpWidth  * 7 / 6 + this.margin.left) + ',' + this.margin.top + ')')
  let remarkContainers = remarkPanel.selectAll('.remarkIcon')
    .data(this.attrs)
    .enter()
    .append('g')
    .attr('class', 'remarkIcon')

  remarkContainers.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', function(attr){
      return _this.svFeatures2Color[attr];

    })
    .attr('x', 0)
    .attr('y', function(d, i){return i * 15})
    .attr('opacity', 0.8)

  remarkContainers.append('text')
    .text(function(attr) {return attr})
    .attr('x', 20)
    .attr('y' ,function(d, i){
      return i * 15 + 10;
    })

};

export default SparkPCP
