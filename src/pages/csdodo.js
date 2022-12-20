import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const csDodo = () => (
  <Layout>
    <h1><b>About cs dodo</b></h1>
    <hr/>
    <p>Computer Science as a discipline has exploded in recent years.  Thanks to the unlimited marketing of kegs and ping pong tables at startups throughout the world, just
        about everyone wants to work in tech.  There is no shortage of code bootcamps and online learning platforms out there that anyone can use
        to learn these skills.  However, there is a limited quantity of CS teachers. cs dodo focuses purely on CS students and university curriculum.  

        
    </p>
    <h1><b>About the venture</b></h1>
    <hr/>
   <p>
        By partnering with universities, we build out the basic infrastructure of a business for an active learning environment that supports your curriculum, language of choice, and helps you expand to other students in your
        college community that can't take cs courses due to availability.  

        CS dodo is the first of its kind platform that supports eductional institutions and their teachers in the teaching of computer science and other disciplines by giving them solid online materials for use 
        with their class.
   </p>
 
    <Link to="/">Home</Link>
  </Layout>
)

export const Head = () => <Seo title="csdodo" />

export default csDodo
