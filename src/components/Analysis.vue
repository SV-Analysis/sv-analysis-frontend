<template>
  <div class="statistic-list">
    <!--<div>{{ title }}</div>-->
    <div style="display: inline-block; float: left" v-for="query in queryList" class="barChartContainer-container">
      <div> {{query.cityId}} {{query.number}}</div>
      <BarChart v-bind:regionQueryData="query" v-bind:svFeatures2Color="svFeatures2Color"></BarChart>
    </div>
  </div>
</template>

<script>
  import pipeService from '../service/pipeService'
  import BarChart from './visChart/BarChart.vue'
  export default {
    name: 'analysis',
    props: ['svFeatures2Color'],
    components:{
      BarChart
    },
    data () {
      return {
        title: 'Analysis View',
        queryList:[]
//      {cityId, dataRecord, number, attr{building, car, sky, green, others, road}}
      }
    },
    mounted(){
      let _this = this;
      pipeService.onRegionQueryDataRecieved(function(data){
        _this.queryList.push(_this.praseRegionQueryResult(data));
      })
    },
    computed:{
    },

    methods:{
      parseFeatures(){

      },
      praseRegionQueryResult(data){
        let time = new Date();
        let region = data['region'];
        let records = data['records'];
        let features = this.svFeatures2Color['allFeatures'];
        let featureStaDict = {};
        let featureRatioDict = {};
        features.forEach(function(feature){
          featureStaDict[feature] = 0;
        });
        let sum = 0;
        for(var i = 0, ilen = records.length; i < ilen; i++){
          let record = records[i];
          features.forEach(function(feature){
            featureStaDict[feature] += parseFloat(record[feature]);
            sum += parseFloat(record[feature]);
          });
        }
        features.forEach(function(feature){
          featureRatioDict[feature] = featureStaDict[feature] / sum;
        });

        let output = {
          cityId: data['cityId'],
          featureArr: features,
          featureSta: featureStaDict,
          featureRatio: featureRatioDict,
          number: records.length
        };
        return output;
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
  .barChartContainer-container{
    /*background: rgba(13,13,13,0.1);*/

    /*width: 100%*/
    padding-left: 15px
  }
</style>
