# Modern Blog Application

A full-stack blog application built with Next.js 13, Supabase, and TypeScript. Features a modern dark theme, real-time updates, and a responsive design.

## Features

- 🔐 Secure authentication with email/password
- 👤 User profiles with avatars
- ✍️ Create, edit, and delete blog posts
- 🖼️ Image upload support for posts and avatars
- 🎨 Modern dark theme with glass-morphism effects
- 🔍 Real-time search and filtering
- 📱 Fully responsive design
- ⚡ Server-side rendering with Next.js 13
- 🔄 Real-time updates with Supabase

## Tech Stack

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Hooks
- **Image Handling**: Next.js Image Component
- **Date Formatting**: date-fns

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Supabase account

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

4. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Set up the database:
   Run the following SQL commands in your Supabase SQL editor:
   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
       id UUID REFERENCES auth.users(id) PRIMARY KEY,
       username TEXT,
       email TEXT,
       avatar_url TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
   );

   -- Enable RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Enable read access for all users"
   ON profiles FOR SELECT
   USING (true);

   CREATE POLICY "Enable insert for authenticated users"
   ON profiles FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = id);

   CREATE POLICY "Enable update for users based on id"
   ON profiles FOR UPDATE
   TO authenticated
   USING (auth.uid() = id)
   WITH CHECK (auth.uid() = id);

   CREATE POLICY "Enable delete for users based on id"
   ON profiles FOR DELETE
   TO authenticated
   USING (auth.uid() = id);

   -- Create posts table
   CREATE TABLE posts (
       id SERIAL PRIMARY KEY,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
       title TEXT NOT NULL,
       content TEXT NOT NULL,
       image_url TEXT,
       author_id UUID REFERENCES auth.users(id) NOT NULL,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
   );

   -- Enable RLS
   ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

   -- Create policies for posts
   CREATE POLICY "Posts are viewable by everyone"
   ON posts FOR SELECT
   USING (true);

   CREATE POLICY "Users can create posts"
   ON posts FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = author_id);

   CREATE POLICY "Users can update own posts"
   ON posts FOR UPDATE
   TO authenticated
   USING (auth.uid() = author_id)
   WITH CHECK (auth.uid() = author_id);

   CREATE POLICY "Users can delete own posts"
   ON posts FOR DELETE
   TO authenticated
   USING (auth.uid() = author_id);
   ```

6. Create storage buckets:
   In Supabase dashboard:
   - Create a bucket named 'avatars' for profile pictures
   - Create a bucket named 'post-images' for blog post images
   - Set up appropriate CORS policies

### Running the Application

Development mode:
```bash
npm run dev
# or
yarn dev
```

Build for production:
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Project Structure

```
├── app/                    # Next.js 13 app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── ...               # Other components
├── lib/                   # Utilities and services
│   ├── auth.ts           # Authentication service
│   ├── types.ts          # TypeScript types
│   └── ...               # Other utilities
└── public/               # Static assets
```

## Key Design Decisions

1. **Authentication**:
   - Custom auth service for better type safety
   - JWT-based authentication with Supabase
   - Secure password requirements
   - Profile picture upload during signup

2. **Database Structure**:
   - Separate profiles and posts tables
   - Row Level Security (RLS) for data protection
   - Optimized queries for post listing

3. **UI/UX**:
   - Modern dark theme with glass-morphism
   - Responsive design for all screen sizes
   - Real-time search and filtering
   - Image preview and resizing
   - Loading states and error boundaries

4. **Performance**:
   - Server-side rendering for better SEO
   - Optimized image loading
   - Efficient state management
   - Debounced search

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript compiler

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 
