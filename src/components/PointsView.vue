<template>
  <div class="point-view">
  </div>
</template>

<script>
  import PointCloud from '../lib/PointCloud'
  import pipeService from '../service/pipeService'
  export default {
    name: 'pointsview',
    props: ['cityInfo', 'svFeatures2Color'],
    data () {
      return {
        title: 'Points View'
      }
    },
    mounted(){
      let _this = this;
      pipeService.onUpdateAllResultData(function(msg){
        if(msg.cityId == _this.cityInfo.id){
          _this.pointView.updatePointCloud(msg.data, msg.zoomLevel);
        }
      });
      pipeService.onCompMapZoomStart(function(msg){
        if(msg.cityId == _this.cityInfo.id){
          _this.pointView.updatePointCloud([]);
        }
      });
      pipeService.onCompMapDragStart(function(msg){
        if(msg.cityId == _this.cityInfo.id){
          _this.pointView.updatePointCloud([]);
        }
      });
      this.createPointsView();
    },
    computed:{
    },
    methods:{
      createPointsView(){
        this.pointView = new PointCloud(this.$el);
        this.pointView.init();
        this.pointView.animate();
        this.pointView.setColorStyle(this.svFeatures2Color)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .point-view{
    float: left;
    width: 100%;
    height: 100%;
    z-index: 1000
  }

</style>
