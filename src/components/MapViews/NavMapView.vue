<template>

  <div class="nav-mapview">
  </div>
</template>

<script>
  import pipeService from '../../service/pipeService'
  import DetailMap from '../../lib/DetailMap'

  export default {
    name: 'mapview',
    props: ['cityInfo'],
    data () {
      return {
        title: 'mapview'
      }
    },
    mounted(){
      this.createMap();
      this.sendMapRegion();
    },
    computed:{
    },
    methods:{
      sendMapRegion(){
        let _this = this;
        if(!this.mapObj) return;
        let region = this.mapObj.getBounds();
        pipeService.emitUpdateMapBound({
          'region': region,
          'id': _this.cityInfo['id']
        })
      },
      createMap(){
        let _this = this;

        this.mapObj = new DetailMap(this.$el, this.cityInfo);
        this.mapObj.init();
        this.mapObj.enableControlLayer();
        this.mapObj.onEvent('zoomend', function(event){
          _this.sendMapRegion();
        });
        this.mapObj.onEvent('dragend', function(event){
          _this.sendMapRegion();
        });
        this.mapObj.onEvent('zoomstart', function(event){
          pipeService.emitCompMapZoomStart({'cityId': _this.cityInfo['id']});
        });
        this.mapObj.onEvent('movestart', function(event){
          pipeService.emitCompMapDragStart({'cityId': _this.cityInfo['id']});
        });

        this.mapObj.onBaseLayerChange(function(event){
          pipeService.emitUpdateMapLayer({
            'cityId': _this.cityInfo['id'],
            'layerName': event.name
          });
        })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .nav-mapview{
    float: left;
    width: 100%;
    background: rgba(13,13,13,0.1);
    height: 90%
  }
</style>
