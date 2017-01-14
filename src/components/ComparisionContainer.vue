<template>
  <div class="comparision-container">
    <div>{{ title }}</div>
    <div v-for="cityInfo in cities" class = "compmap-container">
      <CompMap  v-bind:cityInfo="cityInfo"></CompMap>
      <div class="render_container">
        <PointsView class="points-view" v-bind:cityInfo="cityInfo"></PointsView>
        <SelectionLayer class="points-view2" v-bind:cityInfo="cityInfo"> </SelectionLayer>
      </div>
    </div>
  </div>
</template>

<script>
  import pipeService from '../service/pipeService'
  import CompMap from './CompMapView.vue'
  import PointsView from './PointsView.vue'
  import SelectionLayer from './SelectionLayer.vue'


  export default {
    name: 'comparision-container',
    data () {
      return {
        title: 'Comparision View',
        cities: [],
        candidates: {
          'nyc':{
            'name': 'New York',
            'gps':[40.7058253, -74.1180861],
            'id': 'nyc',
            'bound': null},
          'singapore': {
            'name': 'Singapore',
            'gps':[1.3149014, 103.7769792],
            'id': 'singapore',
            'bound': null},
          'hk': {
            'name': 'Hong Kong',
            'gps':[22.365354, 114.105228],
            'id':'hk',
            'bound': null},
          'london': {
            'name': 'London',
            'gps':[51.528308,-0.3817765],
            'id': 'london',
            'bound': null}
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
      SelectionLayer
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .compmap-container{
    float: left;
    margin-left: 3%;
    width: 45%;
    background: rgba(13,13,13,0.1);
    height: 88%
  }
  .render_container{
    position: relative;
    height: 100%;
    width: 100%
  }
  .points-view{
    position: absolute;
    bottom: 100%;
    height: 100%;
    left: 0px;
  }
  .points-view2{
    position: absolute;
    bottom: 100%;
    /*height: 100%;*/
    left: 0px;
  }
</style>
