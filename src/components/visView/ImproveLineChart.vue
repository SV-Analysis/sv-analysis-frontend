<template>
  <svg class="scatter-bar-chart">

  </svg>
</template>

<script>
  import * as d3 from 'd3'
  import pipeService from '../../service/pipeService'

  import * as Config from '../../Config'
  export default {
    name: 'scatterBarChart',

    data () {
      return {
        title: 'BarChart',
        svFeatures2Color: Config.svFeatures2Color
      }
    },
    mounted(){
      let _this = this;
      this.width = this.$el.clientWidth;
      this.height = this.$el.clientHeight;
      this.margin = {top: 1 / 4 * this.height, bottom: 10, left: 10, right: 10};
      pipeService.onStreetsSelected(function(msg){
        _this.drawLineChart(msg, 'green')
      })
    },
    computed:{

    },
    methods:{
      drawLineChart(streets,attr){
        let _this = this;
        let attrx = 'green';
        let xscales = [];
        let yscale = d3.scaleLinear().range([this.height - this.margin.bottom, this.margin.top / 2]).domain([0, 0.5]);
        let street_y_scale = d3.scaleLinear().range([0, this.height / 2]).domain([0, streets.length]);
        d3.selectAll('.container').remove();
        let container = d3.select(this.$el).append('g').attr('class', 'container')
        let newStreets = [];
        streets.forEach(function(d,i){
          if(i < 10){
            newStreets.push(d)
          }
        })
        let streetContainers = container.selectAll('.streetcontainer')
          .data(newStreets)
          .enter()
          .append('g').attr('class', 'streetcontainer');

        let gradientGenerator = function(el, id, userRatio, largestOpcity){


          var gradient = el.append("defs")
            .append("linearGradient")
            .attr("id", id)
            .attr("x1", "50%")
            .attr("y1", "100%")
            .attr("x2", "50%")
            .attr("y2", "0%")
            .attr("spreadMethod", "pad");

          gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#00f944")
            .attr("stop-opacity", 0);



          gradient.append("stop")
            .attr("offset", userRatio)
            .attr("stop-color", "#00f944")
            .attr("stop-opacity", 0.1);


          gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#00f944")
            .attr("stop-opacity", largestOpcity);
        };

        streetContainers.each(function(d, index){
          let temp_container = d3.select(this).attr('transform','translate(0,'+ (-15 * index ) +')');
          let images = d['image_list'];
          let maxAttrValue = 0;
          images.forEach(function(d){
            if(maxAttrValue < d[attrx]){
              maxAttrValue = d[attrx]
            }
          })
          maxAttrValue /= 100;
          console.log('maxAttr', maxAttrValue)
          let xScale = d3.scaleLinear()
            .range([_this.margin.left, _this.width - _this.margin.right])
            .domain([0, images.length]);


          let yScale = d3.scaleLinear()
            .range([ _this.height, _this.height / 2])
            .domain([0 ,50])

          let area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d, j) {

              return xScale(j);
            })
            .y0(_this.height )
            .y1(function(d, j) {

              return yScale(d[attrx]);
            });

          var line = d3.line()
            .x(function(d, j) {
              return xScale(j);
            })
            .y(function(d, j) {
              return yScale(d[attrx]);
            })
          let fixRatio = 0.2;
          let colorScale = d3.scaleLinear().range([0.6, 1]).domain([fixRatio, 1]);
          gradientGenerator(temp_container,'grandient_' + index, fixRatio / maxAttrValue, colorScale(maxAttrValue))
//          temp_container.append('path')
//            .datum(d['image_list'])
//            .attr("class", "areachart")
//            .attr("d", function(d, i){
//              return area(d)
//            })
//            .attr('fill',function(){
//              let url = 'url(#' + ('grandient_' + index) + ')'
//              return url;
////              return _this.svFeatures2Color[attrx];
//            })
//            .attr('stroke',function(){
//              let url = 'url(#' + ('grandient_' + index) + ')'
//              return url;
//            })
//            .attr('fill-opacity', 0.2)
//            .on('mouseover', function(d){
//              d3.select(this).attr('stroke','blue' )
//            })
//            .on('mouseout', function(d){
//              d3.select(this).attr('stroke','none' ).attr('stroke',function(){
//                let url = 'url(#' + ('grandient_' + index) + ')'
//                return url;
//              })
//            })
          temp_container.append('path').datum(d['image_list'])
            .attr('class', 'lineChart')
            .attr("d", function(d, i){
              return line(d)
            })
            .attr('stroke',function(){
              let url = 'url(#' + ('grandient_' + index) + ')'
              return url;
            })
            .attr('fill', 'none')
        })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .scatter-bar-chart{
    margin-top: 10px;
    width: 100%;

  }
</style>
