/**
 * Created by qshen on 12/6/2017.
 */
import * as d3 from "d3"
import * as d3contour from '../../../src/lib/d3-contour'

let DiversityChart = function(el, margin){

};

DiversityChart.prototype.setConfig = function(el, features, config){
  this.el = el;
  let _this = this;
  this.features = features;
  this.config = config;
  this.diversityContainer = el.append('g').attr('class', 'diversity')

  this.config.margin['diversityRegionHeight'] = this.config.margin['height'] / 3;
  this.config.margin['diversityRegionWidth'] = this.config.margin['width'] / 2;
  this.config.margin['diversityRegionMargin'] = 5;


  let diversityRegionWidth = this.config.margin['diversityRegionWidth'];
  let diversityRegionHeight = this.config.margin['diversityRegionHeight'];
  let margin = this.config.margin['diversityRegionMargin'];

  this.diversityContainers = this.diversityContainer.selectAll('.diversityContainers')
    .data(features)
    .enter()
    .append('g')
    .attr('class', 'diversityContainers')
    .attr('transform', function(d, i){
      let _x = i % 2 * diversityRegionWidth;
      let _y = (parseInt(i / 2) * diversityRegionHeight);
      return 'translate('+ _x +',' + _y +')'
    });
  this.diversityContainers.append('rect').attr('width', diversityRegionWidth - margin * 2)
    .attr('x',3)
    .attr('y', 3)
    .attr('height', diversityRegionHeight - margin * 2)
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 0.3)
    .attr('stoke-opacity', 0.3);

  let texts = this.diversityContainers.append('text')
    .attr('font-size', 35)
    .text(function(d){

      if(d == 'green') d = 'Greenery'
      if(d == 'car') d = 'vehicle'
      return d.charAt(0).toUpperCase() + d.slice(1);
    });
  texts.attr('x', function(){
    let _width = d3.select(this).node().getBBox().width;
    return diversityRegionWidth / 2 - _width / 2 - margin;
  })
    .attr('y', function(){
      let _height = d3.select(this).node().getBBox().height;
      return diversityRegionHeight / 2 - _height / 2 + margin + 10;
    })
    .attr('opacity', 0.2)
};
DiversityChart.prototype.getColor = function(id){
  return this.colorScale != undefined? this.colorScale[id]: "red";
};

