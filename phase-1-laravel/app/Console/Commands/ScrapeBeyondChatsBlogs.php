<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Support\Str;
use App\Models\Article;

class ScrapeBeyondChatsBlogs extends Command
{
    protected $signature = 'scrape:beyondchats {--page=14 : Page number to scrape} {--limit=5 : Number of articles to scrape} {--debug : Show debugging information} {--use-api : Save via API instead of direct database}';
    protected $description = 'Scrape blogs from BeyondChats';

    public function handle()
    {
        $page = $this->option('page');
        $limit = (int) $this->option('limit');
        $debug = $this->option('debug');
        
        $url = "https://beyondchats.com/blogs/page/{$page}";
        
        $this->info("Fetching: {$url}");

        $response = Http::get($url);
        
        if (!$response->successful()) {
            $this->error("Failed to fetch the blog page. Status: {$response->status()}");
            if ($debug) {
                $this->line("Response body: " . substr($response->body(), 0, 500));
            }
            return 1;
        }

        $crawler = new Crawler($response->body());
        
        // Try multiple selectors for blog cards
        $blogCards = $this->findBlogCards($crawler, $debug);
        
        if ($blogCards->count() === 0) {
            $this->error("No blog cards found! Trying to identify page structure...");
            if ($debug) {
                $this->debugPageStructure($crawler);
            }
            return 1;
        }

        $this->info("Found {$blogCards->count()} blog cards. Scraping first {$limit}...");
        
        $articles = [];
        $nodesArray = [];
        
        // Convert nodes to array for proper slicing
        $blogCards->each(function ($node) use (&$nodesArray) {
            $nodesArray[] = $node;
        });
        
        $nodesToProcess = array_slice($nodesArray, 0, $limit);
        
        foreach ($nodesToProcess as $index => $node) {
            try {
                if ($debug) {
                    $this->line("\nProcessing card " . ($index + 1) . " of " . count($nodesToProcess));
                }
                
                $articleData = $this->extractArticleData($node, $debug);
                if ($articleData && $this->isValidArticle($articleData)) {
                    $articles[] = $articleData;
                    if ($debug) {
                        $this->line("✓ Extracted: {$articleData['title']}");
                    }
                } else {
                    if ($debug) {
                        $this->warn("✗ Skipped invalid article");
                    }
                }
            } catch (\Exception $e) {
                $this->error("Error extracting article: {$e->getMessage()}");
                if ($debug) {
                    $this->line("Node HTML: " . substr($node->outerHtml(), 0, 200));
                }
            }
        }

        if (empty($articles)) {
            $this->error("No articles were successfully extracted!");
            return 1;
        }

        $this->info("Successfully extracted " . count($articles) . " articles. Saving...");

        $useApi = $this->option('use-api');
        $successCount = 0;
        $failCount = 0;

        if ($useApi) {
            // Save via API
            $apiUrl = rtrim(config('app.url', 'http://127.0.0.1:8000'), '/') . '/api/articles';
            
            if ($debug) {
                $this->line("API URL: {$apiUrl}");
            }

            foreach ($articles as $articleData) {
                try {
                    $response = Http::timeout(30)->post($apiUrl, $articleData);
                    
                    if ($response->successful()) {
                        $this->info("✓ Saved: {$articleData['title']}");
                        $successCount++;
                    } else {
                        $this->error("✗ Failed to save: {$articleData['title']}");
                        $this->error("  Status: {$response->status()}");
                        if ($debug) {
                            $this->line("  Response: " . $response->body());
                            $this->line("  Data sent: " . json_encode($articleData, JSON_PRETTY_PRINT));
                        }
                        $failCount++;
                    }
                } catch (\Exception $e) {
                    $this->error("✗ Exception saving: {$articleData['title']} - {$e->getMessage()}");
                    $failCount++;
                }
            }
        } else {
            // Save directly to database (faster and more reliable)
            foreach ($articles as $articleData) {
                try {
                    $article = Article::updateOrCreate(
                        ['slug' => $articleData['slug']],
                        $articleData
                    );
                    $this->info("✓ Saved: {$articleData['title']}");
                    $successCount++;
                } catch (\Exception $e) {
                    $this->error("✗ Failed to save: {$articleData['title']} - {$e->getMessage()}");
                    if ($debug) {
                        $this->line("  Exception: " . $e->getTraceAsString());
                    }
                    $failCount++;
                }
            }
        }

        $this->info("Scraping completed! Success: {$successCount}, Failed: {$failCount}");
        return 0;
    }

