<template>
  <SiteHeader />
  <div id="content">

    <div class="content-section section-dark">
      <div class="content-wrapper">
        <h1>Contact</h1>
        <span class="default-text">If you are a potential partner and would like to get in touch with us, please fill <a target="_blank" href="https://docs.google.com/forms/d/12L34uFxsfd5fSwww2e-IG6tytRshdQn0YhG44Xel7U8/viewform?edit_requested=true&pli=1">this form.</a></span>
        <span class="default-text">For any other request, you can contact us by mail at <a href="mailto:contact@geo-trees.org">contact@geo-trees.org</a>.</span>
      </div>
    </div>

    <div class="content-section section-light">
      <div class="content-wrapper">
        <h2>Download our terms of reference</h2>
        <span class="default-text">Date : 15/07/2025. This is an evolving document and we are happy to discuss this with partners.</span>
        <div class="link-container">
          <a v-for="file in termsOfReference" :key="file.url" class="link-text" :href="file.url" download target="_blank">
            <svg viewBox="0 0 512 512" aria-hidden="true"><path :d="downloadIcon" /></svg>
            {{ file.label }}
          </a>
        </div>
        <h2>Download our code of conduct </h2>
        <span class="default-text">Date : 15/04/2026.</span>
        <div class="link-container">
          <a v-for="file in codeOfConduct" :key="file.url" class="link-text" :href="file.url" download target="_blank">
            <svg viewBox="0 0 512 512" aria-hidden="true"><path :d="downloadIcon" /></svg>
            {{ file.label }}
          </a>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import SiteHeader from '@/components/SiteHeader.vue'

const termsOfReference = [
  { label: 'PDF - English version', url: 'https://geo-trees.org/downloads/GEO-TREES_ToR_English.pdf' },
  { label: 'PDF - French version', url: 'https://geo-trees.org/downloads/GEO-TREES_ToR_French.pdf' },
  { label: 'PDF - Spanish version', url: 'https://geo-trees.org/downloads/GEO-TREES_ToR_Spanish.pdf' },
  { label: 'PDF - Portuguese version', url: 'https://geo-trees.org/downloads/GEO-TREES_ToR_Portuguese' }
]

const codeOfConduct = [
  { label: 'PDF - English version', url: 'https://geo-trees.org/downloads/GEOTREES Code of Conduct 2025 FINAL_English.pdf' },
  { label: 'PDF - French version', url: 'https://geo-trees.org/downloads/GEOTREES Code of Conduct 2025 FINAL_French.pdf' },
  { label: 'PDF - Spanish version', url: 'https://geo-trees.org/downloads/GEOTREES Code of Conduct 2025 FINAL_Spanish.pdf' },
  { label: 'PDF - Portuguese version', url: 'https://geo-trees.org/downloads/GEOTREES Code of Conduct 2025 FINAL_Portuguese.pdf' }
]

const downloadIcon =
  'M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z'
</script>

<style lang="scss">


#app {
  #content{
    background-color: #f4f7e4;
    .content-section{
      .content-wrapper{
        h2:nth-of-type(2) {
          margin-top: 75px;
        }
        // download buttons side by side, wrapping onto new lines on narrow screens
        .link-container{
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
          .link-text{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin: 0;
            padding: 10px 16px;
            font-size: 15px;
            color: #213043;
            text-decoration: none;
            &:hover{
              text-decoration: underline;
            }
            svg{
              flex: none;
              width: 16px;
              height: 16px;
              fill: #213043;
            }
          }
        }
        @media (max-width: 767px){
          // one button per line on phones, all the same width
          .link-container .link-text{
            flex: 1 1 100%;
          }
        }
      }
    }
  }
}

</style>
