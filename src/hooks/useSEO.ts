import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

export const useSEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | ShowMyFIT`;
    }

    // Update meta description
    if (description) {
      updateMetaTag('name', 'description', description);
      updateMetaTag('property', 'og:description', description);
      updateMetaTag('property', 'twitter:description', description);
    }

    // Update meta keywords
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // Update Open Graph tags
    if (title) {
      updateMetaTag('property', 'og:title', `${title} | ShowMyFIT`);
      updateMetaTag('property', 'twitter:title', `${title} | ShowMyFIT`);
    }

    if (image) {
      updateMetaTag('property', 'og:image', image);
      updateMetaTag('property', 'twitter:image', image);
    }

    if (url) {
      updateMetaTag('property', 'og:url', url);
      updateMetaTag('property', 'twitter:url', url);
      updateMetaTag('rel', 'canonical', url);
    }

    // Update Open Graph type
    updateMetaTag('property', 'og:type', type);

    // Update robots meta
    if (noIndex) {
      updateMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      updateMetaTag('name', 'robots', 'index, follow');
    }

    // Add structured data for the current page
    addStructuredData(title, description, url, type);

  }, [title, description, keywords, image, url, type, noIndex]);
};

const updateMetaTag = (attribute: string, name: string, content: string) => {
  let element: HTMLMetaElement | HTMLLinkElement | null = null;

  if (attribute === 'name') {
    element = document.querySelector(`meta[name="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }
  } else if (attribute === 'property') {
    element = document.querySelector(`meta[property="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('property', name);
      document.head.appendChild(element);
    }
  } else if (attribute === 'rel') {
    element = document.querySelector(`link[rel="${name}"]`);
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', name);
      document.head.appendChild(element);
    }
  }

  if (element) {
    element.setAttribute('content', content);
  }
};

const addStructuredData = (title?: string, description?: string, url?: string, type?: string) => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[data-seo-structured-data]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create new structured data based on page type
  let structuredData: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url
  };

  if (type === 'product') {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": title,
      "description": description,
      "url": url,
      "brand": {
        "@type": "Brand",
        "name": "ShowMyFIT"
      },
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "INR"
      }
    };
  } else if (type === 'article') {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "url": url,
      "publisher": {
        "@type": "Organization",
        "name": "ShowMyFIT",
        "url": "https://showmyfit.com"
      }
    };
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo-structured-data', 'true');
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
};

// SEO configurations for different pages
export const SEOConfigs = {
  home: {
    title: 'ShowMyFIT - Local Marketplace',
    description: 'Discover and shop from amazing local stores in your area. ShowMyFIT connects you with local businesses offering fashion, electronics, home goods, and more.',
    keywords: 'local marketplace, online shopping, local stores, community shopping, fashion, electronics, home goods',
    type: 'website' as const
  },
  browse: {
    title: 'Browse Products',
    description: 'Browse and discover products from local stores in your area. Find great deals on fashion, electronics, home goods, and more.',
    keywords: 'browse products, local products, online shopping, deals, discounts',
    type: 'website' as const
  },
  categories: {
    title: 'Product Categories',
    description: 'Explore our wide range of product categories. From fashion to electronics, find exactly what you\'re looking for.',
    keywords: 'product categories, fashion, electronics, home goods, beauty, sports',
    type: 'website' as const
  },
  cart: {
    title: 'Shopping Cart',
    description: 'Review your selected items and proceed to checkout. Secure payment and fast delivery from local stores.',
    keywords: 'shopping cart, checkout, local delivery, secure payment',
    type: 'website' as const,
    noIndex: true
  },
  wishlist: {
    title: 'Wishlist',
    description: 'Your saved items and favorite products from local stores. Never lose track of products you love.',
    keywords: 'wishlist, saved items, favorites, local products',
    type: 'website' as const,
    noIndex: true
  },
  about: {
    title: 'About ShowMyFIT',
    description: 'Learn about ShowMyFIT\'s mission to connect customers with local businesses. Supporting communities through technology.',
    keywords: 'about ShowMyFIT, local business support, community marketplace, company information',
    type: 'website' as const
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'ShowMyFIT\'s privacy policy and how we protect your personal information and data.',
    keywords: 'privacy policy, data protection, user privacy, ShowMyFIT privacy',
    type: 'website' as const
  },
  terms: {
    title: 'Terms of Service',
    description: 'ShowMyFIT\'s terms of service and user agreement for using our marketplace platform.',
    keywords: 'terms of service, user agreement, marketplace terms, ShowMyFIT terms',
    type: 'website' as const
  },
  login: {
    title: 'Login',
    description: 'Sign in to your ShowMyFIT account to access personalized shopping experience and manage your orders.',
    keywords: 'login, sign in, user account, ShowMyFIT login',
    type: 'website' as const,
    noIndex: true
  },
  sellerAuth: {
    title: 'Become a Seller',
    description: 'Join ShowMyFIT as a seller and start selling your products to local customers. Easy setup and great commission rates.',
    keywords: 'become a seller, seller registration, local business, marketplace seller',
    type: 'website' as const
  }
};
