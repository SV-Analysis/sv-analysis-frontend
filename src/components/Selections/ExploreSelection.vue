<template>
  <div class="exploreSelection">
    <div v-on:mouseover="mouseOver" >Explore{{streets.length}} {{regions.length}}</div>
  </div>
</template>
<script>
  import pipeService from '../../service/pipeService'
  import * as Config from '../../Config'
  import dataService from '../../service/dataService'
  import MulitExploration from '../../lib/MultiExploration/MulitExploration.js'
  import * as d3 from 'd3'
  export default {
    props: [''],
    components:{

    },
    data() {
      return {
        streets: [],
        streetMap:{},
        regions: [],
        region:{},
        selected: [],
        isInitRender: false,
        attrs: []
      };
    },
    methods: {
      mouseOver:function(){

      },
      initRender: function(){
        console.log('el config ', this.$el.clientWidth);
        if(this.isInitRender) return;
        this.isInitRender = true;
        this.multiExploration = new MulitExploration(this.$el, Config.svFeatures2Color);
        this.multiExploration.setAttrs(this.attrs);

        this.multiExploration.update(this.streets);
      }
    },
    watch:{

    },
    computed:{

    },
    mounted(){

      let features = Config.svFeatures2Color.allFeatures.slice();
      let attrs = ['id'].concat(features);
      this.attrs = attrs;
      pipeService.onSelectRegion((record)=>{
        let id = record['rid'];
        this.regions.push(record);
      });
      pipeService.onUpdateSelectItems((record)=>{
        let id = record['id'];
        this.streets.push(record);
        if(this.multiExploration)
          this.multiExploration.update(this.streets);
      });
      pipeService.onTabClicked((msg)=>{
        if(msg == 'explore'){
          setTimeout(()=>{
            this.initRender();
          }, 1);
        }
      });
    }
  };
</script>
<style scope>
  .exploreSelection{

    width: 100%;
    height: 100%;
  }

</style>
