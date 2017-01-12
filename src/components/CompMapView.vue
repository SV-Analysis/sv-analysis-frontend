<template>
  <div class="comp-mapview">
  </div>
</template>

<script>
  import pipeService from '../service/pipeService'
  import DetailMap from '../lib/DetailMap'

  export default {
    name: 'comp-mapview',
    props: ['cityInfo'],
    data () {
      return {
        title: 'comp-mapview'
      }
    },
    mounted(){
      let _this = this;
      this.createMap();
    },
    computed:{
      cityId(){
        return this.cityInfo.id;
      }
    },
    watch:{
      'cityInfo.bound': function(newData, oldData){
        if(newData == null) return;
        this.mapObj.fitBounds(newData);
      }
    },
    methods:{
      createMap(){
        this.mapObj = new DetailMap(this.$el, this.cityInfo);
        this.mapObj.init();
        console.log('this', this.mapObj);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .comp-mapview{
    float: left;
    margin-left: 3%;
    width: 45%;
    background: rgba(13,13,13,0.1);
    height: 88%
  }
</style>
