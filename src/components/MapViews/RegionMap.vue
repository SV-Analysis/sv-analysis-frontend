<template>

  <div class="region-mapview">
    rerere
  </div>
</template>

<script>
  import pipeService from '../../service/pipeService'
  import DetailMap from '../../lib/DetailMap'

  export default {
    name: 'mapview',
    props: ['cityInfo', 'streetData'],
    data () {
      return {
        title: 'mapview'
      }
    },
    mounted(){
      this.createMap();

    },
    destroyed(){
      let _this = this;
      pipeService.emitDestroyPolyLine({
        'cityId': _this.cityInfo['id'],
        'polylineObj': _this.polylineObj
      })
    },
    beforeDestroyed(){

    },
    computed:{
    },
    methods:{
      sendMapRegion(){
        let _this = this;

      },
      createMap(){
        let _this = this;
        this.mapObj = new DetailMap(this.$el, this.cityInfo);
        this.mapObj.init();
        this.mapObj.enableControlLayer();
        this.mapObj.onEvent('zoomend', function(event){

        });
        this.mapObj.onEvent('dragend', function(event){

        });
        this.mapObj.onEvent('zoomstart', function(event){

        });
        this.mapObj.onEvent('movestart', function(event){

        });

        this.mapObj.onBaseLayerChange(function(event){

        })
        let polylineObj = this.mapObj.drawPolygon(this.streetData);
        this.polylineObj = polylineObj;
        pipeService.emitPolyLine({
          'cityId': _this.cityInfo['id'],
          'polylineObj': polylineObj
        })
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
</style>
