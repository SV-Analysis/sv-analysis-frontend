/**
 * Created by Qiaomu on 13/6/2017.
 */
import * as d3 from "d3";
import VerticalStackArea from "../../src/lib/VerticalStackArea";
import VerticalPolyline from "../../src/lib/VerticalPolyline";


let featureMap = {
  'green': 'greenery',
  'car': 'vehicle'
};



let SparkPCP = function(el, attrs, data, featureColor){
  this.selectedColor = [{'color': '#df65b0',  'used': false}, {'color': '#2b8cbe', 'used': false}];
  d3.select(this.$el).selectAll('g').remove();

  this.width = el.clientWidth;
  this.height = el.clientHeight;
  this.$el = el;

  this.attrs = attrs;
  this.data = [data[0]['record']['aggregatedImages'],data[1]['record']['aggregatedImages']]; // Image list
  this.barNumber = 40;
  this.svFeatures2Color = featureColor;
  this.isRendered = false;
  this.isChartDisplayed = false;
  this.pcpColor = ['#fdae61', '#66c2a5'];
  this.pcpBarColor = ['#f46d43', '#a6d96a']
  this.id2Data = {};
  this.regionConfig = {'left': 0.2,'middle': 0.6, 'right': 0.2,'middleMargin': 0.1};
  this.margin = {};
  for(let attr in this.regionConfig){
    this.margin[attr] = this.regionConfig[attr] * this.width;
  }
  this.margin['top'] = 20;
  this.margin['bottom'] = 40;
  this.margin['rightLeft'] = this.margin['left'] + this.margin['middle'];
};
SparkPCP.prototype.initData = function(attrs){
  this.leftData = [];
  this.rightData = [];
  this.largestRatio = -1;
  this.barData = [];
  this.data.forEach((data, i)=>{
    let arr = i==0? this.leftData: this.rightData;
    let label = i==0? 'left': 'right';
    let _attrs = i==0? ['left'].concat(this.attrs.slice()): this.attrs.slice().concat(['right'])
    data.forEach((d, j)=>{
      let obj = Object.assign({}, d);
      obj['attrObj'][label] = j / data.length * 100;
      obj['attrArr'] = [];
      arr.push(obj);
      _attrs.forEach((attr, i)=>{

        let currentRatio = obj['attrObj'][attr];
        if(attr != 'left' && attr != 'right'){
          this.largestRatio = this.largestRatio < currentRatio? currentRatio: this.largestRatio;
        }
        obj['attrArr'].push({
          attr: attr,
          value: currentRatio,
          raw: obj
        })
      })
    });

  });
  this.initBarData();

};

SparkPCP.prototype.initBarData = function(){
  let barNumber = this.barNumber;
  let barR = Math.floor(100 / barNumber);
  let features = this.svFeatures2Color['allFeatures'];
  let dataMap = {};
  features.forEach((attr, i)=>{
    let arr1 = [];
    let arr2 = [];
    for(var j = 0; j < barNumber; j++){
      arr1.push(0);
      arr2.push(0);
    }
    dataMap[attr] = [arr1, arr2];
  });
  let maxIndex = 0;

  this.data.forEach((dataList, i)=>{
    dataList.forEach((d, j)=>{
      let attrObj = d.attrObj;
      features.forEach(attr=>{
        let index = Math.floor(attrObj[attr] / barR);
        maxIndex = maxIndex < index? index: maxIndex
        dataMap[attr][i][index] += 1;
      })
    })
  });

  features.forEach((attr)=>{
    let list = dataMap[attr];
    list.forEach((group, index)=>{
      for(var i = 0; i < group.length; i++){
        group[i] = group[i] / this.data[index].length;
      }
    });
  });
  this.maxIndex = maxIndex;
  this.barsData = dataMap;
};

SparkPCP.prototype.initRender = function(){
  this.container = d3.select(this.$el).append('g').attr('class', 'container');
  this.leftAreaContainer = this.container.append('g');
  this.rightAreaContainer = this.container.append('g').attr('transform','translate('+ (this.margin.left + this.margin.middle) + ',0)')
  this.areaWidth = this.margin.left;
  this.initXScale();
};

