<template>
  <nav class="navbar navbar-default navbar-custom">
    <!-- container to make the display of navbar to be centered -->
    <div class="container">
      <div class="navbar-header">
        <a class="navbar-brand hidden-sm" href="http://vis.cse.ust.hk/" >Navbar head</a>
      </div>

      <!--Navbar right or left -->
      <div class="navbar-collapse collapse navbar-right" >
        <ul class="nav navbar-nav">
          <li v-for="item in buttons" >

            <a v-bind:href= "item.link">{{ item.name }}</a>
          </li>
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown">Choose Data <span class="caret"></span></a>
            <ul class="dropdown-menu" role="menu">
              <li><a href="#">Button</a></li>
              <li><a href="#">Button</a></li>
              <li><a href="#">Button</a></li>
              <li class="divider"></li>
              <li class="dropdown-header">Description</li>
              <li><a href="#">Button</a></li>
              <li><a href="#">Button</a></li>
            </ul>
          </li>

        </ul>
        <ul class="nav navbar-nav navbar-right hidden-sm">
          <li><a href="">About</a></li>
        </ul>
      </div>
    </div>
  </nav>
</template>


<script>
  export default {
    name: 'navbar',
    data(){
      return {
        title: 'Street View Analysis',
        buttons: [
          {'name': 'Start', 'link': "http://www.huamin.org/"},

        ]
      }
    }
  }
</script>

<style scoped>
  .navbar-default{
    background: rgb(0,153,218);
  }
  .navbar-default .navbar-brand {
    color: #fff;
  }
  .navbar-default .navbar-nav > li > a {
    color: #fff;
}

</style>
