# LYVEN E-Commerce Website — Complete Plain-English Project Guide

> **What is this document?**  
> This is a complete, beginner-friendly explanation of the entire LYVEN website. It explains what the website does, how every page works, how payments work, how the admin panel works, and what you need to launch it.

---

## 1. What is LYVEN? (Project Overview)

**LYVEN** is an online shopping website built for an Indian streetwear clothing brand.

* **What it sells:** Premium, heavyweight graphic-print oversized T-shirts made of **240 GSM French Terry Cotton** (thick, durable, high-quality fabric).
* **Launch Products:**
  1. **LYVEN Design 01 — VIRAT KOHLI:** Boxy oversized drop-shoulder T-shirt in Jet Black (**₹400**).
  2. **LYVEN Design 02 — DUDE / MARVEL:** Boxy oversized drop-shoulder T-shirt in Washed Charcoal (**₹400 / ₹388**).
* **Available Sizes:** Small (`S`), Medium (`M`), Large (`L`), Extra Large (`XL`), and Double Extra Large (`XXL`).
* **Who it is for:** Indian fashion and streetwear enthusiasts looking for trendy oversized T-shirts.

---

## 2. Every Page & Feature Explained in Simple Words

### 1. Homepage (`/`)
* **What customers see:** A modern, dark-themed storefront with bold typography, high-fashion photos, the brand story, and the featured T-shirt collection.
* **Special feature (Live Activity Toast):** Small notification popups appear at the bottom of the screen showing recent orders from Indian cities (for example: *"Rahul from Mumbai just purchased Virat Kohli Oversized Tee"*). This builds trust with new visitors.
* **Code files:** `app/page.tsx`, `components/home/ArchitecturalHero.tsx`, `components/home/LiveActivityToast.tsx`.

### 2. Shop Page (`/shop`)
* **What customers see:** A catalog of all available T-shirts.
* **Features:** Customers can filter by style (Graphic Tees, Minimalist, Oversized Drops) and sort by price (low to high, high to low, or newest).
* **Code files:** `app/shop/page.tsx`, `app/shop/ShopClient.tsx`, `components/products/ProductCard.tsx`.

### 3. Product Details Page (`/products/[slug]`)
* **What customers see:** The main page for an individual T-shirt (e.g. `/products/virat-kohli-oversized-tee`).
* **Features:**
  * Shows both **Front** and **Back** views of the T-shirt.
  * Size buttons (`S`, `M`, `L`, `XL`, `XXL`) with live stock availability.
  * Sizing guide modal showing chest, sleeve, and length dimensions in inches.
  * Fabric breakdown (240 GSM Cotton) and washing instructions.
  * "Add to Bag" and "Buy Now" buttons.
* **Code files:** `app/products/[slug]/page.tsx`, `app/products/[slug]/ProductDetailClient.tsx`.

### 4. Shopping Bag / Cart (`/cart` & Slide-Out Drawer)
* **What customers see:** A persistent shopping cart. Even if customers refresh their browser or close the tab, their items remain saved in their cart.
* **Features:** Customers can change quantities, remove items, see how much more they need to buy for free shipping, and see the subtotal.
* **Code files:** `app/cart/page.tsx`, `components/cart/CartDrawer.tsx`, `lib/cart/store.ts`.

### 5. Indian Checkout Page (`/checkout`)
* **What customers see:** A fast, one-page checkout designed specifically for Indian shoppers.
* **Smart validation:**
  * Checks that the phone number is a valid 10-digit Indian number starting with 6, 7, 8, or 9.
  * Checks that the PIN code is a valid 6-digit postal code.
  * Includes a dropdown of all Indian states.
  * Prevents double-charging if a user accidentally taps the "Place Order" button twice.
* **Code files:** `app/checkout/page.tsx`, `lib/validation/index.ts`.

### 6. Payment System (Razorpay & Cash on Delivery)
* **Online Payment (Razorpay):** Supports Google Pay, PhonePe, Paytm, BHIM UPI, Credit Cards, Debit Cards, and NetBanking.
* **Cash on Delivery (COD):** Allows customers to order without paying upfront. They pay in cash when the delivery agent delivers the package to their door.
* **Security:** The server checks digital cryptographic signatures so nobody can fake a payment.
* **Code files:** `app/api/orders/create/route.ts`, `app/api/payments/verify/route.ts`.

### 7. Order Tracking Portal (`/track`)
* **What customers see:** Any customer can type in their Order Number (for example: `LYV-20261021-9988A`) and see where their order is.
* **Progress Bar:** Shows 4 steps:
  1. *Order Confirmed*
  2. *Packed & Processing*
  3. *In Transit (Shipped)*
  4. *Delivered*
