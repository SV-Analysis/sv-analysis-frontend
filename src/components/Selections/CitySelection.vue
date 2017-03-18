<template>
  <div id="navigation" class="navigation">

    <div style="height: 100%" class="map-list-container">
      <div class='navmap-container' v-for="cityInfo in cities">
        <div>
          <input style='float:left; margin-left: 20px'
                 v-bind:value='cityInfo.id' type="checkbox"
                 v-model="checkedItem" :disabled="cityInfo.notDisabled == 1? false: true">
          <div style='float:left; margin-left: 20px' for="checkbox">{{ cityInfo.name }}</div>
        </div>
        <NavMapView v-bind:cityInfo="cityInfo"></NavMapView>
      </div>
    </div>
  </div>
</template>

<script>
  import NavMapView from '../MapViews/NavMapView.vue'
  import pipeService from '../../service/pipeService'
  import dataService from '../../service/dataService'

  export default {
    name: 'citySelection',
    watch:{
      checkedItem: {
        deep: 'true',
        handler(newValue, oldValue){
          if(newValue.length == 2){
            for(var i = 0, ilen = this.cities.length; i < ilen; i++){
              this.cities[i].notDisabled = 0;
              for(var j = 0, jlen = newValue.length; j < jlen; j++){
                if(newValue[j] == this.cities[i].id) this.cities[i].notDisabled = 1;
              }
            }
          }else{
            for(var i = 0, ilen = this.cities.length; i < ilen; i++){
              this.cities[i].notDisabled = 1;
            }
          }
          let _this = this;

          newValue.forEach(function(cityId){
            if(_this.statistic[cityId] == undefined){
              dataService.queryStatistics(cityId, 'region', function(data){
                console.log('region', data)
              })
            }
          })

          pipeService.emitUpdateSelectedMapView(newValue);
        }
      }
    },
    data () {
      return {
        title: 'Navigation View',
        // City configuration should be loaded from the backend configuration files
        checkedItem: [],
        statistic:{

        },
        cities: [{
          'name': 'Hong Kong',
          'gps':[22.365354, 114.105228],
          'id':'hk',
          'selected': false,
          'notDisabled': 1
        },{
          'name': 'Singapore',
          'gps':[1.3149014, 103.7769792],
          'id': 'singapore',
          'selected': false,
          'notDisabled': 1
        },{
          'name': 'New York',
          'gps':[40.7058253, -74.1180861],
          'id': 'nyc',
          'selected': false,
          'notDisabled': 1
        },{
          'name': 'London',
          'gps':[51.528308,-0.3817765],
          'id': 'london',
          'selected': false,
          'notDisabled': 1
        }]
      }
    },
    mounted(){
      console.log('cityies', this.cities)
    },
    computed:{
      newMessage: function(){
        return this.title;
      },
      new_style: function(){
        if(this.$el)
        {
          let width = this.$el.clientWidth * this.cities.length + 'px';
          let height = (this.$el.clientWidth * 3  / 4) * this.cities.length + 'px';
          console.log('height', height)
          return {width: width, height: height }
        }
      }
    },
    components:{
      NavMapView
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #navigation{
    max-width: 100%;
    minwidth: 100%;

  }
  .map-list-container{
    max-width: 100%;
  }
  .navmap-container{
    margin-left: 20px;
    background: rgba(13,13,13,0.1);
    height: 180px;
  }
</style>
