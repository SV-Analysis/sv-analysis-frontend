/**
 * Created by qshen on 16/6/2017.
 */
import {Unit} from "../../../src/lib/MultiExploration/BasicElements.js";
import * as d3 from "d3";

let MultiExploration = function(el, colorMap){
  this.el = el;
  this.columNumber = 35;
  this.colorMap = colorMap;
  this.width = el.clientWidth;
  this.height = 400;
  this.svg = d3.select(this.el).append('svg').attr('width', this.width);
  this.svg.style('border-width', '1px').style('border-style','solid').style('border-color','#dfe6ec').style('border-radius', '3px');
  this.clipContainer = this.svg.append('g');
  this.tableMargin = {'top':5,'left':5,'right':5,'bottom':5};
  this.containerWidth = this.width - this.tableMargin.left - this.tableMargin.right;
  this.containerHeight = this.height - this.tableMargin.top - this.tableMargin.bottom;
  this.container = this.svg.append('g').attr('transform', 'translate(' + this.tableMargin.left + ',' + this.tableMargin.top + ')');
  this.unitConfig = {
    left: 2,
    right: 2,
    top: 1,
    bottom: 1,
    headHeight: 25,
    height: 22,

    widths: [],
    lefts: [],
    widthScale: [],
    domains: []
  };
  // Generate render attributes
  this.unitConfig.renderTop = this.unitConfig.top + 3;
  this.unitConfig.renderRight = this.unitConfig.right + 10;
  this.unitConfig.renderLeft = this.unitConfig.left;
  this.unitConfig.renderBottom = this.unitConfig.bottom + 3;
  this.unitConfig.renderHeight = this.unitConfig.height - this.unitConfig.renderTop - this.unitConfig.renderBottom;
  this.attrUnits = [];
};

MultiExploration.prototype.updateBackground = function(){
  this.backgroundContainer = this.bodyContainer.append('g').attr('class', 'backgroundContainer')
  let unitConfig = this.unitConfig;
  let backRows = [];
  let backUnits = [];
  for(var i = 0, ilen = this.columNumber; i < ilen; i++){
    let _row = [];
    this.attrs.forEach(function(attr, j){
      _row.push(new Unit(i + '_' + j + '_' + attr, attr, attr, i, j, 'background'));
    });
    backRows.push(_row);
    backUnits = backUnits.concat(_row)
  };


  let unitContainers = this.bodyContainer.selectAll('.backgroundUnit')
    .data(backUnits, function(d){
      return d.id
    });

  // UPDATE old elements present in new data.
  unitContainers.each(function(d){
    let yIndex = d['yIndex'];
    let xIndex = d['xIndex'];
    let left = unitConfig.lefts[yIndex];
    let _width = unitConfig.widths[yIndex] - unitConfig.left - unitConfig.right;
    let _height = unitConfig.height - unitConfig.top - unitConfig.bottom;
    let value = d['value'];

    let unitContainer = d3.select(this);

    unitContainer.selectAll('.unitBackground')
      .transition(t)
      .attr('width', _width).attr('height', _height)
      .attr('fill', function(){
        return xIndex % 2 != 0? '#eee': '#fff';
      })
      .attr('opacity', 0.8)
      .attr('x', unitConfig.left)
      .attr('y', unitConfig.top);

  });

  // ENTER new elements present in new data.
  let newUnitContainers = unitContainers.enter().append('g').attr('class', 'backgroundUnit')
    .attr('clip-path', d=>{
      let clip_id = 'clips_'+ d.attr;
      return 'url(#' + clip_id + ')'
    });

  newUnitContainers.each(function(d){
    let yIndex = d['yIndex'];
    let xIndex = d['xIndex'];
    let left = unitConfig.lefts[yIndex];
    let _width = unitConfig.widths[yIndex] - unitConfig.left - unitConfig.right;
    let _height = unitConfig.height - unitConfig.top - unitConfig.bottom;

    let value = d['value'];
    let unitContainer = d3.select(this);
    unitContainer.attr('transform', 'translate('+ left + ',' + (xIndex * unitConfig.height)+ ')');
    unitContainer.append('rect').attr('class','unitBackground')
      .attr('width', _width).attr('height', _height)
      .attr('fill', function(){
        return xIndex % 2 != 0? '#eee': '#fff';
      })
      .attr('opacity', 0.8)
      .attr('x', unitConfig.left)
      .attr('y', unitConfig.top);


  });

  // Remove old elements as needed.
  let exitUnitContainers = unitContainers.exit();
  exitUnitContainers.remove();


  // let brContainers = this.backgroundContainer.selectAll('.backgroundRow').data(backRows);
  //
  // brContainers.enter().append('g').attr('transform', (d, i)=>{
  //   return 'translate(0,' + (i * this.unitConfig.height) + ')';
  // });
  //
  // brContainers.each(function(d){
  //   d3.select(this).selectAll('.backUnit').data(d).enter().append('rect').attr('class', 'backUnit')
  // });
};

