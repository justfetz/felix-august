import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "../components/index.module.css"

const links = [
  {
    text: "dotnet dodo",
    url: "/dodo",
    description:
    "A simple training platform that helps users understand building a system using algorithms in dotnet.",
  },
  {
    text: "tipout",
    url: "/tipout",
    description:
      "A simple, visual and intuitive approach to personal finance. Built for the service industry.",
  },
  {
    text: "digital by jason",
    url: "/digitalbyjason",
    description:
      "Presentations, Data Visualization and Information Design.",
  },
  {
    text: "csdodo",
    url: "/csdodo",
    description:
      "Helping universities create clear online content and curriculum for advanced cs topics.",
  },
]
const samplePageLinks = [
  {
    text: "About",
    url: "/about",
    badge: false,
    description:
      "About our business",
  },
  { text: "Contact", 
    url: "/contact" },
  { text: "Ventures", 
    url: "/ventures" },
  { text: "Consulting", 
    url: "/consulting" },
]


const moreLinks = [
  { text: "About", 
    url: "/about" },
  {
    text: "Ventures",
    url: "/ventures",
  },
  {
    text: "Consulting",
    url: "/consulting",
  },
  {
    text: "Blog",
    url: "https://blog.felixaugust.com/",
  },


]

const utmParameters = `?utm_source=starter&utm_medium=start-page&utm_campaign=default-starter`

const IndexPage = () => (
  <Layout>
    <Seo title="Home" />
    <div className={styles.textCenter}>
      <StaticImage
        src="../images/rubik_3D.png"
        loading="eager"
        width={64}
        quality={95}
        formats={["auto", "webp", "avif"]}
        alt=""
        style={{ marginBottom: `var(--space-3)` }}
      />
      <h1>
        <b>felix/august</b>
      </h1>
      <h6>Data. Decisions. Design.</h6>
      <p className={styles.intro}>
        {" "}
        {samplePageLinks.map((link, i) => (
          <React.Fragment key={link.url}>
            <Link to={link.url}>{link.text}</Link>
            {i !== samplePageLinks.length - 1 && <> · </>}
          </React.Fragment>
        ))}
        <br />
        </p>
    </div>
    
    <ul className={styles.list}>
      {links.map(link => (
        <li key={link.url} className={styles.listItem}>
          <a
            className={styles.listItemLink}
            href={`${link.url}${utmParameters}`}
          >
            {link.text} ↗
          </a>
          <p className={styles.listItemDescription}>{link.description}</p>
        </li>
      ))}
    </ul>
<img src="https://www.google.com/finance/getchart?q=AMZN&p=20Y&i=86400" />
    {moreLinks.map((link, i) => (
      <React.Fragment key={link.url}>
        <a href={`${link.url}${utmParameters}`}>{link.text}</a>
        {i !== moreLinks.length - 1 && <> · </>}
      </React.Fragment>
    ))}
  </Layout>
)

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="Home" />

export default IndexPage
