# Uniblox Assignment - Shopping Cart Service

This project implements a shopping cart service with discount management functionality using Next.js and Supabase.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Set up Supabase:

- Create a new Supabase project
- Create the following tables:
  - `products`: id (uuid), name (text), price (numeric), description (text)
  - `orders`: id (uuid), user_id (text), items (jsonb), subtotal (numeric), discount (numeric), total (numeric), used_discount_code (text), created_at (timestamp)

4. Load initial products:

```bash
npm run load-products
```

## Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Requirements Fulfilled

1. User-specific discount codes:

   - Generated automatically after every nth order (configurable)
   - Unique per user
   - Single-use only
   - Percentage-based discount (configurable)

2. Shopping Cart Features:

   - Add products to cart
   - View cart contents
   - Apply discount codes
   - Checkout process
   - Order confirmation

3. Admin Dashboard:
   - View total revenue
   - Track total items sold
   - Monitor total discounts given
   - View recent orders
   - Configure discount logic:
     - Set nth order number
     - Set discount percentage

## Technical Implementation

- **Frontend**: Next.js with TypeScript
- **State Management**: React useState and useEffect
- **Data Persistence**: Supabase
- **Styling**: Tailwind CSS
- **Session Management**: sessionStorage for user identification

## Project Structure

```
/D:/uniblox-assignment/
├── app/
│   ├── api/              # API routes
│   ├── components/       # Reusable components
│   ├── lib/             # Business logic
│   ├── admin/           # Admin dashboard
│   └── page.tsx         # Main shopping page
└── types/              # TypeScript definitions
```

## Features

### Shopping Cart

- User identification on first visit
- Product listing
- Add items to cart
- Apply discount codes
- View available discounts
- Order confirmation with savings details

### Admin Dashboard

- Real-time statistics
- Recent order history
- Discount configuration
- Revenue tracking

### Discount System

- Automatic code generation
- User-specific codes
- Single-use validation
- Progress tracking for next discount
- Configurable discount percentage and frequency

## Technical Notes

1. User Identification:

   - Users must enter ID on first visit
   - ID stored in session storage
   - All discounts tracked per user

2. Discount Logic:

   - Codes generated after every nth order
   - Codes are unique per user
   - Validation prevents code reuse
   - Automatic cleanup of used codes

3. Data Storage:
   - Products stored in products.json
   - Orders stored in orders.json
   - In-memory tracking of active/used codes
