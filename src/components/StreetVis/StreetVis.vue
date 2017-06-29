<template>
  <div class="street-view">

    <div class="img-map-container top_contaienr">
      <div style="height: 100%; width: 100%">
        <div v-for="street in streetData" class="map-container">
          <div class="img-map-wrapper">
            <ImgLayer class="img-svg" v-bind:street="street"></ImgLayer>

            <ImgMap
              v-bind:picked="picked"
              v-bind:street='street'
              class="img-map-f">
            </ImgMap>
          </div>
        </div>
      </div>
    </div>
    <div class = 'spartpcpcontainer bottom_contaienr'>
      <SparkPCP class="spark-pcp">spark-pcp</SparkPCP>
    </div>
    <!--<TrendView class="trend-view">trend-view</TrendView>-->
  </div>
</template>

<script>
  import * as d3 from 'd3'
  import SparkPCP from './SparkPCP.vue'

  import TrendView from './TrendView.vue'
  import ImgLayer from './ImgLayer.vue'
  import ImgMap from './ImgMap.vue'
  import pipeService from '../../service/pipeService'
  import * as Config from '../../Config'
  export default {
    name: 'StreetView',
    props:['selectItems'],
    data () {
      return {
        title: 'Street View',
        streetData: [],
        picked: null,
        svFeatures2Color:Config.svFeatures2Color


      }
    },
    watch:{
      picked: function(value){
        this.isActive = !this.isActive;

        if(value == 0){
          this.streetData[0]['show'] = true;
          this.streetData[1]['show'] = false;
        }else if(value == 1){
          this.streetData[0]['show'] = false;
          this.streetData[1]['show'] = true;
        }
      }
    },
    mounted(){
      let _this = this;
      pipeService.onConfirmSelection(function(items){
        items[0]['show']= true;
        items[1]['show']= false;
        _this.streetData = items;
        _this.picked = items[1]['id']
      });
    },
    computed:{

    },
    methods:{
    },
    components:{
      SparkPCP,
      TrendView,
      ImgMap,
      ImgLayer
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .street-view{
    position: relative;
    width: 100%;
    height: 100%;

  }
  .top_contaienr {
    border-radius: 3px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;
    height: 99%;
  }
  .bottom_contaienr {
    margin-top: 10px;
    border-radius: 3px;
    box-shadow: 3px 3px 3px grey;
    background: #FFF;

  }
  .spartpcpcontainer{
    width: 100%;
    height: 50%
  }
  .spark-pcp{
    margin: 0 auto;
    height: 100%;
    width: 95%;
    /*border-width: 1px;*/
    /*border-style: solid;*/
    /*border-color: #ff899c;*/
  }


  .img-map-container{
    position: relative;
    height: 49%;
    /*border-width: 1px;*/
    /*border-style: solid;*/
    /*border-color: #9ea0ff;*/
  }

  /*.map-container{*/
  /*float: left;*/
  /*height: 100%;*/
  /*width: 50%*/
  /*}*/
  .map-container:nth-child(1){
    margin-left: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    float: left;
    height: 95%;
    width: 47%
  }
  .map-container:nth-child(2){
    margin-right: 10px;
    margin-bottom: 10px;
    margin-top: 10px;
    float: right;
    height: 95%;
    width: 49.5%
  }
  .img-map-wrapper{
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 3px;
    background-color: #00fd20;
  }
  .img-map-f{
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0px;
    left: 0px;
  }
  .img-svg{
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0px;
    left: 0px;
    pointer-events: none;
    z-index: 1000;
  }
  .img-map-p{
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    background-color: #5e7382;
  }

</style>
