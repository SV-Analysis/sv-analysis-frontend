<template>
  <div id="navigation" class="navigation">
    <div>{{ title }}</div>
    <div style="height: 100%" v-bind:style="new_style">
      <div class='navmap-container' v-for="cityInfo in cities">
        <div>
          <input style='float:left; margin-left: 10px' v-bind:value='cityInfo.id' type="checkbox"
                 v-model="checkedItem" :disabled="cityInfo.notDisabled == 1? false: true">
          <div style='float:left; margin-left: 20px' for="checkbox">{{ cityInfo.name }}</div>
        </div>
        <NavMapView v-bind:cityInfo="cityInfo"></NavMapView>
      </div>
    </div>
  </div>
</template>

<script>
  import 'leaflet/dist/leaflet.css'
  import NavMapView from './MapViews/NavMapView.vue'
  import pipeService from '../service/pipeService'

  export default {
    name: 'navigation',
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
          pipeService.emitUpdateSelectedMapView(newValue);
        }
      }
    },
    data () {
      return {
        title: 'Navigation View',
        // City configuration should be loaded from the backend configuration files
        checkedItem: [],
        cities: [{
          'name': 'New York',
          'gps':[40.7058253, -74.1180861],
          'id': 'nyc',
          'selected': false,
          'notDisabled': 1
        },{
          'name': 'Singapore',
          'gps':[1.3149014, 103.7769792],
          'id': 'singapore',
          'selected': false,
          'notDisabled': 1
        },{
          'name': 'Hong Kong',
          'gps':[22.365354, 114.105228],
          'id':'hk',
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
    },
    computed:{
      newMessage: function(){
        return this.title;
      },
      new_style: function(){
        let width = 350 * this.cities.length + 'px';
        return {width: width}
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
    overflow-x: auto;

  }
  .navmap-container{
    float: left;
    /*position: absolute;*/
    margin-left: 20px;
    width: 300px;

    background: rgba(13,13,13,0.1);
    height: 80%
  }
</style>
