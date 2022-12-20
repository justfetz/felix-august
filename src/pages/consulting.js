import React from 'react';
import { Link } from 'gatsby';

import Layout from "../components/layout"
import Seo from "../components/seo"

const Consulting = () => (
  <Layout>
    <h1><b>What is the problem?</b></h1>
    <p>Do you have a solid understanding of your issue?  
        We do not mess around with your time or money.
        Most firms are going to exhaust you with requirements about scope and parameters.  We are not going to beat around the bush.  If you
        want to fix your problem, let's communicate, get your data together and figure out the problem we are trying to solve.
    </p>
    <hr/>
    <h1><b>Focus on a minimum viable solution</b></h1>
    <p>Most firms overdeliver an app for hundreds of thousands of dollars.
        We pride ourselves on solving issues with limited resources using open-source technologies.  Do you need a custom function integrated into 
        an already existing Enterprise stack?  No problem.  Need a small BI environment set up?  
        We are not here to change your operation.  We are here to help and get you over the 
        hump.  
    </p>
    <hr/>
    <h1><b>Expertise:</b></h1> 
    <p>Algorithm Design, Business Intelligence, Constraint Programming, Data Analysis, Geospatial Data & Analysis, Information Visualization and Design, Network Optimization, 
    Operations Research, Optimization and Modeling Problems, 
        Linear Programming, Manufacturing Inefficiencies (Job Scheduling, Constraint Optimization), Training. 
    </p>
    <br/>

    <Link to="/">Back to home</Link>
    </Layout>
)
export const Head = () => <Seo title="about" />

export default Consulting

