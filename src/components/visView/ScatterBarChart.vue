<template>
  <svg class="scatter-bar-chart">

  </svg>
</template>

<script>
  import * as d3 from 'd3'
  export default {
    name: 'scatterBarChart',
    props:['regionQueryData', 'svFeatures2Color', 'selectItems'],
    data () {
      return {
        title: 'BarChart',
      }
    },
    mounted(){
      this.drawBarChart(this.selectItems[0], this.selectItems[1]);
    },
    computed:{

    },
    methods:{
      drawBarChart(sourceItem, targetItem){
        let _this = this;
        let featureArray = this.svFeatures2Color['allFeatures'];
        if(sourceItem == undefined || targetItem == undefined){
          console.log('Undefined item')
          return
        }
        let width = this.$el.clientWidth;
        let height = this.$el.clientHeight;
        let svg = d3.select(this.$el);
        svg.append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', 'none')
          .attr('stroke', '#7084f9')
          .attr('stroke-width', 3)

        let margin_x = 30;
        let margin_y = height * 2.5 / 10;
        let matrixSize = height - margin_y * 2;

        let firstArray = sourceItem['record']['image_list'];
        let secondArray = targetItem['record']['image_list'];
        let matrixRegion = svg.append('g').attr('transform', function(d, i){
          return 'translate(' +  (margin_x ) +
            ',' + (margin_y) + ')'
        });

        matrixRegion.append('rect')
          .attr('width', matrixSize)
          .attr('height', matrixSize)
          .attr('fill', 'none')
          .attr('opacity', 0.2)


        let regionMargin = 2;
        let regionWidthWithMargin = matrixSize / (featureArray.length);
        let regionWidth = regionWidthWithMargin - regionMargin * 2;
        let regionArray = [];
        let index = 0;
        let maxRatio = 0;
        for(var i = 0; i < featureArray.length; i++){
          for(var j = i ; j < featureArray.length; j++){
            regionArray[index] ={x: j,y :i}
            index ++;
          }
          firstArray.forEach(function(d){
            if(maxRatio < d[featureArray[i]]){
              maxRatio = d[featureArray[i]];
            }
          })
        }
        maxRatio = maxRatio / 100;
        let regions = matrixRegion.selectAll('.rect-region')
          .data(regionArray)
          .enter()
          .append('g').attr('class', 'rect-region')
          .attr('transform', function(d, i){
            return 'translate(' +  ((d['x'] ) * regionWidthWithMargin ) +
              ',' + (d['y'] * regionWidthWithMargin) + ')'
          });


        // Draw scatter plot matrix
        regions.each(function(attr){
          let pointContainer = d3.select(this);
          let xscale = d3.scaleLinear().range([regionMargin, regionWidth - regionMargin])
            .domain([0 , maxRatio + 0.1])
          let yscale = d3.scaleLinear().range([regionMargin, regionWidth - regionMargin])
            .domain([0 , maxRatio + 0.1])

          pointContainer.append('rect')
            .attr('x', regionMargin)
            .attr('y', regionMargin)
            .attr('width', regionWidth)
            .attr('height', regionWidth)
            .attr('fill', 'none')
            .attr('stroke', '#5499f9')
            .attr('stroke-width', 1)
            .append('title')
            .text(d=>d['x'] + ',' + d['y']);
          let firstAttr = featureArray[attr['x']];
          let secondAttr = featureArray[attr['y']];

          pointContainer.selectAll('.scatter-point-x')
            .data(firstArray)
            .enter()
            .append('circle')
            .attr('class', 'scatter-point-x')
            .attr('cx', function(d){
              let ratio = d[firstAttr];
              let xvalue = xscale(ratio / 100)
              return xvalue
            })
            .attr('cy', function(d){
              let ratio = d[secondAttr];
              let yvalue = yscale(ratio/ 100)
              return yvalue
            })
            .attr('r', 1)
            .attr('fill','rgb(255, 187, 120)')
            .attr('opacity', 0.5)

          pointContainer.selectAll('.scatter-point-y')
            .data(secondArray)
            .enter()
            .append('circle')
            .attr('class', 'scatter-point-y')
            .attr('cx', function(d){
              let ratio = d[firstAttr];
              let xvalue = xscale(ratio / 100)
              return xvalue
            })
            .attr('cy', function(d){
              let ratio = d[secondAttr];
              let yvalue = yscale(ratio/ 100)
              return yvalue
            })
            .attr('r', 1)
            .attr('fill','rgb(44, 160, 44)')
            .attr('opacity', 0.3)

        });

        // Draw barchart
        let barChartContainer = svg.append('g').attr('class','regionssss');
        let barCollections = barChartContainer.selectAll('.barcharts')
          .data(featureArray)
          .enter()
          .append('g')
          .attr('class', 'barcharts')
          .attr('transform', function(d, i){
            return 'translate(' + (margin_x + matrixSize) + ',' + (margin_y + i * regionWidthWithMargin + regionMargin) + ')';
          });

        barCollections.append('rect')
          .attr('width', matrixSize)
          .attr('height', regionWidth)
          .attr('fill', 'none')
          .attr('stroke-width', 1)
          .attr('stroke', '#5499f9')
          .attr('opacity', 1);

        let axis = d3.axisBottom();

        let axisContainer = barCollections.append('g').attr('class', '.dimension')
          .attr("transform", function(d) {
            return "translate(" + 0 + ',' + (regionWidth / 2) + ")";
          });


        let numberOfScale = 20;
        let attr2RatioArray = [{},{}];
        let largestIndex = 0;
        barCollections.each(function(attr){
          attr2RatioArray[0][attr] = [];
          attr2RatioArray[1][attr] = [];
          for(let i = 0; i < numberOfScale; i++){
            attr2RatioArray[0][attr][i] = 0;
            attr2RatioArray[1][attr][i] = 0;
          }
          firstArray.forEach(function(item){
            let value = parseInt(parseInt(item[attr]) / (100 / numberOfScale));
            attr2RatioArray[0][attr][value] += 1;
            if(largestIndex < value) largestIndex = value;
          })
          secondArray.forEach(function(item){
            let value = parseInt(parseInt(item[attr]) / (100 / numberOfScale));
            attr2RatioArray[1][attr][value] += 1;
            if(largestIndex < value) largestIndex = value;
          })
        });

        let x_scale = d3.scaleLinear().domain([0, largestIndex / 20]).range([0, matrixSize]);
        axisContainer.append("g")
          .attr("class", "axis")
          .each(function(d) { d3.select(this).call(axis.scale(x_scale)); })
          .append("text")
          .style("text-anchor", "middle")
          .text(function(d) {
            return d;
          });


      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .scatter-bar-chart{
    margin-top: 0px;
    width: 100%;
    height: 100%
  }
</style>
