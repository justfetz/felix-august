import React from 'react';
import { Link } from 'gatsby';

import Layout from "../components/layout"
import Seo from "../components/seo"

const Blog = () => (
  <Layout>
<h3>About the project</h3>
<p>I started this company for my sons, my mental health, and myself.  We are a veteran-owned business. I had the idea for these ventures
    for a few years as I progressed through graduate school, but never acted on any of them.  Then one day, you realize time is ticking. You probably have books on your shelf
    that you want to read, you probably have a course you bought you want to take, but the reality is you have to find some way to move forward and realize time is finite. 
    So after watching Stutz on Netflix one night, I got up one day and just started moving forward. I just started doing. 
    <hr/>
    <h3>About the Blog</h3>
    The blog is a journal
    of everything I am going through to start the business and create healthy, repeatable habits and improve my life, finances, and mental health.  
    The business is named Felix/August because these are my sons names and they are my inspiration.  
    Each blog entry is a letter to them about how I built another
    piece of my puzzle.  Nothing is off limits in the blog.  This is the core concept of my business, to show growth.  
    My hope is to be a story that my sons and others read one day and understand what it takes to 
    get something off the ground when you feel stuck or don't know what to do. You have to START DOING.    
    You can read more about the venture through our blog.  We also post our milestones to Linkedin.
</p>
    
    <br/>

    <Link to="/">Back to home</Link>
  </Layout>
)
export const Head = () => <Seo title="about" />

export default Blog

