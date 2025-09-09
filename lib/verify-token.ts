// Quick token verification tool
// Add this to your diagnostic page or run in browser console

export function verifyTokenType(token: string) {
  console.log('🔍 Analyzing token...');
  console.log(`Token: ${token}`);
  console.log(`Length: ${token.length}`);
  console.log(`Format: ${token.match(/^[a-f0-9]+$/) ? 'Hexadecimal' : 'Mixed characters'}`);
  
  // Storefront tokens are typically 32 chars, hexadecimal
  if (token.length === 32 && token.match(/^[a-f0-9]+$/)) {
    console.log('✅ This looks like a Storefront Access Token');
  } else if (token.length > 32) {
    console.log('❓ This might be an Admin API token or different type');
  } else {
    console.log('❓ Unusual token format - may not be a Shopify token');
  }
  
  return {
    length: token.length,
    format: token.match(/^[a-f0-9]+$/) ? 'hex' : 'mixed',
    likelyType: token.length === 32 && token.match(/^[a-f0-9]+$/) ? 'storefront' : 'unknown'
  };
}

// Test with a simple products query - works with any domain if token is valid
export async function testTokenWithKnownStore(token: string) {
  console.log('🧪 Testing token with known working Shopify store...');
  
  // Test with Shopify's demo store first
  const testDomains = [
    'shopify-graphql-learning-kit.myshopify.com', // Shopify's public demo
    'hydrogen-preview.myshopify.com' // Another public demo
  ];
  
  for (const domain of testDomains) {
    try {
      console.log(`Testing token against: ${domain}`);
      
      const response = await fetch(`https://${domain}/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({
          query: `{ products(first: 1) { edges { node { id title } } } }`
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.data?.products) {
        console.log(`✅ Token works! This IS a valid Storefront Access Token`);
        return true;
      } else {
        console.log(`❌ Token failed on ${domain}:`, data);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${domain}:`, error);
    }
  }
  
  console.log('❌ Token does not work with known Shopify stores');
  return false;
}
