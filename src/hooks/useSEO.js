import { useEffect } from 'react';

export default function useSEO({ title, description, keywords, canonical, ogImage, ogType = 'website' }) {
  useEffect(() => {
    // 1. Update Title
    const defaultTitle = "Sernaya Kids | Premium Children's Fashion & Contemporary Kidswear";
    document.title = title ? `${title} | Sernaya Kids` : defaultTitle;

    // 2. Update Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || "Discover stylish, comfortable, and premium quality clothing for happy little adventures at Sernaya Kids. Co-ord sets, nightwear, and designer kidswear.");

    // 2.5 Update Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords || "sernaya kids, children clothing brand, kids fashion, baby co-ord sets, children nightwear, kids designer dresses, kids outfits online, premium kidswear india, cotton coordinates for boys, girls dresses, kids matching sets, buy kids clothes online");

    // 3. Update Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    const currentUrl = canonical || window.location.href;
    linkCanonical.setAttribute('href', currentUrl);

    // 4. Update Open Graph Tags
    const ogTags = [
      { property: 'og:title', content: title ? `${title} | Sernaya Kids` : defaultTitle },
      { property: 'og:description', content: description || "Discover stylish, comfortable, and premium quality clothing for happy little adventures at Sernaya Kids." },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: ogType },
      { property: 'og:image', content: ogImage ? `https://sernayakids.com/${ogImage}` : 'https://sernayakids.com/logo.webp' }
    ];

    ogTags.forEach(tag => {
      let element = document.querySelector(`meta[property="${tag.property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

  }, [title, description, keywords, canonical, ogImage, ogType]);
}