    private function findBlogCards(Crawler $crawler, $debug = false)
    {
        // Try direct selectors based on actual HTML structure (most reliable)
        $selectors = [
            '.card-content',
            'div.card-content',
            'article .card-content',
            // Fallback selectors
            '.blog-card',
            'article.blog-card',
            '.post-card',
            'article[class*="card"]',
            'article',
        ];

        foreach ($selectors as $selector) {
            try {
                $nodes = $crawler->filter($selector);
                if ($nodes->count() > 0) {
                    if ($debug) {
                        $this->line("Found {$nodes->count()} elements using selector: {$selector}");
                    }
                    return $nodes;
                }
            } catch (\Exception $e) {
                // Continue to next selector
            }
        }

        // Fallback: Find elements with .entry-title and get their parent containers using XPath
        try {
            $entryTitles = $crawler->filter('.entry-title');
            if ($entryTitles->count() > 0) {
                $parentNodes = [];
                $entryTitles->each(function ($titleNode) use (&$parentNodes, $crawler) {
                    try {
                        // Get the DOMElement node
                        $domNode = $titleNode->getNode(0);
                        if ($domNode instanceof \DOMElement) {
                            // Use XPath to find ancestor with .card-content class
                            $xpath = new \DOMXPath($domNode->ownerDocument);
                            
                            // Find ancestor div with card-content class
                            $ancestors = $xpath->query('ancestor::div[contains(@class, "card-content")]', $domNode);
                            if ($ancestors->length > 0) {
                                $parentNodes[] = $ancestors->item(0);
                                return;
                            }
                            
                            // Find ancestor article
                            $ancestors = $xpath->query('ancestor::article', $domNode);
                            if ($ancestors->length > 0) {
                                $parentNodes[] = $ancestors->item(0);
                                return;
                            }
                            
                            // Find any ancestor div with "card" in class
                            $ancestors = $xpath->query('ancestor::div[contains(@class, "card")]', $domNode);
                            if ($ancestors->length > 0) {
                                $parentNodes[] = $ancestors->item(0);
                                return;
                            }
                            
                            // Last resort: get immediate parent
                            if ($domNode->parentNode instanceof \DOMElement) {
                                $parentNodes[] = $domNode->parentNode;
                            }
                        }
                    } catch (\Exception $e) {
                        // Skip this node
                    }
                });
                
                if (!empty($parentNodes)) {
                    $nodes = new Crawler($parentNodes);
                    if ($debug) {
                        $this->line("Found {$nodes->count()} blog cards by finding .entry-title parents");
                    }
                    return $nodes;
                }
            }
        } catch (\Exception $e) {
            // Continue
        }

        return new Crawler();
    }

