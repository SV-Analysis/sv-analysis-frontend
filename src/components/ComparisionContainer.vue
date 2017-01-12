<template>
  <div class="comparision-container">
    <div>{{ title }}</div>
    <CompMap v-for="cityInfo in cities" v-bind:cityInfo="cityInfo"></CompMap>
  </div>
</template>

<script>
  import CompMap from './CompMapView.vue'

  export default {
    name: 'comparision-container',
    data () {
      return {
        title: 'Comparision View',
        cities: [{
          'name': 'New York',
          'gps':[40.7058253, -74.1180861],
          'id': 'nyc'
        },{
          'name': 'Singapore',
          'gps':[1.3149014, 103.7769792],
          'id': 'singapore'
        }]
      }
    },
    mounted(){

    },
    computed:{

    },
    components:{
      CompMap
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
