/**
 * Client-side Gemini AI caller proxying through backend Express endpoint
 */

export interface GenerateAIRequest {
  prompt: string;
  systemInstruction?: string;
  imageBase64?: string;
  mimeType?: string;
}

export async function generateAICotent(params: GenerateAIRequest): Promise<string> {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: Failed to generate content from AI`);
  }

  const data = await response.json();
  return data.text || '';
}
