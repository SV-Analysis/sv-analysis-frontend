<template>
  <div id="navigation" class="navigation">
    <div>{{ title }}</div>
    <div style="width: 300%; height: 100%">
      <NavMapView v-for="cityInfo in cities" v-bind:cityInfo="cityInfo"></NavMapView>
    </div>
  </div>
</template>

<script>
  import 'leaflet/dist/leaflet.css'
  import L from 'leaflet'
  import NavMapView from './NavMapView.vue'

  export default {
    name: 'navigation',
    data () {
      return {
        title: 'Navigation View',
        // City configuration should be loaded from the backend configuration files
        cities: [{
          'name': 'New York',
          'gps':[40.7058253, -74.1180861],
          'id': 'nyc'
        },{
          'name': 'Singapore',
          'gps':[1.3149014, 103.7769792],
          'id': 'singapore'
        },{
          'name': 'Hong Kong',
          'gps':[22.365354, 114.105228],
          'id':'hk'
        },{
          'name': 'London',
          'gps':[51.528308,-0.3817765],
          'id': 'london'
        }
        ]
      }
    },
    mounted(){
    },
    computed:{
      newMessage: function(){
        return this.title;
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
    width: 300%;
    max-width: 100%;
    minwidth: 800px;
    overflow-x: auto;


  }
</style>
