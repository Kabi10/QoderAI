# Landing Page Website - AI Generation Prompt

## Project Overview
**Category:** Landing Page  
**Project Name:** TaskMaster Pro  
**Target Audience:** Project managers and team leads  
**Deployment Target:** Vercel

## Technical Requirements

### Core Technology Stack
- React
- TypeScript
- Node.js
- PostgreSQL

### Architecture Requirements
- Modern responsive design with mobile-first approach
- React-based single-page application with component architecture
- 
- SEO-optimized with meta tags and structured data
- Performance-optimized with fast loading times (<3 seconds)
- Accessibility compliant (WCAG 2.1 AA standards)

### Features to Implement
- routing
- state-management
- testing
- auth

## Detailed Implementation Instructions

### 1. Project Structure
Generate a complete landing page with the following structure:
```
TaskMaster Pro/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header/         # Navigation and branding
│   │   ├── Hero/           # Main hero section
│   │   ├── Features/       # Feature showcase
│   │   ├── Testimonials/   # Customer testimonials
│   │   ├── CTA/            # Call-to-action sections
│   │   └── Footer/         # Footer with links and info
│   ├── sections/           # Page sections and layouts
│   ├── styles/             # CSS/SCSS stylesheets
│   ├── assets/             # Images, icons, and media
│   ├── utils/              # JavaScript utilities
│   └── data/               # Static content and configuration
├── public/
│   ├── images/             # Optimized images and graphics
│   ├── icons/              # Favicon and app icons
│   ├── fonts/              # Custom font files
│   └── robots.txt          # SEO crawler instructions
├── docs/
│   ├── design/             # Design specifications and wireframes
│   └── content/            # Content guidelines and copy
├── package.json
├── index.html
└── README.md
```

### 2. Page Sections and Layout

#### Header Section
Create a responsive header with:
- Company logo and branding
- Navigation menu (desktop and mobile)
- Call-to-action button (sign up, demo, contact)
- Sticky navigation on scroll
- Mobile hamburger menu with smooth animations

#### Hero Section
Design an impactful hero area featuring:
- Compelling headline and value proposition
- Subheading with key benefits
- Primary call-to-action button
- Hero image or video background
- Social proof indicators (customer logos, ratings)
- Animated elements for engagement

#### Features Section
Showcase product/service features with:
- Grid layout of key features (3-6 main features)
- Feature icons and visual elements
- Benefit-focused descriptions
- Interactive hover effects
- Progressive disclosure for detailed information

#### Testimonials Section
Build trust with customer testimonials:
- Customer photos and company logos
- Rotating testimonial carousel
- Star ratings and review scores
- Case studies and success stories
- Video testimonials (if applicable)

#### Pricing Section (if applicable)
Present pricing options clearly:
- Pricing tiers with feature comparison
- Highlight recommended plan
- Clear pricing display with currency
- FAQ section for common questions
- Free trial or money-back guarantee

#### Call-to-Action Sections
Strategic CTA placement throughout:
- Above-the-fold primary CTA
- Mid-page secondary CTAs
- Final conversion-focused section
- Contact form or lead capture
- Newsletter signup integration

#### Footer Section
Comprehensive footer with:
- Company information and contact details
- Links to important pages and policies
- Social media links and icons
- Newsletter signup form
- Copyright and legal information

### 3. Responsive Design Implementation

#### Breakpoint Strategy
Implement responsive breakpoints:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+

#### Mobile-First CSS
- Start with mobile styles as base
- Progressive enhancement for larger screens
- Touch-friendly interaction design
- Optimized navigation for mobile devices
- Performance-optimized mobile experience

### 4. Performance Optimization

#### Image Optimization
- WebP format with fallbacks
- Responsive image sizing with srcset
- Lazy loading for below-the-fold content
- Optimized file sizes and compression
- CDN delivery for global performance

#### Code Optimization
- Minified CSS and JavaScript
- Critical CSS inlining
- Async loading of non-critical resources
- Tree shaking and dead code elimination
- Gzip/Brotli compression

#### Loading Performance
- First Contentful Paint < 1.5 seconds
- Largest Contentful Paint < 2.5 seconds
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms
- Resource preloading for critical assets

### 5. SEO Implementation

#### Meta Tags and Structure
- Descriptive title tags (50-60 characters)
- Compelling meta descriptions (150-160 characters)
- Open Graph tags for social sharing
- Twitter Card meta tags
- Canonical URLs and hreflang tags

#### Content Optimization
- Semantic HTML structure with proper headings
- Alt text for all images
- Internal linking strategy
- Schema.org structured data markup
- XML sitemap generation

#### Technical SEO
- Fast loading speeds and Core Web Vitals
- Mobile-friendly responsive design
- SSL certificate and HTTPS
- Clean URL structure
- Error-free HTML validation

### 6. Accessibility Implementation

#### WCAG 2.1 AA Compliance
- Proper heading hierarchy (H1-H6)
- Alt text for all images and media
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios ≥ 4.5:1

#### Interactive Elements
- Focus indicators for all interactive elements
- ARIA labels and descriptions
- Skip navigation links
- Form labels and error messages
- Accessible modals and overlays

### 7. Analytics and Tracking

#### Google Analytics Setup
- Enhanced ecommerce tracking (if applicable)
- Goal and conversion tracking
- User behavior analysis
- Traffic source attribution
- Custom events for key interactions

#### Performance Monitoring
- Core Web Vitals tracking
- Error monitoring and reporting
- Uptime monitoring
- User experience metrics
- A/B testing framework (if needed)

### 8. Integration Requirements

#### Form Handling

#### Third-Party Services

### 9. Content Management

#### Dynamic Content
- Easy content updates without code changes
- Multi-language support (if needed)
- Blog integration (if applicable)
- News/updates section
- FAQ section with search functionality

#### Media Management
- Image galleries and carousels
- Video embedding and optimization
- Downloadable resources and documents
- Social media feed integration
- Customer logo showcase

### 10. Deployment and Hosting

#### Static Site Deployment
- Optimized for Vercel hosting
- Automated build and deployment pipeline
- Environment-specific configuration
- SSL certificate setup
- CDN configuration for global delivery

#### Maintenance and Updates
- Content update workflow
- Performance monitoring setup
- Security best practices
- Backup and recovery procedures
- Version control and rollback capability

## Constraints and Considerations
- Mobile-first design
- WCAG accessibility compliance

## Success Criteria
The generated landing page should:
1. ✅ Achieve Core Web Vitals scores in the "Good" range
2. ✅ Have responsive design working on all device sizes
3. ✅ Pass WCAG 2.1 AA accessibility standards
4. ✅ Include comprehensive SEO optimization
5. ✅ Have conversion-optimized design and copy
6. ✅ Be ready for deployment to Vercel
7. ✅ Include analytics and tracking setup
8. ✅ Have clear call-to-action placement and design
9. ✅ Include contact forms and lead capture mechanisms

## Additional Notes
- Focus on conversion optimization with strategic CTA placement
- Include A/B testing framework for continuous optimization
- Ensure fast loading times with optimized assets
- Implement comprehensive error handling and fallbacks
- Add social proof elements throughout the page
- Include detailed deployment and maintenance documentation

---
*Generated by Qoder Universal Prompt Generator on 2025-08-25T23:26:34.344Z*