DiversityChart.prototype.draw = function(dataList){
  let _this = this;
  this.clearRegion();
  console.log('Diversity dataList ', dataList);
  let features = this.features;

  let largestFV = 0;
  let largestDis = 0;
  dataList.forEach(function(item){
    if(item.type == 'adregion'){
      item['dv'] = {};
      item['dv']['standard'] = item['record']['standard'];
      item['dv']['statistics'] = item['record']['statistics'];
      item['dv']['sv'] = item['record']['sv'];
      item['dv']['lv'] = item['record']['lv'];
    }else{
      item['dv'] = {};
      item['dv']['standard'] = item['record']['standard'];
      item['dv']['statistics'] = item['record']['statistics'];
      item['dv']['sv'] = item['record']['sv'];
      item['dv']['lv'] = item['record']['lv'];

    }
    features.forEach(function(attr){
      largestFV = largestFV < item['dv']['statistics'][attr]? item['dv']['statistics'][attr]: largestFV;
      largestDis = largestDis < item['dv']['standard'][attr]? item['dv']['standard'][attr]: largestDis;
    })
  });

  let diversityRegionWidth = this.config.margin['diversityRegionWidth'];
  let diversityRegionHeight = this.config.margin['diversityRegionHeight'];
  let margin = this.config.margin['diversityRegionMargin'];

  this.gap = 20;
  let xScale = d3.scaleLinear()
    .domain([0, largestFV / 100]).range([3, diversityRegionWidth - this.gap]);

  let yScale = d3.scaleLinear().range([diversityRegionHeight - 2 * margin + 3, 3])
    .domain([0 , largestDis]);

  let offScale = d3.scaleLinear().range([0, 15]).domain([0, 0.2])

  let idMap = null;
  this.diversityContainers.each(function(attr, i){
    let diversityPointContainer = d3.select(this).append('g').attr('class','diversityPointContainer');

    let __nodes1 = [];
    let __nodes2 = [];

    dataList.forEach(function(data){

      let dataid = data['cityObj']['id'];
      if(idMap == null){
        idMap = dataid;
      }

      let nodes = data['cityObj']['id'] == idMap ? __nodes1: __nodes2


      nodes.push({
        x: xScale(data['dv']['statistics'][attr] / 100),
        y: yScale(data['dv']['standard'][attr])
      })
    });

    // console.log('nodes', __nodes1, __nodes2)
    // 'hk': '#2b8cbe',
    // 'singapore': '#df65b0',
    let bandwidth = 4;
    let c1 = d3contour.contourDensity()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .size([diversityRegionWidth , diversityRegionHeight])
      .bandwidth(bandwidth)
      (__nodes1);

    let c2 = d3contour.contourDensity()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .size([diversityRegionWidth , diversityRegionHeight])
        .bandwidth(bandwidth)
        (__nodes2);

    diversityPointContainer.append('g')
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .selectAll("path")
      .data(c2)
      .enter().append("path")
      .attr("fill", '#df65b0')
      .attr("d", d3.geoPath())
      .attr('opacity', 0.15)

      diversityPointContainer.append('g')
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .selectAll("path")
      .data(c1)
      .enter().append("path")
      .attr("fill", '#2b8cbe')
      .attr("d", d3.geoPath())
      .attr('opacity', 0.15);
    let pointsContainers = diversityPointContainer.selectAll('.diversityCombination')
      .data(dataList)
      .enter()
      .append('g').attr('class', 'diversityCombination')
      .attr('transform', function(data, i){
        let _x = xScale(data['dv']['statistics'][attr] / 100);
        let _y = yScale(data['dv']['standard'][attr]);
        // let _x = __nodes[i]['x'];
        // let _y = __nodes[i]['y'];
        return 'translate('+ _x +','+ _y +')';
      });

    // let lines = pointsContainers.append('line')
    //   .attr('x1', function(data){
    //     let gapValue = offScale((data['dv']['statistics'][attr] - data['dv']['sv'][attr]) / 100);
    //     return -gapValue;
    //   })
    //   .attr('x2', function(data){
    //     let gapValue = offScale((data['dv']['lv'][attr] - data['dv']['statistics'][attr]) / 100);
    //     return gapValue;
    //   }).attr('class', d=> d['point_id'])
    //
    //   .attr('stroke', function(d){ return _this.colorScale[d['cityObj']['id']]}).attr('stroke-width', 1)
    //   .on('click', function(d){
    //     let renders = d['render'];
    //     renders.forEach(function(e){
    //       d3.select(e).attr('stroke', 'red').attr('stroke-width', 2)
    //         .attr('fill', 'red').attr('fill-opacity', 0.5)
    //         .attr('r',4)
    //
    //       e.parentNode.appendChild(e);
    //       e.parentNode.parentNode.appendChild(e.parentNode);
    //
    //     });
    //   });
    //
    // lines.each(function(d){
    //   if(d['render'] == undefined){
    //     d['render'] = []
    //   }
    //   d['render'].push(this)
    // })

    // let circles = pointsContainers.append('circle')
    //   .attr('stroke-width', 1)
    //   .on('click', function(d){
    //     let renders = d['render'];
    //     renders.forEach(function(e){
    //       d3.select(e).attr('stroke', 'red').attr('stroke-width', 2)
    //         .attr('fill', 'red').attr('fill-opacity', 0.9)
    //         .attr('r',4);
    //       e.parentNode.appendChild(e);
    //       e.parentNode.parentNode.appendChild(e.parentNode);
    //
    //     });
    //   })
    //   .attr('class', d => d['point_id'])
    //   .attr('r',2)
    //   .attr('fill',function(d){
    //     return "red";
    //     return _this.getColor(d['cityObj']['id'])
    //   })
    //   .attr('fill-opacity', '0.5')
    //   .attr('stroke', function(d){
    //     return _this.getColor(d['cityObj']['id'])
    //   });
    //
    // circles.each(function(d){
    //   if(d['render'] == undefined){
    //     d['render'] = []
    //   }
    //   d['render'].push(this)
    // });


    if(i >= 4){
      let regionXAxis = d3.axisBottom()
        .ticks(5);

      let axisContainer = diversityPointContainer.append('g').attr('class', 'xdimension')
        .attr("transform", function (d) {
          return "translate(" + 0 + ',' + (diversityRegionHeight - margin* 2 + 3) + ")"
        });

      axisContainer.append("g")
        .attr("class", "diversity-axis")
        .each(function (d) {
          let ct = d3.select(this)
            .call(regionXAxis.scale(xScale));
          ct.selectAll('path').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('line').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('text').attr('fill', '#777')
        });
    }


    if(i % 2 == 0){
      let regionYAxis = d3.axisLeft()
        .ticks(3)
        .tickSize(2);

      let axisContainer = diversityPointContainer.append('g').attr('class', 'ydimension')
        .attr("transform", function (d) {
          return "translate(" + 3 + ',' + (0) + ")";
        });

      axisContainer.append("g")
        .attr("class", "axis")
        .each(function (d) {
          let ct = d3.select(this).call(regionYAxis.scale(yScale));
          ct.selectAll('line').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('path').attr('stroke', '#777').attr('stroke-dasharray', '2,2');
          ct.selectAll('text').attr('fill', '#777')
        });
    }
  });

  this.diversityContainer.each(function(attr, i){

  });


};

DiversityChart.prototype.clearRegion = function(){
  this.diversityContainers.each(function(d){
    d3.select(this).selectAll('.diversityPointContainer').remove();
  });
};
export default DiversityChart
