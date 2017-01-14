/**
 * Created by yiding on 2017/1/14.
 */
import * as d3 from 'd3'

let DragSelection = function(el) {
  let _this = this;
  this.$el = el;
  this.width = el.clientWidth;
  this.height = el.clientHeight;

  let select_container = d3.select(this.$el).append('svg');
  select_container.attr('width', this.width).attr('height', this.height);

  // Refactor the code
  let line = d3.line()
    .curve(d3.curveBasis);

  select_container
    .call(d3.drag()
      .container(function () {
        return this;
      })
      .subject(function () {
        var p = [d3.event.x, d3.event.y];
        return [p, p];
      })
      .on("start", dragstarted)
      .on('end', function () {
        // let selectionRegion = d3.event.subject;
        // pipeService.emitInteractiveSelection(selectionRegion);
        if(_this.dragCallBack) _this.dragCallBack(d3.event);
        select_container.selectAll('path').remove();
      }));

  function dragstarted() {
    var d = d3.event.subject,
      active_select = select_container.append("path").datum(d),
      x0 = d3.event.x,
      y0 = d3.event.y;
    d3.event.on("drag", function () {
      var x1 = d3.event.x,
        y1 = d3.event.y,
        dx = x1 - x0,
        dy = y1 - y0;

      if (dx * dx + dy * dy > 100) d.push([x0 = x1, y0 = y1]);
      else d[d.length - 1] = [x1, y1];
      active_select.attr("d", line).attr('fill-opacity', 0.3).attr('fill', 'white')
    });

  }
};

DragSelection.prototype.registerDragEnd = function(endDragCallback){
  this.dragCallBack = endDragCallback;
};


export default DragSelection
