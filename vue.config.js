const webpack = require('webpack')
module.exports = {
  pages: {
    'index':{
      entry: './src/pages/Home/main.js',
      title: 'Homepage',
      filename: 'index.html'
    },
    'about-us':{
      entry: './src/pages/about-us/main.js',
      title: 'About-us',
      filename: 'about-us.html'
    },
    'project':{
      entry: './src/pages/project/main.js',
      title: 'Project',
      filename: 'project.html'
    },
    'sites':{
      entry: './src/pages/sites/main.js',
      title: 'Sites',
      filename: 'sites.html'
    },
    'data':{
      entry: './src/pages/data/main.js',
      title: 'Data',
      filename: 'data.html'
    },
    'contact':{
      entry: './src/pages/contact/main.js',
      title: 'Contact',
      filename: 'contact.html'
    },
    'opportunities':{
      entry: './src/pages/opportunities/main.js',
      title: 'Opportunities',
      filename: 'opportunities.html'
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      })
    ]
  },
  filenameHashing: false,
  productionSourceMap: false,
  publicPath: process.env.NODE_ENV === "production" ? "/geo-trees" : "/",
  chainWebpack:
    config => {
      config.optimization.delete('splitChunks')
    }
}