interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export async function web_search(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Please provide a helpful response to: ${query}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Gemini request failed');
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    // Format the response as a search result
    return [{
      title: 'Gemini Response',
      snippet: generatedText,
      url: ''
    }];
  } catch (error) {
    console.error('Gemini error:', error);
    return [];
  }
} 