<template>
  <div class="selection-layer">

  </div>
</template>

<script>
//  import * as d3 from 'd3';
  import DragSelection from '../lib/DragSelection'
  import pipeService from '../service/pipeService'

  export default {
    name: 'select-layer',
    props: ['cityInfo'],
    data () {
      return {
        title: 'Points View'
      }
    },
    mounted(){
      this.createSelectLayer()
    },
    computed:{
    },
    methods:{
      createSelectLayer(){
        this.dragSelection = new DragSelection(this.$el);
        this.dragSelection.registerDragEnd(function(event){
          let selectionRegion = event.subject;
          pipeService.emitInteractiveSelection(selectionRegion);
          console.log('select', selectionRegion);
        });
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .selection-layer{
    float: left;
    width: 100%;
    height: 100%;


    z-index: 1001
  }

</style>
