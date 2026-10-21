# LYVEN — Premium Oversized Streetwear Platform

> Direct-to-Consumer e-commerce platform for **LYVEN**, an independent Indian streetwear label specializing in heavyweight (240 GSM) graphic-print oversized T-shirts. Engineered with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Razorpay Payments, and Firebase/Firestore.

---

## ⚡ Launch Roster (Catalogue)

| Product | Price | Silhouette | Fabric Specs | Launch Status |
| :--- | :--- | :--- | :--- | :--- |
| **LYVEN Design 01 — VIRAT KOHLI** | **₹400** | Boxy Oversized Drop-Shoulder | 240 GSM Combed French Terry Cotton, Jet Black | In Stock |
| **LYVEN Design 02 — MARVEL** | **₹388** | Boxy Oversized Drop-Shoulder | 240 GSM Combed French Terry Cotton, Washed Charcoal | In Stock |

---

## 🏗 Architecture & Features

### 🛍 Customer Experience (Storefront)
- **High-Fashion Minimalist Aesthetic**: Dark theme, stark typography, drop-shoulder garment proportions, micro-animations.
- **Product Detail Pages**: Multi-angle SVG garment mockups (front & back), interactive size selector (`S`, `M`, `L`, `XL`, `XXL`), live inventory check, and garment care guide.
- **Persistent Cart**: Client-side state managed via Zustand with `localStorage` persistence.
- **Indian Checkout Flow**:
  - Validated shipping address: Full name, 10-digit Indian mobile number (`[6-9]XXXXXXXXX`), 6-digit PIN code (`[1-9]XXXXX`), house/flat, street/locality, Indian state selection, and optional delivery instructions.
  - Idempotent order submission via unique client UUID keys to prevent duplicate billing.
  - Payment modes: **Online Payment (UPI / Cards / NetBanking via Razorpay)** and **Cash on Delivery (COD)**.
- **Order Tracking Portal (`/track`)**:
  - Live lookup by Order Reference (e.g. `LYV-20261012-ABC12`).
  - Visual 4-step progress bar: *Confirmed &rarr; Processing &rarr; In Transit &rarr; Delivered*.
  - Logistics carrier & AWB tracking links (BlueDart, Delhivery).
- **Brand Pages & Legal Policies**:
  - `/about`: Brand manifesto, 240 GSM French Terry craftsmanship, and ethical drop model.
  - `/contact`: Customer concierge form, email link (`support@lyven.in`), and direct WhatsApp button.
  - `/size-guide`: Detailed garment dimension charts for oversized fit (chest, length, shoulder drop, sleeve).
  - `/policies/shipping`: Delivery timelines (2–4 days metros, 4–6 days rest of India), free shipping rules.
  - `/policies/returns`: 7-day hassle-free reverse pickup and exchange guidelines.
  - `/policies/privacy` & `/policies/terms`: PCI-DSS compliance disclosure and legal terms under IT Act 2000.

### 🛡 Security & Backend Robustness
- **Server-Side Price Enforcement**: Order totals and variant prices are strictly calculated and enforced on the server (`lib/products/data.ts` & Firestore). Client payload prices are discarded.
- **Razorpay HMAC SHA-256 Signature Verification**: Online payments require cryptographically secure signature verification prior to updating order status and deducting stock.
- **Admin Dashboard (`/admin`)**:
  - Protected by HMAC signed cookie session token (`lyven_admin_token`).
  - Business KPIs: Total revenue, active orders, pending COD collections, fulfillment pipeline.
  - Order Management (`/admin/orders`): Search, status filter, dispatch updater (carrier name, AWB tracking ID, tracking URL).
  - Inventory Matrix (`/admin/inventory`): Live stock editor per size variant with low-stock alerts (&le; 5 units).

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18.17+ or 20+
- npm or pnpm

### 1. Clone & Install
```bash
git clone <repo-url>
cd Lyven
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Razorpay Test Keys (obtain from dashboard.razorpay.com)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=YourSecretKey
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecret

# Admin Portal
ADMIN_SECRET=lyven_super_secure_admin_jwt_secret_change_in_production
ADMIN_PASSWORD=lyvenadmin2026
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- Storefront: [http://localhost:3000](http://localhost:3000)
- Shop Catalogue: [http://localhost:3000/shop](http://localhost:3000/shop)
- Order Tracking: [http://localhost:3000/track](http://localhost:3000/track)
- Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin) *(Password: `lyvenadmin2026`)*

### 4. Run Automated Tests
```bash
npm test
```
Executes unit tests verifying:
- ₹400 & ₹388 single and combined pricing calculations
- Indian phone number and PIN code regex validation
- Razorpay HMAC SHA-256 signature verification & tamper rejection
- Order reference generator format compliance (`LYV-YYYYMMDD-XXXXX`)

---

## 💳 Razorpay Test-Mode Configuration

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** (toggle in the header).
3. Navigate to **Settings &rarr; API Keys** and click **Generate Key**.
4. Copy the `Key Id` and `Key Secret` into `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```
5. Test cards & UPI IDs provided by Razorpay:
   - **UPI**: `success@razorpay`
   - **Cards**: Any standard test card with OTP `123456`

---

## 🔥 Firebase Setup Instructions

LYVEN operates seamlessly with an in-memory database out of the box during development. For production persistence with Firestore:

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Cloud Firestore** in production mode.
3. Deploy Firestore rules and indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
4. Obtain service account credentials:
   - Go to **Project Settings &rarr; Service Accounts**.
   - Click **Generate New Private Key**.
   - Copy `project_id`, `client_email`, and `private_key` into `.env.local`.
5. Seed initial products and variants:
   ```bash
   node scripts/seed-firestore.mjs
   ```

---

## 🌐 Vercel Deployment Instructions

1. Push your repository to GitHub / GitLab.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your `Lyven` repository.
4. Add all environment variables from `.env.example` in the Vercel Project Settings.
5. Click **Deploy**. Vercel will automatically build the Next.js production bundle.

---

## 🔒 Production Security Checklist

- [x] Server-side price computation (zero client trust).
- [x] Input sanitization for customer names, addresses, and instructions.
- [x] Cryptographic HMAC verification for Razorpay payment webhooks and redirects.
- [x] Timing-safe equal string comparison for signatures and admin tokens.
- [x] HTTP-only, Secure, SameSite cookies for admin authentication.
- [x] Strict Firestore security rules prohibiting direct client writes to orders and payments.
- [x] Configure Razorpay Webhooks endpoint (`/api/payments/webhook`) for asynchronous payment capture confirmation and automatic stock deduction.
- [x] Indian GST compliant printable/downloadable Tax Invoice Modal (HSN 61091000, 5% GST breakdown) on Order Confirmation and Order Tracking portals.
- [x] Firestore repository abstraction with transparent in-memory dev fallback.
- [ ] Replace default admin password `lyvenadmin2026` with a strong 32-character secret in production.

---

## 📋 Outstanding Owner Actions

To take LYVEN fully live in India:
1. **Razorpay Account Activation**: Complete KYC on Razorpay to switch from Test Mode to Live Mode.
2. **Custom Domain**: Connect your domain (e.g., `lyven.in`) via Vercel DNS settings.
3. **Logistics Partner Integration**: Set up API credentials with BlueDart or Shiprocket for automatic AWB generation.
4. **Product Photography**: Replace SVG garment vectors in `public/products/` with high-resolution photoshoot model images when ready.
