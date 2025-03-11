import { openAIService } from './openaiService';
import { sidebarService } from './sidebarService';

export async function testOpenAIConnection() {
  try {
    console.log('API Keys present:', {
      projectKey: !!import.meta.env.VITE_OPENAI_API_KEY,
      standardKey: !!import.meta.env.VITE_OPENAI_STANDARD_API_KEY
    });

    // Test basic OpenAI connection
    console.log('\nTesting OpenAI connection...');
    const testResponse = await openAIService.generateResponse(
      "This is a test context",
      "Is the connection working?"
    );
    console.log("OpenAI Test Response:", testResponse);

    // Test sidebar service with a simple query
    console.log('\nTesting sidebar service...');
    const sidebarResponse = await sidebarService.processQuery(
      "Test query for connection verification",
      [{
        id: "test-1",
        role: "user",
        content: "This is a test message",
        timestamp: new Date()
      }],
      { useWebSearch: false }
    );
    console.log("Sidebar Service Test Response:", sidebarResponse);

    return {
      success: true,
      openAIResponse: testResponse,
      sidebarResponse: sidebarResponse
    };
  } catch (error) {
    console.error("OpenAI Connection Test Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Run the test
testOpenAIConnection().then(result => {
  if (result.success) {
    console.log("\n✅ OpenAI connection test successful!");
    console.log("Results:", result);
  } else {
    console.error("\n❌ OpenAI connection test failed:", result.error);
  }
}); 