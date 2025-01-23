# Modern Forum Application

A full-featured forum application built with Next.js 13, featuring real-time discussions, content moderation, reputation system, and more.

## Features

### Core Functionality

- 💬 Real-time discussions with rich text editing
- 🏷️ Topic categorization and tagging
- 🔍 Advanced full-text search with filters
- 📱 Responsive design for all devices

### User Features

- 🔐 Secure authentication with multiple providers
- ⭐ Reputation system with levels and privileges
- 🏆 User achievements and leaderboards
- 👤 Customizable user profiles

### Moderation

- 🛡️ Comprehensive content moderation system
- 📊 Moderation metrics and analytics
- 🚫 Automated content filtering
- 📝 Detailed audit logging

### Security

- 🔒 Row-level security with Supabase
- 🛡️ CSRF protection
- 🔐 Rate limiting
- 📧 Email verification

## Tech Stack

- **Framework**: Next.js 13 with App Router
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Rich Text**: TipTap
- **Charts**: Recharts
- **Form Handling**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- SMTP server for emails

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/luhdo/next.js-forum.git
   cd next.js-forum
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file:

   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_uri

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # OAuth Providers
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret

   # SMTP
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   SMTP_FROM=noreply@yourdomain.com
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

### Database Setup

The application uses MongoDB for data storage. Make sure to:

1. Create a MongoDB database
2. Update the `MONGODB_URI` in your `.env.local` file
3. The application will automatically create the required collections and indexes

## Project Structure

```css
├── app/                  # Next.js 13 app directory
│   ├── api/             # API routes
│   ├── admin/           # Admin pages
│   ├── auth/            # Authentication pages
│   └── ...             # Other pages
├── components/          # React components
│   ├── ui/             # UI components
│   └── ...             # Feature components
├── lib/                 # Utility functions
│   ├── db/             # Database utilities
│   ├── moderation/     # Moderation system
│   └── ...             # Other utilities
└── public/             # Static files
```

## Key Features in Detail

### Authentication System

- Email/password authentication
- OAuth providers (Google, GitHub)
- Password reset functionality
- Email verification

### Content Moderation

- User reporting system
- Automated content filtering
- Moderation queue
- Action logging and metrics

### Reputation System

- Point-based reputation
- User levels and privileges
- Achievement system
- Weekly/monthly leaderboards

### Search System

- Full-text search across topics and posts
- Advanced filtering options
- Real-time search suggestions
- Search analytics

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) team for the amazing framework
- All our contributors and supporters

## Support

For support, please:

1. Check the [Issues](https://github.com/luhdo/next.js-forum/issues) page
