<template>
  <div>
    <div>{{ title }} </div>
    <button v-for="para in parameters" class="btn btn-primary dataset-btn ng-scope ng-binding">{{para.name}}</button>
  </div>

</template>

<script>

  export default {
    name: 'control',
    data(){
      return {
        title: "Control Pannel",
        parameters: [
          {'name': 'B1', 'type': 'radio'},
          {'name': 'B2', 'type': 'slider'},
          {'name': 'B3', 'type': 'inputbox'}
        ]
      }
    }
  }
</script>
