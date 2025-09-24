# 🏪 Local Marketplace Platform

A beautiful, modern React-based local marketplace platform that connects customers with nearby shops and artisans. Built with TypeScript, Tailwind CSS, and a focus on elegant user experience.

![Platform Preview](https://via.placeholder.com/800x400/F5F3F0/8A7B68?text=Local+Marketplace+Platform)

## ✨ Features

### 🛍️ **For Customers**
- **Browse Collections**: Discover curated products from local artisans and boutiques
- **Location-Based Search**: Find shops and products near you with distance calculations
- **Category Filtering**: Filter by Essential Knits, Tailored Pieces, Outerwear, Accessories, and more
- **Advanced Search**: Search through product names and descriptions
- **Beautiful UI**: Elegant, warm-toned design with smooth animations

### 🏪 **For Shop Owners**
- **Shop Dashboard**: Manage your products with a comprehensive dashboard
- **Product Management**: Add, edit, and organize your product catalog
- **Analytics**: Track total products, revenue, and category distribution
- **Approval System**: Secure registration with admin approval workflow
- **Image Upload**: Easy product image management

### 👨‍💼 **For Administrators**
- **Shop Approval**: Review and approve new shop registrations
- **Platform Analytics**: Monitor total shops, products, and platform value
- **Activity Tracking**: View recent shop registrations and product additions
- **Category Analytics**: Track product distribution across categories

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd local-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🎨 Design System

### Color Palette
The platform uses a carefully crafted warm color scheme:

- **Cream**: `#F5F3F0` - Primary background
- **Warm Tones**: From `#FAF9F7` to `#2D251E` - Main UI colors
- **Sage Green**: `#F7F8F7` to `#1A211A` - Accent colors

### Typography
- **Serif**: Playfair Display (Headings)
- **Sans**: Inter (Body text)

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Customizable button component
│   ├── ProductCard.tsx # Product display card
│   ├── ShopCard.tsx    # Shop information card
│   ├── Modal.tsx       # Modal dialog component
│   └── ...
├── pages/              # Main application pages
│   ├── HomePage.tsx    # Landing page
│   ├── UserBrowse.tsx  # Customer product browsing
│   ├── ShopDashboard.tsx # Shop management interface
│   ├── ShopAuth.tsx    # Authentication page
│   └── AdminPanel.tsx  # Admin management interface
├── context/            # React Context for state management
│   └── AppContext.tsx  # Global application state
├── hooks/              # Custom React hooks
│   └── useToast.ts     # Toast notification hook
└── utils/              # Utility functions
    └── distance.ts     # Location and distance calculations
```

## 🔐 Authentication & Roles

### Test Credentials
For development and testing, use these credentials:

**Admin Access:**
- Email: `test@gmail.com`
- Password: `test123`

**Shop Access:**
- Email: `test@gmail.com`
- Password: `test123`

### User Roles
1. **Customer**: Browse products, search, and filter
2. **Shop Owner**: Manage products, view analytics
3. **Administrator**: Approve shops, platform analytics

## 🌟 Key Components

### HomePage
- Hero section with call-to-action buttons
- Feature highlights and testimonials
- Statistics and community information
- Elegant animations and hover effects

### UserBrowse
- Location-based product discovery
- Advanced search and filtering
- Distance calculations to nearby shops
- Responsive grid layout

### ShopDashboard
- Product management interface
- Real-time statistics
- Image upload functionality
- Approval status tracking

### AdminPanel
- Shop approval workflow
- Platform analytics dashboard
- Activity monitoring
- Category distribution charts

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State Management**: React Context + useReducer
- **Build Tool**: Vite
- **Linting**: ESLint

## 🎯 Key Features Implementation

### Location Services
- Automatic user location detection
- Distance calculations between users and shops
- Location-based product filtering

### State Management
- Centralized state with React Context
- Immutable state updates with useReducer
- Type-safe state management

### Responsive Design
- Mobile-first approach
- Breakpoint-specific layouts
- Touch-friendly interactions

### Performance
- Component-based architecture
- Lazy loading and code splitting ready
- Optimized bundle size with Vite

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Setup
The application is configured to work out of the box. For production deployment, consider:

1. Setting up environment variables for API endpoints
2. Configuring proper CORS settings
3. Setting up a production database
4. Implementing proper authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons provided by [Lucide](https://lucide.dev/)
- Design inspiration from modern marketplace platforms
- Built with ❤️ using React and TypeScript

---

**Ready to explore the local marketplace? Start browsing collections and discover amazing products from nearby artisans!** 🛍️✨
