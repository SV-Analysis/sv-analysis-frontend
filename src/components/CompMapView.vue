<template>
  <div class="comp-mapview">
  </div>
</template>

<script>
  export default {
    name: 'comp-mapview',
    props: ['cityInfo'],
    data () {
      return {
        title: 'comp-mapview'
      }
    },
    mounted(){
      console.log('this', this.cityInfo, this.$el);
      this.createMap();
    },
    computed:{
    },
    methods:{
      createMap(){
        var cities = new L.LayerGroup();

        var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
          mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

        let grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: null});
        let streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: null});

        var map = L.map(this.$el, {
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

        L.control.layers(baseLayers, overlays).addTo(map);
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
