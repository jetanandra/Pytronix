# Phytronix E-commerce Technical Documentation


## Overview
Phytronix is a full-featured e-commerce platform for selling electronics and IoT components. The application provides a modern, responsive user interface with comprehensive product browsing, user management, wishlist functionality, and an admin panel for product and order management. Built with React, TypeScript, and Supabase, the platform offers a complete solution for online electronics retail.

## Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **State Management**: React Context API
- **Styling**: Tailwind CSS with custom theming
- **Routing**: React Router v6
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Markdown Rendering**: React Markdown
- **Build Tool**: Vite

### Architectural Patterns
The application follows a client-side rendering approach with several key architectural patterns:

1. **Context API for State Management**: Different aspects of application state are managed through dedicated context providers (Auth, Cart, Profile, Theme).

2. **Service Layer**: API calls are abstracted into service files that handle communication with Supabase.

3. **Component-Based Design**: UI is broken down into reusable components.

4. **Responsive Design**: Mobile-first approach ensuring proper display across devices.

5. **Role-Based Access Control**: Certain routes and features are protected based on user roles (admin/customer).

### Folder Structure
```
├── src/
│   ├── components/   # Reusable UI components
│   ├── context/      # Context providers for state management
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility libraries (Supabase client)
│   ├── pages/        # Page components for routes
│   ├── services/     # API service functions
│   ├── types/        # TypeScript type definitions
│   ├── data/         # Static data (currently dummy products)
│   ├── routes/       # Routing configuration
│   ├── main.tsx      # Application entry point
│   └── App.tsx       # Main application component
├── supabase/
│   ├── migrations/   # Database schema migrations
│   └── functions/    # Edge functions
```

## Page-by-Page Explanation

### Home Page (`/`)
- **Component**: `HomePage.tsx`
- **Functionality**: Displays featured products, hero section, features, testimonials, and CTA sections.
- **Data Source**: Fetches featured products from Supabase.

### Products Page (`/products`)
- **Component**: `ProductsPage.tsx`
- **Functionality**: 
  - Lists all products with filtering by category and price
  - Sorting options (popularity, price, newest)
  - Search functionality
  - Responsive grid layout
- **Data Source**: Fetches products from Supabase with filtering and sorting applied.

### Product Detail Page (`/product/:id`)
- **Component**: `ProductDetailPage.tsx`
- **Functionality**: 
  - Displays detailed product information
  - Image gallery
  - Specifications table
  - Add to cart functionality
  - Add to wishlist functionality
  - Quantity selector
- **Data Source**: Fetches single product by ID from Supabase.

### Cart Page (`/cart`)
- **Component**: `CartPage.tsx`
- **Functionality**: Displays items in cart, quantity adjustment, removal, and checkout option.
- **Data Source**: Uses CartContext for state management, with data stored in localStorage.

### Checkout Page (`/checkout`)
- **Component**: `CheckoutPage.tsx`
- **Functionality**: Order summary, shipping info form, and payment integration.
- **Protection**: Requires authentication (wrapped with AuthGuard).

### Login/Signup Page (`/login`)
- **Component**: `LoginPage.tsx` and `LoginForm.tsx`
- **Functionality**: 
  - Authentication with email/password
  - Toggle between login and signup
  - Error handling
  - Redirects after successful login
- **Data Source**: Uses Supabase Auth through AuthContext.

### Profile Page (`/profile`)
- **Component**: `ProfilePage.tsx`
- **Functionality**: 
  - Personal information management
  - Password changes
  - Address management (add, edit, delete)
  - Wishlist management
- **Protection**: Requires authentication (wrapped with AuthGuard).
- **Data Source**: Fetches user profile from Supabase.

### Admin Dashboard (`/admin`)
- **Component**: `AdminPage.tsx` and related components in `/admin/` folder
- **Functionality**: 
  - Overview of products, orders, and users
  - Quick access to admin functions
  - Status alerts for inventory issues
- **Protection**: Requires admin role.
- **Data Source**: Fetches admin-specific data from Supabase.

