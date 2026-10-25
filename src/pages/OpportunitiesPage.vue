<template>
  <SiteHeader />
  <div id="content">

    <div class="content-section section-dark">
      <div class="content-wrapper">
        <h1>Opportunities</h1>
        <span class="default-text">Discover GEO-TREES opportunities for research, collaboration, and training.</span>
      </div>
    </div>

    <div class="content-section section-light">
      <div class="content-wrapper">
        <h2>Awards & fellowships</h2>
        <SheetError v-if="error" />
        <span class="default-text" v-else-if="!opportunitiesData['awards'] || opportunitiesData['awards'].length==0" >Content forthcoming.</span>
        <div class="opportunities-item" v-for="(item, position) in opportunitiesData['awards']" :key="position">
          <div class="opportunities-item-title">{{ item.title }}</div>
          <div class="opportunities-item-date">{{ item.date }}</div>
          <div class="opportunities-item-text">{{ item.text }}</div>
          <div class="opportunities-item-link">
            <template v-for="(link, i) in item.links" :key="i"><a v-if="link.url" :href="link.url" target="_blank" rel="noopener">{{ link.name }}</a><span v-else>{{ link.name }}</span></template>
          </div>
        </div>
      </div>
    </div>

    <div class="content-section section-white">
      <div class="content-wrapper">
        <h2>Job board</h2>
        <span class="default-text" v-if="!error && (!opportunitiesData['job'] || opportunitiesData['job'].length==0)" >Content forthcoming.</span>
        <div class="opportunities-item" v-for="(item, position) in opportunitiesData['job']" :key="position">
          <div class="opportunities-item-title">{{ item.title }}</div>
          <div class="opportunities-item-date">{{ item.date }}</div>
          <div class="opportunities-item-text">{{ item.text }}</div>
          <div class="opportunities-item-link">
            <template v-for="(link, i) in item.links" :key="i"><a v-if="link.url" :href="link.url" target="_blank" rel="noopener">{{ link.name }}</a><span v-else>{{ link.name }}</span></template>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { computed } from 'vue'
import SiteHeader from '@/components/SiteHeader.vue'
import SheetError from '@/components/SheetError.vue'
import { useSheet } from '@/composables/useSheet'
import { loadOpportunities } from '@/lib/sheets'

const { data, error } = useSheet(loadOpportunities)
const opportunitiesData = computed(() => data.value || {})
</script>

<style lang="scss">


#app {
  #content{
    background-color: #f4f7e4;
    .content-section{
      .content-wrapper{
        .opportunities-item{
          display: inline-block;
          text-align: left;
          .opportunities-item-date{
            font-size: 14px;
            color: #213043;
            font-family: "Lato-Regular";
            margin-bottom: 10px;
          }
        }
        .opportunities-item-title{
          font-size: 17px;
          color: #213043;
          font-family: "Lato-Bold";
          margin-bottom: 15px;
        }
        .opportunities-item-text{
          font-size: 17px;
          color: #213043;
          font-family: "Lato-Regular";
          margin-bottom: 20px;
          line-height: 1.75;
          display: inline-block;
        }
        .opportunities-item-link{
          font-size: 17px;
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
