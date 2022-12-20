import React from 'react';
import { Link } from 'gatsby';

import Layout from "../components/layout"
import Seo from "../components/seo"

const About = () => (
  <Layout>
    <h1><b>What problem are you trying to solve?</b></h1>
    <p>We were founded on a simple principle.  Communication is central to
      everything we do.  We believe communication is central to everything in life, including
      the problems faced in business.  
      </p>
      <br/>  
      <hr/>
      <br/>
    <p>The easiest way to succeed is by making something simple to understand. 
    Our company focuses on improving your outcomes through data, decisions, and design.
    These are at the heart of everything we do.  Feel free to read about 
    our ventures, consulting and expertise, or simply email us if you have a question.
    </p>
    <br/>

    <Link to="/">Back to home</Link>
    </Layout>
)
export const Head = () => <Seo title="about" />

export default About