### Admin Products Management (`/admin/products`)
- **Component**: `ProductList.tsx`
- **Functionality**: 
  - List all products
  - Search and filter products
  - Add, edit, and delete products
- **Protection**: Requires admin role.
- **Data Source**: Fetches products from Supabase.

### Admin Product Form (`/admin/products/new` or `/admin/products/edit/:id`)
- **Component**: `ProductForm.tsx`
- **Functionality**: 
  - Form for adding or editing products
  - Image management
  - Rich text description
  - Specifications management
- **Protection**: Requires admin role.
- **Data Source**: Fetches product data when editing, submits to Supabase.

### Admin Setup Page (`/admin-setup`)
- **Component**: `AdminSetupPage.tsx`
- **Functionality**: Interface for users to gain admin privileges by entering a secret code.
- **Data Source**: Uses Supabase Edge Function to update user roles.

### 404 Not Found Page
- **Component**: `NotFoundPage.tsx`
- **Functionality**: Displayed when a route doesn't match any defined routes.

## Supabase Integration

### Database Schema
The database consists of the following tables:

1. **products** - Stores product information
   - Primary fields: id, name, description, price, image, category, tags, stock
   - Additional fields: discount_price, images, full_description, specifications, warranty_info

2. **profiles** - User profile information
   - Primary fields: id (linked to auth.users), full_name, phone, profile_picture

3. **addresses** - User shipping and billing addresses
   - Primary fields: id, user_id, type, street, city, state, postal_code, country, is_default

4. **wishlists** - User product wishlists
   - Primary fields: id, user_id, product_id, priority, notes

5. **user_preferences** - User UI preferences
   - Primary fields: id (linked to auth.users), theme, email_notifications

6. **orders** - Order information
   - Primary fields: id, user_id, status, total, shipping_address, payment_details

7. **order_items** - Items within orders
   - Primary fields: id, order_id, product_id, quantity, price

### Row Level Security (RLS)
All tables have RLS enabled with policies that:
- Allow users to only access their own data (profiles, addresses, wishlists, preferences)
- Allow public read access to products
- Restrict product creation/modification to admin users
- Allow users to manage their own orders

### Authentication
- Uses Supabase Auth with email/password
- Custom logic to handle admin roles through user metadata
- Profile creation is automated on signup through database triggers

### Edge Functions
- **set-admin**: Function to assign admin role to users who provide the correct secret code

### Client Integration
- Supabase client is configured in `src/lib/supabaseClient.ts`
- Auth state is managed through `AuthContext.tsx`
- Database operations are abstracted through service files:
  - `productService.ts`: Product CRUD operations
  - `profileService.ts`: User profile and related data management

## Current Status

### Implemented Features
- Complete product browsing and filtering
- Product detail views
- User authentication (login/signup)
- User profile management
- Address management
- Wishlist functionality
- Admin dashboard
- Product management for admins
- Theme switching (light/dark mode)
- Cart functionality with localStorage persistence
- Responsive design for all device sizes