SparkPCP.prototype.initXScale = function(){
  let middleLeft = this.margin.left;
  let middleRight = this.margin.left + this.margin.middle;
  let middleMargin =this.margin.middleMargin;
  let middleXScale = d3.scalePoint().range([middleLeft + middleMargin, middleRight - middleMargin]).domain(this.attrs);

  this.middleXScale = middleXScale;
  this.middleYScale = d3.scaleLinear().domain([0, this.largestRatio]).range([this.height - this.margin.bottom, this.margin.top]);
  this.leftXScale = function(attr, d){
    return d == undefined? middleLeft: d.raw.scalePoint.x;
  };
  this.rightXScale = function(attr, d){

    return d == undefined? middleRight: d.raw.scalePoint.x + this.margin['rightLeft']

  };
  this.xScale = function(attr, d){
    return attr == 'left' ? this.leftXScale(attr, d):
      attr == 'right'? this.rightXScale(attr, d): this.middleXScale(attr);
  };
  this.leftYScale = function(value, d){
    return d == undefined? 100: d.raw.scalePoint.y;

  };
  this.rightYScale = function(value, attr, d){
    if(d == undefined){

    }
    return d == undefined? 100: d.raw.scalePoint.y;
  };
  this.yScale = function(value, attr, d){
    return attr == 'left'? this.leftYScale(value, d):
      attr =='right'? this.rightYScale(value, attr, d): this.middleYScale(value);
  }
};

SparkPCP.prototype.drawAxis = function(){
  let _this = this;

  this.dimensionContainer = this.container.append('g').attr('class', 'dimensionContainer').selectAll('.dimension')
    .data(this.attrs)
    .enter().append('g').attr('class', 'dimension')
    .attr('transform', (d)=>{
      return 'translate('+this.xScale(d) + ',0)';
    });

  let axis = d3.axisLeft();
  axis.ticks(6);

  let axisContainer = this.dimensionContainer.append("g")
    .attr("class", "axis");
  axisContainer.each(function(d){
    let _container = d3.select(this);
    let t = _container.call(axis.scale(_this.middleYScale));
    let textContainer = _container.append('g').attr('transform', 'translate(0,'+ (_this.height - _this.margin.top) + ')')
    let rectWidth = 50;
    let rectHeight = 20;

    let _rect = textContainer.append('rect')
      .attr('width', rectWidth).attr('height', rectHeight)
      .attr('fill', function(d){
        return _this.svFeatures2Color[d];
      })
      .attr('opacity', 0.5);

    let text = textContainer.append("text")
      .style("text-anchor", "middle")
      .text(function(d){
        let title = featureMap[d] == undefined? d: featureMap[d];
        title = title.charAt(0).toUpperCase() + title.slice(1);
        return title;
      })
      .style('fill', 'black');

    let _box = text.node().getBBox();
    _rect
      .attr('x', _box.x - (rectWidth - _box.width) / 2)
      .attr('y', _box.y - (rectHeight - _box.height) / 2);

    t.selectAll('path').attr('stroke', '#777').attr('stroke-width', '1.3').attr('opacity', 0.8)
  });

};

SparkPCP.prototype.drawPCPLines = function(){
  let _this = this;
  console.log('left', this.leftData);
  this.lineContainers = this.container.append('g').attr('class', 'background')
    .selectAll('.lineContainer')
    .data(this.leftData.concat(this.rightData))
    .enter()
    .append('g').attr('class', 'lineContainer')

  let line = d3.line()
    .x((d, i)=>{
      let _x = this.xScale(d.attr, d);
      return _x;
    })
    .y((d)=>{
      let _y =  this.yScale(d.value, d.attr, d);
      return _y ;
    })
    .curve(d3.curveLinear);

  this.lineContainers.each(function(aggImg){
    let lc = d3.select(this);
    lc.datum(aggImg['attrArr']).append('path').attr('class', 'multiLines').attr('d', line)
      .attr('fill', 'none')
      .attr('stroke-width', 1)
      .attr('opacity', 0.1)
      .attr('stroke', d=>{
        return aggImg['attrObj']['left'] != undefined? _this.selectedColor[0].color: _this.selectedColor[1].color;
      })
  });
};

SparkPCP.prototype.rmHighlight = function(selectId){
  this.lineContainers.each(function(aggImgArr, i){

    // Hack
    let _data = aggImgArr[0].raw;
    if(_data.id == selectId){
      d3.select(this).selectAll('.multiLines')
        .attr('stroke-width', 1)
        .attr('opacity', 0.1)
    }
  });
};
SparkPCP.prototype.highlight = function(selectId){
  this.lineContainers.each(function(aggImgArr, i){
    let _data = aggImgArr[0].raw;
    if(_data.id == selectId){
      d3.select(this).selectAll('.multiLines').attr('opacity', 1).attr('stroke-width', 2)
    }
  });
};


