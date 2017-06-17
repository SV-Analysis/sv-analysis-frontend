/**
 * Created by Qiaomu on 12/6/2017.
 */
import * as d3 from 'd3'

let CompBarChart = function(el, margin){

};

CompBarChart.prototype.setConfig = function(el, features, config){
  this.el = el;
  let _this = this;
  this.config = config;
  this.features = features;
  let matrixSize = this.config.margin['size'];
  let singleRegionSize = matrixSize / features.length;
  this.singleRegionSize = singleRegionSize;
  let contaienrOffsetX = this.config.margin['width'] > this.config.margin['height']? (this.config.margin['width'] - this.config.margin['height']): 0;
  this.colorScale = config.colorScale;
  this.compBarContainer = el.append('g').attr('class', 'region_container').attr('transform', 'translate(' + contaienrOffsetX + ',' + '0)');
  this.barChartsPair = this.compBarContainer.selectAll('.barContainers')
    .data(features)
    .enter()
    .append('g')
    .attr('class', 'barContainers')
    .attr('transform', function(d, i){
      return 'translate( 0' +',' +(i * singleRegionSize) +')'
    });
  this.barChartsPair.append('rect').attr('width', this.config.margin['width'])
    .attr('x',3)
    .attr('y', 3)
    .attr('height', singleRegionSize - 6)
    .attr('fill', 'none')
    .attr('stroke', 'grey')
    .attr('stroke-width', 0.3)
    .attr('stoke-opacity', 0.3)
};
CompBarChart.prototype.getColor = function(id){
  return this.colorScale != undefined? this.colorScale[id]: "red";
};

CompBarChart.prototype.draw = function(dataList){
  let _this = this;
  this.clearRegion();
  if(dataList.length == 0) return;
  let features = this.features;
  let numberOfScale = 20;
  this.numberOfScale = numberOfScale;
  // Init the data
  let attr2RatioArray = [];
  for(let i = 0, ilen = dataList.length; i <ilen; i++){
    let data = dataList[i];
    let _cityObj = {'cityId': data['cityId']};
    features.forEach(function(attr){
      _cityObj[attr] = [];
      for(let j = 0, jlen = numberOfScale; j < jlen; j++ ){
        _cityObj[attr][j] = 0;
      }
    });
    _cityObj.color = data.color;
    attr2RatioArray.push(_cityObj);
  }

  let largestIndex = 0;
  let largestValue = 0;

  dataList.forEach(function(d, i){
    if(d['cityId'] != attr2RatioArray[i]['cityId']) return;
    let images = d['imgList'];
    attr2RatioArray[i]['name'] = d['name']
    attr2RatioArray[i].len = images.length;
    images.forEach(function(img){
      features.forEach(function(attr){
        let value = parseInt(img['record']['statistics'][attr] / (100 / numberOfScale));
        attr2RatioArray[i][attr][value] += 1;
        if(largestIndex < value){
          largestIndex = value;
        }
      })
    })
  });

  attr2RatioArray.forEach(function(singleArr){
    features.forEach(function(attr){
      for(var i = 0, ilen = singleArr[attr].length; i < ilen; i++){
        singleArr[attr][i] /= singleArr.len;
        if(largestValue < singleArr[attr][i]){
          largestValue = singleArr[attr][i];
        }
      }
    })
  })

  let barWidth = this.config.margin.width / largestIndex * 3 / 4;

  this.barChartsPair.each(function(attr){
    let x_scale = d3.scaleLinear().domain([0, largestIndex + 1]).range([3, _this.config.margin.width]);
    _this.x_scale = x_scale;
    let y_scale = d3.scaleLinear().domain([0, largestValue+ 0.1]).range([3, _this.singleRegionSize / 2 - 6]);
    let barPairContainer = d3.select(this).append('g').attr('class', 'barContainer');
    let cityId = attr2RatioArray[0]['cityId'];
    let name = attr2RatioArray[0]['name'];
    let color = attr2RatioArray[0].color;
    barPairContainer.append('g').selectAll('.bar').data(attr2RatioArray[0][attr].slice(0, largestIndex + 1))
      .enter()
      .append('rect').attr('class','bar')
      .attr('x', function(d, i){
        return x_scale(i);
      })
      .attr('y', function(d, i){
        return _this.singleRegionSize / 2 - y_scale(d);

      })
      .attr('width', barWidth)
      .attr('height', function(d){
        return y_scale(d);
      })
      .attr('fill', function(d){
        return color;
        // if(cityId!= undefined)
        //   return _this.getColor(cityId)
        // else
        //   return _this.getColor(name)
      })
      .attr('opacity', 0.7);

    let axis = d3.axisBottom()
      .ticks(5)
      .tickFormat(function(ds){
        return ds / numberOfScale;
      });

    let axisContainer = barPairContainer.append('g').attr('class', '.dimension')
      .attr("transform", function(d) {
        return "translate(" + 0 + ',' + (_this.singleRegionSize  / 2) + ")";
      });

    axisContainer.append("g")
      .attr("class", "axis")
      .each(function(d) {
        d3.select(this)
          .call(axis.scale(x_scale))
          .attr('stroke-dasharray', '2,2');
      })
      .append("text")
      .style("text-anchor", "middle");

    if(attr2RatioArray.length > 1){
      let cityId = attr2RatioArray[1]['cityId'];
      let name = attr2RatioArray[1]['name'];
      let color = attr2RatioArray[1].color;
      barPairContainer.append('g').selectAll('.bar').data(attr2RatioArray[1][attr].slice(0, largestIndex + 1))
        .enter()
        .append('rect').attr('class','bar')
        .attr('x', function(d, i){
          return x_scale(i);
        })
        .attr('y', function(d, i){
          return _this.singleRegionSize / 2;
        })
        .attr('width', barWidth)
        .attr('height', function(d){
          return y_scale(d);
        })
        .attr('fill', function(d){
          return color;
        })
        .attr('opacity', 0.7);
    }

  });
};

CompBarChart.prototype.clearRegion = function(){
  this.barChartsPair.each(function(d){
    d3.select(this).selectAll('.barContainer').remove();
  })
}
export default CompBarChart
