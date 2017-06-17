/**
 * Created by qshen on 16/6/2017.
 */
import {Unit} from "../../../src/lib/MultiExploration/BasicElements.js";
import * as d3 from "d3";


let MultiExploration = function(el, colorMap){
  this.el = el;
  this.colorMap = colorMap;
  this.width = el.clientWidth;
  this.height = 400;
  this.svg = d3.select(this.el).append('svg').attr('width', this.width);
  this.svg.style('border-width', '1px').style('border-style','solid').style('border-color','#dfe6ec').style('border-radius', '3px');

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

MultiExploration.prototype.setAttrs = function(attrs){
  this.attrs = attrs;
  this.unitConfig.attr2Index = {};
  this.attrUnits = [];
  for(let i = 0, ilen = this.attrs.length; i < ilen; i++){
    this.attrUnits.push(new Unit(this.attrs[i], this.attrs[i],0, i));
    this.unitConfig.attr2Index[this.attrs[i]] = i;
  }
  if(this.widthsRatio == undefined || this.widthRatios.length == 0){
    this.widthRatios = [];
    for(let i = 0, ilen = this.attrs.length; i < ilen; i++){
      this.widthRatios.push(1 / ilen);
    }
  }

  this.updateRenderHead();
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
    if(attr!= 'id'){
      largestValue = largestValue < extent[1]? extent[1]: largestValue;
    }
    this.unitConfig.domains[i] = extent;
    let index = this.unitConfig.attr2Index[attr];
    if(attr == 'id') this.unitConfig.widthScale[i] = null;
    else{
      let xscale = d3.scaleLinear().range([0, this.unitConfig.widths[index] - this.unitConfig.renderRight])
        .domain([0 , largestValue]);
      this.unitConfig.widthScale[i] = xscale;
    }
  });
  console.log('unitConfig', this.unitConfig);
  console.log('vectors', vectors);
  let _height = this.bodyData.length * this.unitConfig.height + this.unitConfig.headHeight + this.tableMargin.top + this.tableMargin.bottom;
  this.updateRenderBody();
  this.svg.attr('height', _height);
};

MultiExploration.prototype.updateRenderBody = function(){
  let _this = this;
  let unitConfig = this.unitConfig;
  this.container.selectAll('.bodyContainer').remove();
  this.bodyContainer = this.container.append('g').attr('class', 'bodyContainer')
    .attr('transform','translate(0,' + (this.unitConfig.headHeight) + ')');

  this.rowContainers = this.bodyContainer.selectAll('.rowContainer')
    .data(this.bodyData)
    .enter()
    .append('g').attr('class', 'rowContainer');

  this.rowContainers.each(function(row){
    let rowContainer = d3.select(this);
    let unitContainers = rowContainer.selectAll('.bodyUnit').data(row.data).enter().append('g').attr('class', 'bodyUnit');
    unitContainers.each(function(d){

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

      if(d.attr == 'id') {
        let text = unitContainer.append('text').text(value)
        // console.log('text', unitConfig.renderTop, text.node().getBBox())
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
    })
  })
};





MultiExploration.prototype.updateRenderHead = function(){
  // neet set attrs
  let unitConfig = this.unitConfig;
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
      .attr('y', unitConfig.top);
    unitContainer.append('text')
      .style('font-weight', 'bold')
      .style('font-family', "'PT Sans',Tahoma")
      .text(d.value).attr('y', 20).attr('x', unitConfig.left)
  });
};

MultiExploration.prototype.addData = function(data){

};

MultiExploration.prototype.removeData = function(d){

};


function processStreets(streets, attrs){
  console.log('data', streets);
  let vectors = [];
  streets.forEach((street, rIndex)=>{
    let attr2Value = street.record.statistics;
    let _unit = {};
    let unitArray = [];
    let streetId = null;
    attrs.forEach(function(attr, cIndex){
      let value = attr == 'id'? street.record.id:
        attr == 'region'? street.city: attr2Value[attr];
      if(attr == 'id') streetId = value;
      _unit[attr] = value;
      unitArray.push(new Unit(attr, value, rIndex, cIndex, 'data'));
    });
    vectors.push({'id': streetId, data: unitArray, raw: street});
  });
  return vectors;
};
export default MultiExploration;
