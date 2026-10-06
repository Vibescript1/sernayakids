import { create } from 'zustand';
import { client, getAuthToken } from '../apollo';
import { gql } from '@apollo/client';
import axios from 'axios';
import { checkRateLimit, getRateLimitMessage } from '../utils/rateLimiter';
import { useAuthStore } from './useAuthStore';
import { fbqTrack } from '../utils/pixel';
import { getColorMeta } from '../utils/colorHelper';

// GraphQL Operations for Cart Synchronization
const GET_CART_QUERY = gql`
  query GetCart {
    cart {
      appliedCoupons {
        code
        discountAmount
      }
      discountTotal
      subtotal
      total
      contents(first: 100) {
        nodes {
          key
          product {
            node {
              databaseId
              name
              image {
                sourceUrl
              }
              ... on SimpleProduct {
                price(format: RAW)
              }
              ... on VariableProduct {
                price(format: RAW)
              }
            }
          }
          quantity
          variation {
            node {
              databaseId
              name
            }
            attributes {
              name
              value
            }
          }
        }
      }
    }
  }
`;

const APPLY_COUPON_MUTATION = gql`
  mutation ApplyCoupon($code: String!) {
    applyCoupon(input: { code: $code }) {
      cart {
        appliedCoupons {
          code
          discountAmount
        }
        discountTotal
        subtotal
        total
      }
    }
  }
`;

const REMOVE_COUPONS_MUTATION = gql`
  mutation RemoveCoupons($codes: [String]!) {
    removeCoupons(input: { codes: $codes }) {
      cart {
        appliedCoupons {
          code
        }
        discountTotal
        subtotal
        total
      }
    }
  }
`;


