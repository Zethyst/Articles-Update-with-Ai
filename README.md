# Articles Management System

A comprehensive three-phase project for scraping, processing, and displaying articles from BeyondChats with AI-powered content enhancement.

## Project Overview

This project consists of three interconnected phases:

- **Phase 1**: Laravel backend for scraping and storing articles with CRUD APIs
- **Phase 2**: Node.js service for AI-powered article enhancement using Google Search and LLM
- **Phase 3**: React frontend for displaying articles in a responsive UI

## Project Structure

```
Articles/
├── phase-1-laravel/     # Laravel backend API
├── phase-2-node/        # Node.js article enhancement service
├── phase-3-react/       # React frontend application
└── README.md           # This file
```

---

## Phase 1: Laravel Backend (Moderate Difficulty)

### Description
Scrapes the 5 oldest articles from BeyondChats blogs section and stores them in a database. Provides CRUD APIs for article management.

**Source URL**: https://beyondchats.com/blogs/

### Features
- Web scraping of articles from BeyondChats
- Database storage with SQLite
- RESTful CRUD APIs for articles
- Article model with migrations

### Setup Instructions

#### Prerequisites
- PHP >= 8.2
- Composer
- Node.js and npm

#### Installation Steps

1. **Navigate to Laravel project directory**:
   ```bash
   cd phase-1-laravel
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Set up environment file**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configure database** (SQLite is used by default):
   - Ensure `database/database.sqlite` exists (created automatically)
   - Or update `.env` to use MySQL/PostgreSQL:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=articles
     DB_USERNAME=root
     DB_PASSWORD=
     ```

5. **Run migrations**:
   ```bash
   php artisan migrate
   ```

6. **Install frontend dependencies** (for Laravel assets):
   ```bash
   npm install
   ```

7. **Run the scraping command** to fetch articles:
   ```bash
   php artisan scrape:articles
   ```

8. **Start the development server**:
   ```bash
   php artisan serve
   ```
   The API will be available at `http://localhost:8000`

### API Endpoints

All endpoints are prefixed with `/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | Get all articles |
| GET | `/api/articles/{id}` | Get a specific article |
| POST | `/api/articles` | Create a new article |
| PUT/PATCH | `/api/articles/{id}` | Update an article |
| DELETE | `/api/articles/{id}` | Delete an article |

### Article Model Structure

```json
{
  "id": 1,
  "title": "Article Title",
  "content": "Article content...",
  "url": "https://beyondchats.com/blogs/article-slug",
  "published_at": "2024-01-01T00:00:00.000000Z",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

---

## Phase 2: Node.js Article Enhancement Service (Very Difficult)

### Description
A Node.js service that:
1. Fetches the latest article from the Laravel API
2. Searches the article title on Google
3. Fetches the first two blog/article links from search results
4. Scrapes content from those articles
5. Uses an LLM API to enhance the original article based on the scraped articles
6. Publishes the enhanced article via Laravel API
7. Includes citations for reference articles

### Features
- Google Search integration (using SerpAPI)
- Web scraping with Cheerio
- OpenAI integration for content enhancement
- Express server for API endpoints
- Automatic article processing

### Setup Instructions

#### Prerequisites
- Node.js >= 18.x
- npm or yarn
- API keys for:
  - SerpAPI (for Google Search)
  - OpenAI (for LLM)

#### Installation Steps

1. **Navigate to Node.js project directory**:
   ```bash
   cd phase-2-node
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```
   Or create `.env` manually with:
   ```env
   LARAVEL_API_URL=http://localhost:8000/api
   SERPAPI_KEY=your_serpapi_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=5000
   ```

4. **Get API Keys**:
   - **SerpAPI**: Sign up at https://serpapi.com/ and get your API key
   - **OpenAI**: Get your API key from https://platform.openai.com/api-keys

5. **Start the service**:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

### Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/process-latest` | Process the latest article from Laravel API |

### How It Works

1. Fetches the latest article from Laravel API
2. Searches article title on Google using SerpAPI
3. Filters results to find blog/article links
4. Scrapes main content from top 2 articles
5. Sends original article + scraped articles to OpenAI
6. Receives enhanced article with improved formatting and content
7. Publishes enhanced article via Laravel API
8. Adds citations for reference articles at the bottom

---

## Phase 3: React Frontend (Very Easy)

### Description
A modern React application built with Vite and TypeScript that displays articles from the Laravel API. Shows both original and enhanced versions of articles in a responsive, professional UI.

### Features
- Responsive design with Tailwind CSS
- Article listing and detail views
- Displays original and enhanced articles
- Modern UI components with Radix UI
- React Query for data fetching
- React Router for navigation

### Setup Instructions

#### Prerequisites
- Node.js >= 18.x
- npm or yarn

#### Installation Steps

1. **Navigate to React project directory**:
   ```bash
   cd phase-3-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API endpoint**:
   Create or update `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Preview production build**:
   ```bash
   npm run preview
   ```

### Features

- **Article List**: View all articles in a grid/list layout
- **Article Detail**: View full article content with formatting
- **Original vs Enhanced**: Toggle between original and enhanced versions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

---

## Running the Complete System

### Step 1: Start Laravel Backend
```bash
cd phase-1-laravel
composer install
php artisan migrate
php artisan serve
```

### Step 2: Start Node.js Service
```bash
cd phase-2-node
npm install
npm start
```

### Step 3: Start React Frontend
```bash
cd phase-3-react
npm install
npm run dev
```

### Access Points
- **Laravel API**: http://localhost:8000
- **Laravel API Docs**: http://localhost:8000/api/articles
- **Node.js Service**: http://localhost:5000
- **React Frontend**: http://localhost:5173

---

## Development Workflow

1. **Initial Setup**: Run scraping command in Phase 1 to populate database
2. **Article Enhancement**: Use Phase 2 service to enhance articles
3. **View Articles**: Use Phase 3 frontend to browse and view articles

---

## Technologies Used

### Phase 1 (Laravel)
- Laravel 12
- PHP 8.2+
- SQLite/MySQL/PostgreSQL
- Symfony DOM Crawler
- Composer

### Phase 2 (Node.js)
- Node.js
- Express.js
- Axios
- Cheerio
- SerpAPI
- OpenAI API
- dotenv

### Phase 3 (React)
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Query
- React Router
- Radix UI
- Axios

---

## Environment Variables

### Phase 1 (Laravel)
See `.env.example` in `phase-1-laravel/` directory

### Phase 2 (Node.js)
```env
LARAVEL_API_URL=http://localhost:8000/api
SERPAPI_KEY=your_serpapi_key
OPENAI_API_KEY=your_openai_key
PORT=5000
```

### Phase 3 (React)
```env
VITE_API_URL=http://localhost:8000/api
```

---

## Troubleshooting

### Laravel Issues
- **Migration errors**: Run `php artisan migrate:fresh` to reset database
- **Permission errors**: Ensure storage and cache directories are writable
- **API not responding**: Check if server is running on port 8000

### Node.js Issues
- **API key errors**: Verify SerpAPI and OpenAI keys in `.env`
- **Connection errors**: Ensure Laravel API is running before starting Node service
- **Scraping failures**: Check internet connection and target website availability

### React Issues
- **API connection errors**: Verify `VITE_API_URL` in `.env` matches Laravel API URL
- **Build errors**: Clear node_modules and reinstall dependencies
- **Port conflicts**: Change port in `vite.config.ts` if 5173 is in use

---

## License

ISC

---

## Author

harshita

