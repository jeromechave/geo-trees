<template>
  <header id="header" :class="{ small: isScrolled }">
    <div id="header-logo">
      <a :class="{ active: currentPage === 'index' }" :href="base"><img :src="base + 'icon.png'" alt="GEO-TREES home"></a>
    </div>
    <button
      id="header-menu-button"
      type="button"
      :class="{ open: menuOpen }"
      :aria-expanded="menuOpen ? 'true' : 'false'"
      aria-controls="header-links"
      aria-label="Menu"
      @click="menuOpen = !menuOpen"
    >
      <span class="menu-button-line"></span>
      <span class="menu-button-line"></span>
      <span class="menu-button-line"></span>
    </button>
    <nav id="header-links" :class="{ open: menuOpen }" aria-label="Main">
      <a
        v-for="link in links"
        :key="link.page"
        :class="{ active: currentPage === link.page }"
        :aria-current="currentPage === link.page ? 'page' : null"
        :href="link.page === 'index' ? base : base + link.page + '.html'"
      >{{ link.label }}</a>
      <div class="social-links">
        <span>Follow us on</span>
        <a class="social-link" href="https://www.linkedin.com/company/geo-trees/" target="_blank" rel="noopener" aria-label="GEO-TREES on LinkedIn">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M512 96L127.9 96C110.3 96 96 110.5 96 128.3L96 511.7C96 529.5 110.3 544 127.9 544L512 544C529.6 544 544 529.5 544 511.7L544 128.3C544 110.5 529.6 96 512 96zM231.4 480L165 480L165 266.2L231.5 266.2L231.5 480L231.4 480zM198.2 160C219.5 160 236.7 177.2 236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160zM480.3 480L413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480z"/></svg>
        </a>
        <a class="social-link" href="https://x.com/GEO_TREES" target="_blank" rel="noopener" aria-label="GEO-TREES on X">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z"/></svg>
        </a>
        <a class="social-link" href="https://bsky.app/profile/geo-trees.bsky.social" target="_blank" rel="noopener" aria-label="GEO-TREES on Bluesky">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M439.8 358.7C436.5 358.3 433.1 357.9 429.8 357.4C433.2 357.8 436.5 358.3 439.8 358.7zM320 291.1C293.9 240.4 222.9 145.9 156.9 99.3C93.6 54.6 69.5 62.3 53.6 69.5C35.3 77.8 32 105.9 32 122.4C32 138.9 41.1 258 47 277.9C66.5 343.6 136.1 365.8 200.2 358.6C203.5 358.1 206.8 357.7 210.2 357.2C206.9 357.7 203.6 358.2 200.2 358.6C106.3 372.6 22.9 406.8 132.3 528.5C252.6 653.1 297.1 501.8 320 425.1C342.9 501.8 369.2 647.6 505.6 528.5C608 425.1 533.7 372.5 439.8 358.6C436.5 358.2 433.1 357.8 429.8 357.3C433.2 357.7 436.5 358.2 439.8 358.6C503.9 365.7 573.4 343.5 593 277.9C598.9 258 608 139 608 122.4C608 105.8 604.7 77.7 586.4 69.5C570.6 62.4 546.4 54.6 483.2 99.3C417.1 145.9 346.1 240.4 320 291.1z"/></svg>
        </a>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const links = [
  { page: 'index', label: 'HOME' },
  { page: 'about-us', label: 'ABOUT US' },
  { page: 'project', label: 'PROJECT' },
  { page: 'sites', label: 'SITES' },
  { page: 'data', label: 'DATA' },
  { page: 'contact', label: 'CONTACT' },
  { page: 'opportunities', label: 'OPPORTUNITIES' },
  { page: 'news', label: 'NEWS' }
]

// Root of the site, e.g. "/geo-trees/" in production and "/" in development
const base = import.meta.env.BASE_URL

// "about-us" for /geo-trees/about-us.html, "index" for /geo-trees/ (query and hash ignored)
const fileName = window.location.pathname.split('/').pop()
const currentPage = fileName === '' ? 'index' : fileName.replace(/\.html$/, '')

const menuOpen = ref(false)
const isScrolled = ref(false)
const onScroll = () => {
  isScrolled.value = window.scrollY > 250
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
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
    cursor: pointer;
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
      &:focus-visible{
        outline: 2px solid #53A034;
        outline-offset: 4px;
      }
    }
    .social-links{
      display: flex;
      align-items: center;
      justify-content: center;
      width: auto;
      height: 100%;
      position: absolute;
      bottom: 0;
      right: 20px;
      height: 75px;
      span{
        font-size: 15px;
        font-family: "Lato-Bold";
        color: #213043;
        margin:0 0 0 0;
      }
      .social-link{
        margin:0 0 0 10px;
        svg{
          width: 30px;
          height: auto;
          fill: #213043;
          transform: translateY(2px);
        }
        &:after{
          display: none;
        }
      }
    }
  }
  #header-menu-button{
    display: none;
    border: 0;
    padding: 0;
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

@media (max-width: 1360px) {

  #header{
    #header-logo{
      left: 10px;
      height: 55px;
    }
    #header-links{
      width: 60%;
      
      flex-wrap: wrap;
      position: relative;
      top:50%;
      left:50%;
      transform: translate(-50%, -50%);
      height: 55px;
      .social-links{
        right: -200px;
        height: 55px;
        position: fixed;
        span{
          font-size: 14px;
        }
      }
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
      transform: translate(-50%, 0);
      &.open{
        height: 440px;
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
      .social-links{
        right: 50%;
        transform:translateX(50%);
        span{
          transform: translate(-4px,4px);
        }
        .social-link{
          margin:5px 0 0 0;
        }
      }
      
    }
    #header-menu-button{
      // flex keeps the lines at the top: a <button> otherwise centres its content
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
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
        display: block;
        width: 100%;
        height: 2px;
        background-color: #213043;
        &:nth-child(2){
          margin: 5px 0;
        }
        &:nth-child(3){
          margin-top: 0; // flex items' margins don't collapse with the 5px above
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