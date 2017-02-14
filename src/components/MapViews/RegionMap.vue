<template>

  <div class="region-mapview">
    <div class="regionmap-control">
      <button v-on:click="vbuttonClick()" id="display-points" type="button" class="btn btn-default btn-xs self-button" aria-label="Left Align">
        <span class="glyphicon " aria-hidden="true">V</span>
      </button>
    </div>
    <svg class="regionmap-svg"></svg>
  </div>
</template>

<script>
  import pipeService from '../../service/pipeService'
  import DetailMap from '../../lib/DetailMap'
  import * as d3 from 'd3'


  export default {
    name: 'mapview',
    props: ['cityInfo', 'streetData', 'svFeatures2Color'],
    data () {
      return {
        title: 'mapview',
        attrs:['green', 'sky', 'road','building', 'car', 'others'],
        isRendered:false,
        isChartDisplayed: false
      }
    },
    mounted(){
      this.createMap();
//      this.drawBarChart()
    },
    destroyed(){
      let _this = this;
      pipeService.emitDestroyPolyLine({
        'cityId': _this.cityInfo['id'],
        'streetInfo': _this.streetData
      })
    },
    beforeDestroyed(){

    },
    computed:{
    },
    components:{

    },
    methods:{
      vbuttonClick(){
        if (event) event.stopPropagation()
        this.drawBarChart();
      },
      createMap(){
        let _this = this;
        this.mapObj = new DetailMap(this.$el, this.cityInfo);
        this.mapObj.init();
        this.mapObj.setColorStyle(this.svFeatures2Color)
        this.mapObj.enableControlLayer();
        this.mapObj.drawPolygon(this.streetData);
        this.mapObj.drawPointsToMap(this.streetData);

        this.mapObj.fitBoundByStreet(this.streetData);
        pipeService.emitPolyLine({
          'cityId': _this.cityInfo['id'],
          'streetInfo': _this.streetData
        });
      },
      drawBarChart(){
        if(this.isRendered == true && this.isChartDisplayed== true){
          this.svgContainer.attr('opacity', 0);
          this.isChartDisplayed = false;
          return
        }else if(this.isRendered == true && this.isChartDisplayed == false){
          this.svgContainer.attr('opacity', 1);
          this.isChartDisplayed = true;
          return
        }else if(this.isRendered == false){

        }
        this.isRendered = true;
        this.isChartDisplayed = true;
        let _this = this;

        let ratioBarData  = {};
        let bar_marginLeft = 100;
        let imageList = this.streetData['image_list'];
        for(var i = 0, ilen = this.attrs.length; i < ilen; i++){
          ratioBarData[this.attrs[i]] = [];
          for(var j = 0; j < 20; j++){
            ratioBarData[this.attrs[i]][j] = 0
          }
        }
        let largestIndex = 0;
        for(var i = 0, ilen = imageList.length; i < ilen; i++){
          let imageObj = imageList[i];
          this.attrs.forEach(function(attr){
            let value = parseInt(parseInt(imageObj[attr]) / 5);
            if(largestIndex < value){
              largestIndex = value;
            }
            ratioBarData[attr][value] += 1;
          })
        }
        let imageNumber = imageList.length;
        let largestRatio = -1;
        this.attrs.forEach(function(attr){
          for(var i = 0; i < imageNumber; i++){
            let ratio = ratioBarData[attr][i] / imageNumber;
            ratioBarData[attr][i] = ratio;
            largestRatio = largestRatio < ratio? ratio: largestRatio;
          }
        });

        let width = this.$el.clientWidth;
        let height = this.$el.clientHeight;

        let featureArr = this.svFeatures2Color['allFeatures'];
        let barNum = featureArr.length;

        let svgContainer = d3.select(this.$el).select('svg');
        this.svgContainer = svgContainer;
        svgContainer.append('rect')
          .attr('width', width).attr('height', height).attr('fill', 'white').attr('opacity', 0.9)
        var x = d3.scalePoint().range([60, width - 30]),
          y = {},
          dragging = {};

        var line = d3.line(),
          axis = d3.axisLeft(),
          background;
        var margin = {top: 0, right: 0, bottom: 0, left: 0};
        var svg = svgContainer
          .attr("width", width * 0.8 + margin.left + margin.right)
          .attr("height", height * 0.8 + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.attrs.forEach(function(attr){
          y[attr] = d3.scaleLinear().domain([0, 1]).range([height - 40, 20]);
        });

        x.domain(this.attrs);
        var g = svg.selectAll(".dimension")
          .data(this.attrs)
          .enter().append("g")
          .attr("class", "dimension")
          .attr("transform", function(d) {
            return "translate(" + x(d) + ")";
          })
        g.append("g")
          .attr("class", "axis")
          .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
          .append("text")
          .style("text-anchor", "middle")
          .attr("y", -9)
          .text(function(d) { return d; });

        g.append('text')
          .text(function(d) {return d})
          .attr('y', height - 20)
          .attr('x', -20)


        var foreground = svg.append("g")
          .attr("class", "background")
          .selectAll("path")
          .data(imageList)
          .enter().append("path")
          .attr("d", path)
          .attr('class', 'parallel-path')
          .attr('stroke', '#6b6ecf')
          .attr('fill', 'none')
          .attr('opacity', '0.05')


        function position(d) {
          var v = dragging[d];
          return v == null ? x(d) : v;
        }
        function path(d) {
          var _arrs = _this.attrs.map(function(p){
            return [position(p), y[p](d[p] / 100)];
          })
          return line(_arrs);
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .region-mapview{
    text-align: center;
    margin: auto;
    margin-bottom: 10px;
    width: 95%;
    background: rgba(13,13,13,0.1);
    height: 200px
  }

  .regionmap-control{
    left: 5px;
    top: 5px;
    position: absolute;
    z-index:10001;
  }
  .regionmap-svg{
    position: absolute;
    width: 100%;
    height: 200px;
    top: 0px;
    left:0px;
    z-index: 1002;
  }

  .parallel-path {
    fill: none;
    stroke: #273fdd;
    stroke-width:1px;
    shape-rendering: crispEdges;
    opacity: 0.2
  }

  /*.foreground path {*/
  /*fill: none;*/
  /*stroke: steelblue;*/
  /*}*/

  /*.brush .extent {*/
  /*fill-opacity: .3;*/
  /*stroke: #fff;*/
  /*shape-rendering: crispEdges;*/
  /*}*/

  /*.axis line,*/
  /*.axis path {*/
  /*fill: none;*/
  /*stroke: #000;*/
  /*shape-rendering: crispEdges;*/
  /*}*/

  /*.axis text {*/
  /*text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;*/
  /*cursor: move;*/
  /*}*/
</style>
