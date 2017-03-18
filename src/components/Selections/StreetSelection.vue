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

      <table class="street-table">
        <!--<col width="16.67%">-->
        <thead >
        <tr>
          <th height="30" v-for="attr in attrObj" class="head-style">{{attr}}</th>
        </tr>
        </thead>
        <tbody>

        <tr v-for="record in streetArray" v-if="record['dataType']=='street'">
          <td oncontextmenu="return false;"
              v-bind:class="record['attr']['SL'] ? 'selectRow' : 'notSelectRow'"
              v-on:click='rowClick(record)'
              v-on:contextmenu="rightClick(record)"
              v-for="attr_name in attrObj">
            {{record.attr[attr_name]}}
          </td>
        </tr>

        <tr class="extand_map" v-else-if="record['dataType']=='street_map'"><td colspan="6">
          <RegionMap v-bind:cityInfo="currentCity"
                     v-bind:streetData="record['context']"
          >
          </RegionMap></td>
        </tr>

        </tbody>
      </table>
    </div>
    <el-pagination
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      layout="prev, pager, next"
      :page-size="30"
      :total="totalRecord">
    </el-pagination>

  </div>

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
        attrObj: ['SL','id','tag', 'streetType','img_len'],
        streetArray: [],
        cityOptions: Config.cityOptions,
        selectedCity: null,
        totalRecord: 0,
        endIndex: 'End',
        currentLen: 30,
        svFeatures2Color: Config.svFeatures2Color,
        serverLink: Config.serverLink,
        currentPage: 1,
        queryConditions:Config.svFeatures2Color['allFeatures'].concat(['img_len']),
        selectedCondition:'img_len'
      };
    },
    methods: {
      initPaginationInput(){
        this.startIndex = 0;
        this.currentPage = 1;
        this.endIndex = this.startIndex + this.currentLen - 1;
      },
      selectionChanged(){
        let _this = this;
        this.cityOptions.forEach(function(city){
          if(city['id'] == _this.selectedCity){
            _this.currentCity = city;
          }
        });
        if(!this.selectedCity) return;
        this.initPaginationInput();
        this._queryStreet();

      },
      _queryStreet(){
        let _this = this;
        dataService.queryStreetCollections(this.selectedCity, this.startIndex, this.currentLen,this.selectedCondition, function(recordObj){
          _this._parseStreetRecords(recordObj, _this.selectedCity)
        })
      },
      _parseStreetRecords(recordObj, city){
        let records = recordObj['records'];
        let total = recordObj['total'];
        let _this = this;
        let udpateData = [];
        let number  = 0;
        records.forEach(function(record){
//        City is somehow hack
          number++;
          record['dataType'] = 'street';
          record['clicked'] = false;
          record['attr']['id'] = record['id'];
          record['attr']['tag'] = record['tag'];
          record['attr']['img_len'] = record['image_list'].length;
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
        _this.streetArray = udpateData;
        _this.totalRecord = total;
        pipeService.emitStreetsSelected(_this.streetArray);
      },
      rowClick(record){
        let index = -1;
        for(var i = 0; i < this.streetArray.length; i++){
          if(record == this.streetArray[i]){
            index = i;
            break;
          }
        }
        if(index != -1 && this.streetArray[index]['clicked'] == false){
          // Insert a new element at index
          let mapDataType = 'street_map'

          this.streetArray.splice(index + 1, 0, {
            dataType: mapDataType,
            context: this.streetArray[index]
          });

          this.streetArray[index]['clicked'] = true;
        }else if(index != -1 && this.streetArray[index]['clicked'] == true){
          this.streetArray[index]['clicked'] = false;
          this.streetArray.splice(index + 1, 1);
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
        this._queryStreet();
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
    max-height: 750px;
    overflow-y: auto;
  }
  .street-table{
    width: 100%;
    padding: auto;
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
    width: 100px;
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
