<!--耦合度太高，最好能够把propos里面的对象改成一些更加通用的数据结构，如单纯的polyline 以及 points等-->

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
  import ParallelCoordinate from '../../lib/ParallelCoordinate'


  export default {
    name: 'mapview',
    props: ['cityInfo', 'streetData', 'svFeatures2Color','adRegionData'],
    data () {
      return {
        title: 'mapview',
        attrs:['green', 'sky', 'road','building', 'car', 'others'],
        isRendered:false,
        isChartDisplayed: false,
        imageList: null,
        selectionId: null,
        polyLinePoints: []
      }
    },
    mounted(){
      console.log('data', this.cityInfo, this.streetData, this.adRegionData);
      let _this = this;
      if(this.streetData != undefined && this.adRegionData == undefined){
        this.imageList = this.streetData['image_list'];

        // Use an array for polyLinePoints because the streetData to consider the multipolygon case
        let points = [];
        this.streetData['node_list'].forEach(function(d){
          points.push(d['location']);
        });
        this.polyLinePoints = [points];
        this.selectionId = this.streetData['id'];


      }else if(this.streetData == undefined && this.adRegionData != undefined){
        this.imageList = [];
        this.polyLinePoints = [];
        this.adRegionData.subRegion.forEach(function(d){
          let boundaryNodes = d['boundary'];
          _this.polyLinePoints.push(boundaryNodes);
        });
        this.selectionId = this.adRegionData['rid'];
        let imageList = [];
        this.adRegionData['imageList'].forEach(function(d){
          imageList = imageList.concat(d['images']);
        });
        this.imageList = imageList;
        console.log('this.adReegionData', this.adRegionData)
      }

      this.createMap();

    },
    destroyed(){
      let _this = this;
      pipeService.emitDestroyPolyLine({
        'cityId': _this.cityInfo['id'],
//        'streetInfo': _this.streetData
        'selectionId': _this.selectionId
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
        this.drawParallelCoordinate();
      },
      createMap(){
        let _this = this;
        this.mapObj = new DetailMap(this.$el, this.cityInfo);
        this.mapObj.init();
        this.mapObj.setColorStyle(this.svFeatures2Color);
        this.mapObj.enableControlLayer();
        this.mapObj.drawMultiplePolylines(this.polyLinePoints, this.selectionId);
        this.mapObj.drawImagePoints(this.imageList, this.selectionId);
//        this.mapObj.drawPolygon(this.streetData);
//        this.mapObj.drawPointsToMap(this.streetData);
//
//        this.mapObj.fitBoundByStreet(this.streetData);
        pipeService.emitPolyLine({
          'cityId': _this.cityInfo['id'],
          'polyLinePoints': _this.polyLinePoints,
          'imageList': _this.imageList,
          'selectionId': _this.selectionId
        });
      },
      drawParallelCoordinate(){
        if(this.isRendered == true && this.isChartDisplayed== true){
          this.parallelHanlder.updateDisplay(true)
          this.isChartDisplayed = false;
          return
        }else if(this.isRendered == true && this.isChartDisplayed == false){
          this.parallelHanlder.updateDisplay(false)
          this.isChartDisplayed = true;
          return
        }else if(this.isRendered == false){

        }
        this.isRendered = true;
        this.isChartDisplayed = true;
        let parallelHandler = new ParallelCoordinate(this.$el, this.attrs, this.imageList, this.svFeatures2Color);
        this.parallelHanlder = parallelHandler;
        parallelHandler.init();
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
    z-index:1002;
  }
  .regionmap-svg{
    position: absolute;
    width: 100%;
    height: 200px;
    top: 0px;
    left:0px;
    z-index: 1001;
    pointer-events: auto;
  }

  .parallel-path {
    fill: none;
    stroke: #273fdd;
    stroke-width:1px;
    shape-rendering: crispEdges;
    opacity: 0.2
  }
</style>
