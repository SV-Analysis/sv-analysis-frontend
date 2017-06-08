<template>
  <div class="street-view">

    <div class="img-map-container">
      <ImgLayer class="img-svg"></ImgLayer>
      <div class="map-container" >
        <div class="radio-container">
          <!--<div  v-for="data in streetData">-->
            <!--<input style=" left: 10px; pointer-events: auto" type="radio" id="one" v-bind:value="data['id']" v-model="picked">-->
            <!--<label style="pointer-events: auto" for="one">{{data['id']}}</label>-->
          <!--</div>-->
        </div>
        <div v-for="data in streetData" >
          <ImgMap
            v-bind:picked="picked"
            v-bind:data='data'
            class="img-map-f">
          </ImgMap>
        </div>
      </div>
    </div>
    <SparkPCP class="spark-pcp">spark-pcp</SparkPCP>
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
    margin-top: 0px;
    width: 100%;
    height: 100%;

  }
  .spark-pcp{
    height: 40%;
    /*background-color: #5bc0de;*/
    border-width: 1px;
    border-style: solid;
    border-color: #ff899c;
  }

  .img-map-container{
    position: relative;
    height: 70%;
    border-width: 1px;
    border-style: solid;
    border-color: #9ea0ff;
  }
  .radio-container{
    color: yellow;
    position: absolute;
    top:0px;
    bottom: 0px;
    z-index: 1001;
    pointer-events:none;
    text-align: left;
    margin-left: 10px;
    margin-top: 5px;
  }
  .map-container{
    position: relative;
    height: 100%;
    width: 100%
  }
  .img-map-f{
    position: absolute;
    height: 100%;
    top: 0px;
    left: 0px;
  }
  .img-svg{
    position: absolute;
    height: 100%;
    top: 0px;
    left: 0px;
    pointer-events: none;
    z-index: 1000;
  }
  .trend-view{
    height: 30%;
    border-width: 1px;
    border-style: solid;
    border-color: #baff92;
  }
  .active{
    display:none;
  }
</style>
