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
    props: ['cityInfo', 'streetData', 'svFeatures2Color'],
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
        'streetInfo': _this.streetData
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
        this.mapObj.setColorStyle(this.svFeatures2Color)
        this.mapObj.enableControlLayer();
        this.mapObj.drawPolygon(this.streetData);
        this.mapObj.drawPointsToMap(this.streetData);

        this.mapObj.fitBoundByStreet(this.streetData);
        pipeService.emitPolyLine({
          'cityId': _this.cityInfo['id'],
          'streetInfo': _this.streetData
        });
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