### Pending Tasks
- Order processing and management
- Payment gateway integration
- User order history
- Advanced search capabilities
- Review and rating system
- Email notifications
- Analytics dashboard for admins

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd phytronix-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase URL and anon key:
     ```
     VITE_SUPABASE_URL=your-supabase-project-url
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the migration scripts in `/supabase/migrations/` in order of creation date
   - These migrations will set up all necessary tables, functions, and policies

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Setup Admin Access**
   - Register a new user through the application
   - Navigate to `/admin-setup`
   - Enter the admin secret code: `phytronix-admin-2025`
   - Sign out and sign back in to activate admin privileges

### Deployment
The application is configured for deployment to Netlify.

## Codebase Walkthrough

### Key Components

#### Context Providers
- **AuthContext**: Manages user authentication state
- **CartContext**: Handles shopping cart functionality
- **ProfileContext**: Manages user profile data
- **ThemeContext**: Controls light/dark theme switching

#### UI Components
- **Layout.tsx**: Main layout wrapper with navbar and footer
- **Navbar.tsx**: Navigation with responsive mobile menu
- **ProductCard.tsx**: Reusable product display component
- **LoginForm.tsx**: Authentication form component
- **ErrorBoundary.tsx**: Error handling wrapper
- **LoaderSpinner.tsx**: Loading indicator component

#### Custom Hooks
- **useApi.ts**: Generic hook for API calls with loading/error states
- **useSupabaseFetch.ts**: Specialized hook for Supabase queries

#### Service Functions
- **productService.ts**: Product-related database operations
- **profileService.ts**: User profile and related data management

### Important Files
- **main.tsx**: Application entry point with context providers
- **routes/index.tsx**: Routing configuration with lazy loading
- **lib/supabaseClient.ts**: Supabase client configuration
- **types/index.ts**: TypeScript type definitions for the application

## UI and Frontend Design Guidelines

### Color Palette
- **Primary**: Neon Blue (#3b82f6)
- **Secondary**: Neon Violet (#8b5cf6)
- **Accent**: Neon Green (#22c55e)
- **Dark Background**: Dark Navy (#0f172a)
- **Medium Background**: Light Navy (#1e293b)
- **Text Light**: Soft White (#f8fafc)
- **Text Muted**: Soft Gray (#94a3b8)

### Typography
- **Primary Font**: Inter (sans-serif)
- **Accent Font**: Orbitron (display, headers)
- **Base Size**: 16px
- **Scale**: 1.25 (major third)

### Components
- **Buttons**: 
  - Primary: `.btn-primary` (blue background)
  - Secondary: `.btn-secondary` (violet background)
  - Accent: `.btn-accent` (green background)

- **Cards**: `.card` class for consistent styling

- **Forms**: Consistent styling with labels above inputs

- **Loaders**: `LoaderSpinner` component with size and color options

### Responsive Breakpoints
- **Small**: 640px
- **Medium**: 768px
- **Large**: 1024px
- **Extra Large**: 1280px

### Design Patterns
- Dark mode support with theme toggle
- Consistent spacing using Tailwind's spacing scale
- Animated interactions using Framer Motion
- Card-based layouts for consistent visual rhythm

## Development Guidelines

### Coding Standards
- Use TypeScript for all new components and functions
- Follow React functional component patterns with hooks
- Comment complex logic and functions
- Use named exports for components
- Keep components focused on a single responsibility

### State Management
- Use React Context for global state
- Use React useState and useReducer for component state
- Avoid prop drilling by creating new context providers when needed

### Error Handling
- Wrap async operations in try/catch blocks
- Use ErrorBoundary for component error containment
- Display user-friendly error messages with toast notifications

### Performance Considerations
- Use React.memo for expensive components
- Implement lazy loading for routes
- Use useCallback and useMemo appropriately
- Minimize re-renders by optimizing state structure

### Testing
- Write unit tests for utilities and services
- Component testing with React Testing Library
- Manual testing for critical user flows

## Future Roadmap

### Phase 1: Core E-commerce Completion
- Implement payment processing with Stripe
- Complete order management system
- Add order history for users
- Implement email notifications for orders and account activities

### Phase 2: Enhanced User Experience
- Add product reviews and ratings
- Implement personalized product recommendations
- Add advanced search with filters and sorting
- Implement saved payment methods for faster checkout

### Phase 3: Analytics and Optimization
- Add analytics dashboard for admins
- Implement A/B testing framework
- Add performance monitoring
- SEO optimizations

### Phase 4: Mobile App
- Develop React Native mobile app
- Implement push notifications
- Add offline support
- Barcode scanner for quick product lookup

### Phase 5: Advanced Features
- Implement loyalty program
- Add subscription-based products
- Implement bundle deals and dynamic pricing
- Add AI-powered chatbot for customer support

# Recent Updates & Enhancements (2024)

## Major Features Added
- **Category Management System:**
  - Admins can create, edit, and delete product categories (with name and image) from the admin panel.
  - Products are now linked to categories via a `category_id` (UUID), not just a text field.
  - Admins can assign categories to products.
  - Categories are displayed on the homepage as clickable cards, in the navbar dropdown, and as filters on the products page.
  - Clicking a category filters products by that category.

- **Improved Product Search:**
  - Search bar in the navbar now routes users to the products page and instantly filters products by the search term.
  - Products page search bar is synced with the URL, so searches from the navbar are reflected immediately.

- **Cart & Order Summary Redesign:**
  - Cart page now features a modern, responsive table layout with product images, names, prices, quantity controls, and remove buttons.
  - Order summary now shows:
    - Total original price (sum of all products' original prices)
    - Discount applied (total original price minus total selling price)
    - Total after discount (actual total to pay)
  - Price display logic fixed: if a product has a discount price, it is shown as the main price, with the original price crossed out.

- **Product Detail Page Enhancements:**
  - Category name is now fetched and displayed from the categories table.
  - Product image gallery thumbnails are now horizontal and scrollable, improving the UI.
  - Breadcrumbs and category links are updated to use the new category system.

- **UI/UX Improvements:**
  - Account dropdown is now centered below the nav button and handles long emails gracefully.
  - Button styles (e.g., 'Clear Cart') are now consistent with the rest of the UI.
  - Various responsive and accessibility improvements.

## Bug Fixes & Technical Improvements
- Fixed price calculation bugs in the cart and order summary (now uses `discount_price` everywhere).
- Fixed category display issues on product detail and product list pages.
- Fixed RLS (Row Level Security) and Supabase policy issues for category management.
- Fixed search and filter synchronization between navbar and products page.
- Improved code consistency (naming, types, and service functions).

## Technical Details & Future Improvement Notes

### Category Management System
- **Database:**
  - `categories` table uses UUID as primary key. Products reference categories via `category_id` (UUID, foreign key).
  - RLS (Row Level Security) policies restrict category modification to admin users only.
- **Frontend:**
  - Category CRUD handled via service functions in `productService.ts`:
    ```ts
    export const getAllCategories = async (): Promise<Category[]> => { ... };
    export const createCategory = async (category: Omit<Category, 'id' | 'created_at'>): Promise<Category> => { ... };
    export const deleteCategory = async (id: string): Promise<void> => { ... };
    export const getCategoryById = async (id: string): Promise<Category | null> => { ... };
    ```
  - Product forms and lists now use `category_id` and fetch category names for display.
- **Future Improvements:**
  - Add category editing (update name/image).
  - Support category hierarchy (parent/child categories).
  - Add category slugs for SEO-friendly URLs.

### Product Search
- **Logic:**
  - Navbar search updates the URL (`/products?search=...`), which is read by the Products page to filter products in real time.
  - Products page search bar is synced with the URL param using React Router's `useSearchParams` and `useEffect`.
    ```ts
    const [searchParams] = useSearchParams();
    const searchParam = searchParams.get('search');
    useEffect(() => { setSearchQuery(searchParam || ''); }, [searchParam]);
    ```
- **Future Improvements:**
  - Implement server-side search/filtering for large product catalogs.
  - Add instant search suggestions/autocomplete.
  - Support advanced search (by tags, specs, etc).

### Cart & Order Summary
- **Logic:**
  - Cart state managed via React Context (`CartContext.tsx`), persisted in localStorage.
  - Price calculation always uses `discount_price` if present, else falls back to `price`:
    ```ts
    const price = item.product.discount_price || item.product.price;
    ```
  - Order summary computes:
    ```ts
    const totalOriginal = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
    const totalDiscount = totalOriginal - total;
    ```
- **Future Improvements:**
  - Add coupon/promo code support.
  - Integrate with payment gateway and order processing.
  - Show per-product discount breakdown.

### Product Detail Page
- **Logic:**
  - Fetches product by ID and then fetches category name by `category_id`.
  - Image gallery uses a horizontal scrollable row for thumbnails:
    ```tsx
    <div className="flex flex-row gap-4 overflow-x-auto pb-2">
      {[product.image, ...product.images].filter(Boolean).map((img, index) => (
        <div ... onClick={() => setActiveImage(img)} ...>
          <img src={img} ... />
        </div>
      ))}
    </div>
    ```
- **Future Improvements:**
  - Add zoom/lightbox for images.
  - Show category image/badge.
  - Add related products carousel.

### UI/UX & General
- **Logic:**
  - Navbar dropdowns use Tailwind and Framer Motion for smooth, centered, responsive menus.
  - Button styles are standardized via `.btn-primary`, `.btn-secondary`, etc.
- **Future Improvements:**
  - Add skeleton loaders for slow data fetches.
  - Improve accessibility (ARIA, keyboard navigation).
  - Add user feedback for all async actions (toasts, spinners).


---

## Changelog & Major Technical Updates

### Initial Project Setup
- **Project Bootstrapping**: Initialized with React 18, TypeScript, Vite, Tailwind CSS, and Supabase as the backend (PostgreSQL).
- **Folder Structure**: Established a modular structure with `components`, `context`, `services`, `types`, `pages`, and `supabase` for migrations and edge functions.
- **Supabase Integration**: Configured Supabase client, authentication, and database migrations for core e-commerce tables (products, users, orders, etc.).

### Core Features Implemented
- **Authentication**: Email/password login and registration using Supabase Auth, with context-based state management.
- **Profile Management**: Automated profile creation via DB triggers; profile editing UI; RLS policies to restrict profile access to owners.
- **Product Catalog**: CRUD for products, category management, product detail pages, and responsive product listing with filtering and search.
- **Cart & Checkout**: Cart context with localStorage persistence, order summary, and checkout flow (pre-payment integration).
- **Admin Panel**: Role-based access for admin dashboard, product management, and user management, with admin role assignment via Edge Function.

### Review & Rating System
- **Review Submission**: Users can submit, edit, and delete reviews for products. Each review is linked to a user profile.
- **Verified Purchase Reviews**: Logic to mark reviews as 'verified purchase' if the user has bought the product.
- **Review Display**: Product pages show all reviews, sorted by verified status, helpful votes, and recency.
- **Helpful Votes**: Users can mark reviews as helpful (one vote per user per review).
- **Admin Review Management**: Admins can view, search, filter, and delete any review from a dedicated admin page.

### User Profile Visibility & RLS
- **Initial RLS Policy**: Profiles table was protected by RLS, allowing only users to view their own profile. This caused reviewer names to show as 'Anonymous User' for all but the logged-in user.
- **Bug Fix**: Added a public read policy to the `profiles` table for reviewer info, allowing all users (even logged out) to see reviewer names and profile pictures on reviews. This was implemented via a new RLS policy:
  ```sql
  CREATE POLICY "Public can view reviewer info"
    ON profiles
    FOR SELECT
    USING (true);
  ```
- **Frontend Logic**: No frontend changes were needed; the review display logic automatically started showing names once the policy was applied.

### Additional Enhancements
- **Registration Improvements**: Registration form updated to collect name and phone number, syncing these fields to the `profiles` table.
- **Profile Completion Prompt**: After first login, users are prompted to complete their profile if name/phone is missing.
- **Admin User Management**: Admins can view user IDs, names, and emails, with copy-to-clipboard functionality for user IDs.
- **Order & Wishlist System**: Full support for order placement, order item management, and wishlists, all protected by RLS.
- **Category System**: Categories table with admin CRUD, product-category linking, and UI filtering.
- **UI/UX**: Responsive design, dark mode, consistent button styles, and improved accessibility.

### Security & Best Practices
- **RLS Everywhere**: All sensitive tables (profiles, orders, addresses, wishlists) are protected by Row Level Security, with policies for owner-only access and admin overrides where needed.
- **Edge Functions**: Used for admin role assignment and user management, leveraging Supabase service role keys securely.
- **Migration Management**: All schema and policy changes are tracked via SQL migrations in the `supabase/migrations` directory.

---
