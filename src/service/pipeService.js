/**
 * Created by yiding on 2017/1/12.
 */
import Vue from 'vue'

var pipeService = new Vue({
  data:{
    UPDATEMAPBOUNDARY: 'update_map_bound',
    UPDATEMAPVIEWSELECTION: 'update_select_map_view_selection',
    ALLRESULTDATAREADYL: 'all_result_data_ready',
    INTERACTIVESELECTION: 'interactive_select',
    UPDATELAYER: 'update_layer',
    REGIONQUERYDATARECIEVED: 'region_query_data_recieved',
    MAPINSTANCE: 'map_instance'
  },

  methods:{
    emitUpdateMapBound: function(msg){
      this.$emit(this.UPDATEMAPBOUNDARY, msg);
    },
    onUpdateMapBound: function(callback){
      this.$on(this.UPDATEMAPBOUNDARY,function(msg){
        callback(msg);
      })
    },
    //------------------------------------------------------------
    emitUpdateSelectedMapView: function(msg){
      this.$emit(this.UPDATEMAPVIEWSELECTION, msg);
    },
    onUpdateSelectedMapView: function(callback){
      this.$on(this.UPDATEMAPVIEWSELECTION,function(msg){
        callback(msg);
      })
    },
    //------------------------------------------------------------
    emitUpdateAllResultData: function(msg){
      this.$emit(this.ALLRESULTDATAREADYL, msg);
    },
    onUpdateAllResultData: function(callback){
      this.$on(this.ALLRESULTDATAREADYL,function(msg){
        callback(msg);
      })
    },
    //------------------------------------------------------------
    emitInteractiveSelection: function(msg){
      this.$emit(this.INTERACTIVESELECTION, msg);
    },
    onInteractiveSelection: function(callback){
      this.$on(this.INTERACTIVESELECTION,function(msg){
        callback(msg);
      })
    },

    //------------------------------------------------------------
    emitUpdateMapLayer: function(msg){
      this.$emit(this.UPDATELAYER, msg);
    },
    onUpdateMapLayer: function(callback){
      this.$on(this.UPDATELAYER,function(msg){
        callback(msg);
      })
    },

    //------------------------------------------------------------
    // From CompMapView to Analysis view
    emitRegionQueryDataRecieved: function(msg){
      this.$emit(this.REGIONQUERYDATARECIEVED, msg);
    },
    onRegionQueryDataRecieved: function(callback){
      this.$on(this.REGIONQUERYDATARECIEVED,function(msg){
        callback(msg);
      })
    },

    //-------------------------------------------------------------
    emitMapInstance: function(msg){
      this.$emit(this.MAPINSTANCE, msg);
    },
    onMapInstance: function(callback){
      this.$on(this.MAPINSTANCE,function(msg){
        callback(msg);
      })
    },

  }
})

export default pipeService
