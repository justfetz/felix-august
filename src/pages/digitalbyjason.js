import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const DigitalByJason = () => (
  <Layout>
    <h1><b>About digital by jason.</b></h1>
    <hr/>
    <p>We have had interest in the visual display of quantitative information and decided
        to make a small site dedicated to the practice.
    </p>
    <h1><b>About the infrastructure</b></h1>
    <hr/>
    <p>The project uses ASP.NET along with some visualization libraries
        for some cool and quirky visual projects.  
    </p>
 
    <Link to="/">Home</Link>
  </Layout>
)

export const Head = () => <Seo title="Page two" />

export default DigitalByJason
