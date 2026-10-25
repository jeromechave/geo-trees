<template>
  <SiteHeader />
  <div id="content">

    <div class="content-section section-dark">
      <div class="content-wrapper">
        <h1>Biomass Reference Measurement Sites</h1>
      </div>
      <SitesMap
        ref="sitesMap"
        :directory-slugs="directorySlugs"
        @sites-loaded="mapSlugs = $event"
        @show-in-directory="showInDirectory"
      />
    </div>

    <div class="content-section section-light">
      <div class="content-wrapper">
        <h2>BRM Site directory</h2>
        <SheetError v-if="error" />
        <div class="sites-repertory">
          <div class="sites-repertory-country" v-for="(country, index) in sitesData" :key="index">
            <h3 class="country-name">{{ country[0]["country"] }}</h3>
            <div
              v-for="(site,siteindex) in country"
              :id="'site-' + slugify(site.name)"
              :key="siteindex"
              class="site-container"
              :class="{'open': openSites.includes(site)}"
            >
              <div
                class="site-name-container"
                role="button"
                tabindex="0"
                :aria-expanded="openSites.includes(site) ? 'true' : 'false'"
                @click="toggleSiteDetails(site)"
                @keydown.enter.prevent="toggleSiteDetails(site)"
                @keydown.space.prevent="toggleSiteDetails(site)"
              >
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
                  <div class="site-details-item-row" v-if="mapSlugs.has(slugify(site.name))">
                    <button type="button" class="show-on-map" @click="showOnMap(site)">Show on map</button>
                  </div>
                  <div class="site-details-item-row" v-if="site.websites.length > 0">
                    <span class="site-details-item-label">Website: </span>
                    <a
                      v-for="(url, i) in site.websites"
                      :key="i"
                      class="site-details-item-value"
                      :href="url"
                      target="_blank"
                      rel="noopener"
                    >{{ site.websites.length === 1 ? 'visit' : linkLabels(site.websites)[i] }}</a>
                  </div>
                  <div class="site-details-item-row" v-if="site.piNames.length > 0">
                    <span class="site-details-item-label">PI Names: </span>
                    <span class="site-details-item-value" v-for="(piName, i) in site.piNames" :key="i">{{ piName }}</span>
                  </div>
                  <div class="site-details-item-row" v-if="site.institutions.length > 0">
                    <span class="site-details-item-label">Supporting Institutions: </span>
                    <template v-for="(item, i) in site.institutions" :key="i">
                      <a v-if="item.url" class="site-details-item-value" :href="item.url" target="_blank" rel="noopener">{{ item.name }}</a>
                      <span v-else class="site-details-item-value">{{ item.name }}</span>
                    </template>
                  </div>
                  <!-- Funders and partners are not shown (as on the previous site). To show them:
                  <div class="site-details-item-row" v-if="site.funders.length > 0">
                    <span class="site-details-item-label">Funders: </span>
                    <span class="site-details-item-value" v-for="(funder, i) in site.funders" :key="i">{{ funder }}</span>
                  </div>
                  <div class="site-details-item-row" v-if="site.partnerNames.length > 0">
                    <span class="site-details-item-label">Partners Names: </span>
                    <span class="site-details-item-value" v-for="(partner, i) in site.partnerNames" :key="i">{{ partner }}</span>
                  </div>
                  <div class="site-details-item-row" v-if="site.partnerInstitutions.length > 0">
                    <span class="site-details-item-label">Partners Institutions: </span>
                    <template v-for="(item, i) in site.partnerInstitutions" :key="i">
                      <a v-if="item.url" class="site-details-item-value" :href="item.url" target="_blank" rel="noopener">{{ item.name }}</a>
                      <span v-else class="site-details-item-value">{{ item.name }}</span>
                    </template>
                  </div>
                  -->
                  <div class="site-details-item-row" v-if="site.networks.length > 0">
                    <span class="site-details-item-label">Networks: </span>
                    <template v-for="(item, i) in site.networks" :key="i">
                      <a v-if="item.url" class="site-details-item-value" :href="item.url" target="_blank" rel="noopener">{{ item.name }}</a>
                      <span v-else class="site-details-item-value">{{ item.name }}</span>
                    </template>
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

<script setup>
import { computed, nextTick, ref } from 'vue'
import SiteHeader from '@/components/SiteHeader.vue'
import SheetError from '@/components/SheetError.vue'
import SitesMap from '@/components/SitesMap.vue'
import { useSheet } from '@/composables/useSheet'
import { linkLabels, loadSites, slugify } from '@/lib/sheets'

const { data: sitesData, error } = useSheet(loadSites)

const openSites = ref([])
const toggleSiteDetails = (site) => {
  if (openSites.value.includes(site)) {
    openSites.value = openSites.value.filter((item) => item !== site)
  } else {
    openSites.value.push(site)
  }
}

// ---- links between the map and the directory: both come from the Data tab and
// are matched by site name (a site without valid coordinates is in the directory only)
const sitesMap = ref(null)
const mapSlugs = ref(new Set())
const directorySites = computed(() => Object.values(sitesData.value || {}).flat())
const directorySlugs = computed(() => new Set(directorySites.value.map((site) => slugify(site.name))))

function showInDirectory(slug) {
  const site = directorySites.value.find((item) => slugify(item.name) === slug)
  if (!site) return
  if (!openSites.value.includes(site)) openSites.value.push(site)
  nextTick(() => {
    const element = document.getElementById('site-' + slug)
    if (!element) return
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    element.querySelector('.site-name-container').focus({ preventScroll: true })
  })
}

function showOnMap(site) {
  sitesMap.value.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  sitesMap.value.focusSite(slugify(site.name))
}
</script>

<style lang="scss">


#app {
  #content{
    .content-section{
      // same placement as the previous embedded map (overlaps the next section by 60px)
      .sites-map{
        top: 60px;
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


#app #content .sites-repertory {
  .site-name-container:focus-visible {
    outline: 2px solid #53A034;
    outline-offset: 3px;
  }
  .show-on-map {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    font-family: "Lato-Regular", sans-serif; // buttons do not inherit the page font by default
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
}
</style>