const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($productId: Int!, $quantity: Int!, $variation: [ProductAttributeInput], $variationId: Int) {
    addToCart(input: { productId: $productId, quantity: $quantity, variation: $variation, variationId: $variationId }) {
      cart {
        contents(first: 100) {
          nodes {
            key
            product {
              node {
                databaseId
                name
                image {
                  sourceUrl
                }
                ... on SimpleProduct {
                  price(format: RAW)
                }
                ... on VariableProduct {
                  price(format: RAW)
                }
              }
            }
            quantity
            variation {
              node {
                databaseId
                name
              }
              attributes {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;

const UPDATE_CART_QUANTITIES_MUTATION = gql`
  mutation UpdateItemQuantities($key: ID!, $quantity: Int!) {
    updateItemQuantities(input: { items: [{ key: $key, quantity: $quantity }] }) {
      cart {
        contents(first: 100) {
          nodes {
            key
            product {
              node {
                databaseId
                name
                image {
                  sourceUrl
                }
                ... on SimpleProduct {
                  price(format: RAW)
                }
                ... on VariableProduct {
                  price(format: RAW)
                }
              }
            }
            quantity
            variation {
              node {
                databaseId
                name
              }
              attributes {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;

const REMOVE_FROM_CART_MUTATION = gql`
  mutation RemoveItemsFromCart($key: ID!) {
    removeItemsFromCart(input: { keys: [$key] }) {
      cart {
        contents(first: 100) {
          nodes {
            key
            product {
              node {
                databaseId
                name
                image {
                  sourceUrl
                }
                ... on SimpleProduct {
                  price(format: RAW)
                }
                ... on VariableProduct {
                  price(format: RAW)
                }
              }
            }
            quantity
            variation {
              node {
                databaseId
                name
              }
              attributes {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;

const mapBackendCart = (contentsNodes) => {
  if (!contentsNodes) return [];
  return contentsNodes.map(node => {
    const product = node.product?.node;
    const priceVal = parseFloat(product?.price) || 1299;
    
    let colorVal = 'Default';
    let sizeVal = 'Default';
    
    if (node.variation?.attributes) {
      const colorAttr = node.variation.attributes.find(a => a.name.toLowerCase().includes('color'));
      const sizeAttr = node.variation.attributes.find(a => 
        a.name.toLowerCase().includes('size') || 
        a.name.toLowerCase() === 'age' || 
        a.name.toLowerCase().includes('age')
      );
      if (colorAttr) colorVal = colorAttr.value;
      if (sizeAttr) sizeVal = sizeAttr.value;
    }
    
    const allProducts = useShopStore.getState().products || [];
    const matchedProduct = allProducts.find(p => String(p.id) === String(product?.databaseId));
    const isTwentyPercentOff = matchedProduct ? matchedProduct.isTwentyPercentOff : false;
    
    return {
      id: String(product?.databaseId || ''),
      name: product?.name || '',
      price: priceVal,
      img: product?.image?.sourceUrl || 'assets/product-linen-dress.webp',
      color: colorVal,
      size: sizeVal,
      quantity: node.quantity,
      key: node.key,
      isTwentyPercentOff: isTwentyPercentOff
    };
  });
};

const parsePriceString = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const formatStatus = (status) => {
  if (!status) return 'Processing';
  const cleaned = status.replace(/[-_]/g, ' ').toLowerCase();
  if (cleaned === 'pending' || cleaned === 'pending payment' || cleaned === 'payment pending') {
    return 'Payment Pending';
  }
  return cleaned.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const normalizeAttrValue = (val) => {
  if (!val) return '';
  return val.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace('years', 'y')
    .replace('year', 'y');
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('sernaya_cart', JSON.stringify(cart));
  } catch (e) {
    console.warn('Failed to save cart to localStorage:', e.message);
  }
};

const shippingThreshold = 2499;

export const useShopStore = create((set, get) => ({
  products: [],
  testimonials: [],
  orders: [],
  loadingCatalog: true,
  loadingTestimonials: true,
  selectedShippingRate: null,
  cart: (() => {
    try {
      const saved = localStorage.getItem('sernaya_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem('sernaya_cart');
      return [];
    }
  })(),
  wishlist: (() => {
    try {
      const saved = localStorage.getItem('sernaya_wishlist');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : [];
    } catch {
      localStorage.removeItem('sernaya_wishlist');
      return [];
    }
  })(),
  pendingCoupon: (() => {
    try {
      return localStorage.getItem('sernaya_pending_coupon') || '';
    } catch {
      return '';
    }
  })(),
  toasts: [],
  couponCode: '',
  appliedDiscount: 0,
  selectedColors: {
    p1: 'Warm Cream',
    p4: 'Blush Pink',
    p5: 'Starry Cream',
    p7: 'Denim Blue',
    p8: 'Olive Green',
    p10: 'Sage Green',
    p11: 'Teddy Brown',
    p12: 'Lemon Yellow',
    p14: 'Magic Cream',
    p15: 'Dusty Pink'
  },

  setSelectedColors: (updater) => {
    set((state) => ({
      selectedColors: typeof updater === 'function' ? updater(state.selectedColors) : updater
    }));
  },

  setSelectedShippingRate: (rate) => set({ selectedShippingRate: rate }),

  showToast: (message) => {
    const id = Date.now();
    set(state => ({ toasts: [...state.toasts, { id, message }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 3000);
  },

  fetchWooCommerceProducts: async () => {
    try {
      console.log(`Connecting to WooCommerce GraphQL API...`);
      const GET_PRODUCTS_QUERY = gql`
        query GetProducts {
          products(first: 100) {
            nodes {
              databaseId
              name
              onSale
              averageRating
              reviewCount
              image {
                sourceUrl
              }
              galleryImages(first: 10) {
                nodes {
                  sourceUrl
                }
              }
              productCategories {
                nodes {
                  name
                  slug
                }
              }
              ... on SimpleProduct {
                price(format: RAW)
                regularPrice(format: RAW)
                salePrice(format: RAW)
                stockStatus
                stockQuantity
                attributes {
                  nodes {
                    name
                    options
                  }
                }
              }
              ... on VariableProduct {
                price(format: RAW)
                regularPrice(format: RAW)
                salePrice(format: RAW)
                stockStatus
                stockQuantity
                attributes {
                  nodes {
                    name
                    options
                  }
                }
                variations(first: 100) {
                  nodes {
                    databaseId
                    stockStatus
                    stockQuantity
                    attributes {
                      nodes {
                        name
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await client.query({
        query: GET_PRODUCTS_QUERY,
        fetchPolicy: 'cache-first'
      });

      const productsNodes = response.data?.products?.nodes;
      if (productsNodes && Array.isArray(productsNodes) && productsNodes.length > 0) {
        const mapped = productsNodes.map((p) => {
          const GIRLS_INDICATORS = [
            'girl', 'girls', '(g)', 'minnie', 'barbie', 'princess', 'frock', 
            'dress', 'skirt', 'gown', 'lehenga', 'tutu', 'doll', 'fairy', 
            'mermaid', 'butterfly'
          ];
          const BOYS_INDICATORS = [
            'boy', 'boys', '(b)', 'spider-man', 'spiderman', 'batman', 
            'superman', 'hulk', 'avengers', 'iron man', 'ironman', 'dinosaur', 
            'dino', 'captain america'
          ];

          const prodNameLower = (p.name || '').toLowerCase();
          const hasGirlsIndicator = GIRLS_INDICATORS.some(kw => prodNameLower.includes(kw));
          const hasBoysIndicator = BOYS_INDICATORS.some(kw => prodNameLower.includes(kw));

          let isNewCategory = false;
          let isGirlsCategory = false;
          let isBoysCategory = false;
          let isNewbornCategory = false;
          let isSummerCategory = false;
          let isUnisexCategory = false;
          let isTwentyPercentOff = false;

          if (p.productCategories?.nodes && Array.isArray(p.productCategories.nodes)) {
            p.productCategories.nodes.forEach(c => {
              const slugLower = c.slug.toLowerCase();
              const nameLower = c.name.toLowerCase();

              if (slugLower.includes('new-arrivals') || nameLower.includes('new arrivals') || nameLower.includes('new arrival')) {
                isNewCategory = true;
              }
              if (slugLower === 'girls' || slugLower.includes('-girls') || nameLower.includes('girls') || nameLower.includes('(g)')) {
                isGirlsCategory = true;
              }
              if (slugLower === 'boys' || slugLower.includes('-boys') || nameLower.includes('boys') || nameLower.includes('(b)')) {
                isBoysCategory = true;
              }
              if (slugLower.includes('newborn') || nameLower.includes('newborn') || nameLower.includes('baby') || nameLower.includes('0-1')) {
                isNewbornCategory = true;
              }
              if (slugLower.includes('summer') || nameLower.includes('summer')) {
                isSummerCategory = true;
              }
              if (slugLower.includes('unisex') || nameLower.includes('unisex') || prodNameLower.includes('unisex')) {
                isUnisexCategory = true;
              }
              if (nameLower.includes('20%') || slugLower.includes('20-off') || nameLower.includes('20-off')) {
                isTwentyPercentOff = true;
              }
            });
          }

          const isCoOrdSet = p.productCategories?.nodes?.some(c => {
            const slugLower = c.slug.toLowerCase();
            const nameLower = c.name.toLowerCase();
            return slugLower.includes('co-ord') || nameLower.includes('co-ord') || nameLower.includes('co- ord');
          }) || prodNameLower.includes('co-ord') || prodNameLower.includes('co- ord');

          if (hasBoysIndicator && !hasGirlsIndicator) {
            isBoysCategory = true;
            isGirlsCategory = false;
            isUnisexCategory = false;
          }
          if (hasGirlsIndicator && !hasBoysIndicator) {
            isGirlsCategory = true;
            isBoysCategory = false;
            isUnisexCategory = false;
          }

          const mappedCategories = [];
          if (isNewCategory) mappedCategories.push('new');
          if (isGirlsCategory) mappedCategories.push('girls');
          if (isBoysCategory) mappedCategories.push('boys');
          if (isNewbornCategory) mappedCategories.push('newborn');
          if (isSummerCategory) mappedCategories.push('summer');
          
          const isExplicitUnisex = isUnisexCategory || (isGirlsCategory && isBoysCategory) || (isCoOrdSet && !(isGirlsCategory || isBoysCategory));
          if (isExplicitUnisex) {
            mappedCategories.push('unisex');
          }

          if (mappedCategories.length === 0) {
            mappedCategories.push('unisex');
          }

          const sizeAttr = p.attributes?.nodes?.find(attr => 
            attr.name.toLowerCase().includes('size') || attr.name.toLowerCase() === 'age'
          );
          const colorAttr = p.attributes?.nodes?.find(attr => 
            attr.name.toLowerCase().includes('color')
          );

          const sizesList = sizeAttr ? sizeAttr.options : ['0-3M', '3-6M', '6-12M', '12-18M'];
          const colorsList = colorAttr ? colorAttr.options.map(cName => getColorMeta(cName)) : [];

          const parsedPrice = parseFloat(p.price) || 1299;
          let originalPrice = parseFloat(p.regularPrice);
          if (!originalPrice) {
            originalPrice = parsedPrice ? Math.round(parsedPrice * 1.3) : 1799;
          }

          const hasVariations = p.variations?.nodes && p.variations.nodes.length > 0;
          const variationsList = (p.variations?.nodes || []).map(v => ({
            databaseId: v.databaseId,
            inStock: v.stockStatus === 'IN_STOCK' || v.stockStatus === 'instock' || !v.stockStatus,
            stockQuantity: v.stockQuantity !== null && v.stockQuantity !== undefined ? parseInt(v.stockQuantity, 10) : null,
            attributes: v.attributes
          }));
          const isParentInStock = p.stockStatus === 'IN_STOCK' || p.stockStatus === 'instock' || !p.stockStatus;
          const inStock = hasVariations ? variationsList.some(v => v.inStock) : isParentInStock;

          const galleryList = (p.galleryImages?.nodes || []).map(img => img.sourceUrl);
          const images = p.image?.sourceUrl ? [p.image.sourceUrl, ...galleryList] : (galleryList.length > 0 ? galleryList : ['assets/category-new.webp']);

          return {
            id: String(p.databaseId),
            name: p.name,
            price: parsedPrice,
            originalPrice: originalPrice,
            tag: p.onSale ? 'Sale' : 'New',
            tagColor: p.onSale ? 'bg-brand-coral text-white' : 'bg-bg-blue-light text-brand-navy',
            isTwentyPercentOff: isTwentyPercentOff,
            img: p.image?.sourceUrl || 'assets/category-new.webp',
            images: images,
            rating: parseFloat(p.averageRating) || 4.8,
            reviews: p.reviewCount || 12,
            category: mappedCategories[0] || 'unisex',
            categories: mappedCategories,
            sizes: sizesList,
            colors: colorsList,
            rawColorAttrName: colorAttr?.name || 'pa_color',
            rawSizeAttrName: sizeAttr?.name || 'pa_size',
            variations: variationsList,
            inStock: inStock,
            stockQuantity: p.stockQuantity !== null && p.stockQuantity !== undefined ? parseInt(p.stockQuantity, 10) : null
          };
        });

        set({ products: mapped });
      }

      // Fetch testimonials
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const GET_REVIEWS_QUERY = gql`
          query GetReviews {
            comments(first: 50) {
              nodes {
                author {
                  node {
                    name
                    avatar {
                      url
                    }
                  }
                }
                content
              }
            }
          }
        `;
        const reviewsResponse = await client.query({
          query: GET_REVIEWS_QUERY,
          fetchPolicy: 'cache-first'
        });

        const reviewsNodes = reviewsResponse.data?.comments?.nodes;
        if (reviewsNodes && Array.isArray(reviewsNodes) && reviewsNodes.length > 0) {
          const mappedReviews = reviewsNodes.map(r => ({
            name: r.author?.node?.name || 'Verified Customer',
            role: 'Verified Customer',
            text: `${r.content.replace(/<[^>]+>/g, '').trim()}`,
            avatar: r.author?.node?.avatar?.url || 'assets/category-girls.webp',
            rating: 5
          }));
          set({ testimonials: mappedReviews });
        }
      } catch (revError) {
        console.warn('Could not load reviews from WooCommerce GraphQL.', revError.message);
      } finally {
        set({ loadingTestimonials: false });
      }
    } catch (error) {
      console.warn('WooCommerce GraphQL API offline.', error.message);
    } finally {
      set({ loadingCatalog: false, loadingTestimonials: false });
    }
  },

  fetchUserOrders: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ orders: [] });
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      console.log('Fetching customer order history via WooCommerce GraphQL...');
      const GET_CUSTOMER_ORDERS = gql`
        query GetCustomerOrders {
          customer {
            orders(first: 50) {
              nodes {
                databaseId
                date
                total
                status
                paymentMethod
                shippingTotal
                discountTotal
                billing {
                  firstName
                  lastName
                  address1
                  city
                  postcode
                  phone
                  email
                }
                lineItems {
                  nodes {
                    product {
                      node {
                        name
                        image {
                          sourceUrl
                        }
                      }
                    }
                    quantity
                    total
                  }
                }
              }
            }
          }
        }
      `;
      const { data } = await client.query({
        query: GET_CUSTOMER_ORDERS,
        fetchPolicy: 'network-only'
      });
      const fetchedOrders = data?.customer?.orders?.nodes || [];
      const mappedOrders = fetchedOrders.map(order => {
        const billingInfo = order.billing || {};
        return {
          id: `SK-${order.databaseId}`,
          date: order.date ? order.date.split(' ')[0] : new Date().toISOString().split('T')[0],
          items: (order.lineItems?.nodes || []).map(item => {
            const rawTotal = parsePriceString(item.total);
            const qty = item.quantity || 1;
            return {
              name: item.product?.node?.name || 'Outfit',
              quantity: qty,
              price: rawTotal / qty,
              color: '',
              size: '',
              image: item.product?.node?.image?.sourceUrl || ''
            };
          }),
          total: parsePriceString(order.total),
          shippingCost: parsePriceString(order.shippingTotal) || 0,
          discount: parsePriceString(order.discountTotal) || 0,
          status: formatStatus(order.status),
          shippingDetails: {
            name: `${billingInfo.firstName || ''} ${billingInfo.lastName || ''}`.trim() || user?.name || 'Customer',
            phone: billingInfo.phone || user?.phone || 'No phone',
            email: billingInfo.email || user?.email || '',
            address: billingInfo.address1 || user?.address || '',
            city: billingInfo.city || user?.city || '',
            pin: billingInfo.postcode || user?.pin || ''
          },
          paymentMode: order.paymentMethod || 'prepaid'
        };
      });
      const uniqueOrders = mappedOrders.filter((o, idx, self) =>
        self.findIndex(item => item.id === o.id) === idx
      );
      set({ orders: uniqueOrders });
    } catch (err) {
      console.warn('Could not fetch user order history via GraphQL.', err.message);
    }
  },

  syncCartFromBackend: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      console.log('Guest user detected, skipping backend cart sync.');
      return;
    }
    try {
      console.log('Fetching cart from WooCommerce backend...');
      const response = await client.query({
        query: GET_CART_QUERY,
        fetchPolicy: 'network-only'
      });
      const cartData = response.data?.cart;
      const contentsNodes = cartData?.contents?.nodes;
      const mapped = mapBackendCart(contentsNodes);
      
      const coupons = cartData?.appliedCoupons || [];
      saveCartToStorage(mapped);
      if (Array.isArray(coupons) && coupons.length > 0) {
        const activeCoupon = coupons[0]?.code || '';
        const discountTotalStr = cartData?.discountTotal || '0';
        const subtotalStr = cartData?.subtotal || '1';
        
        const discountVal = parseFloat(discountTotalStr.replace(/[^0-9.]/g, '')) || 0;
        const subtotalVal = parseFloat(subtotalStr.replace(/[^0-9.]/g, '')) || 1;
        
        set({ 
          cart: mapped,
          couponCode: activeCoupon.toUpperCase(),
          appliedDiscount: subtotalVal > 0 ? discountVal / subtotalVal : 0
        });
      } else {
        set({ 
          cart: mapped,
          couponCode: '',
          appliedDiscount: 0
        });
      }
      console.log('Cart synchronized:', mapped);
    } catch (error) {
      console.warn('Failed to fetch cart from backend:', error.message);
    }
  },

  syncOnAuthChange: async () => {
    const user = useAuthStore.getState().user;
    const { cart, products, syncCartFromBackend } = get();

    if (user) {
      console.log("User detected. Synchronizing cart and wishlist with WooCommerce...");
      const localWishlist = JSON.parse(localStorage.getItem('sernaya_wishlist') || '[]');
      const serverWishlistIds = user.wishlist ? user.wishlist.split(',').filter(Boolean) : [];
      const mergedWishlist = Array.from(new Set([...localWishlist, ...serverWishlistIds]));
      
      set({ wishlist: mergedWishlist });
      localStorage.setItem('sernaya_wishlist', JSON.stringify(mergedWishlist));
      
      if (mergedWishlist.length > serverWishlistIds.length) {
        try {
          const UPDATE_WISHLIST_MUTATION = gql`
            mutation UpdateWishlistOnLogin($wishlistStr: String!) {
              updateCustomer(input: {
                metaData: [
                  { key: "sernaya_wishlist", value: $wishlistStr }
                ]
              }) {
                customer {
                  databaseId
                }
              }
            }
          `;
          await client.mutate({
            mutation: UPDATE_WISHLIST_MUTATION,
            variables: { wishlistStr: mergedWishlist.join(',') }
          });
        } catch (e) {
          console.warn('Failed to merge wishlist on login:', e.message);
        }
      }

      if (cart.length > 0) {
        console.log("Migrating guest cart to server...");
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        for (const item of cart) {
          if (!item.key) {
            const dbId = parseInt(item.id.replace(/\D/g, '')) || 989098;
            const productObj = products.find(p => p.id === item.id);
            const colorName = productObj?.rawColorAttrName || 'pa_color';
            const sizeName = productObj?.rawSizeAttrName || 'pa_size';
            const variationAttr = [];
            if (productObj) {
              if (productObj.colors && productObj.colors.length > 0) {
                variationAttr.push({ attributeName: colorName, attributeValue: item.color });
              }
              if (productObj.sizes && productObj.sizes.length > 0) {
                variationAttr.push({ attributeName: sizeName, attributeValue: item.size });
              }
            } else {
              variationAttr.push({ attributeName: colorName, attributeValue: item.color });
              variationAttr.push({ attributeName: sizeName, attributeValue: item.size });
            }

            let variationId = null;
            if (productObj?.variations && productObj.variations.length > 0) {
              const matched = productObj.variations.find(v => {
                if (!v.attributes?.nodes) return false;
                return v.attributes.nodes.every(attr => {
                  const attrName = attr.name.toLowerCase();
                  const attrVal = attr.value;
                  if (attrName.includes('color')) {
                    return !attrVal || normalizeAttrValue(attrVal) === normalizeAttrValue(item.color);
                  }
                  if (attrName.includes('size') || attrName === 'age' || attrName.includes('age')) {
                    return !attrVal || normalizeAttrValue(attrVal) === normalizeAttrValue(item.size);
                  }
                  return true;
                });
              });
              if (matched) variationId = matched.databaseId;
            }

            try {
              await client.mutate({
                mutation: ADD_TO_CART_MUTATION,
                variables: {
                  productId: dbId,
                  quantity: item.quantity,
                  variation: variationAttr,
                  variationId: variationId
                }
              });
            } catch (e) {
              console.warn(`Failed to migrate guest item ${item.name}:`, e.message);
            }
            await delay(500);
          }
        }
      }
    }
    await syncCartFromBackend();

    if (user) {
      const pendingCoupon = get().pendingCoupon || localStorage.getItem('sernaya_pending_coupon') || '';
      if (pendingCoupon) {
        console.log(`Automatically applying pending coupon "${pendingCoupon}" on login...`);
        const applied = await get().handleApplyCoupon(pendingCoupon);
        if (applied) {
          set({ pendingCoupon: '' });
          localStorage.removeItem('sernaya_pending_coupon');
          await syncCartFromBackend();
        }
      }
    }
  },

  addToCart: async (product, color = '', size = '', quantity = 1) => {
    const { allowed, retryAfter } = checkRateLimit('cart');
    if (!allowed) {
      get().showToast(getRateLimitMessage('cart', retryAfter));
      return;
    }

    const addQty = Math.max(1, Math.floor(quantity));
    let selectedColor = color || get().selectedColors[product.id];
    let selectedSize = size;

    if (!selectedColor || !selectedSize) {
      const firstInStockVar = product.variations?.find(v => v.inStock);
      if (firstInStockVar) {
        const sizeAttr = firstInStockVar.attributes?.nodes?.find(a => a.name.toLowerCase().includes('size') || a.name.toLowerCase() === 'age');
        const colorAttr = firstInStockVar.attributes?.nodes?.find(a => a.name.toLowerCase().includes('color'));
        if (sizeAttr && !selectedSize) selectedSize = sizeAttr.value;
        if (colorAttr && !selectedColor) selectedColor = colorAttr.value;
      }
    }

    if (!selectedColor) selectedColor = product.colors?.[0]?.name || 'Default';
    if (!selectedSize) selectedSize = product.sizes?.[0] || '4-5Y';

    let variationId = null;
    let isVariationInStock = product.inStock;
    if (product.variations && product.variations.length > 0) {
      const matched = product.variations.find(v => {
        if (!v.attributes?.nodes) return false;
        return v.attributes.nodes.every(attr => {
          const attrName = attr.name.toLowerCase();
          const attrVal = attr.value;
          if (attrName.includes('color')) {
            return !attrVal || normalizeAttrValue(attrVal) === normalizeAttrValue(selectedColor);
          }
          if (attrName.includes('size') || attrName === 'age' || attrName.includes('age')) {
            return !attrVal || normalizeAttrValue(attrVal) === normalizeAttrValue(selectedSize);
          }
          return true;
        });
      });
      if (matched) {
        variationId = matched.databaseId;
        isVariationInStock = matched.inStock;
      }
    }

    if (!isVariationInStock) {
      get().showToast(`Sorry, "${product.name} - ${selectedSize}" is currently out of stock!`, 'error');
      return;
    }

    const existing = get().cart.find(item => item.id === product.id && item.color === selectedColor && item.size === selectedSize);
    const existingQty = existing ? existing.quantity : 0;
    const newTotalQty = existingQty + addQty;

    let currentStockQty = null;
    if (product.variations && product.variations.length > 0) {
      const matched = product.variations.find(v => {
        if (!v.attributes?.nodes) return false;
        return v.attributes.nodes.every(attr => {
          const attrName = attr.name.toLowerCase();
          const attrVal = attr.value;
          if (attrName.includes('color')) {
            return !attrVal || normalizeAttrValue(attrVal) === normalizeAttrValue(selectedColor);
          }
          if (attrName.includes('size') || attrName === 'age' || attrName.includes('age')) {
            return !attrVal || normalizeAttrValue(attrVal) === normalizeAttrValue(selectedSize);
          }
          return true;
        });
      });
      if (matched) {
        currentStockQty = matched.stockQuantity;
      }
    } else {
      currentStockQty = product.stockQuantity;
    }

    if (currentStockQty !== null && newTotalQty > currentStockQty) {
      const remainingToAdd = currentStockQty - existingQty;
      if (remainingToAdd <= 0) {
        get().showToast(`You already have the maximum available stock (${currentStockQty}) of this item in your cart.`);
        return;
      } else {
        get().showToast(`Only ${currentStockQty} items available in stock. You can only add ${remainingToAdd} more.`);
        return;
      }
    }

    const label = addQty > 1 ? `${addQty}× ` : '';
    get().showToast(`Added ${label}"${product.name}" to shopping bag!`);

    if (existing) {
      set(state => {
        const newCart = state.cart.map(item =>
          item.id === product.id && item.color === selectedColor && item.size === selectedSize
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
        saveCartToStorage(newCart);
        return { cart: newCart };
      });
    } else {
      set(state => {
        const newCart = [...state.cart, {
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.img,
          color: selectedColor,
          size: selectedSize,
          quantity: addQty,
          variationId: variationId,
          isTwentyPercentOff: product.isTwentyPercentOff
        }];
        saveCartToStorage(newCart);
        return { cart: newCart };
      });
    }

    // Track AddToCart on Meta Pixel
    fbqTrack('AddToCart', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      value: product.price ? parseFloat(product.price) * addQty : 0,
      currency: 'INR',
    });

    // Automatically apply coupon if adding a 20% OFF sale item and no coupon is already applied
    if (product.isTwentyPercentOff) {
      const currentCoupon = get().couponCode || '';
      if (!currentCoupon) {
        const user = useAuthStore.getState().user;
        if (user) {
          setTimeout(() => {
            if (!get().couponCode) {
              get().handleApplyCoupon('SALE20');
            }
          }, 50);
        }
      }
    }

    const user = useAuthStore.getState().user;
    if (user) {
      const dbId = parseInt(product.id.replace(/\D/g, '')) || 989098;
      const colorName = product.rawColorAttrName || 'pa_color';
      const sizeName = product.rawSizeAttrName || 'pa_size';

      const variationAttr = [];
      if (product.colors && product.colors.length > 0) {
        variationAttr.push({ attributeName: colorName, attributeValue: selectedColor });
      }
      if (product.sizes && product.sizes.length > 0) {
        variationAttr.push({ attributeName: sizeName, attributeValue: selectedSize });
      }

      try {
        const { data } = await client.mutate({
          mutation: ADD_TO_CART_MUTATION,
          variables: {
            productId: dbId,
            quantity: addQty,
            variation: variationAttr.length > 0 ? variationAttr : undefined,
            variationId: variationId || undefined
          }
        });
        const contentsNodes = data?.addToCart?.cart?.contents?.nodes;
        if (contentsNodes) {
          const mapped = mapBackendCart(contentsNodes);
          set({ cart: mapped });
          saveCartToStorage(mapped);
        }
      } catch (error) {
        console.warn('Failed to add cart item to backend:', error.message);
      }
    }
  },

  updateQty: async (id, color, size, increment) => {
    const { allowed, retryAfter } = checkRateLimit('cart');
    if (!allowed) {
      get().showToast(getRateLimitMessage('cart', retryAfter));
      return;
    }

    const currentItem = get().cart.find(item => item.id === id && item.color === color && item.size === size);
    if (!currentItem) return;

    const newQty = currentItem.quantity + increment;

    if (increment > 0) {
      const product = get().products.find(p => p.id === id);
      if (product) {
        let currentStockQty = null;
        if (product.variations && product.variations.length > 0) {
          const matched = product.variations.find(v => {
            if (!v.attributes?.nodes) return false;
            return v.attributes.nodes.every(attr => {
              const attrName = attr.name.toLowerCase();
              const attrVal = attr.value;
              if (attrName.includes('color')) {
                return !attrVal || normalizeAttrValue(attrVal) === normalizeAttrValue(color);
              }
              if (attrName.includes('size') || attrName === 'age' || attrName.includes('age')) {
                return !attrVal || normalizeAttrValue(attrVal) === normalizeAttrValue(size);
              }
              return true;
            });
          });
          if (matched) {
            currentStockQty = matched.stockQuantity;
          }
        } else {
          currentStockQty = product.stockQuantity;
        }

        if (currentStockQty !== null && newQty > currentStockQty) {
          get().showToast(`Sorry, only ${currentStockQty} items available in stock.`);
          return;
        }
      }
    }

    if (newQty <= 0) {
      await get().removeFromCart(id, color, size);
      return;
    }

    set(state => {
      const newCart = state.cart.map(item =>
        item.id === id && item.color === color && item.size === size
          ? { ...item, quantity: newQty }
          : item
      );
      saveCartToStorage(newCart);
      return { cart: newCart };
    });

    const user = useAuthStore.getState().user;
    if (user && currentItem.key) {
      try {
        const { data } = await client.mutate({
          mutation: UPDATE_CART_QUANTITIES_MUTATION,
          variables: {
            key: currentItem.key,
            quantity: newQty
          }
        });
        const contentsNodes = data?.updateItemQuantities?.cart?.contents?.nodes;
        if (contentsNodes) {
          const mapped = mapBackendCart(contentsNodes);
          set({ cart: mapped });
          saveCartToStorage(mapped);
        }
      } catch (error) {
        console.warn('Failed to update cart quantity on backend:', error.message);
      }
    }
  },

  removeFromCart: async (id, color, size) => {
    const { allowed, retryAfter } = checkRateLimit('cart');
    if (!allowed) {
      get().showToast(getRateLimitMessage('cart', retryAfter));
      return;
    }

    const currentItem = get().cart.find(i => i.id === id && i.color === color && i.size === size);
    if (!currentItem) return;

    get().showToast(`Removed "${currentItem.name}" from bag.`);
    set(state => {
      const newCart = state.cart.filter(i => !(i.id === id && i.color === color && i.size === size));
      saveCartToStorage(newCart);
      return { cart: newCart };
    });

    const user = useAuthStore.getState().user;
    if (user && currentItem.key) {
      try {
        const { data } = await client.mutate({
          mutation: REMOVE_FROM_CART_MUTATION,
          variables: { key: currentItem.key }
        });
        const contentsNodes = data?.removeItemsFromCart?.cart?.contents?.nodes;
        if (contentsNodes) {
          const mapped = mapBackendCart(contentsNodes);
          set({ cart: mapped });
          saveCartToStorage(mapped);
        }
      } catch (error) {
        console.warn('Failed to remove item from backend cart:', error.message);
      }
    }
  },

  toggleWishlist: async (productId, name) => {
    const wishlist = get().wishlist;
    const isAlready = wishlist.includes(productId);
    const updatedWishlist = isAlready
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    if (isAlready) {
      get().showToast(`Removed "${name}" from Wishlist.`);
    } else {
      get().showToast(`Saved "${name}" to Wishlist!`);
    }
    set({ wishlist: updatedWishlist });
    localStorage.setItem('sernaya_wishlist', JSON.stringify(updatedWishlist));

    const user = useAuthStore.getState().user;
    if (user) {
      try {
        const UPDATE_WISHLIST_MUTATION = gql`
          mutation UpdateWishlist($wishlistStr: String!) {
            updateCustomer(input: {
              metaData: [
                { key: "sernaya_wishlist", value: $wishlistStr }
              ]
            }) {
              customer {
                metaData {
                  key
                  value
                }
              }
            }
          }
        `;
        await client.mutate({
          mutation: UPDATE_WISHLIST_MUTATION,
          variables: { wishlistStr: updatedWishlist.join(',') }
        });
      } catch (err) {
        console.warn('Failed to sync wishlist with backend:', err.message);
      }
    }
  },

  handleApplyCoupon: async (code) => {
    const { allowed, retryAfter } = checkRateLimit('coupon');
    if (!allowed) {
      get().showToast(getRateLimitMessage('coupon', retryAfter));
      return false;
    }

    const cleanCode = String(code).trim().toUpperCase();
    if (!cleanCode) {
      get().showToast('Please enter a valid coupon code.');
      return false;
    }

    const user = useAuthStore.getState().user;
    if (!user) {
      set({ pendingCoupon: cleanCode });
      localStorage.setItem('sernaya_pending_coupon', cleanCode);
      get().showToast('Please login to apply coupon');
      return false;
    }

    // Always remove existing coupon first so user has only 1 active code at a time
    const existingCode = get().couponCode ? get().couponCode.trim().toUpperCase() : '';
    if (existingCode && existingCode !== cleanCode) {
      try {
        console.log(`Removing previous coupon "${existingCode}" before applying "${cleanCode}"...`);
        await client.mutate({
          mutation: REMOVE_COUPONS_MUTATION,
          variables: { codes: [existingCode] }
        });
      } catch (remErr) {
        console.warn('Failed to remove previous coupon:', remErr.message);
      }
    }

    // Handle special promotional sale codes (SALE20)
    const isSale20 = cleanCode === 'SALE20';

    if (isSale20) {
      const rate = 0.20;
      try {
        console.log(`Applying sale coupon "${cleanCode}" via GraphQL...`);
        const response = await client.mutate({
          mutation: APPLY_COUPON_MUTATION,
          variables: { code: cleanCode }
        });
        
        const cartData = response.data?.applyCoupon?.cart;
        const discountTotalStr = cartData?.discountTotal || '0';
        const subtotalStr = cartData?.subtotal || '1';
        
        const discountVal = parseFloat(discountTotalStr.replace(/[^0-9.]/g, '')) || 0;
        const subtotalVal = parseFloat(subtotalStr.replace(/[^0-9.]/g, '')) || 1;
        const backendRate = subtotalVal > 0 ? discountVal / subtotalVal : 0;

        set({ 
          couponCode: cleanCode,
          appliedDiscount: backendRate > 0 ? backendRate : rate
        });
      } catch (error) {
        console.warn(`GraphQL coupon application note for ${cleanCode}:`, error.message);
        set({
          couponCode: cleanCode,
          appliedDiscount: rate
        });
      }

      // Check if user has eligible products in cart for SALE20
      const cartItems = get().cart || [];
      const products = get().products || [];
      const hasSaleItems = cartItems.some(item => {
        const prod = products.find(p => String(p.id) === String(item.id) || (parseInt(p.id, 10) === parseInt(item.id, 10) && !isNaN(parseInt(p.id, 10))));
        return prod ? prod.isTwentyPercentOff : item.isTwentyPercentOff;
      });

      if (cartItems.length > 0 && !hasSaleItems) {
        get().showToast(`Coupon "${cleanCode}" applied! (Discount applies to selected sale products)`);
      } else {
        get().showToast(`Coupon "${cleanCode}" applied successfully!`);
      }
      return true;
    }

    // Applying any other coupon code
    try {
      console.log(`Applying coupon "${cleanCode}" via GraphQL...`);
      const response = await client.mutate({
        mutation: APPLY_COUPON_MUTATION,
        variables: { code: cleanCode }
      });
      
      const cartData = response.data?.applyCoupon?.cart;
      const discountTotalStr = cartData?.discountTotal || '0';
      const subtotalStr = cartData?.subtotal || '1';
      
      const discountVal = parseFloat(discountTotalStr.replace(/[^0-9.]/g, '')) || 0;
      const subtotalVal = parseFloat(subtotalStr.replace(/[^0-9.]/g, '')) || 1;
      
      set({ 
        couponCode: cleanCode,
        appliedDiscount: subtotalVal > 0 ? discountVal / subtotalVal : 0
      });
      get().showToast(`Coupon "${cleanCode}" applied successfully!`);
      return true;
    } catch (error) {
      console.warn('Failed to apply coupon via GraphQL:', error.message);
      const errorMsg = error.message ? error.message.replace(/<[^>]+>/g, '').trim() : 'Invalid coupon code.';
      get().showToast(errorMsg);
      set({ appliedDiscount: 0, couponCode: '' });
      return false;
    }
  },

  handleRemoveCoupon: async () => {
    const couponCode = get().couponCode;
    const code = couponCode ? couponCode.trim().toUpperCase() : '';
    
    set({ couponCode: '', appliedDiscount: 0 });

    if (code) {
      try {
        console.log(`Removing coupon "${code}" via GraphQL...`);
        await client.mutate({
          mutation: REMOVE_COUPONS_MUTATION,
          variables: { codes: [code] }
        });
        get().showToast(`Coupon "${code}" removed.`);
      } catch (error) {
        console.warn('Failed to remove coupon via GraphQL:', error.message);
        get().showToast(`Coupon cleared.`);
      }
    }
  },

  syncCouponFromServer: (code, discount = 0) => {
    if (!code) {
      set({ couponCode: '', appliedDiscount: 0 });
      return;
    }
    const cleaned = String(code).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (/^[A-Z0-9]{3,20}$/.test(cleaned)) {
      set({ couponCode: cleaned, appliedDiscount: discount });
    }
  },

  clearCart: async () => {
    const coupon = get().couponCode;
    set({ cart: [], appliedDiscount: 0, couponCode: '', selectedShippingRate: null });
    saveCartToStorage([]);

    const user = useAuthStore.getState().user;
    if (user) {
      try {
        const CLEAR_CART_MUTATION = gql`
          mutation ClearCart {
            removeItemsFromCart(input: { all: true }) {
              cart {
                contents(first: 100) {
                  nodes {
                    key
                  }
                }
              }
            }
          }
        `;
        await client.mutate({
          mutation: CLEAR_CART_MUTATION
        });

        if (coupon) {
          console.log(`Removing coupon "${coupon}" from server during cart clear...`);
          await client.mutate({
            mutation: REMOVE_COUPONS_MUTATION,
            variables: { codes: [coupon] }
          });
        }
      } catch (error) {
        console.warn('Failed to clear remote cart or coupons:', error.message);
      }
    }
  },

  createWooCommerceOrder: async (shippingDetails, cartItems, cartTotal, razorpayMeta = {}) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw new Error('Unauthorized: You must be logged in to place an order.');
    }

    const { allowed, retryAfter } = checkRateLimit('order');
    if (!allowed) {
      throw new Error(getRateLimitMessage('order', retryAfter));
    }

    try {
      let currentSessionToken = sessionStorage.getItem('woocommerce-session') || '';
      let currentCartToken = sessionStorage.getItem('wc-cart-token') || '';
      let currentNonce = '';

      const updateSessionAndNonce = (headers) => {
        if (!headers) return;
        
        const newSession = headers['woocommerce-session'] || (typeof headers.get === 'function' ? headers.get('woocommerce-session') : '');
        if (newSession) {
          sessionStorage.setItem('woocommerce-session', newSession);
          currentSessionToken = newSession;
        }

        const newCartToken = headers['cart-token'] || (typeof headers.get === 'function' ? headers.get('cart-token') : '');
        if (newCartToken) {
          sessionStorage.setItem('wc-cart-token', newCartToken);
          currentCartToken = newCartToken;
        }

        const newNonce = headers['nonce'] || headers['x-wc-store-api-nonce'] || (typeof headers.get === 'function' ? (headers.get('nonce') || headers.get('x-wc-store-api-nonce')) : '');
        if (newNonce) {
          currentNonce = newNonce;
        }
      };

      const jwtToken = getAuthToken();
      const authHeaders = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};

      console.log('--- DEBUG ORDER START ---', { jwtToken, authHeaders, currentSessionToken, currentCartToken });

      const cartResponse = await axios.get('/wp-json/wc/store/v1/cart', {
        headers: { 
          'Cache-Control': 'no-cache',
          ...authHeaders,
          ...(currentCartToken ? { 'Cart-Token': currentCartToken } : {}),
          ...(currentSessionToken ? { 'woocommerce-session': `Session ${currentSessionToken}` } : {})
        },
        withCredentials: true
      });

      console.log('cartResponse headers keys:', Object.keys(cartResponse.headers));
      console.log('cartResponse nonce header direct:', cartResponse.headers['nonce'] || cartResponse.headers['Nonce'] || cartResponse.headers['x-wc-store-api-nonce'] || cartResponse.headers['X-WC-Store-API-Nonce']);
      console.log('cartResponse cart-token header direct:', cartResponse.headers['cart-token'] || cartResponse.headers['Cart-Token']);

      updateSessionAndNonce(cartResponse.headers);

      console.log('Extracted nonce:', currentNonce, 'Extracted session:', currentSessionToken, 'Extracted cart token:', currentCartToken);

      if (!currentNonce) {
        throw new Error('Could not retrieve a checkout session token. Please refresh the page and try again.');
      }

      const addressPayload = {
        billing_address: {
          first_name: shippingDetails.name.split(' ')[0] || '',
          last_name: shippingDetails.name.split(' ').slice(1).join(' ') || '.',
          address_1: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state || 'DL',
          postcode: shippingDetails.pin,
          country: 'IN',
          phone: shippingDetails.phone,
          email: shippingDetails.email || user?.email || ''
        },
        shipping_address: {
          first_name: shippingDetails.name.split(' ')[0] || '',
          last_name: shippingDetails.name.split(' ').slice(1).join(' ') || '.',
          address_1: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state || 'DL',
          postcode: shippingDetails.pin,
          country: 'IN',
          phone: shippingDetails.phone
        }
      };

      const customerUpdateResponse = await axios.post('/wp-json/wc/store/v1/cart/update-customer', addressPayload, {
        headers: { 
          'Nonce': currentNonce, 
          'X-WC-Store-API-Nonce': currentNonce,
          ...authHeaders,
          ...(currentCartToken ? { 'Cart-Token': currentCartToken } : {}),
          ...(currentSessionToken ? { 'woocommerce-session': `Session ${currentSessionToken}` } : {})
        },
        withCredentials: true
      });

      updateSessionAndNonce(customerUpdateResponse.headers);

      const shippingRates = customerUpdateResponse.data?.shipping_rates || [];
      if (shippingRates.length > 0) {
        const firstPackage = shippingRates[0];
        const packageId = firstPackage.package_id || 0;
        const availableRates = firstPackage.shipping_rates || [];
        if (availableRates.length > 0) {
          const firstRate = availableRates[0];
          set({ selectedShippingRate: firstRate });
          const selectShippingResponse = await axios.post('/wp-json/wc/store/v1/cart/select-shipping-rate', {
            package_id: packageId,
            rate_id: firstRate.rate_id
          }, {
            headers: { 
              'Nonce': currentNonce, 
              'X-WC-Store-API-Nonce': currentNonce,
              ...authHeaders,
              ...(currentCartToken ? { 'Cart-Token': currentCartToken } : {}),
              ...(currentSessionToken ? { 'woocommerce-session': `Session ${currentSessionToken}` } : {})
            },
            withCredentials: true
          });
          updateSessionAndNonce(selectShippingResponse.headers);
        }
      }

      await get().syncCartFromBackend();

      const checkoutPayload = {
        ...addressPayload,
        payment_method: 'razorpay',
        payment_data: [
          ...(razorpayMeta.razorpay_payment_id ? [{ key: 'razorpay_payment_id', value: razorpayMeta.razorpay_payment_id }] : []),
          ...(razorpayMeta.razorpay_order_id   ? [{ key: 'razorpay_order_id',   value: razorpayMeta.razorpay_order_id   }] : []),
          ...(razorpayMeta.razorpay_signature  ? [{ key: 'razorpay_signature',  value: razorpayMeta.razorpay_signature  }] : []),
          { key: 'payment_amount', value: String(cartTotal) }
        ],
      };

      const checkoutResponse = await axios.post('/wp-json/wc/store/v1/checkout', checkoutPayload, {
        headers: { 
          'Nonce': currentNonce, 
          'X-WC-Store-API-Nonce': currentNonce,
          ...authHeaders,
          ...(currentCartToken ? { 'Cart-Token': currentCartToken } : {}),
          ...(currentSessionToken ? { 'woocommerce-session': `Session ${currentSessionToken}` } : {})
        },
        withCredentials: true
      });

      const orderData = checkoutResponse.data;
      if (orderData && orderData.order_id) {
        const derived = getDerivedShopState(get());
        const orderShippingCost = derived.shippingCost || 0;
        const orderDiscount = derived.discountAmount || 0;
        
        const orderId = `SK-${orderData.order_id}`;
        set(state => ({
          orders: [
            {
              id: orderId,
              date: new Date().toISOString().split('T')[0],
              items: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                color: item.color,
                size: item.size
              })),
              total: cartTotal,
              shippingCost: orderShippingCost,
              discount: orderDiscount,
              status: shippingDetails.payment === 'card' ? 'Payment Pending' : 'Processing',
              shippingDetails,
              paymentMode: shippingDetails.payment || 'prepaid'
            },
            ...state.orders
          ]
        }));
        
        if (shippingDetails.payment !== 'card') {
          try {
            await axios.post('/wp-json/sernaya/v1/notify-admin-order', {
              orderId: orderData.order_id
            }, {
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders
              },
              withCredentials: true
            });
          } catch (emailErr) {
            console.warn('Failed to trigger admin email notification:', emailErr.message);
          }
        }

        await get().clearCart();
        return orderId;
      }

      throw new Error('Order submission failed: no order ID returned from server.');

    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Unknown error';
      if (
        msg.toLowerCase().includes('unauthorized') ||
        msg.toLowerCase().includes('log in') ||
        msg.toLowerCase().includes('permission')
      ) {
        throw new Error('Unauthorized: ' + msg, { cause: error });
      }
      throw new Error('Order placement failed: ' + msg, { cause: error });
    }
  }
}));

// Derived selectors helper hook/function to keep the API compatible with useShop
export const getDerivedShopState = (state) => {
  const cartSubtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Determine coupon discount rate
  const upperCoupon = (state.couponCode || '').toUpperCase();
  let discountRate = state.appliedDiscount;
  if (upperCoupon === 'SALE20') {
    discountRate = 0.20;
  }

  // Calculate discount:
  // SALE20 applies ONLY on selected products (20% OFF category)
  // General coupons apply on the total price (all items)
  let discountAmount = 0;
  if (discountRate > 0) {
    if (upperCoupon === 'SALE20') {
      const saleItemsSubtotal = state.cart.reduce((sum, item) => {
        const product = state.products?.find(p => 
          String(p.id) === String(item.id) || 
          (parseInt(p.id, 10) === parseInt(item.id, 10) && !isNaN(parseInt(p.id, 10)))
        );
        const isTwentyPercentOff = product ? product.isTwentyPercentOff : item.isTwentyPercentOff;
        if (isTwentyPercentOff) {
          return sum + item.price * item.quantity;
        }
        return sum;
      }, 0);
      discountAmount = Math.round(saleItemsSubtotal * discountRate);
    } else {
      discountAmount = Math.round(cartSubtotal * discountRate);
    }
  }

  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const isFreeShipping = cartSubtotal >= shippingThreshold || state.cart.length === 0;
  const rawShippingCost = state.selectedShippingRate ? parseFloat(state.selectedShippingRate.price || state.selectedShippingRate.total || 0) : (isFreeShipping ? 0 : 100);
  const shippingCost = isNaN(rawShippingCost) ? (isFreeShipping ? 0 : 100) : rawShippingCost;
  const cartTotal = discountedSubtotal + shippingCost;
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartSubtotal,
    discountAmount,
    discountedSubtotal,
    isFreeShipping,
    shippingCost,
    cartTotal,
    cartCount,
    appliedDiscount: state.couponCode ? discountRate : 0,
    couponCode: state.couponCode || '',
    shippingThreshold
  };
};
