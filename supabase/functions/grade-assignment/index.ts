// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// FIX 1: Explicitly type 'req' as Request
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { submissionText, submissionFileUrl, rubric, assignmentType } = await req.json()
    
    // FIX 2: Deno namespace access
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('No API Key found')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const promptParts = []
    
    // System Instruction (Persona)
    const systemInstruction = `You are a strict university professor. Grade the following student submission based strictly on this rubric: \n"${rubric}"\n. Return a JSON object with 'score' (0-100) and 'feedback' (concise, bullet points).`
    promptParts.push(systemInstruction);

    // Handle Images
    if (submissionFileUrl) {
      const imageResp = await fetch(submissionFileUrl)
      const imageBlob = await imageResp.blob()
      const arrayBuffer = await imageBlob.arrayBuffer()
      
      const base64String = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      promptParts.push({
        inlineData: {
          data: base64String,
          mimeType: imageBlob.type || 'image/jpeg' 
        }
      });
      promptParts.push("\nAnalyze this image. If it's handwriting, transcribe it first internally. If it's a graph, check the axes and data.");
    }

    if (submissionText) {
      promptParts.push(`\nStudent Text Submission: "${submissionText}"`);
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = response.text();

    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  // FIX 3: Type 'error' as 'any' to access .message
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})