<template>
  <SiteHeader />
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
        <img class="center" src="@/assets/governance-image-2.png" alt="GEO-TREES governance structure"/>
      </div>
    </div>

    <div class="content-section section-white" v-if="aboutData">
      <div class="content-wrapper">

        <h2>Executive Board</h2>
        <div class="team-member-list">
          <div class="team-member" v-for="(member, position) in executiveBoard" :class="member.group" :key="position">
            <div class="team-member-image">
              <img :style="{'width': member.zoom+'%'}" :src="sheetImage(member.image)" alt=""/>
            </div>
            <h3>{{member.name}}</h3>
            <span  v-if="member.role" class="team-member-role">{{member.role}}</span>
            <span  v-if="member.affiliation" class="team-member-affiliation">{{member.affiliation}}</span>
          </div>
        </div>

        <h2>Project Managers</h2>
        <div class="team-member-list">
          <div class="team-member" v-for="(member, position) in projectManager" :class="member.group" :key="position">
            <div class="team-member-image">
              <img :src="sheetImage(member.image)" alt=""/>
            </div>
            <h3>{{member.name}}</h3>
            <span class="team-member-role">{{member.role}}</span>
            <span class="team-member-affiliation">{{member.affiliation}}</span>
          </div>
        </div>

        <h2>Scientific Advisory Board</h2>
        <div class="team-member-list">
          <div class="team-member" v-for="(member, position) in scientificBoard" :class="member.group" :key="position">
            <div class="team-member-image">
              <img :style="{'width': member.zoom+'%'}" :src="sheetImage(member.image)" alt=""/>
            </div>
            <h3>{{member.name}}</h3>
            <span class="team-member-role">{{member.role}}</span>
            <span class="team-member-affiliation">{{member.affiliation}}</span>
          </div>
        </div>

        <h2>Network Partners</h2>
        <div class="partners-logo-list x-small-logo">
          <a :style="{'width': member.zoom+'%'}" class="partner-logo" v-for="(member, position) in networksPartners" :key="position" :href="member.link"  target="_blank"><img :src="sheetImage(member.image)" :alt="member.name"/></a>
        </div>

        <!-- Community: hidden for now, kept for a later release (see SHOW_COMMUNITY below) -->
        <template v-if="SHOW_COMMUNITY">
          <h2>Community</h2>
          <div class="community-member-list">
            <div class="community-member" v-for="(member, position) in community" :class="member.group" :key="position">
              <div class="community-member-image">
                <img :style="{'width': member.zoom+'%'}" :src="sheetImage(member.image)" alt=""/>
              </div>
              <h3>{{member.name}}</h3>
              <span v-for="(r, position) in splitList(member.role)" :key="position" class="community-member-role">{{r}}</span>
              <span v-for="(f, position) in splitList(member.affiliation)" :key="position" class="community-member-affiliation">{{f}}</span>
            </div>
          </div>
        </template>

        <h2>Site Partners</h2>
        <a href="https://geo-trees.org/sites.html">More information about the sites</a>
        <div class="partners-logo-list x-small-logo">
          <a class="partner-logo" v-for="(member, position) in sitePartners" :key="position" :href="member.link" target="_blank"><img :src="sheetImage(member.image)" :alt="member.name"/></a>
        </div>

        <h2>Supporting Partners</h2>
        <div class="partners-logo-list x-small-logo">
          <a class="partner-logo" v-for="(member, position) in supportingPartners" :key="position" :href="member.link" target="_blank"><img :src="sheetImage(member.image)" :alt="member.name"/></a>
        </div>

      </div>
    </div>

    <div class="content-section section-white" v-else-if="error">
      <div class="content-wrapper">
        <SheetError />
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import SiteHeader from '@/components/SiteHeader.vue'
import SheetError from '@/components/SheetError.vue'
import { useSheet } from '@/composables/useSheet'
import { loadAbout, splitItems } from '@/lib/sheets'
import { sheetImage } from '@/config'

const { data: aboutData, error } = useSheet(loadAbout)

// Rows whose "display" column is not "yes" are hidden (but still readable in the public sheet)
const group = (name) =>
  computed(() => (aboutData.value || []).filter((member) => member.group === name && member.display === 'yes'))

const executiveBoard = group('executive-board')
const projectManager = group('project-manager')
const scientificBoard = group('scientific-board')
const networksPartners = group('networks-partners')
const sitePartners = group('site-partners')
const supportingPartners = group('supporting-partners')
const community = group('community')

// The Community section is hidden for now and kept for a later release:
// set to true to show it again (between Network Partners and Site Partners).
const SHOW_COMMUNITY = false

const splitList = splitItems // "a; b" -> ['a', 'b']
</script>

<style lang="scss">


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
          font-size: 15px;
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
                width: 150%;
              }
            }
          }
          h3{
            font-family: "Lato-Bold";
            font-size: 17px;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          span{
            display: block;
            font-family: "Lato-Regular";
            font-size: 15px;
            margin-bottom: 5px;
          }
        }
        .community-member-list{
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          gap: 20px 0px;
          padding-top: 20px;
          margin-bottom: 100px;
          .community-member{
            width: 22.5%;
            text-align: center;
          }
          .community-member-role{
            margin-bottom: 10px;
          }
          .community-member-affiliation{
            font-style: italic;
            margin-bottom: 10px;
          }
          .community-member-image{
            width: 80px;
            height: 80px;
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
                width: 150%;
              }
            }
          }
          h3{
            font-family: "Lato-Bold";
            font-size: 15px;
            margin-top: 5px;
            margin-bottom: 5px;
          }
          span{
            display: block;
            font-family: "Lato-Regular";
            font-size: 14px;
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
              &[data-zoom="zoom"]{
                width: 24%;
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
            font-size: 15px;
          }
          span{
            font-size: 14px;
          }
        }
        .community-member-list{
          gap: 20px 0px;
          padding-top: 20px;
          .community-member{
            width: 33%;
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
