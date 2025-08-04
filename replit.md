# Synergy Sphere - Climate Solution Platform

## Overview

Synergy Sphere is a full-stack web application that empowers global collaboration to address humanity's greatest climate challenges through interactive 3D visualization and innovative problem-solving. The platform combines real-time data visualization, climate simulation, and community-driven solution sharing to create an engaging experience for users to explore environmental data and design solutions.

## Project Requirements Documentation

This project follows detailed Product Requirements Documents (PRDs) that define the core vision, functionality, and implementation approach:

### Core Planning Documents
- **[MVP Requirements](docs/planner/mvp_requirements.md)** - Defines the Minimum Viable Product scope and features
- **[User Journey](docs/planner/user_journey.md)** - Complete user experience flow from onboarding to collaboration

### Technical Architecture
- **[Tech Stack](docs/architecture/tech_stack.md)** - Comprehensive technology stack and rationale
- **[Feature Specifications](docs/architecture/feature_specifications.md)** - In-depth Geoscope and World Game module specifications

### Design Guidelines
- **[Design Schema](docs/user/design_guidelines.md)** - Organic Futurism design system and UI/UX guidelines

**Important**: These PRDs serve as the foundational blueprint for all development decisions. All features, design choices, and technical implementations must align with these specifications to maintain project vision and consistency.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state and caching
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom color palette (earth-green, sky-blue, sandstone themes)
- **Build Tool**: Vite with custom configuration for client/server separation
- **3D Visualization**: Three.js for interactive globe rendering

### Backend Architecture
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js with custom middleware
- **Authentication**: Passport.js with LocalStrategy and express-session
- **Password Hashing**: bcrypt for secure password storage
- **Development**: tsx for TypeScript execution in development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Defined in `shared/schema.ts` for type safety across client/server
- **Tables**: Users, solutions, comments, likes, user progress, and globe interactions
- **Session Storage**: Express session with PostgreSQL store (connect-pg-simple)
- **Cloud Database**: Neon Database serverless PostgreSQL

### Database Schema Design
The application uses a relational database structure optimized for social climate solutions:
- **Users**: Complete profile management with bio, location, avatar
- **Solutions**: Stores simulation parameters, outcomes, and synergy scores as JSON
- **Comments**: Hierarchical commenting system with parent/child relationships
- **Likes**: Social engagement tracking
- **User Progress**: Gamification elements with badges and achievements
- **Globe Interactions**: Analytics for user engagement with geographic data

## Key Components

### Interactive 3D Globe (`Globe3D.tsx`)
- Three.js-powered 3D Earth visualization
- Real-time climate data overlay (CO2 emissions, population density, forest coverage)
- Interactive country selection with detailed data tooltips
- Orbit controls for smooth navigation
- Dynamic data layer switching

### Climate Simulation Engine (`simulation-engine.ts`)
- Physics-based climate modeling for emission reduction scenarios
- Economic impact calculations for renewable energy adoption
- Policy effectiveness modeling with multiplier effects
- Temperature change projections based on CO2 reduction
- Synergy score calculation for solution effectiveness

### Community Platform (`Community.tsx`)
- Real-time solution sharing and discovery
- Threaded commenting system
- Social engagement features (likes, shares)
- Solution filtering and search capabilities
- User-generated content moderation

### User Authentication & Sessions
- Secure password-based authentication with bcrypt
- Session-based state management
- User profile management with optional fields
- Protected routes and API endpoints

## Data Flow

1. **User Registration/Login**: Credentials → Passport.js → Session Store → Database
2. **Globe Interaction**: User clicks → Country detection → Data fetch → Analytics recording
3. **Solution Creation**: Parameters → Simulation engine → Results → Database storage
4. **Community Engagement**: User actions → Real-time updates → Query cache invalidation
5. **Data Visualization**: Database → API → React Query → Component rendering

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **three.js**: 3D graphics rendering
- **passport**: Authentication framework
- **bcrypt**: Password hashing
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds
- **vite**: Development server and build tool
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Development Server**: Vite dev server with HMR
- **Port Configuration**: Internal port 5000, external port 80

### Production Build
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: esbuild bundles Express server to `dist/index.js`
- **Asset Serving**: Express serves static files from build directory
- **Database Migrations**: Drizzle Kit for schema updates

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Secure session encryption key
- **REPL_ID**: Replit-specific environment detection

### Scaling Considerations
- **Autoscale Deployment**: Configured for automatic scaling based on demand
- **Session Persistence**: PostgreSQL-backed sessions for horizontal scaling
- **Asset Optimization**: Static asset caching and compression
- **Database Connection Pooling**: Neon serverless handles connection scaling

## Changelog

```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
## Documentation
The project maintains comprehensive documentation in the `/docs` folder:
- **Architecture**: System design and technical specifications
- **Development**: Setup guides and deployment procedures
- **User**: API documentation and user guides
- **Testing**: Quality assurance and testing strategies
- **Planner**: Versioned PRDs and sprint planning documents
  - MVP Requirements (v1.0) - Core feature specifications
  - User Journey (v1.1) - Complete user experience design
  - Sprint Planning (v1.0) - Storypoint-based planning template
- **Architecture**: Versioned technical specifications
  - Tech Stack (v1.0) - Technology choices and rationale
  - Feature Specifications (v1.0) - Detailed module descriptions
- **User**: Versioned design and user documentation
  - Design Guidelines (v1.0) - Organic Futurism design schema

All PRD documents include version control and change tracking to monitor refinements and maintain project alignment.