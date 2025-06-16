<template>
  <div id="app">
    <Header></Header>
    <div id="content">

      <div class="content-section section-dark">
        <div class="content-wrapper">
          <h1>Contact</h1>
          <span class="default-text">If you are a potential partner and would like to get in touch with us, please fill <a target="_blank" href="https://docs.google.com/forms/d/12L34uFxsfd5fSwww2e-IG6tytRshdQn0YhG44Xel7U8/viewform?edit_requested=true&pli=1">this form.</a></span>
          <span class="default-text">For any other request, you can contact us <a href="mailto:contact.geotrees@gmail.com">by email</a>.</span>
        </div>
      </div>

      <div class="content-section section-light">
        <div class="content-wrapper">
          <h2>Download our terms of reference</h2>
          <span class="default-text">Date : 02/05/2024. This is an evolving document and we are happy to discuss this with partners.</span>
          <div class="link-container">
            <span class="link-text">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>
              <a download href="https://geo-trees.org/wp-content/uploads/2024/05/GEO-TREES_ToR_English.pdf" target="_blank">PDF - English version</a>
            </span>
            <span class="link-text">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>
              <a download href="https://geo-trees.org/wp-content/uploads/2024/05/GEO-TREES_ToR_French-1.pdf" target="_blank">PDF - French version</a></span>
            <span class="link-text">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>
              <a download href="https://geo-trees.org/wp-content/uploads/2024/05/GEO-TREES_ToR_Spanish.pdf" target="_blank">PDF - Spanish version</a></span>
            <span class="link-text">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>
              <a download href="https://geo-trees.org/wp-content/uploads/2024/05/GEO-TREES_ToR_Portuguese.pdf" target="_blank">PDF - Portuguese version</a></span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>

import Header from '@/components/header.vue'

export default {
  name: 'Contact',
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
        .link-container{
          display: inline-block;
          .link-text{
            display: block;
            width: 310px;
            margin: 20px auto 0 auto;
            font-size: 20px;
            svg{
              width: 20px;
              height: 20px;
              margin-right: 10px;
              transform: translateY(2px);
              fill: #213043;
            }
          }
        }
      }
    }
  }
}

</style>
