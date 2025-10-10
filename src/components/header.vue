<template>
  <div id="header" :class="{'small': isScrolled}">
    <div id="header-logo">
      <a :class="pathName === '' ? 'active' : ''" :href="dynamicPath + '/'"><img src="icon.png" alt="GEO-TREES"/></a></div>
    <div id="header-menu-button" :class="{'open': menuOpen}" @click="toggleMenu">
      <div class="menu-button-line"></div>
      <div class="menu-button-line"></div>
      <div class="menu-button-line"></div>
    </div>
    <div id="header-links" :class="{'open': menuOpen}">
      <a :class="pathName === '' ? 'active' : ''" :href="dynamicPath + '/'">HOME</a>
      <a :class="pathName === 'about-us.html' ? 'active' : ''" :href="dynamicPath + '/about-us.html'">ABOUT US</a>
      <a :class="pathName === 'project.html' ? 'active' : ''" :href="dynamicPath + '/project.html'">PROJECT</a>
      <a :class="pathName === 'sites.html' ? 'active' : ''" :href="dynamicPath + '/sites.html'">SITES</a>
      <a :class="pathName === 'data.html' ? 'active' : ''" :href="dynamicPath + '/data.html'">DATA</a>
      <a :class="pathName === 'contact.html' ? 'active' : ''" :href="dynamicPath + '/contact.html'">CONTACT</a>
      <a :class="pathName === 'opportunities.html' ? 'active' : ''" :href="dynamicPath + '/opportunities.html'">OPPORTUNITIES</a>
      <a :class="pathName === 'news.html' ? 'active' : ''" :href="dynamicPath + '/news.html'">NEWS</a>
    </div>
  </div>
</template>

<script>
//import store from '@/store'

export default {
  name: 'Header',
  data(){
    return {
      menuOpen: false,
      isScrolled: false
    }
  },
  props: {
  },
  computed: {
    dynamicPath(){
      return window.location.href.substring(0, window.location.href.lastIndexOf('/'))
    },
    pathName(){
      return window.location.href.split('/').pop()
    },
    
  },
  methods: {
    toggleMenu(){
      this.menuOpen = !this.menuOpen
    },
    handleScroll() {
      this.isScrolled = window.scrollY > 250
    }
  },

  watch:{
  },

  created(){
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  }

}
</script>


<style scoped lang="scss">

#header{
  background-color: #fff;
  height: 80px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: height 0.3s ease-in-out;
  #header-logo{
    width: auto;
    height: 100%;
    position: absolute;
    bottom: 0;
    left: 20px;
    height: 75px;
    img{
      width: auto;
      height: 100%;
    }
  }
  #header-links{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    a{
      margin: 0 15px;
      font-family: "Lato-Bold";
      font-size: 20px;
      text-decoration: none;
      color:#213043;
      position: relative;
      transition: font-size 0.3s ease-in-out;
      &:after{
        content: '';
        display: block;
        width: 2px;
        height: 20px;
        background-color: #213043;
        position: absolute;
        top:2px;
        right: -15px;
      }
      &:last-child{
        &:after{
          display: none;
        }
      }
      &:before{
          content: '';
          display: block;
          width: 100%;
          height: 2px;
          background-color: #53A034;
          position: absolute;
          bottom: -5px;
          left: 0;
          opacity: 0;
        }
      &:hover{
        &:before{
          opacity: 1;
        }
      }
      &.active{
        &:before{
          opacity: 1;
        }
      }
    }
  }
  #header-menu-button{
    display: none;
  }
  &.small{
    height: 50px;
    #header-logo{
      display: none;
    }
    #header-links{
      a{
        font-size: 17px;  
      }
    }
  }
}

@media (max-width: 1023px) {

  #header{
    #header-logo{
      left: 10px;
      height: 75px;
    }
    #header-links{
      a{
        margin: 0 10px;
        font-size: 17px;
        &:after{
          height: 17px;
          right: -12px;
        }
      }
    }
  }
}

@media (max-width: 767px) {

  #header{
    #header-logo{
      left: 50%;
      transform: translateX(-50%);
      height: 70px;
    }
    #header-links{
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: 100%;
      height: 0;
      overflow: hidden;
      background-color: #fff;
      position: absolute;
      top: 80px;
      right: 0;
      z-index: 100;
      padding: 0;
      transition: height 0.3s ease-in-out;
      &.open{
        height: 290px;
      }
      a{
        margin: 10px 0px;
        &:after{
          display: none;
        }
        &:last-child{
          &:after{
            display: none;
          }
        }
        &:hover{
          &:before{
            opacity: 0;
          }
        }
      }
    }
    #header-menu-button{
      display: block;
      width: 30px;
      height: 20px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 10px;
      z-index: 100;
      cursor: pointer;
      background-color: #fff;
      .menu-button-line{
        width: 100%;
        height: 2px;
        background-color: #213043;
        &:nth-child(2){
          margin: 5px 0;
        }
        &:nth-child(3){
          margin-top: 5px;
        }
      }
      &.open{
        .menu-button-line{
          &:nth-child(1){
            transform: rotate(45deg) translate(5px, 5px);
          }
          &:nth-child(2){
            opacity: 0;
          }
          &:nth-child(3){
            transform: rotate(-45deg) translate(5px, -5px);
          }
        }
      }
    }
    &.small{
    height: 80px;
      #header-logo{
        display: block;
        
      }
    }
  }
}
  
</style>