SparkPCP.prototype.drawPCPBars = function(data, container){
  let barsData = this.barsData;
  let height = this.height - this.margin.bottom - this.margin.top;
  let barHeight = height / (this.maxIndex + 1);
  let features = this.svFeatures2Color['allFeatures'];
  let maxValue = d3.max(features, function(attr){
    return d3.max(barsData[attr], function(group){
      return d3.max(group);
    });
  });
  let _this = this;

  let barYScale = d3.scaleLinear().domain([0, this.maxIndex]).range([this.height - this.margin.bottom - barHeight, this.margin.top]);
  let barWidthScale = d3.scaleLinear().domain([0, maxValue]).range([0, 50]);

  let barsContainers = this.dimensionContainer.append('g').attr('class', 'barsContainer');
  barsContainers.each(function(attr){
    let barContainer = d3.select(this).append('g').attr('class', 'barsContainer');
    barContainer.append('g').attr('class', 'left').selectAll('class', 'attrbar')
      .data(_this.barsData[attr][0])
      .enter()
      .append('rect').attr('class', 'attrbar')
      .attr('width', (d)=>{
        return barWidthScale(d);
      })
      .attr('height', barHeight)
      .attr('x', (d)=>{
        return -1 * barWidthScale(d);
      })
      .attr('y', (d, i)=>{
        return barYScale(i);
      })
      .attr('fill', _this.selectedColor[0]['color'])
      .attr('opacity', 0.9)

    barContainer.append('g').attr('class', 'left').selectAll('class', 'attrbar')
      .data(_this.barsData[attr][1])
      .enter()
      .append('rect').attr('class', 'attrbar')
      .attr('width', (d)=>{
        return barWidthScale(d);
      })
      .attr('height', barHeight)
      .attr('x', (d)=>{
        return 0;
      })
      .attr('y', (d, i)=>{
        return barYScale(i);
      })
      .attr('fill', _this.selectedColor[1]['color'])
      .attr('opacity', 0.7)

  });

};

SparkPCP.prototype.drawPCPAreas = function(){
  // this.leftAreaContainer.append('rect').attr('x', 0).attr('y', 0).attr('width', this.margin['left']).attr('height',this.height)
  //   .attr('stroke', '#777')
  //   .attr('stroke-width', 1)
  //   .attr('fill', 'none');
  //
  // this.rightAreaContainer.append('rect').attr('x', 0).attr('y', 0).attr('height', this.height).attr('width', this.margin['right'])
  //   .attr('stroke', '#777')
  //   .attr('stroke-width', 1)
  //   .attr('fill', 'none');

  // let leftAreaData = this.createAreaData(this.leftData);
  // let rightAreaData = this.createAreaData(this.rightData);

  let generalMargin = {'left': 0, 'right': 0, 'top': this.margin.top, 'bottom': this.margin.bottom, 'height': this.height};
  let leftAreaMargin = Object.assign({}, generalMargin, {'width': this.margin.left});
  let rightAreaMargin = Object.assign({}, generalMargin, {'width': this.margin.right});

  let leftArea = new VerticalStackArea(this.leftAreaContainer.nodes()[0], this.leftData, leftAreaMargin, this.svFeatures2Color);
  let rightArea = new VerticalStackArea(this.rightAreaContainer.nodes()[0], this.rightData, rightAreaMargin, this.svFeatures2Color);

  let leftPolyline = new VerticalPolyline(this.leftAreaContainer.nodes()[0], this.leftData, leftAreaMargin, this.selectedColor[0].color);
  let rightPolyline = new VerticalPolyline(this.rightAreaContainer.nodes()[0], this.rightData, rightAreaMargin, this.selectedColor[1].color);

};
// SparkPCP.prototype.createAreaData = function(imgList){
//
//   let featureArrays = [];
//   let attrs = this.attrs;
//   imgList.forEach(function(imgObj, index){
//     let leftSum = 0;
//     for(var i = 0, ilen = attrs.length;i < ilen; i++){
//       if(featureArrays[i] == undefined){
//         featureArrays[i] = [];
//       }
//       let attr = attrs[i];
//       let value = imgObj['attrObj'][attr];
//       featureArrays[i].push({
//         range: [leftSum, leftSum + value],
//         attr: attr,
//         index: index
//       });
//       leftSum += value;
//     }
//   });
//   return featureArrays;
// };

SparkPCP.prototype.init = function(){

  this.initData();
  this.initRender();
  this.drawAxis();
  this.drawPCPAreas();
  this.drawPCPLines();
  this.drawPCPBars();
  // this.drawRemarkIcon();
};


export default SparkPCP
