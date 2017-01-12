<template>

  <div class="nav-mapview">
  </div>
</template>

<script>
  import pipeService from '../service/pipeService'


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
        if(!this.map) return;
        let region = this.map.getBounds();
        pipeService.emitUpdateMapBound({
          'region': region,
          'id': _this.cityInfo['id']
        })
      },
      createMap(){
        let _this = this;
        var cities = new L.LayerGroup();
        var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
          mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

        let grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: null});
        let streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: null});

        this.map = L.map(this.$el, {
          center: this.cityInfo.gps,
          zoom: 9,
          layers: [grayscale, cities],
          zoomControl: false
        });

        var baseLayers = {
          "Grayscale": grayscale,
          "Streets": streets
        };

        var overlays = {
          "Cities": cities
        };

        L.control.layers(baseLayers, overlays).addTo(this.map);
        this.map.on('zoomend', function(event) {
          _this.sendMapRegion();
        });

        this.map.on('dragend', function(event) {
          _this.sendMapRegion();
        });
      }

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .nav-mapview{
    float: left;
    /*position: absolute;*/

    width: 300px;

    background: rgba(13,13,13,0.1);
    height: 100%
  }
</style>
