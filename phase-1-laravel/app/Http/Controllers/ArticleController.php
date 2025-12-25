<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index()
    {
        return Article::orderBy('published_at', 'desc')->get();
    }

    public function show($id)
    {
        return Article::findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'content' => 'required|string',
            'author' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'excerpt' => 'nullable|string',
        ]);

        // Generate slug if not provided
        if (empty($data['slug']) && !empty($data['title'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['title']);
        }
        
        // Handle slug uniqueness - update if exists, create if not
        $article = Article::updateOrCreate(
            ['slug' => $data['slug']],
            $data
        );
        
        return response()->json($article, 201);
    }

    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|nullable|string|max:255|unique:articles,slug,' . $id,
            'content' => 'sometimes|required|string',
            'author' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'excerpt' => 'nullable|string',
            'version' => 'nullable|in:original,updated',
        ]);

        // Generate slug if title changed but slug not provided
        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['title']);
        }
        
        $article->update($data);
        
        return response()->json($article);
    }

    public function destroy($id)
    {
        Article::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
