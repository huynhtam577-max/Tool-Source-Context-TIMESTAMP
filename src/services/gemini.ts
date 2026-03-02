import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function alignContent(sourceContext: string, srtContent: string): Promise<string> {
  const prompt = `
    You are an expert video editor and subtitle specialist.
    Your task is to align a "Source Context" text with an "SRT" subtitle file.
    
    I will provide you with two inputs:
    1. SOURCE CONTEXT: A text file containing lines of text.
    2. SRT: A subtitle file with timestamps.
    
    GOAL:
    For each line in the SOURCE CONTEXT, find the corresponding timestamp from the SRT file.
    The SRT file might break sentences into smaller chunks, or the Source Context might group them differently.
    You must intelligently match the content and assign the correct start and end time that covers that specific line of Source Context.
    
    OUTPUT FORMAT:
    SOURCE CONTEXT TIMELINE:
    [Line 1 Content]: ([Start Time] --> [End Time])
    [Line 2 Content]: ([Start Time] --> [End Time])
    ...
    
    RULES:
    - The output must start with "SOURCE CONTEXT TIMELINE:".
    - For each line in the SOURCE CONTEXT, output the exact line content followed by its timestamp in parentheses.
    - The timestamp format should be (00:00:00,000 --> 00:00:00,000) or similar as found in the SRT.
    - Ensure every single line from the Source Context is included in order.
    - Do not combine lines. Each Source Context line must be on its own line in the output.
    - Do not include any other conversational text.
    
    INPUTS:
    
    --- SOURCE CONTEXT ---
    ${sourceContext}
    
    --- SRT ---
    ${srtContent}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text || "Error: No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Failed to process content. Please check your inputs and try again.";
  }
}
