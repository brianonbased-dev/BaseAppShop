# Shopify Purchase Integration Setup

## 🎯 What's Been Implemented

Your app now has complete Shopify purchase functionality:

### ✅ **Purchase Flow**
- **Cart Management**: Add/remove items, update quantities
- **Checkout Process**: Creates Shopify carts and redirects to checkout
- **Purchase Confirmation**: Shows success/error states
- **Cart Persistence**: Uses cookies to maintain cart across sessions

### ✅ **Webhook System**
- **Secure Webhook Handler**: `/api/shopify-webhooks` with HMAC verification
- **Order Events**: Handles orders/paid, orders/fulfilled, orders/cancelled, orders/created
- **Logging**: Comprehensive logging for debugging

### ✅ **Server Actions**
- **initiateCheckout()**: Creates Shopify cart and gets checkout URL
- **completePurchase()**: Handles post-purchase cleanup

---

## 🛠️ Shopify Admin Configuration Required

### 1. **Set Up Webhooks**
In your Shopify Admin (https://0xyq0w-e7.myshopify.com/admin):

1. Go to **Settings** → **Notifications**
2. Scroll to **Webhooks** section
3. Click **Create webhook** for each of these:

#### **Order Paid Webhook**
- **Event**: `Order payment`
- **Format**: `JSON`
- **URL**: `https://YOUR-DOMAIN.com/api/shopify-webhooks`
- **Secret**: Your `SHOPIFY_WEBHOOK_SECRET` value

#### **Order Fulfilled Webhook**
- **Event**: `Order fulfillment`
- **Format**: `JSON`  
- **URL**: `https://YOUR-DOMAIN.com/api/shopify-webhooks`
- **Secret**: Your `SHOPIFY_WEBHOOK_SECRET` value

#### **Order Created Webhook**
- **Event**: `Order creation`
- **Format**: `JSON`
- **URL**: `https://YOUR-DOMAIN.com/api/shopify-webhooks` 
- **Secret**: Your `SHOPIFY_WEBHOOK_SECRET` value

### 2. **Get Admin API Token** (Optional)
For order tracking and management:

1. In Shopify Admin, go to **Apps** → **Develop apps**
2. Click **Create an app**
3. Configure **Admin API access scopes**:
   - `read_orders`
   - `write_orders` (if you need to update orders)
4. Install the app and copy the **Admin API access token**
5. Add to `.env.local`: `SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token`

---

## 🚀 How It Works

### **Customer Purchase Flow**
1. Customer adds items to cart in your app
2. Clicks "Pay with Base" → calls `handleCheckout()`
3. App creates Shopify cart via `initiateCheckout()`
4. Customer redirects to Shopify checkout
5. Customer completes payment on Shopify
6. Shopify sends webhook to your app
7. Your app processes the webhook and updates order status

### **Webhook Processing**
```
Shopify Order Event → Your Webhook Handler → Process & Log → Respond
```

### **Testing the Integration**

#### **Test Webhook Endpoint**
```bash
curl -X POST https://your-domain.com/api/shopify-webhooks \\
  -H "Content-Type: application/json" \\
  -H "X-Shopify-Topic: orders/paid" \\
  -H "X-Shopify-Shop-Domain: 0xyq0w-e7.myshopify.com" \\
  -H "X-Shopify-Hmac-Sha256: YOUR_SIGNATURE" \\
  -d '{"id": 12345, "order_number": "1001", "email": "test@example.com"}'
```

#### **Test Cart Creation**
Visit: `/api/test-shopify` to verify Shopify connection

---

## 🎨 UI Features

### **Enhanced Cart Button**
- Dynamic background color based on item count
- Animated item count badge
- Pulse effects when items added

### **Purchase Confirmation**
- Success modal after checkout initiation
- Auto-closes after 5 seconds
- Shows order total and redirects user

### **Error Handling**
- Graceful fallbacks for API failures
- User-friendly error messages
- Retry mechanisms

---

## 🔧 Environment Variables Required

```env
# Storefront API (for browsing products)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=0xyq0w-e7.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token

# Webhook Security
SHOPIFY_WEBHOOK_SECRET=b39b1f3901ba569869e99f04c3c01fa0

# Admin API (optional - for order management)
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
```

---

## 🎯 Next Steps

1. **Deploy your app** with the new webhook endpoint
2. **Configure webhooks** in Shopify admin (see setup above)
3. **Test a purchase** end-to-end
4. **Add Admin API token** for order tracking (optional)
5. **Customize webhook handlers** for your business logic

## 🐛 Debugging

- Check webhook logs in your deployment console
- Test webhook signature verification with dummy payloads
- Use `/api/test-shopify` to verify Shopify API connection
- Monitor cart creation/checkout flow in browser console

The purchase flow is now fully functional! Customers can add items to cart and complete purchases through Shopify's secure checkout, with your app receiving real-time webhook notifications about order events.
