import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const Dodo = () => (
  <Layout>
    <h1><b>About dotnet dodo</b></h1>
    <hr/>
    <p><code>dotnet</code> is typically misunderstood by so many individuals in tech and universities.  The reality is Microsoft's technologies are 
        ubiquitous in Enterprise.  Nearly 1/3 of code in production today was written in Visual Studio.  Our platform 
        uses academic topics to teach you how to build IT infrastructure.  We do this by helping you build a system on dotnet.
    </p>
    <h1><b>About the venture</b></h1>
    <hr/>
    <p>You will learn how to build a small paper mill business in dotnet.  You will learn how to take topics from 
        cs and apply them to real world scenarios and solve problems that come up in your build.  The project is small and intended to be.
        We aim to get you up to speed quickly.  Most code platforms start with a bottom-up approach.  "This is an integer, string, etc."  
        We take the other approach.  Before you learn what an integer and string is, you should have an idea of what that code and infrastructure
        support, or why the requirement came up in the first place.  Our unique curriculum takes one poorly formatted Excel, gives it to the user,
        and pieces together the requirements that help you build a working system.  
    </p>
 
    <Link to="/">Home</Link>
  </Layout>
)

export const Head = () => <Seo title="Page two" />

export default Dodo
