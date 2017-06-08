<template>
  <div class="comparision-container">

    <div v-for="cityInfo in cities" class = "compmap-container">
      <CompMap  v-bind:cityInfo="cityInfo"></CompMap>
      <div class="render_container" v-bind:style="{'pointer-events': cityInfo.isConVisActive}" >
        <PointsView class="points-view" v-bind:cityInfo="cityInfo" v-bind:svFeatures2Color="svFeatures2Color"></PointsView>
        <ControlLayer class="control-layer" v-bind:cityInfo="cityInfo"> </ControlLayer>
      </div>
    </div>
  </div>
</template>

<script>
  import pipeService from '../service/pipeService'
  import CompMap from './MapViews/CompMapView.vue'
  import PointsView from './visView/PointsView.vue'
  import ControlLayer from './CompMapControlLayer.vue'


  export default {
    name: 'comparision-container',
    props:['svFeatures2Color'],
    data () {
      return {
        title: 'Comparision View',
        cities: [],
        candidates: {
          'nyc':{
            'name': 'New York',
            'gps':[40.7058253, -74.1180861],
            'id': 'nyc',
            'bound': null,
            'isActive': 'contaienr-display',
            'isConVisActive': 'none'},
          'singapore': {
            'name': 'Singapore',
            'gps':[1.3149014, 103.7769792],
            'id': 'singapore',
            'bound': null,
            'isActive': 'contaienr-display',
            'isConVisActive': 'none'},
          'hk': {
            'name': 'Hong Kong',
            'gps':[22.365354, 114.105228],
            'id':'hk',
            'bound': null,
            'isActive': 'contaienr-display',
            'isConVisActive': 'none'},
          'london': {
            'name': 'London',
            'gps':[51.528308,-0.3817765],
            'id': 'london',
            'bound': null,
            'isActive': 'contaienr-display',
            'isConVisActive': 'none'},
        }
      }
    },
    mounted(){
      let _this = this;
      pipeService.onUpdateSelectedMapView(function(city_id_arr){
        _this.cities = [];
        for(var i = 0, ilen = city_id_arr.length; i < ilen; i++){
          let city_id = city_id_arr[i];
          _this.cities.push(_this.candidates[city_id]);
        }
      });
      pipeService.onDisplayPointCloud(function(msg){
        _this.cities.forEach(function(cityObj){
          if(cityObj['id'] == msg['cityId']){
            if(msg['disablePoints'] == true){
              cityObj['isActive'] = 'contaienr-hide';
            }else{
              cityObj['isActive'] = 'contaienr-display'
            }

          }
        });

      });
      pipeService.onChagneInteractions(function(msg){

        _this.cities.forEach(function(cityObj){
          if(msg['mapInteraction'] == true){
            cityObj['isConVisActive'] = 'auto';
          }else{
            cityObj['isConVisActive'] = 'none';
          }
        })
      });
    },
    created(){
      let _this = this;
      pipeService.onUpdateMapBound(function(para){
        let _id = para['id'];
        if(_this.candidates[_id] == undefined) return;
        _this.candidates[_id]['bound'] = para['region'];
      })
    },
    computed:{

    },
    components:{
      CompMap,
      PointsView,
      ControlLayer
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .compmap-container{
    margin-top: 10px;
    margin-bottom: 10px;
    position: relative;
    float: left;
    margin-left: 2%;
    width: 47%;
    background: rgba(13,13,13,0.1);
    height: 95%
  }
  .render_container{
    position: absolute;
    height: 100%;
    width: 100%;
    top:0;
  }
  .points-view{
    position: absolute;
    height: 100%;
    left: 0px;
  }
  .control-layer{
    position: absolute;
    left: 0px;
  }
  .contaienr-hide{
    pointer-events: none;
  }
  .contaienr-display{
    pointer-events: auto;
  }
  .mapInteraction{
    pointer-events: none;
  }
</style>
