# Supabase Store Management Application

A complete e-commerce solution with Supabase integration, real-time analytics, and modern web features.

## 🚀 Features

### Admin Features
- **Product Management**: Add, edit, delete products with image upload
- **Real-time Analytics**: Sales graphs, product views, order tracking
- **Stock Management**: Low stock alerts, inventory tracking
- **Store Settings**: Configure store information, contact details
- **Supabase Integration**: Real-time data sync, secure authentication

### Public Features
- **Product Catalog**: Responsive product browsing with filters
- **Shopping Cart**: Add to cart, quantity management
- **WhatsApp Integration**: Send orders directly via WhatsApp
- **Multi-language**: French and Arabic support
- **Analytics Tracking**: User behavior, source tracking

### Technical Features
- **Supabase Database**: PostgreSQL with real-time subscriptions
- **Supabase Storage**: Image hosting and management
- **Supabase Auth**: Secure authentication system
- **Security Policies**: Row Level Security (RLS)
- **Responsive Design**: Mobile-first approach

## 🛠️ Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [Supabase Dashboard](https://app.supabase.com)
2. Get your project URL and anon key from Settings > API
3. Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Run the migration file `supabase/migrations/001_initial_schema.sql`
3. This will create all necessary tables, functions, and security policies

### 3. Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `product-images`
3. Set the bucket to public
4. Configure the following storage policies:

```sql
-- Allow public read access to product images
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

### 4. Authentication Setup

1. Go to Authentication > Settings in your Supabase dashboard
2. Disable email confirmations for easier testing
3. Create an admin user:
   - Email: `admin@store.com`
   - Password: `admin123`

### 5. Installation

```bash
npm install
npm run dev
```

## 📊 Analytics Features

### Sales Analytics
- Daily, weekly, monthly sales graphs
- Top-selling products
- Order tracking and conversion rates
- Revenue analytics with beautiful charts

### User Tracking
- Source tracking (Facebook, TikTok, WhatsApp, etc.)
- Page view analytics
- Product view counters
- Real-time visitor tracking

### Admin Dashboard
- Real-time sales data
- Low stock alerts
- Product performance metrics
- Customer behavior insights

## 🔐 Security

- Supabase Authentication for admin access
- Row Level Security (RLS) policies for data protection
- Storage policies for image access control
- Input validation and sanitization

## 📱 Mobile Features

- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile image upload
- WhatsApp integration for mobile orders

## 🌍 Multi-language Support

- French (default)
- Arabic with RTL support
- Easy to extend for additional languages

## 🚀 Deployment

The application is ready for deployment on:
- Netlify
- Vercel
- Any static hosting provider

## 📈 Performance

- Real-time data synchronization with Supabase
- Optimized image loading
- Lazy loading for better performance
- Efficient state management

## 🛡️ Admin Login

Default admin credentials:
- Email: `admin@store.com`
- Password: `admin123`

## 📞 Support

For support and customization, contact the development team.

## 🔧 Database Schema

### Products Table
- Product information with multi-language support
- Image URLs stored as array
- Stock and pricing management
- View tracking

### Store Settings Table
- Store configuration
- Contact information
- Social media links
- Multi-language welcome messages

### Visits Table
- Analytics and tracking data
- Source attribution
- User behavior tracking

### Orders Table
- Order management
- WhatsApp integration tracking
- Sales analytics data

## 🎯 Key Features

- **Real-time Updates**: Products update instantly across all clients
- **Image Management**: Upload and manage product images with Supabase Storage
- **Analytics Dashboard**: Comprehensive sales and visitor analytics
- **WhatsApp Integration**: Direct order placement via WhatsApp
- **Multi-language**: Full Arabic and French support
- **Mobile Responsive**: Works perfectly on all devices
- **Admin Panel**: Complete product and store management