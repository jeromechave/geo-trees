<template>
  <div id="app">
    <Header></Header>
    <div id="content">

      <div class="content-section section-dark">
        <div class="content-wrapper">
          <h1>Forest Plot Biomass data</h1>
          <h2>Data portal</h2>
          <span class="default-text">DATA.GEO-TREES is the data portal of the GEO-TREES initiative. Access data here : <a href="https://data.geo-trees.org/" target="_blank">data.geo-trees.org</a></span>
        </div>
      </div>

      <div class="content-section section-light">
        <div class="content-wrapper">
          <h2>Data Sharing</h2>
          <span class="default-text">The data collected by the GEO-TREES project is publicly accessible through the GEO-TREES web portal. The data sharing agreement should be consulted before downloading the data on the GEO-TREES web portal. For more information please download the <a href="GEOTREES_TermsConditions_1.2.pdf" download>Terms and Conditions</a>.</span>
        </div>
      </div>

        

    </div>
  </div>
</template>

<script>

import Header from '@/components/header.vue'

export default {
  name: 'Data',
  components: {
    Header
  },
  computed: {
  
  },

  watch:{
  
  },
  
  created(){
  
  }
}
</script>

<style lang="scss">

@import "../../../css/overload-fonts.css";
@import "../../../css/commons.scss";

#app {
  #content{
    background-color: #f4f7e4;
    .content-section{
      .content-wrapper{
        
      }
    }
  }
}

@media (max-width: 1023px) {

  #app {
    #content{
      .content-section{
        .content-wrapper{
    
        }
      }
    }
  }
}

@media (max-width: 767px) {

  #app {
    #content{
      .content-section{
        .content-wrapper{
        
        }
      }
    }
  }
}

</style>
