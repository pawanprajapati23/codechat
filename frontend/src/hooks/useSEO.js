import { useEffect } from 'react';

export const useSEO = ({ title, description, keywords, canonical }) => {
  useEffect(() => {
    // Set title
    document.title = title ? `${title} | CodeChat` : 'CodeChat — Real-Time Chat for Developers';
    
    // Set/update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { 
      metaDesc = document.createElement('meta'); 
      metaDesc.name = 'description'; 
      document.head.appendChild(metaDesc); 
    }
    if (description) metaDesc.content = description;
    
    // Set/update meta keywords
    if (keywords) {
      let metaKw = document.querySelector('meta[name="keywords"]');
      if (!metaKw) { 
        metaKw = document.createElement('meta'); 
        metaKw.name = 'keywords'; 
        document.head.appendChild(metaKw); 
      }
      metaKw.content = keywords;
    }
    
    // OG title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) ogTitle.content = `${title} | CodeChat`;
    
    // OG description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.content = description;
    
    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { 
        link = document.createElement('link'); 
        link.rel = 'canonical'; 
        document.head.appendChild(link); 
      }
      link.href = canonical;
    }
    
    return () => {
      document.title = 'CodeChat — Real-Time Chat for Developers';
    };
  }, [title, description, keywords, canonical]);
};
