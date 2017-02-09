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
    computed:{
    },
    methods:{
      sendMapRegion(){

      },
      createMap(){
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
        this.mapObj.drawPolygon(this.streetData);
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
