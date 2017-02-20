<template>
  <div>
    <label class="typo__label">Single select</label>
    <!--<multiselect v-model="value" :options="options" :searchable="false" :close-on-select="false" :show-labels="false" placeholder="Pick a value"></multiselect>-->
    <pre class="language-json"><code>{{ value  }}</code></pre>
  </div>
</template>
<script>
  //  import Multiselect from 'vue-multiselect'

  export default {
    name: 'msview',
    components: {
//      Multiselect
    },
    data () {
      return {
        value: '',
        options: ['Select option', 'options', 'selected', 'mulitple', 'label', 'searchable', 'clearOnSelect', 'hideSelected', 'maxHeight', 'allowEmpty', 'showLabels', 'onChange', 'touched']
      }
    }
  }
</script>
<style scoped>
  .vis-container{
    height: 100%;
    /*background-color: rgba(170, 229, 231, 0.84);*/
  }
</style>
