<template>
  <div>
    <div class="table-container">

      <el-select class="selection"
                 size="small" v-model="selectedCity" placeholder="Select City">
        <el-option
          v-for="option in cityOptions"
          :label="option.name"
          :value="option.id">
        </el-option>
      </el-select>

      <el-select style = 'margin-left: 5px' class="selection"
                 size="small" v-model="selectedCondition" placeholder="Condition">
        <el-option
          v-for="option in queryConditions"
          :label="option"
          :value="option">
        </el-option>
      </el-select>


      <table class="region-table">
        <!--<col width="16.67%">-->
        <thead >
        <tr>
          <th height="30" v-for="attr in attrObj" class="head-style">{{attr}}</th>
        </tr>
        </thead>
        <tbody>

        <tr v-for="record in regionArray"  v-if="record['dataType']=='adregion'">
          <td oncontextmenu="return false;"
              v-bind:class="record['attr']['SL'] ? 'selectRow' : 'notSelectRow'"
              v-on:click='rowClick(record)'
              v-on:contextmenu="rightClick(record)"
              v-for="attr_name in attrObj">
            {{record.attr[attr_name]}}
          </td>
        </tr>

        <tr class="extand_map" v-else-if="record['dataType']=='adregion_map'"><td colspan="6">
          <RegionMap v-bind:cityInfo="currentCity" v-bind:adRegionData="record['context']" ></RegionMap></td>
        </tbody>
      </table>


    </div>
    <el-pagination
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      layout="prev, pager, next"
      :page-size="30"
      :total="totalRecords">
    </el-pagination>
  </div>
