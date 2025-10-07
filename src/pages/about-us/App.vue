<template>
  <div id="app">
    <Header></Header>
    <div id="content">
      <div class="content-section section-dark">
        <div class="content-wrapper">
          <h1>About us</h1>
          <h2>GEO-TREES is enabled by a consortium of established forest inventory networks, advanced concept teams and user groups.</h2>
          <span class="default-text">Many users will benefit from GEO-TREES. These include the Earth Observation community, ecological, forest and biodiversity researchers, and earth system modellers. As confidence in biomass maps increases, GEO-TREES will assist diverse groups including governments, policy-makers, communities and enterprises -everyone needing to know where forest carbon is and how it is changing.</span>
        </div>
      </div>

      <div class="content-section section-light">
        <div class="content-wrapper">
          <h2>Governance</h2>
          <img class="center" src="../../assets/governance-image-2.png"/>
        </div>
      </div>

      <div class="content-section section-white" v-if="aboutData">
        <div class="content-wrapper">

          <h2>Executive Board</h2>
          <div class="team-member-list">
            <div class="team-member" v-for="member in executiveBoard" :class="member.group" v-bind:key="member.name">
              <div class="team-member-image">
                <img :class="(member.name=='Camille Piponiot'?'zoom':'')" :src="'https://geo-trees.org/geo-trees/img/'+member.image"/>
              </div>
              <h3>{{member.name}}</h3>
              <span class="team-member-role">{{member.role}}</span>
              <span class="team-member-affiliation">{{member.affiliation}}</span>
            </div>
          </div>

          <h2>Project Managers</h2>
          <div class="team-member-list">
            <div class="team-member" v-for="member in projectManager" :class="member.group" v-bind:key="member.name">
              <div class="team-member-image">
                <img :src="'https://geo-trees.org/geo-trees/img/'+member.image"/>
              </div>
              <h3>{{member.name}}</h3>
              <span class="team-member-role">{{member.role}}</span>
              <span class="team-member-affiliation">{{member.affiliation}}</span>
            </div>
          </div>

          <h2>Scientific Advisory Board</h2>
          <div class="team-member-list">
            <div class="team-member" v-for="member in scientificBoard" :class="member.group" v-bind:key="member.name">
              <div class="team-member-image">
                <img :class="(member.name=='Luiz Aragão'||member.name=='Bonaventure Sonké'||member.name=='Laura Duncanson'?'zoom':'')" :src="'https://geo-trees.org/geo-trees/img/'+member.image"/>
              </div>
              <h3>{{member.name}}</h3>
              <span class="team-member-role">{{member.role}}</span>
              <span class="team-member-affiliation">{{member.affiliation}}</span>
            </div>
          </div>

          <h2>Network Partners</h2>
          <div class="partners-logo-list x-small-logo">
            <a class="partner-logo" v-for="member in networksPartners" v-bind:key="member.name" :href="member.link" target="_blank"><img :src="'https://geo-trees.org/geo-trees/img/'+member.image"/></a>
          </div>

          <h2>Site Partners</h2>
          <a href="https://geo-trees.org/sites.html">More information about the sites</a>
          <div class="partners-logo-list x-small-logo">
            <a class="partner-logo" v-for="member in sitePartners" v-bind:key="member.name" :href="member.link" target="_blank"><img :src="'https://geo-trees.org/geo-trees/img/'+member.image"/></a>
          </div>

          <h2>Supporting Partners</h2>
          <div class="partners-logo-list x-small-logo">
            <a class="partner-logo" v-for="member in supportingPartners" v-bind:key="member.name" :href="member.link" target="_blank"><img :src="'https://geo-trees.org/geo-trees/img/'+member.image"/></a>
          </div>

        </div>
      </div>
      
    </div>
  </div>
</template>

<script>

import Header from '@/components/header.vue'
import { getData } from '../../import.js'
import store from '@/store'

export default {
  name: 'About-us',
  components: {
    Header
  },
  data(){
    return {}
  },
  computed: {
    executiveBoard(){
      return this.aboutData.filter(member => member.group === "executive-board");
    },
    projectManager(){
      return this.aboutData.filter(member => member.group === "project-manager");
    },
    scientificBoard(){
      return this.aboutData.filter(member => member.group === "scientific-board");
    },
    networksPartners(){
      return this.aboutData.filter(member => member.group === "networks-partners");
    },
    sitePartners(){
      return this.aboutData.filter(member => member.group === "site-partners");
    },
    supportingPartners(){
      return this.aboutData.filter(member => member.group === "supporting-partners");
    },
    aboutData(){
      return store.state.aboutData
    }
  },

  watch:{
  
  },
  
  created(){
    getData(store)
  }
}
</script>

<style lang="scss">

@import "../../../css/overload-fonts.css";
@import "../../../css/commons.scss";

#app {
  #content{
    .content-section{
      .content-wrapper{
        .center{
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        a{ 
          text-decoration: none;
          font-family: "Lato-Regular";
          font-size: 18px;
          color: #213043;
          text-decoration: underline;
        }
        .team-member-list{
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          gap: 50px 0px;
          padding-top: 50px;
          margin-bottom: 100px;
          .team-member{
            width: 33%;
            text-align: center;
          }
          .team-member-image{
            width: 100px;
            height: 100px;
            border-radius: 50%;
            position: relative;
            overflow: hidden;
            margin: 0 auto;
            border:3px solid #53A034;
            box-sizing: border-box;
            &.no-border{
              border:none;
            }
            img{
              width: 100%;
              height: auto;
              position: absolute;
              left:50%;
              top:50%;
              transform: translate(-50%, -50%);
              &.zoom{
                width: 150px;
              }
            }
          }
          h3{
            font-family: "Lato-Bold";
            font-size: 20px;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          span{
            display: block;
            font-family: "Lato-Regular";
            font-size: 18px;
            margin-bottom: 5px;
          }
        }
        .partners-logo-list{
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 50px 25px;
          margin-top: 50px;
          margin-bottom: 100px;
          .partner-logo{
            width: 30%;
            height: 150px;
            img{
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }
          &.small-logo{
            .partner-logo{
              width: 12%;
              height: 125px;
            }
          }
          &.x-small-logo{
            .partner-logo{
              width: 12%;
              height: 100px;
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
          .partners-logo-list{
            &.small-logo{
              .partner-logo{
                width: 15%;
              }
            }
            &.x-small-logo{
              .partner-logo{
                width: 15%;
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
        .team-member-list{
          gap: 30px 0px;
          padding-top: 20px;
          .team-member{
            width: 50%;
          }
          h3{
            font-size: 18px;
          }
          span{
            font-size: 16px;
          }
        }
        .partners-logo-list{
          .partner-logo{
            width: 28%;
          }
          &.small-logo{
            .partner-logo{
              width: 28%;
            }
          }
          &.x-small-logo{
            .partner-logo{
              width: 28%;
            }
          }
        }
      }
    }
  }
}

}

</style>
