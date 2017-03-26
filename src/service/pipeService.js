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
    MAPINSTANCE: 'map_instance',
    ZOOMSTART: 'zoom_start',
    DRAGSTAET: 'drag_start',
    MAPPOLYLINE: 'map_polyline',
    DESTROYPOLYLINE: 'destroy_polyline',
    DISPLAYPOINTCHANGED: 'display_point_updated',
    INTERACTIONCHANGE: 'interaction_change',
    UPDATESELECTITEMS: 'update_selected_item',
    CONFIRMSELECTION:'confirm_selection',
    UPDATEIMGFROMIMGMAP2IMGLAYER: 'update_images_from_image_map_2_imagelayer',
    IMAGESELECTED:'image_selected',
    STREETSELECTED:'streets_selected',
    CITIESSELECTED:'cities_selected',
    SCREENIMAGES:'screen_images'
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

    //-------------------------------------------------------------
    emitCompMapZoomStart: function(msg){
      this.$emit(this.ZOOMSTART, msg);
    },
    onCompMapZoomStart: function(callback){
      this.$on(this.ZOOMSTART,function(msg){
        callback(msg);
      })
    },

    //-------------------------------------------------------------
    emitCompMapDragStart: function(msg){
      this.$emit(this.DRAGSTAET, msg);
    },
    onCompMapDragStart: function(callback){
      this.$on(this.DRAGSTAET,function(msg){
        callback(msg);
      })
    },

    //-------------------------------------------------------------
    emitPolyLine: function(msg){
      this.$emit(this.MAPPOLYLINE, msg);
    },
    onDrawPolyLine: function(callback){
      this.$on(this.MAPPOLYLINE,function(msg){
        callback(msg);
      })
    },

    //-------------------------------------------------------------
    emitDestroyPolyLine: function(msg){
      this.$emit(this.DESTROYPOLYLINE, msg);
    },
    onDestroyPolyLine: function(callback){
      this.$on(this.DESTROYPOLYLINE,function(msg){
        callback(msg);
      })
    },

    //--------------------------------------------------------------
    emitDisplayPointCloud: function(msg){
      this.$emit(this.DISPLAYPOINTCHANGED, msg);
    },
    onDisplayPointCloud: function(callback){
      this.$on(this.DISPLAYPOINTCHANGED,function(msg){
        callback(msg);
      })
    },
    //--------------------------------------------------------------
    //Change interactions, map interaction or select
    emitChagneInteractions: function(msg){
      this.$emit(this.INTERACTIONCHANGE, msg);
    },
    onChagneInteractions: function(callback){
      this.$on(this.INTERACTIONCHANGE,function(msg){
        callback(msg);
      })
    },


    //--------------------------------------------------------------
    emitUpdateSelectItems: function(msg){
      this.$emit(this.UPDATESELECTITEMS, msg);
    },
    onUpdateSelectItems: function(callback){
      this.$on(this.UPDATESELECTITEMS,function(msg){
        callback(msg);
      })
    },

    //--------------------------------------------------------------
    emitConfirmSelection: function(msg){
      this.$emit(this.CONFIRMSELECTION, msg);
    },
    onConfirmSelection: function(callback){
      this.$on(this.CONFIRMSELECTION,function(msg){
        callback(msg);
      })
    },

    //--------------------------------------------------------------
    emitUpdateImagesFromImgMap2ImgLayer: function(msg){
      this.$emit(this.UPDATEIMGFROMIMGMAP2IMGLAYER, msg);
    },
    onUpdateImagesFromImgMap2ImgLayer: function(callback){
      this.$on(this.UPDATEIMGFROMIMGMAP2IMGLAYER,function(msg){
        callback(msg);
      })
    },

    //--------------------------------------------------------------
    //These message are shared among all the component under the StreetVis
    emitImageGroupSelected: function(msg){
      this.$emit(this.IMAGESELECTED, msg);
    },
    onImageGroupSelected: function(callback){
      this.$on(this.IMAGESELECTED,function(msg){
        callback(msg);
      })
    },

    //----------------------------------------------------------------
    //Message send to the improved linechart
    emitStreetsSelected: function(msg){
      this.$emit(this.STREETSELECTED, msg);
    },
    onStreetsSelected: function(callback){
      this.$on(this.STREETSELECTED,function(msg){
        callback(msg);
      })
    },

    //----------------------------------------------------------------
    //Message send to matrixbarchart
    emitCitySelected: function(msg){
      this.$emit(this.CITIESSELECTED, msg);
    },
    onCitySelected: function(callback){
      this.$on(this.CITIESSELECTED,function(msg){
        callback(msg);
      })
    },

    //----------------------------------------------------------------
    //Message send
    emitScreenLocImages: function(msg){
      this.$emit(this.SCREENIMAGES, msg);
    },
    onScreenLocImages: function(callback){
      this.$on(this.SCREENIMAGES,function(msg){
        callback(msg);
      })
    },
  }
})

export default pipeService