MultiExploration.prototype.initBodyRender = function(){
  this.container.selectAll('.bodyContainer').remove();
  this.bodyContainer = this.container.append('g').attr('class', 'bodyContainer')
    .attr('transform','translate(0,' + (this.unitConfig.headHeight) + ')');


  let clips = this.clipContainer.selectAll('clipPath')
    .data(this.attrs, attr=>{
      return attr;
    });

  clips.enter()
    .append('clipPath')
    .attr('id', function(d){
      return 'clips_'+ d;
    })
    .append('rect')
    .attr('width',(d, i)=>{
      return this.unitConfig.widths[i] - this.unitConfig.left;
    })
    .attr('height', this.unitConfig['height']);
  this.updateBackground();
};


MultiExploration.prototype.setAttrs = function(attrs){
  this.attrs = attrs;
  this.unitConfig.attr2Index = {};
  this.attrUnits = [];
  for(let i = 0, ilen = this.attrs.length; i < ilen; i++){
    this.attrUnits.push(new Unit(this.attrs[i], this.attrs[i], this.attrs[i],0, i));
    this.unitConfig.attr2Index[this.attrs[i]] = i;
  }
  if(this.widthsRatio == undefined || this.widthRatios.length == 0){
    this.widthRatios = [];
    for(let i = 0, ilen = this.attrs.length; i < ilen; i++){
      let attr = this.attrs[i];
      if(attr == 'id' || attr == 'city'){
        this.widthRatios.push(0.5 / (ilen - 1));
      }else{
        this.widthRatios.push(1 / (ilen - 1));
      }

    }
  }
  this.updateRenderHead();
  this.initBodyRender();
};

MultiExploration.prototype.update = function(dataList){
// Hack
  let vectors = processStreets(dataList, this.attrs);
  this.bodyData = vectors;
  let largestValue = -1;
  this.attrs.forEach((attr, i)=>{
    let extent = d3.extent(vectors, function(d){
      return d.data[i].value;
    });
    if(attr != 'id' && attr != 'city'){
      largestValue = largestValue < extent[1]? extent[1]: largestValue;
    }
    this.unitConfig.domains[i] = extent;
    let index = this.unitConfig.attr2Index[attr];
    if(attr == 'id') this.unitConfig.widthScale[i] = null;
    else if(attr == 'city') this.unitConfig.widthScale[i] = null;
    else{
      let xscale = d3.scaleLinear().range([0, this.unitConfig.widths[index] - this.unitConfig.renderRight])
        .domain([0 , largestValue]);
      this.unitConfig.widthScale[i] = xscale;
    }
  });
  // let _height = this.bodyData.length * this.unitConfig.height + this.unitConfig.headHeight + this.tableMargin.top + this.tableMargin.bottom;

  let _height = this.columNumber * this.unitConfig.height + this.unitConfig.headHeight + this.tableMargin.top + this.tableMargin.bottom;
  this.updateRenderBody();
  this.svg.attr('height', _height);
};

MultiExploration.prototype.initColumnClips = function(){

}
MultiExploration.prototype.updateRenderBody = function(){

  let _this = this;
  let unitConfig = this.unitConfig;

  // this.container.selectAll('.bodyContainer').remove();
  // this.bodyContainer = this.container.append('g').attr('class', 'bodyContainer')
  //   .attr('transform','translate(0,' + (this.unitConfig.headHeight) + ')');
  let units = [];
  this.bodyData.forEach(function(row){
    units = units.concat(row.data);
  });
  let unitContainers = this.bodyContainer.selectAll('.bodyUnit')
    .data(units, function(d){
      return d.id
    });
  var t = d3.transition()
    .duration(750);


  // UPDATE old elements present in new data.
  unitContainers.each(function(d){
    let yIndex = d['yIndex'];
    let xIndex = d['xIndex'];
    let left = unitConfig.lefts[yIndex];
    let _width = unitConfig.widths[yIndex] - unitConfig.left - unitConfig.right;
    let _height = unitConfig.height - unitConfig.top - unitConfig.bottom;
    let value = d['value'];

    let unitContainer = d3.select(this);
    unitContainer
      .transition(t)
      .attr('transform', 'translate('+ left + ',' + (xIndex * unitConfig.height)+ ')');

    // unitContainer.selectAll('.unitBackground')
    //   .transition(t)
    //   .attr('width', _width).attr('height', _height)
    //   .attr('fill', function(){
    //     return xIndex % 2 != 0? '#eee': '#fff';
    //   })
    //   .attr('opacity', 0.8)
    //   .attr('x', unitConfig.left)
    //   .attr('y', unitConfig.top);

    if(d.attr == 'id' || d.attr == 'city') {
      // id inforamtion
    }else{
      unitContainer.select('.value')
        .attr('width', d=>{
          let _w = unitConfig.widthScale[yIndex](value);
          return _w;
        })
        .attr('height', unitConfig.renderHeight)
        .attr('fill', ()=>{
          // '#5FB2E8'
          return _this.colorMap[d.attr]
        })
        .attr('opacity', 0.8)
        .attr('x', unitConfig.renderLeft)
        .attr('y', unitConfig.renderTop)
    }

  });

  // ENTER new elements present in new data.
  let newUnitContainers = unitContainers.enter().append('g').attr('class', 'bodyUnit')
    .attr('clip-path', d=>{
      let clip_id = 'clips_'+ d.attr;
      return 'url(#' + clip_id + ')'
    });

  newUnitContainers.each(function(d){
    let yIndex = d['yIndex'];
    let xIndex = d['xIndex'];
    let left = unitConfig.lefts[yIndex];
    let _width = unitConfig.widths[yIndex] - unitConfig.left - unitConfig.right;
    let _height = unitConfig.height - unitConfig.top - unitConfig.bottom;

    let value = d['value'];
    let unitContainer = d3.select(this);
    unitContainer.attr('transform', 'translate('+ left + ',' + (xIndex * unitConfig.height)+ ')');
    // unitContainer.append('rect').attr('class','unitBackground')
    //   .attr('width', _width).attr('height', _height)
    //   .attr('fill', function(){
    //     return xIndex % 2 != 0? '#eee': '#fff';
    //   })
    //   .attr('opacity', 0.8)
    //   .attr('x', unitConfig.left)
    //   .attr('y', unitConfig.top);

    if(d.attr == 'id' || d.attr == 'city') {
      let text = unitContainer.append('text').text(value);
      let conf = text.node().getBBox();
      text.attr('x', unitConfig.renderLeft)
        .attr('y', (conf.height + unitConfig.height) / 2 - 1 )

    }else{
      unitContainer.append('rect').attr('class', 'value')
        .attr('width', d=>{
          let _w = unitConfig.widthScale[yIndex](value);
          return _w;
        })
        .attr('height', unitConfig.renderHeight)
        .attr('fill', ()=>{
          // '#5FB2E8'
          return _this.colorMap[d.attr]
        })
        .attr('opacity', 0.8)
        .attr('x', unitConfig.renderLeft)
        .attr('y', unitConfig.renderTop)
    }
  });

  // Remove old elements as needed.
  let exitUnitContainers = unitContainers.exit();
  exitUnitContainers.remove();

};



