<template>
  <div class="selection-layer"></div>
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
        disablePoint: false,
        mapInteraction: false,
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
      },
      changeInteraction(){
        this.mapInteraction = !this.mapInteraction;
        pipeService.emitChagneInteractions({'cityId': this.cityInfo.id, 'mapInteraction': this.mapInteraction})
      }
    },
    watch:{

    }
  }
</script>

<style scoped>
  .selection-layer{
    float: left;
    width: 100%;
    height: 100%;
    z-index: 1001;

  }
</style>
