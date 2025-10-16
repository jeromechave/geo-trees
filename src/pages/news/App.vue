<template>
  <div id="app">
    <Header></Header>
    <div id="content">

      <div class="content-section section-dark">
        <div class="content-wrapper">
          <h1>News</h1>
          <span class="default-text">Learn more about the main development and accomplishments driving the GEO-TREES project forward.</span>
        </div>
      </div>

      <div class="content-section section-light">
        <div class="content-wrapper">
          <span class="default-text" v-if="!news || news.length==0" >Content forthcoming.</span>
          <div class="news-item" v-for="news in newsData" :key="news.title">
            <div class="news-item-image">
              <img :src="news.img_url" alt="News image"/>
            </div>
            <div class="news-item-content">
              <div class="news-item-title">{{ news.title }}</div>
              <div class="news-item-date">{{ news.date }}</div>
              <div class="news-item-text">{{ news.text }}</div>
              <div class="news-item-link">
                <a v-for="link_text,i in news.link_text" :key="link_text" :href="news.link_url[i]" target="_blank">{{ link_text }}</a>
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
import { getNewsData } from '@/import'

export default {
  name: 'News',
  components: {
    Header
  },
  computed: {
    newsData(){  
      return store.state.newsData
    },
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
      .content-wrapper{
        .news-title{
          display: inline-block;
          text-align: left;
          font-size: 35px;
          color: #213043;
          font-family: "Lato-Bold";
          padding: 10px 0px;
          line-height: 35px;
          margin-bottom: 10px;
        }
        .news-item{
          display: flex;
          text-align: left;
          padding: 20px 0px;
          .news-item-image{
            width: 25%;
            background-color: #213043;
            margin-bottom: 20px;
            margin-right: 20px;
            aspect-ratio: 1;
            overflow: hidden;
            img{
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
          .news-item-content{
            width: calc(75% - 20px);
            .news-item-date{
              font-size: 16px;
              color: #213043;
              font-family: "Lato-Regular";
              margin-bottom: 10px;
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
              display: inline-block;
            }
            .news-item-link{
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
  }
}

@media (max-width: 767px) {
  #app {
    #content{
      .content-section{
        .content-wrapper{
          .news-item{
            flex-direction: column;
            .news-item-image{
              width: 100%;
              
              
            }
            .news-item-content{
              width: 100%;
            }
          }
        }
      }
    }
  }
}
</style>