MultiExploration.prototype.updateRenderHead = function(){
  // neet set attrs
  let unitConfig = this.unitConfig;
  let _this = this;
  this.unitConfig.widths = [];
  let left = 0;
  this.widthRatios.forEach((d)=>{
    let _width = d * this.containerWidth;
    this.unitConfig.widths.push(_width);
    this.unitConfig.lefts.push(left);
    left +=_width;
  });

  this.container.selectAll('.rowContainer').remove();
  this.attrsRowContainer = this.container.append('g').attr('class', 'rowContainer');
  this.attrContainers = this.attrsRowContainer.selectAll('.attrContainer')
    .data(this.attrUnits)
    .enter()
    .append('g')
    .attr('class', 'attrContainer');

  this.attrContainers.each(function(d){
    let yIndex = d['yIndex'];
    let left = unitConfig.lefts[yIndex];
    let _width = unitConfig.widths[yIndex] - unitConfig.left - unitConfig.right;
    let _height = unitConfig.headHeight - unitConfig.top - unitConfig.bottom;
    let unitContainer = d3.select(this);
    unitContainer.attr('transform', 'translate('+ left + ',0)');
    unitContainer.append('rect')
      .attr('width', _width).attr('height', _height)
      .attr('fill', '#eee').attr('opacity', 0.8)
      .attr('x', unitConfig.left)
      .attr('y', unitConfig.top)
      .on('click', function(){
        _this.clickOnAttr(d.value)
      });
    unitContainer.append('text')
      .style('font-weight', 'bold')
      .style('font-family', "'PT Sans',Tahoma")
      .text(d.value).attr('y', 20).attr('x', unitConfig.left)
  });
};
MultiExploration.prototype.clickOnAttr = function(attr){
  this.sortByAttr(attr);
  this.updateRenderBody();
};
MultiExploration.prototype.sortByAttr = function(attr){
  let index = this.unitConfig.attr2Index[attr];
  this.bodyData.sort(function(row1, row2){
    return (row2.data[index].value  - row1.data[index].value ) > 0;
  });
  this.freshIndex();
};

MultiExploration.prototype.removeData = function(d){

};

MultiExploration.prototype.freshIndex = function(){
  this.bodyData.forEach(function(row, y){
    row.data.forEach(function(unit, x){
      unit.updateIndex(x, y);
    })
  })
};

function processStreets(streets, attrs){
  let vectors = [];
  streets.forEach((street, rIndex)=>{

    let attr2Value = street.record == undefined ? street.statistics: street.record.statistics;
    let _unit = {};
    let unitArray = [];
    let streetId = null;
    attrs.forEach(function(attr, cIndex){
      let value = attr == 'id'? street.record.id:
        attr == 'city'? street.city: attr2Value[attr];
      if(attr == 'id') streetId = value;
      _unit[attr] = value;
      let id = streetId + '_' + attr
      unitArray.push(new Unit(id, attr, value, rIndex, cIndex, 'data'));
    });
    vectors.push({'id': streetId, data: unitArray, raw: street});
  });
  return vectors;
};
export default MultiExploration;