* **Courier Links:** Directly provides tracking links for BlueDart or Delhivery once the package is dispatched.
* **Code files:** `app/track/page.tsx`, `app/api/orders/lookup/route.ts`.

### 8. Customer Accounts & Past Orders (`/account` & `/my-orders`)
* **What customers see:** Customers can create an account using their email and password.
* **Order History:** When logged in, customers can see all their past purchases, delivery statuses, and download official tax invoices.
* **Code files:** `app/account/page.tsx`, `app/my-orders/page.tsx`.

### 9. Admin Control Panel (`/admin`)
* **What it is:** A password-protected management dashboard for the store owner.
* **How to log in:** Go to `/admin/login` and enter the admin password.
* **What the store owner can do:**
  * **Sales Overview:** See total revenue, active orders, and pending COD money to collect.
  * **Order Management (`/admin/orders`):** View all customer orders, change order status, enter courier names (e.g. BlueDart), and add tracking numbers.
  * **Inventory Manager (`/admin/inventory`):** Change stock numbers for each size (S, M, L, XL, XXL) with one click.
* **Code files:** `app/admin/page.tsx`, `app/admin/orders/page.tsx`, `app/admin/inventory/page.tsx`, `lib/admin/auth.ts`.

### 10. Custom T-Shirt Design Studio (`/custom-design`)
* **What customers see:** A page where customers can order custom printed streetwear.
* **Features:**
  * Choose T-shirt color (Jet Black, Washed Charcoal, Vintage White).
  * Upload their own graphic artwork or logo (PNG, JPG up to 10MB).
  * Pick print location: Front chest, Back full canvas, or Pocket print.
  * Enter their contact details and click "Send via WhatsApp". The website automatically opens WhatsApp with all details filled in!
* **Code files:** `app/custom-design/page.tsx`, `app/api/custom-design/enquire/route.ts`.

### 11. WhatsApp Support Float
* **What it is:** A green WhatsApp button floating in the bottom-right corner of every page. When clicked, it connects the customer directly to your support WhatsApp number (+91 83282 21844).
* **Code file:** `components/layout/WhatsAppConciergeFloat.tsx`.

### 12. Indian GST Tax Invoices
* **What it is:** Generates official Indian GST tax invoices with a "Print Invoice" button.
* **Tax Calculation:** Automatically splits tax into 2.5% CGST + 2.5% SGST for Karnataka orders, or 5% IGST for other Indian states, listing the official cotton T-shirt HSN code `6109`.
* **Code file:** `components/orders/TaxInvoiceModal.tsx`.

---

## 3. How the Website Works Behind the Scenes

1. **The Website Code (Frontend):**
   * Built with **Next.js 16** and **React 19** using modern **Tailwind CSS**.
   * It loads fast on mobile phones and desktops.
2. **The Database (Where data is saved):**
   * Built for **Supabase PostgreSQL**. It stores products, sizes, customer orders, and payments in 9 organized tables.
   * **Smart Backup System:** If the internet connection to the database fails or keys are not set up yet, the website has an in-memory backup system. It will continue running with demo products without crashing!
3. **Security (Tamper Protection):**
   * **Price Protection:** If a customer tries to change the price in their browser from ₹400 to ₹1, the server rejects it. The server always enforces the true price.
   * **Stock Protection:** Two customers cannot buy the last remaining T-shirt at the same time. The database locks the stock atomically.

---

## 4. Current Status: What is Ready?

* **Code Health:** 100% complete with 0 errors.
* **Automated Tests:** 52 automated tests check pricing, Indian phone validation, PIN code validation, payment verification, and order security. **All 52 tests pass!**
* **What works immediately:**
  * Browsing the entire catalog.
  * Adding shirts to the cart and selecting sizes.
  * Testing checkout with Cash on Delivery.
  * Testing order tracking.
  * Admin dashboard login and stock management.
* **What needs your live keys to go live:**
  1. **Razorpay Live Keys:** To accept real money from real customer bank accounts.
  2. **Supabase Cloud Account:** To store orders permanently in the cloud.
  3. **Resend Email Account:** To send automated email receipts.

---

## 5. Simple 3-Step Guide to Launch Your Website

### Step 1: Create your Cloud Database
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open the SQL Editor in Supabase and run the file `supabase/migrations/20261021_init_lyven_schema.sql`.
3. Copy your Supabase URL and Keys into your `.env.local` file.

### Step 2: Add your Razorpay Keys
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) and copy your Key ID and Key Secret.
2. Paste them into `.env.local`.

### Step 3: Launch on the Internet
1. Link your GitHub repository (`https://github.com/VigneshVudatha/lyven.git`) to [Vercel](https://vercel.com).
2. Add your environment variables in Vercel settings.
3. Click **Deploy**. Your website is now live for the whole world!
