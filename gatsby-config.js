module.exports = {
  siteMetadata: {
    title: `Data. Decisions. Design`,
    description: `Kick off your next project with us helping you achieve more.`,
    author: `@gatsbyjs`,
    siteUrl: `https://felixaugust.com/`,
  },
  plugins: [
        {
          resolve: `gatsby-omni-font-loader`,
          options: {
            enableListener: true,
            preconnect: [`https://fonts.googleapis.com`, `https://fonts.gstatic.com`],
            web: [
              {
                name: `Open Sans`,
                file: `https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap`,
              },
              {
                name: 'Nanum Brush Script',
                file: 'https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&family=Source+Sans+Pro&display=swap',
              },
              {
                name: 'Poppins', 
                file: 'https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&family=Poppins:wght@300&family=Source+Sans+Pro&display=swap',
              },
              {
                name: 'Bubblegum Sans',
                file: 'https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Nanum+Brush+Script&family=Poppins:wght@300&family=Source+Sans+Pro&display=swap',
              }

            ],
          },
        },
      
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/faug.png`, // This path is relative to the root of the site.
      },
    },
  ],
}
