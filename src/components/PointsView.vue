<template>
  <div class="pointview">

  </div>
</template>

<script>
  import PointCloud from '../lib/PointCloud'
  export default {
    name: 'pointsview',
    data () {
      return {
        title: 'Points View'
      }
    },
    mounted(){
      this.createPointsView();
    },
    computed:{
    },
    methods:{
      createPointsView(){
        this.pointView = new PointCloud(this.$el);
        this.pointView.init();
        this.pointView.animate()
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .pointview{
    float: left;
    width: 100%;
    height: 100%;
    z-index: 1000
  }

</style>