    private function extractArticleData($node, $debug = false)
    {
        // Extract title and link from h2.entry-title a (based on actual HTML structure)
        $title = null;
        $link = null;

        try {
            $titleElement = $node->filter('h2.entry-title a');
            if ($titleElement->count() > 0) {
                $title = trim($titleElement->text());
                $link = $titleElement->attr('href');
            }
        } catch (\Exception $e) {
            // Try fallback selectors
        }

        // Fallback: try h2.entry-title without anchor
        if (!$title || !$link) {
            try {
                $titleElement = $node->filter('h2.entry-title');
                if ($titleElement->count() > 0) {
                    if (!$title) {
                        $title = trim($titleElement->text());
                    }
                    if (!$link) {
                        $linkElement = $titleElement->filter('a');
                        if ($linkElement->count() > 0) {
                            $link = $linkElement->attr('href');
                        }
                    }
                }
            } catch (\Exception $e) {
                // Continue to other fallbacks
            }
        }

        // Additional fallback selectors
        if (!$link) {
            $link = $this->trySelectors($node, [
                'h2.entry-title a',
                'h2 a',
                'a[href*="/blog"]',
                '.entry-title a',
                'a',
            ], 'attr', 'href');
        }

        if (!$title) {
            $title = $this->trySelectors($node, [
                'h2.entry-title',
                'h2.entry-title a',
                'h2',
                '.entry-title',
                '.title',
            ], 'text');
        }

        if (!$link) {
            if ($debug) {
                $this->warn("Could not find link");
            }
            return null;
        }

        // Filter out non-article links
        if (!$this->isArticleLink($link)) {
            if ($debug) {
                $this->warn("Skipping non-article link: {$link}");
            }
            return null;
        }

        // Make link absolute if relative
        if (!str_starts_with($link, 'http')) {
            $link = 'https://beyondchats.com' . $link;
        }

        if (!$title || strlen(trim($title)) < 5) {
            if ($debug) {
                $this->warn("Could not find valid title");
            }
            return null;
        }

        if ($debug) {
            $this->line("  Found article: {$title}");
            $this->line("  Link: {$link}");
        }

        // Scrape the full article
        return $this->scrapeSingleArticle($link, $title, $debug);
    }

    private function isArticleLink($link)
    {
        // Filter out navigation and non-article links
        $excludedPatterns = [
            '/blog$',
            '/blogs$',
            '/blog/$',
            '/blogs/$',
            '/blog/page',
            '/blogs/page',
            '#',
            'javascript:',
        ];

        foreach ($excludedPatterns as $pattern) {
            if (preg_match('~' . $pattern . '~', $link)) {
                return false;
            }
        }

        // Must contain /blog/ or /blogs/ in the path, but not pagination
        return (str_contains($link, '/blog/') || str_contains($link, '/blogs/')) 
            && !str_contains($link, '/blog/page') 
            && !str_contains($link, '/blogs/page');
    }

    private function isValidArticle($articleData)
    {
        // Validate article data
        if (empty($articleData['title']) || strlen(trim($articleData['title'])) < 5) {
            return false;
        }

        // Filter out common navigation words
        $invalidTitles = ['blogs', 'blog', 'home', 'about', 'contact', 'privacy', 'terms'];
        $titleLower = strtolower(trim($articleData['title']));
        
        if (in_array($titleLower, $invalidTitles)) {
            return false;
        }

        // Must have content
        if (empty($articleData['content']) || strlen(trim($articleData['content'])) < 50) {
            return false;
        }

        return true;
    }

    private function trySelectors($node, $selectors, $method, $attribute = null)
    {
        foreach ($selectors as $selector) {
            try {
                $element = $node->filter($selector);
                if ($element->count() > 0) {
                    if ($method === 'text') {
                        return trim($element->text());
                    } elseif ($method === 'attr' && $attribute) {
                        return trim($element->attr($attribute));
                    }
                }
            } catch (\Exception $e) {
                // Continue to next selector
            }
        }
        return null;
    }

