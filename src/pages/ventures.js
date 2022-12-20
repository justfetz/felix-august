import React from 'react';
import { Link } from 'gatsby';

import Layout from "../components/layout"
import Seo from "../components/seo"

const Ventures = () => (
  <Layout>
<ul>
    <li><h1><b>dotnet dodo</b></h1></li>
    <hr/>
    <p>Our unique solution to training in Microsoft Technologies.</p>
    <li><h1><b>CS dodo</b></h1></li>
    <hr/>
    <p>We partnered with my alma mater to try and improve the cs curriculum.</p>
    <li><h1><b>tipout</b></h1></li>
    <hr/>
    <p>As someone that grew up without knowledge of personal finance, the topic remains important to me.  tipout is a spin on personal finance built for the restaurant industry.</p>
    <li><h1><b>digital by jason.</b></h1></li>
    <hr/>
    <p>Humans process images 50k times faster than text.  Information Visualization is amazing.  Digital by Jason is a passion project where I index a variety of visuals using chart libraries, 
      tableau, and others.</p>
</ul>
    
    <br/>

    <Link to="/">Back to home</Link>
  </Layout>
)
export const Head = () => <Seo title="about" />

export default Ventures

