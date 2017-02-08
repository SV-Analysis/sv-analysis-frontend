<template>
  <div class="region-list">
   Region
  </div>
</template>

<script>

  export default {
    name: 'analysis',
    props: ['svFeatures2Color'],
    components:{

    },
    data () {
      return {
        title: 'Analysis View',
        queryList:[]
//      {cityId, dataRecord, number, attr{building, car, sky, green, others, road}}
      }
    },
    mounted(){

    },
    computed:{
    },

    methods:{
      parseFeatures(){

      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .statistic-list{
    max-height: 99%;
    overflow-x: auto;
  }

</style>
