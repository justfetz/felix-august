import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const Contact = () => (
  <Layout>
    <h1><b>How can we help you?</b></h1>
    <p>Get in touch by using the email below.</p>

    <Link to="/">Home</Link>
  </Layout>
)

export const Head = () => <Seo title="Page two" />

export default Contact
