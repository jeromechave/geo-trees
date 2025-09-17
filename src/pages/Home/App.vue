<template>
  <div id="app">
    <Header></Header>
    <div id="content">
      <div class="content-section homepage-banner">
        <div class="content-wrapper">
          <h1>GEO-TREES: high-accuracy ground data</h1>
          <h2>for satellite-derived biomass mapping</h2>
        </div>
        <div class="homepage-banner-overlay"></div>
      </div>
      <div class="content-section">
        <div class="content-wrapper">
          <div class="homepage-intro">
            <span>
              Land vegetation is a large carbon store and represents opportunities to sequester additional carbon. While many Earth Observation missions aim to estimate forest biomass from space, their calibration and validation is critical. Ultimately trust in biomass maps requires accurate ground data. Supporting ground measurements and the people who make them is thus mission-critical for mapping and tracking Earth’s forest carbon. Building on decades of work from the global research community with a strong representation of partners from the Global South, the GEO-TREES initiative aims to fund high quality ground data from a global network of long-term forest inventories, and to make these data openly accessible.
            </span>
          </div>
          <div class="homepage-intro">
            <span>The Terms of Reference of the GEO-TREES initiative are available <a href="https://geo-trees.org/about-us.html">here</a>.</span>
          </div>
          <div class="homepage-intro">
            <span>GEO-TREES implements the recommendations of the <a href="https://lpvs.gsfc.nasa.gov/AGB/AGB_home.html" target="_blank">CEOS Aboveground Biomass Land Product Validation protocol</a>.</span>
          </div>
        </div>
      </div>
      <div class="content-section news-section">
        <div class="content-wrapper">
          <h3 class="news-title">News</h3>
          <div class="news-item" v-for="news in newsData" :key="news.title">
            <div class="news-item-date">{{ news.date }}</div>
            <div class="news-item-title">{{ news.title }}</div>
            <div class="news-item-text">{{ news.text }}</div>
            <div class="news-item-link">
              <a v-for="link_text,i in news.link_text" :key="link_text" :href="news.link_url[i]" target="_blank">{{ link_text }}</a>
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
import { getNewsData } from '@/import'

export default {
  name: 'Homepage',
  components: {
    Header
  },

  computed: {
    newsData(){  
      return store.state.newsData
    },
  },

  watch:{
  },
  
  created(){
    getNewsData(store)
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
      position: relative;
      &.news-section{
        background-color: #fff;
        padding-top: 0px;
      }
      &.homepage-banner{
        background-image: url("../../assets/homepage-background.jpg");
        background-size: cover;
        background-position: center;
        position: relative;
      }
      .homepage-banner-overlay{
        background-color: #000000;
        opacity: 0.3;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      }
      .content-wrapper{
        position: relative;
        z-index: 1;
        text-align: left;
        h1{
          color: #fff;
          display: block;
          margin-top: 20px;
          text-align: center;
        } 
        h2{
          color: #fff!important;
          display: block;
          margin-bottom: 10px;
          font-size: 56px;
          text-align: center;
        }
        .homepage-intro{
          display: inline-block;
          margin-top: 0;
          text-align: left;
          width: 100%;
          span{
            display: inline-block;
            text-align: left;
            font-size: 20px;
            color: #213043;
            font-family: "Lato-Regular";
            padding: 10px 20px;
            line-height: 35px;
            a{
              color: #53A034;
              text-decoration: none;
            }
          }
        }
      }
      .news-title{
        display: inline-block;
        text-align: left;
        font-size: 35px;
        color: #213043;
        font-family: "Lato-Bold";
        padding: 10px 20px;
        line-height: 35px;
        margin-bottom: 10px;
      }
      .news-item{
        display: inline-block;
        text-align: left;
        padding: 20px 20px;
        .news-item-date{
          font-size: 16px;
          color: #213043;
          font-family: "Lato-Regular";
          margin-bottom: 10px;
        }
      }
      .news-item-title{
        font-size: 20px;
        color: #213043;
        font-family: "Lato-Bold";
        margin-bottom: 15px;
      }
      .news-item-text{
        font-size: 20px;
        color: #213043;
        font-family: "Lato-Regular";
        margin-bottom: 10px;
        line-height: 35px;
        display: inline;
      }
      .news-item-link{
        font-size: 20px;
        color: #213043;
        font-family: "Lato-Regular";
        margin-bottom: 10px;
        display: inline;
        a{
          color: #53A034;
          text-decoration: none;
          display: inline;
          margin-left: 10px;
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
          h2{
            font-size: 35px;
          }
        }
      }
    }
  }
}

@media (max-width: 767px) {

  #app {
    #content{
      .content-section{
        &.homepage-banner{
          padding: 20px 0 20px 0;
        }
        .content-wrapper{
          h1{
            margin-bottom: 10px;
          }
          h2{
            margin-bottom: 0px;
          }
          .homepage-intro{
            font-size: 18px;
            span{
              line-height: 32px;
            }
          }
        }
      }
    }
  }
}

</style>
