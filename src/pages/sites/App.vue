<template>
  <div id="app">
    <Header></Header>
    <div id="content">

      <div class="content-section section-dark">
        <div class="content-wrapper">
          <h1>Biomass Reference Measurement Sites</h1>
        </div>
        <iframe src="https://geo-trees.org/carto/" width="100%" height="600px"></iframe>
      </div>

      <div class="content-section section-light">
        <div class="content-wrapper">
          <h2>BRM Site directory</h2>
          <div class="sites-repertory">
            <div class="sites-repertory-country" v-for="(country,index) in sitesData" :key="index">
              <h3 class="country-name">{{ country[0]["country"] }}</h3>
              <div class="site-container" :class="{'open': openSites.includes(site)}" v-for="(site,siteindex) in country" :key="siteindex">
                <div class="site-name-container" @click="toggleSiteDetails(site)">
                  <h4 class="site-name" >{{ site.name }}</h4>
                  <span class="site-name-arrow" v-if="openSites.includes(site)">▶</span>
                  <span class="site-name-arrow" v-else>▼</span>
                </div>
                <div class="site-details">
                  <div class="site-details-item">
                    <div class="site-details-item-row">
                      <span class="site-details-item-label">Latitude: </span>
                      <span class="site-details-item-value">{{ site.latitude }}</span>
                    </div>
                    <div class="site-details-item-row">
                      <span class="site-details-item-label">Longitude: </span>
                      <span class="site-details-item-value">{{ site.longitude }}</span>
                    </div>
                    <div class="site-details-item-row" v-if="site.Website!=''">
                      <span class="site-details-item-label">Website: </span>
                      <a class="site-details-item-value" :href="site.Website" target="_blank">visit</a>
                    </div>
                    <div class="site-details-item-row" v-if="site.PI_Names.length>0">
                      <span class="site-details-item-label">PI Names: </span>
                      <span class="site-details-item-value" v-for="Names in site.PI_Names" :key="Names">{{ Names }}</span>
                    </div>
                    <div class="site-details-item-row" v-if="site.PI_Institutions_Names.length>0">
                      <span class="site-details-item-label">Supporting Institutions: </span>
                      <a class="site-details-item-value" v-for="Institutions_Names,i in site.PI_Institutions_Names" :key="Institutions_Names" :href="site.Support_Institutions_websites[i]" target="_blank">{{ Institutions_Names }}</a>
                    </div>
                    <!-- <div class="site-details-item-row" v-if="site.Funders.length>0">
                      <span class="site-details-item-label">Funders: </span>
                      <span class="site-details-item-value" v-for="Funders in site.Funders" :key="Funders">{{ Funders }}</span>
                    </div -->
                    <div class="site-details-item-row" v-if="site.Partners_Names.length>0">
                      <span class="site-details-item-label">Partners Names: </span>
                      <span class="site-details-item-value" v-for="Names in site.Partners_Names" :key="Names">{{ Names }}</span>
                    </div>
                    <div class="site-details-item-row" v-if="site.Partners_Institutions_Names.length>0">
                      <span class="site-details-item-label">Partners Institutions: </span>
                      <a class="site-details-item-value" v-for="Partners_Institutions_Names,i in site.Partners_Institutions_Names" :key="Partners_Institutions_Names" :href="site.Partners_Institutions_Websites[i]" target="_blank">{{ Partners_Institutions_Names }}</a>
                    </div>
                    <div class="site-details-item-row" v-if="site.Networks_Names.length>0">
                      <span class="site-details-item-label">Networks: </span>
                      <a class="site-details-item-value" v-for="Networks_Names,i in site.Networks_Names" :key="Networks_Names" :href="site.Networks_websites[i]" target="_blank">{{ Networks_Names }}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>

import Header from '@/components/header.vue'
import store from '@/store'
import { getSitesData } from '@/import'

export default {
  name: 'Sites',
  data(){
    return {
      openSites:[],
    }
  },
  components: {
    Header
  },
  computed: {
    sitesData(){  
      return store.state.sitesData
    },
  },

  watch:{
  
  },

  methods:{

    toggleSiteDetails(site){
      if(this.openSites.includes(site)){
        this.openSites = this.openSites.filter(i => i !== site)
      }else{
        this.openSites.push(site)
      }
    }
  },
  
  created(){
    getSitesData(store)
  }
}
</script>

<style lang="scss">

@import "../../../css/overload-fonts.css";
@import "../../../css/commons.scss";

#app {
  #content{
    .content-section{
      iframe{
        transform: translateY(60px);
      }
      .content-wrapper{
        .sites-repertory{
          display: flex;
          flex-direction: column;
          gap: 20px;
          .sites-repertory-country{
            display: flex;
            flex-direction: column;
            gap: 10px;
            .country-name{
              font-size: 28px;
              font-family:"Lato-Bold";
              color: #213043;
              margin-bottom: 10px;
            }
            .site-container{
              display: flex;
              flex-direction: column;
              gap: 10px;
              margin-bottom: 10px;
              &.open{
                .site-details{
                  height: auto;
                }
              }
              .site-name-container{
                font-size: 20px;
                font-family:"Lato-Bold";
                color: #53A034;
                cursor: pointer;
                display: flex;
                flex-direction: row;
                gap: 5px;
                align-items: center;
                .site-name{
                  margin-bottom: 0;
                }
                .site-name-arrow{
                  font-size: 12px;
                  opacity: 0.5;
                }
              }
              
              .site-details{
                overflow:hidden;
                height: 0;
                .site-details-item{
                  display: flex;
                  flex-direction: column;
                  gap: 10px;
                  .site-details-item-row{
                    display: flex;
                    flex-direction: row;
                    gap: 10px;
                    .site-details-item-label{
                      font-family:"Lato-Bold";
                    }
                    .site-details-item-value{
                      font-family:"Lato-Regular";
                    }
                    a{
                      color: #213043;
                    }
                  }
                }
              }
            }
          }
        }
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
          .sites-repertory{
            .sites-repertory-country{
              .country-name{
                font-size: 24px;
              }
            }
          }
        }
      }
    }
  }
}

</style>