    private function scrapeSingleArticle($url, $title, $debug = false)
    {
        try {
            if ($debug) {
                $this->line("Scraping article: {$url}");
            }

            $html = Http::get($url)->body();
            $crawler = new Crawler($html);

            // Try multiple selectors for content
            $content = $this->trySelectors($crawler, [
                '.blog-content',
                '.post-content',
                '.entry-content',
                '.article-content',
                'article .content',
                'main article',
                'article',
                '.content',
            ], 'text');

            if (!$content) {
                // Fallback: get all paragraph text
                try {
                    $paragraphs = $crawler->filter('p')->each(function ($p) {
                        return trim($p->text());
                    });
                    $content = implode("\n\n", array_filter($paragraphs));
                } catch (\Exception $e) {
                    $content = '';
                }
            }

            // Try multiple selectors for author (based on actual HTML structure)
            $author = $this->trySelectors($crawler, [
                'li.meta-author span',
                'li.meta-author a span',
                'li.meta-author',
                '.meta-author span',
                '.meta-author',
                '.author',
                '.post-author',
                '.article-author',
                '[class*="author"]',
            ], 'text');

            // Try meta tag for author
            if (!$author) {
                try {
                    $author = $crawler->filter('meta[name="author"]')->attr('content');
                } catch (\Exception $e) {
                    // Ignore
                }
            }

            // Try multiple selectors for date (based on actual HTML structure)
            $date = $this->trySelectors($crawler, [
                'li.meta-date',
                'li.meta-date time',
                '.meta-date',
                '.meta-date time',
                'time',
                '.date',
                '.post-date',
                '.published-date',
                '.article-date',
                '[class*="date"]',
            ], 'text');

            // Try datetime attribute from time element
            if (!$date) {
                try {
                    $timeElement = $crawler->filter('li.meta-date time, .meta-date time, time');
                    if ($timeElement->count() > 0) {
                        $date = $timeElement->attr('datetime');
                        if ($date) {
                            $date = date('Y-m-d', strtotime($date));
                        }
                    }
                } catch (\Exception $e) {
                    // Ignore
                }
            }

            // Try meta tag or time element for date
            if (!$date) {
                try {
                    $date = $crawler->filter('meta[property="article:published_time"]')->attr('content');
                    if ($date) {
                        $date = date('Y-m-d', strtotime($date));
                    }
                } catch (\Exception $e) {
                    // Ignore
                }
                
                if (!$date) {
                    try {
                        $date = $crawler->filter('time')->attr('datetime');
                        if ($date) {
                            $date = date('Y-m-d', strtotime($date));
                        }
                    } catch (\Exception $e) {
                        // Ignore
                    }
                }
            }

            // Parse date if it's a string
            if ($date && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                try {
                    $parsedDate = date('Y-m-d', strtotime($date));
                    if ($parsedDate !== '1970-01-01') {
                        $date = $parsedDate;
                    } else {
                        $date = null;
                    }
                } catch (\Exception $e) {
                    $date = null;
                }
            }

            if ($debug) {
                $this->line("  Title: {$title}");
                $this->line("  Content length: " . strlen($content));
                $this->line("  Author: " . ($author ?: 'Not found'));
                $this->line("  Date: " . ($date ?: 'Not found'));
            }

            return [
                'title' => $title,
                'slug' => Str::slug($title),
                'content' => $content ?: '',
                'author' => $author ?: null,
                'published_at' => $date ?: null,
            ];
        } catch (\Exception $e) {
            $this->error("Failed to scrape article: {$title} - {$e->getMessage()}");
            if ($debug) {
                $this->line("Exception: " . $e->getTraceAsString());
            }
            return null;
        }
    }

    private function debugPageStructure(Crawler $crawler)
    {
        $this->line("\n=== Page Structure Debug ===");
        
        // Check for common article/blog containers
        $commonSelectors = [
            'article', '.post', '.blog', '.entry', 
            '[class*="card"]', '[class*="item"]', '[id*="post"]'
        ];
        
        foreach ($commonSelectors as $selector) {
            try {
                $count = $crawler->filter($selector)->count();
                if ($count > 0) {
                    $this->line("Found {$count} elements with selector: {$selector}");
                }
            } catch (\Exception $e) {
                // Ignore
            }
        }
        
        // Show first few links
        $this->line("\nFirst 5 links found:");
        try {
            $crawler->filter('a')->slice(0, 5)->each(function ($link) {
                $href = $link->attr('href');
                $text = trim($link->text());
                if ($href && str_contains($href, 'blog')) {
                    $this->line("  - {$text} => {$href}");
                }
            });
        } catch (\Exception $e) {
            $this->line("Could not extract links");
        }
    }
}

