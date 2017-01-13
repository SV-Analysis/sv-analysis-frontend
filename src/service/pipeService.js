/**
 * Created by yiding on 2017/1/12.
 */
import Vue from 'vue'

var pipeService = new Vue({
  data:{
    UPDATEMAPBOUNDARY: 'update_map_bound',
    UPDATEMAPVIEWSELECTION: 'update_select_map_view_selection',
    ALLRESULTDATAREADYL: 'all_result_data_ready',
    UPDATEALLRESULTBYINTERACTION: 'update_all_result_by_interaction'
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
    emitUpdateResultByInteraction: function(msg){
      this.$emit(this.UPDATEALLRESULTBYINTERACTION, msg);
    },
    onUpdateResultByInteraction: function(callback){
      this.$on(this.UPDATEALLRESULTBYINTERACTION,function(msg){
        callback(msg);
      })
    }

  }
})

export default pipeService