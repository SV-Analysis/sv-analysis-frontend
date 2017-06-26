<template>
  <div class="comp-mapview">

    <!--<el-dialog class = 'dialogStyle' title="提示" :visible.sync="dialogVisible" size="tiny" :before-close="handleClose">-->
    <!--<span>这是一段信息</span>-->
    <!--<span slot="footer" class="dialog-footer">-->
    <!--<el-button @click="dialogVisible = false">取 消</el-button>-->
    <!--<el-button type="primary" @click="dialogVisible = false">确 定</el-button>-->
    <!--</span>-->
    <!--</el-dialog>-->
  </div>
</template>

<script>
  import pipeService from '../../service/pipeService'
  import DetailMap from '../../lib/DetailMap'
  import dataService from '../../service/dataService'
  import * as d3 from 'd3'
  import L from "leafLet";

  export default {
    name: 'comp-mapview',
    props: ['cityInfo'],
    data () {
      return {
        title: 'comp-mapview',
        points_world: [],
        disablePoint: false,
        regionSign: 'city',
        currentPolygons: [],
        id2Boundary:{},
        dialogVisible :false,
      }
    },
    mounted(){
      let _this = this;
      this.createMap();
      console.log('regionInfo', this.cityInfo);

      let regions = [];
      let boundary = [];
      let bounds = null;
      if(this.cityInfo.subRegion != undefined){
        this.cityInfo.subRegion.forEach(r=>{
          let boundaryNodes = r['boundary'];
          regions.push(boundaryNodes);
          boundary.push(boundaryNodes)
        });
        console.log('boundary', boundary);


        let bounds = this.getBound(regions);

        this.mapObj.fitBounds(bounds);
        _this.mapObj.drawMultiplePolylines(boundary, _this.cityInfo.regioName, true);
      }
      if(regions.length != 0){
        _this.regionSign = 'region'
        _this.id2Boundary[this.cityInfo['regionName']] = regions;
        console.log('id2Boundary', _this.id2Boundary, regions);
      }

//      All the using of the dataService functions should be repackaged.
      dataService.getAllRecordsForOneCity(this.cityInfo['id'], function(data){
        _this.points_world = data;
        let level = _this.mapObj.getZoomLevel();
        let _temp_points = _this.generateSample(_this.points_world, 14 - level);
        let current_points = _this.mapObj.worldToContaierPointsArr(_temp_points);
        if(regions.length != 0){
          _this.id2Boundary[_this.cityInfo['regionName']] = regions;
        }
//        if(_this.cityInfo.regionId != undefined){
//          console.log('here', _this.cityInfo);
//
//
//
//          this.cityInfo.subRegion.forEach(r=>{
//            let boundaryNodes = r['boundary'];
//            regions.push(boundaryNodes);
//            boundary.push(boundaryNodes)
//          });
//        }
        _this.updatePointCloud();

      });

      pipeService.onInteractiveSelection(function(msg){
        let cityId = msg['cityId'];
        let positions = msg['region'];
        if(positions.length <= 2) return;  //position <= 2 means a single click
        if(cityId !=  _this.cityInfo.id) return;
        var world_position = _this.mapObj.contaierPointsToWorld(positions);
        dataService.queryRegionFromBackground( _this.cityInfo['id'], world_position, function(data){
          pipeService.emitRegionQueryDataRecieved(data);
          _this.dialogVisible = !_this.dialogVisible;

          console.log('select add ?',_this.open())

        });
      });
      pipeService.onUpdateMapLayer(function(msg){
        let cityId = msg['cityId'];
        if(cityId !=  _this.cityInfo.id) return;
        _this.mapObj.updateLayer(msg['layerName']);
      });

      pipeService.onDrawPolyLine(function(msg){
        console.log('draw poly line', msg);
        let cityId = msg['cityId'];
        if(cityId !=  _this.cityInfo.id) return;

        let polyLinePoints = msg['polyLinePoints'];
        let imageList = msg['imageList'];
        let selectionId = msg['selectionId'];
        _this.mapObj.drawMultiplePolylines(polyLinePoints, selectionId, msg.regionSign);
        _this.mapObj.drawImagePoints(imageList, selectionId);

        //        let cityId = msg['cityId'];
//        let streetInfo = msg['streetInfo'];
//        _this.mapObj.drawPolygon(streetInfo);
//        _this.mapObj.drawPointsToMap(streetInfo);
      });

      pipeService.onDestroyPolyLine(function(msg){
        let cityId = msg['cityId'];
        if(cityId !=  _this.cityInfo.id) return;



        _this.mapObj.deletePolyline(msg['selectionId']);
        _this.mapObj.deletePoints(msg['selectionId']);
      });

      pipeService.onDisplayPointCloud(function(msg){
        if(msg.cityId == _this.cityInfo.id){
          //  Duplicated id 0110021
          _this.disablePoint = msg['disablePoints']
          _this.updatePointCloud();
        }
      });

//      pipeService.onSelectRegion(function(msg){
//        console.log('here');
//        if(msg['cityId']!=  _this.cityInfo.id) return
//
//        if(msg['attr']['SL'] == true){
//
//          _this.regionSign = 'region';
//          let regions = [];
//          msg['subRegion'].forEach(function(r){
//            regions.push(r['boundary'])
//          });
//
//          _this.id2Boundary[msg['name']] = regions;
//          _this.updatePointCloud();
//        }else if(msg['attr']['SL'] == false){
//          delete _this.id2Boundary[msg['name']]
//          _this.updatePointCloud()
//        }
//
//      });

      pipeService.onSelectedRegionByClick(region=>{
        console.log('newSelected', region);
        let regions = [];
        region.subRegion.forEach(r=>{
          regions.push(r['boundary'])
        });
        let bounds = this.getBound(regions);

        this.mapObj.fitBounds(bounds);

        _this.id2Boundary[region['name']] = regions;
        setTimeout(d=>{
          _this.updatePointCloud();
        }, 200)

      });
    },
    computed:{
      cityId(){
        return this.cityInfo.id;
      }
    },
    watch:{
      'cityInfo.bound': function(newData, oldData){
        let _this = this;
        if(newData == null) return;
        if(!this.mapObj) return;
        this.mapObj.fitBounds(newData);

        if(this.points_world && this.points_world.length != 0){
//          HACK
          setTimeout(function(){
            _this.updatePointCloud()
          }, 400);
        }
      },
      pointType(newType){

      }
    },
    methods:{
      open() {
        this.$alert('', 'Add this region to Ranking View?', {
          confirmButtonText: 'Confirm',
          callback: (msg) => {
            console.log(' ${ action }, ', msg);
            if(msg == 'confirm'){
              pipeService.emitSelectRegionByDrag();
            }else{

            }
          }
        });
      },
      handleClose(){

      },
      getBound(boundary){
        let xExtent = d3.extent(boundary, function(list){
          return d3.extent(list, function(d){
            return d[0]
          });
        });
        let yExtent = d3.extent(boundary, function(list){
          return d3.extent(list, function(d){
            return d[1]
          });
        });
        let bounds = L.latLngBounds(L.latLng(yExtent[0][0], xExtent[0][0]), L.latLng(yExtent[0][1], xExtent[0][1]));
        return bounds;
      },
      generateSample(array, n){
        var result = [];
        for(var i = 0; i < array.length; i += n){
          result.push(array[parseInt(i)]);
        }
        return result;
      },

      createMap(){
        let _this = this;
        this.mapObj = new DetailMap(this.$el, this.cityInfo);
        this.mapObj.init();
//        this.mapObj.disableAllInteraction();
        this.mapObj.addMapScale();

        this.mapObj.onEvent('dragend', function(event){
          setTimeout(function(){
            _this.updatePointCloud()
          }, 400);

        });
        this.mapObj.onEvent('zoomend', function(event){
          _this.updatePointCloud();
        });

        this.mapObj.onEvent('zoomstart', function(event){
          pipeService.emitCompMapZoomStart({'cityId': _this.cityInfo['id']});
        });
        this.mapObj.onEvent('movestart', function(event){
          pipeService.emitCompMapDragStart({'cityId': _this.cityInfo['id']});
        });

      },
      updatePointCloudInPolygons(){
        let _this = this;

      },
      updatePointCloud(){
        console.log('update');
        let _this = this;
        let zoomLevel = this.mapObj.getZoomLevel();

        if(this.disablePoint == true){
          pipeService.emitUpdateAllResultData({
            'cityId': _this.cityInfo['id'],
            'data': [],
            'regionId':_this.cityInfo['regionId'],
            'zoomLevel': zoomLevel});
        }else{
          if(zoomLevel >= 13){
            console.log('zoomLevel', zoomLevel);
            let regions = _this.mapObj.getBoundsRegion();
            let positions = [
              regions.getSouthWest(), regions.getSouthEast(),
              regions.getNorthEast(), regions.getNorthWest()
            ];

            dataService.queryRegionFromBackground( this.cityInfo['id'], positions, function(data){
              let current_points = null;
              if(_this.regionSign == 'city')
                current_points = _this.mapObj.worldToContaierPointsObj(data);
              else
                current_points = _this.mapObj.worldToContaierPointsObj(data, _this.id2Boundary)
              pipeService.emitUpdateAllResultData({
                'cityId': _this.cityInfo['id'],
                'regionId':_this.cityInfo['regionId'],
                'data': current_points,
                'zoomLevel': zoomLevel});
            })
          }else{
            console.log('zoomLevel', zoomLevel);
            let level = _this.mapObj.getZoomLevel();
            let _temp_points = _this.mapObj.filterPointsArrInBounds(_this.points_world);
//            _temp_points = _this.generateSample(_temp_points,14 - level);
            let current_points = null;
            if(_this.regionSign == 'city')
              current_points = _this.mapObj.worldToContaierPointsArr(_temp_points);
            else
              current_points = _this.mapObj.worldToContaierPointsArr(_temp_points, _this.id2Boundary)

            pipeService.emitUpdateAllResultData({
              'cityId': _this.cityInfo['id'],
              'regionId':_this.cityInfo['regionId'],
              'data': current_points,
              'zoomLevel': zoomLevel});
          }
        }

      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .comp-mapview{
    /*float: left;*/
    /*margin-left: 3%;*/
    width: 100%;
    background: rgba(13,13,13,0.1);
    height: 100%
  }
  .dialogStyle{
    width: 800px;
    height: 300px;
    z-index: 1010;
  }
</style>
