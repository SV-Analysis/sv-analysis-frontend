/**
 * Created by qshen on 16/6/2017.
 */

let Unit = function(id, attr, value, x, y, type, raw){
  this.id = id;
  this.value = value;
  this.attr = attr;
  this.xIndex = x;
  this.yIndex = y;
  this.pos = [x, y];
  this.el = {};
  this.raw = raw;
  this.type = type == undefined? value: type;
  this.updateIndex = function(_x, _y){
    this.xIndex = _x == undefined? this.xIndex: _x;
    this.yIndex = _y == undefined? this.yIndex: _y;
  }
};

let ColumnConfig = function(){
  let _this = this;
  this.attrs = [];
  this.attrs2Index = {};
  this.resortAttrs = function(){
    this.attrs.forEach(function(attr, i){
      _this.attrs2Index[attr] = i;
    })};

  this.setAttrs = function(attrs){
    this.attrs = attrs.slice();
    this.resortAttrs();
  };
  this.test = function(){
    console.log('test', this.attrs, this.attrs2Index);
  };
  this.getColumNumber = function(){
    return this.attrs.length;
  }
};

let RowConfig = function(){
  let _this = this;
  this.ids = [];
  this.id2Index = {};
  this.resortIds = function(){
    this.schemas.forEach(function(id, index){
      _this.id2Index[id] = index;
    })
  }
};


export {
  Unit,
  ColumnConfig,
  RowConfig
}