</template>
<script>
  import pipeService from '../../service/pipeService'
  import * as Config from '../../Config'
  import dataService from '../../service/dataService'
  import RegionMap from '../MapViews/RegionMap.vue'
  export default {
    props: ['selectIdMap'],
    components:{
      RegionMap
    },
    data() {
      return {
        attrObj: ['SL', 'id', 'area', 'img_len'],
        regionArray: [],
        cityOptions: Config.cityOptions,
        selectedCity: null,
        totalRecords: 0,
        endIndex: 'End',
        currentLen: 30,
        svFeatures2Color: Config.svFeatures2Color,
        serverLink: Config.serverLink,
        queryConditions:Config.svFeatures2Color['allFeatures'],
        currentPage: 1,
        selectedCondition: null
      };
    },
    methods: {
      initPaginationInput(){

        this.endIndex = this.startIndex + this.currentLen - 1;
      },
      selectionChanged(){
        if(!(this.selectedCity && this.selectedCondition)) return
        console.log('changed')
        let _this = this;
        this.cityOptions.forEach(function(city){
          if(city['id'] == _this.selectedCity){
            _this.currentCity = city;
          }
        });

        this.initPaginationInput();
        this._queryRegionSimp();

      },
      _queryRegionSimp(){
        let _this = this;
        let startTime = new Date();
        dataService.queryRegionCollections(this.selectedCity, this.startIndex, this.currentLen, this.selectedCondition, function(records){
          let endTime = new Date();
          console.log('Time1 ', endTime - startTime);
          _this._parseRegionRecords(records, _this.selectedCity);
          console.log('Time2 ', new Date() - endTime);
        })
      },
      _parseRegionRecords(recordObj, city){
        let records = recordObj['records'];
        let total = recordObj['total'];
        let _this = this;
        let udpateData = [];
        console.log('records', records)
        records.forEach(function(record){
//        City is somehow hack
          record['attr'] = record['attr'] == undefined ? {}: record['attr'];
          record['attr']['id'] = record['rid'];
          record['attr']['area'] = 21;
          record['attr']['img_len'] = record['img_len'];

          record['dataType'] = 'adregion';
          record['clicked'] = false;
          record['city'] = city;
          let record_id = record['city'] + '_' + record['dataType'] + '_' + record['id'];
          if(_this.selectIdMap[record_id]){
            record['attr']['SL'] = true;
          }
          else{
            record['attr']['SL'] = false;
          }
          udpateData.push(record);
        });
        _this.regionArray = udpateData;
        _this.totalRecords = total;
      },
      rowClick(record){
        console.log('click', record);
        let index = -1;
        for(var i = 0; i < this.regionArray.length; i++){
          if(record == this.regionArray[i]){
            index = i;
            break;
          }
        }
        if(index != -1 && this.regionArray[index]['clicked'] == false){
          // Insert a new element at index
          let mapDataType = 'adregion_map';

          this.regionArray.splice(index + 1, 0, {
            dataType: mapDataType,
            context: this.regionArray[index]
          });

          this.regionArray[index]['clicked'] = true;
        }else if(index != -1 && this.regionArray[index]['clicked'] == true){
          this.regionArray[index]['clicked'] = false;
          this.regionArray.splice(index + 1, 1);
        }
      },
      rightClick(record){
        record['attr']['SL'] = !record['attr']['SL'];
        let item = {
          id: record['city'] + '_' + record['dataType'] + '_' + record['id'],
          city: record['city'],
          type: record['dataType'],
          record: record,
          updateSign: record['attr']['SL']
        };

        if(record['aggregatedImages'] == undefined){
          let agImgList = this._createAggregatedImglist(record['image_list']);
          record['aggregatedImages'] = agImgList;
        }
        pipeService.emitUpdateSelectItems(item);
      },
      _createAggregatedImglist(imgList){
        if(imgList == undefined) return;
        let _this = this;

        let features = this.svFeatures2Color['allFeatures'];
        let locationMap = {};
        let aggregateImgList = [];
        for(let i = 0, ilen = imgList.length; i < ilen; i++){
          let imgObj = imgList[i];
          let [x, y] = imgObj['location'];

          if(locationMap[x] == undefined){
            locationMap[x] = {};
          }
          if(locationMap[x][y] == undefined){
            locationMap[x][y] = {
              imgList:[],
              location: [x,y],
              attrObj:{}
            };
            aggregateImgList.push(locationMap[x][y])
          }
          locationMap[x][y]['imgList'].push(imgObj);
        }
        aggregateImgList.forEach(function(agImg, i){
          // Init attrs in the AggregateImgOb
          features.forEach(function(attr){
            agImg['attrObj'][attr] = 0;
          });
          //  Calculate Attr
          agImg['imgList'].forEach(function(imgObj){
            features.forEach(function(attr){
              agImg['attrObj'][attr] += (imgObj[attr] / agImg['imgList'].length);
            })
          });
          let largestValue = 0;
          let largestAttr = null;
          features.forEach(function(attr){
            if(largestValue < agImg['attrObj'][attr]){
              largestValue = agImg['attrObj'][attr]
              largestAttr = attr;
            }
          });
          agImg['max_attr'] = {
            attr: largestAttr,
            value: largestValue
          }
          agImg['img_path'] = agImg['imgList'][0]['img_path'];
          agImg['id'] = 'aggregate_' + agImg['imgList'][0]['index'];


          let imgPath = agImg['img_path']
          let imgitems = imgPath.split('/');
          let cityname = imgitems[0];
          let cid = imgitems[2];
          let iid = imgitems[3];

          let imgLink = _this.serverLink  + 'getImage?city=' + cityname +'&cid='+cid +'&iid=' + iid;
          agImg['formatImgPath'] = imgLink;
          agImg['aggregateIndex'] = i;
        });

        return aggregateImgList;

      },
      handleCurrentChange(val){
        this.currentPage = val;
      }
    },
    watch:{
      selectedCity(newValue, oldValue){
        this.selectionChanged();
      },
      currentPage(newValue, oldValue){
        this._queryRegionSimp();
      },
      selectedCondition(){
        this.selectionChanged();
      }
    },
    computed:{
      startIndex: function(){
        return (this.currentPage - 1) * this.currentLen;
      }
    },
    mounted(){



    },
  };
</script>
<style scope>

  .table-container{
    width:100%;
    /*height:100%;*/
    max-height: 750px;
    overflow-y: auto;
  }
  .region-table{
    /*margin-top:10px;*/
    padding: auto;
    width: 100%;
    border: 1px solid #ddd;
    max-height: 80%;
    overflow-y: auto;
  }
  .head-style{
    text-align: center;
    background-color: #F9FAFB;
    font-weight: bold;
    /*color: #fff;*/
  }
  .selection{
    width: 120px;
    float:left;
    margin-bottom: 10px;
    margin-top: 0px;
  }

  .selectRow{
    background-color: #d6e9c6;
  }
  .notSelectRow{
    background-color: white;
  }

  th{
    border-bottom: 1px solid #dfe6ec;
    border-right: 1px solid #dfe6ec;
    background-color: #eef1f6;
  }
  td{
    border-bottom: 1px solid #dfe6ec;
    border-right: 1px solid #dfe6ec;
  }
</style>
