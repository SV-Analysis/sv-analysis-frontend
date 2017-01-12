/**
 * Created by yiding on 2017/1/12.
 */
import Vue from 'vue'

var pipeService = new Vue({
    data:{
        UPDATEMAPBOUNDARY: 'update_map_bound'
    },
    methods:{
        emitUpdateMapBound: function(msg){
            this.$emit(this.UPDATEMAPBOUNDARY, msg)
        },
        onUpdateMapBound: function(callback){
            this.$on(this.UPDATEMAPBOUNDARY,function(msg){
                callback(msg);
            })
        },

    }
})

export default pipeService
