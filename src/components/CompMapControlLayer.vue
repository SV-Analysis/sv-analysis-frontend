<template>
  <div class="selection-layer">
    <div class="control-buttons">
      <button v-on:click="changeDisplay()" id="display-points" type="button" class="btn btn-default btn-xs self-button" aria-label="Left Align">
        <span class="glyphicon " aria-hidden="true">D</span>
      </button>


    </div>
  </div>
</template>

<script>

  import DragSelection from '../lib/DragSelection'
  import pipeService from '../service/pipeService'

  export default {
    name: 'select-layer',
    props: ['cityInfo'],
    data () {
      return {
        title: 'Points View',
        disablePoint: false
      }
    },
    mounted(){
      this.createSelectLayer();
    },
    computed:{
    },
    methods:{
      createSelectLayer(){
        let _this = this;
        this.dragSelection = new DragSelection(this.$el);
        this.dragSelection.registerDragEnd(function(event){
          let selectionRegion = event.subject;
          pipeService.emitInteractiveSelection({
            'cityId': _this.cityInfo.id, 'region': selectionRegion
          });
        });
      },
      changeDisplay(){
        this.disablePoint = !this.disablePoint;
        pipeService.emitDisplayPointCloud({'cityId': this.cityInfo.id, 'disablePoints': this.disablePoint})
      }
    },
    watch:{

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .selection-layer{
    float: left;
    width: 100%;
    height: 100%;
    z-index: 1001;

  }
  .control-buttons{
    position: absolute;
    width: 20px;
    left: 5px;
    top: 5px;
    pointer-events: auto;
  }
  .self-button{
    margin-top: 3px
  }
</style>
