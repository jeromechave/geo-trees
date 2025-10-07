<template>
  <div id="app">
    <Header></Header>
    <div id="content">

      <div class="content-section section-dark">
        <div class="content-wrapper">
          <h1>Opportunities</h1>
          <span class="default-text">Find news and opportunities for GEO-TREES here.</span>
        </div>
      </div>

      <div class="content-section section-light">
        <div class="content-wrapper">
          <h2>Awards & fellowships</h2>
          <span class="default-text" v-if="!opportunitiesData['awards'] || opportunitiesData['awards'].length==0" >Nothing new for now.</span>
          <div class="opportunities-item" v-for="item in opportunitiesData['awards']" :key="item.title">
            <div class="opportunities-item-title">{{ item.title }}</div>
            <div class="opportunities-item-date">{{ item.date }}</div>
            <div class="opportunities-item-text">{{ item.text }}</div>
            <div class="opportunities-item-link">
              <a v-for="link_text,i in item.link_text" :key="link_text" :href="item.link_url[i]" target="_blank">{{ link_text }}</a>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section section-white">
        <div class="content-wrapper">
          <h2>Job board</h2>
          <span class="default-text" v-if="!opportunitiesData['job'] || opportunitiesData['job'].length==0" >Nothing new for now.</span>
          <div class="opportunities-item" v-for="item in opportunitiesData['job']" :key="item.title">
            <div class="opportunities-item-title">{{ item.title }}</div>
            <div class="opportunities-item-date">{{ item.date }}</div>
            <div class="opportunities-item-text">{{ item.text }}</div>
            <div class="opportunities-item-link">
              <a v-for="link_text,i in item.link_text" :key="link_text" :href="item.link_url[i]" target="_blank">{{ link_text }}</a>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section section-light">
        <div class="content-wrapper">
          <h2>Workshops & seminar</h2>
          <span class="default-text" v-if="!opportunitiesData['workshop'] || opportunitiesData['workshop'].length==0" >Nothing new for now.</span>
          <div class="opportunities-item" v-for="item in opportunitiesData['job']" :key="item.title">
            <div class="opportunities-item-title">{{ item.title }}</div>
            <div class="opportunities-item-date">{{ item.date }}</div>
            <div class="opportunities-item-text">{{ item.text }}</div>
            <div class="opportunities-item-link">
              <a v-for="link_text,i in item.link_text" :key="link_text" :href="item.link_url[i]" target="_blank">{{ link_text }}</a>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section section-white">
        <div class="content-wrapper">
          <h2>News blog</h2>
          <span class="default-text" v-if="!opportunitiesData['blog'] || opportunitiesData['blog'].length==0" >Nothing new for now.</span>
          <div class="opportunities-item" v-for="item in opportunitiesData['job']" :key="item.title">
            <div class="opportunities-item-title">{{ item.title }}</div>
            <div class="opportunities-item-date">{{ item.date }}</div>
            <div class="opportunities-item-text">{{ item.text }}</div>
            <div class="opportunities-item-link">
              <a v-for="link_text,i in item.link_text" :key="link_text" :href="item.link_url[i]" target="_blank">{{ link_text }}</a>
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
import { getOpportunitiesData } from '@/import'

export default {
  name: 'Opportunities',
  components: {
    Header
  },
  computed: {
    opportunitiesData(){
      if(store.state.opportunitiesData){
        return store.state.opportunitiesData
      }
      return {}
    },
  },

  watch:{
    opportunitiesData(newVal){
      console.log(newVal)
    }
  },
  
  created(){

    getOpportunitiesData(store)
  
  }
}
</script>

<style lang="scss">

@import "../../../css/overload-fonts.css";
@import "../../../css/commons.scss";

#app {
  #content{
    background-color: #ffffff;
    .content-section{
      .content-wrapper{
        .opportunities-item{
          display: inline-block;
          text-align: left;
          .opportunities-item-date{
            font-size: 16px;
            color: #213043;
            font-family: "Lato-Regular";
            margin-bottom: 10px;
          }
        }
        .opportunities-item-title{
          font-size: 20px;
          color: #213043;
          font-family: "Lato-Bold";
          margin-bottom: 15px;
        }
        .opportunities-item-text{
          font-size: 20px;
          color: #213043;
          font-family: "Lato-Regular";
          margin-bottom: 20px;
          line-height: 35px;
          display: inline-block;
        }
        .opportunities-item-link{
          font-size: 20px;
          color: #213043;
          font-family: "Lato-Regular";
          margin-bottom: 10px;
          display: inline-block;
          a{
            color: white;
            background-color: #53A034;
            text-decoration: none;
            display: inline-block;
            margin-right: 10px;
            margin-bottom: 10px;
            padding: 10px 15px;
            &:hover{
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}

</style>
