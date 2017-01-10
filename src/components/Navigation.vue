<template>
  <div class="navigation">
    <div>{{ title }}</div>
  </div>
</template>

<script>
  export default {
    name: 'navigation',
    data () {
      return {
        title: 'Navigation View',
      }
    },
    mounted(){

    },
    computed:{
      newMessage: function(){
        return this.title;
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
