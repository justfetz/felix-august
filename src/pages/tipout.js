import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const Tipout = () => (
  <Layout>
    <h1><b>About tipout</b></h1>
    <hr/>
    <p>One of the biggest problems we ever encountered was managing our personal finances
        in the restaurant industry.  There simply is not alot of good information out there for
        individuals with such variable income, be it seasonality or taking in cash on a daily basis.  tipout is a way to ensure the service industry 
        can check the boxes on their personal financial goals.
    </p>
    <h1><b>About the venture</b></h1>
    <hr/>
    <p>The service industry is an industry we hold close to our heart.  The people that make up
        this industry are some of the best individuals in the world.  tipout is a quick and simple web application
        that uses some very basic visualization to understand your money.
    </p>
 
    <Link to="/">Home</Link>
  </Layout>
)

export const Head = () => <Seo title="tipout" />

export default Tipout
