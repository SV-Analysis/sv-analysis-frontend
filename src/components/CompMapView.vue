<template>
  <div class="comp-mapview">
  </div>
</template>

<script>
  import pipeService from '../service/pipeService'
  import DetailMap from '../lib/DetailMap'
  import dataService from '../service/dataService'


  export default {
    name: 'comp-mapview',
    props: ['cityInfo'],
    data () {
      return {
        title: 'comp-mapview',
        points_world: []
      }
    },
    mounted(){
      let _this = this;
      this.createMap();


//      All the using of the dataService functions should be repackaged.
      dataService.getAllRecordsForOneCity(this.cityInfo['id'], function(data){
        _this.points_world = data;
        let current_points = _this.mapObj.worldToContaierPoints(_this.points_world);
        pipeService.emitUpdateAllResultData({
          'cityId': _this.cityInfo['id'],
          'data': current_points});

        pipeService.emitMapInstance({
          'cityId': _this.cityInfo['id'],
          'map': _this.mapObj.getMapInstance()
        })
      });
      pipeService.onInteractiveSelection(function(msg){
        let cityId = msg['cityId'];
        let positions = msg['region'];
        if(positions.length <= 2) return;  //position <= 2 means a single click
        if(cityId !=  _this.cityInfo.id) return;
        var world_position = _this.mapObj.contaierPointsToWorld(positions);
        dataService.queryRegionFromBackground( _this.cityInfo['id'], world_position, function(data){
          pipeService.emitRegionQueryDataRecieved(data);
        });
      });
      pipeService.onUpdateMapLayer(function(msg){
        let cityId = msg['cityId'];
        if(cityId !=  _this.cityInfo.id) return;
        _this.mapObj.updateLayer(msg['layerName']);
      })
    },
    computed:{
      cityId(){
        return this.cityInfo.id;
      }
    },
    watch:{
      'cityInfo.bound': function(newData, oldData){
        let _this = this;
        if(newData == null) return;
        if(!this.mapObj) return;
        this.mapObj.fitBounds(newData);

        if(this.points_world && this.points_world.length != 0){
//          HACK


          setTimeout(function(){
            console.log('result', _this.mapObj.getZoomLevel());
            let current_points = _this.mapObj.worldToContaierPoints(_this.points_world);
            pipeService.emitUpdateAllResultData({
              'cityId': _this.cityInfo['id'],
              'data': current_points});
          }, 400);
        }
      }
    },
    methods:{
      createMap(){
        this.mapObj = new DetailMap(this.$el, this.cityInfo);
        this.mapObj.init();
        this.mapObj.disableAllInteraction();
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .comp-mapview{
    /*float: left;*/
    /*margin-left: 3%;*/
    width: 100%;
    background: rgba(13,13,13,0.1);
    height: 100%
  }
</style>
