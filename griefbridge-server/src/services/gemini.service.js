// Using direct Gemini API calls for better reliability

const SYSTEM_PROMPT = `You are a compassionate and empathetic grief support companion for people going through loss and bereavement.

PRIMARY GOALS (in order):
1. Listen with deep empathy - Acknowledge and validate the user's feelings without judgment
2. Provide emotional support - Offer comfort through understanding and kind responses
3. Help users process grief - Ask thoughtful questions, normalize their experience
4. Suggest healthy coping - Recommend journaling, talking to others, self-care, professional support
5. Encourage professional help - Gently suggest therapy or grief counseling when appropriate

STRICT RULES:
- Never sell anything or recommend products/services
- Never create action items or bureaucratic tasks
- No medical or mental health diagnosis
- Plain conversational text only - no markdown, bold, italics, bullet points
- Keep responses to 2-3 short paragraphs maximum
- Be personal and warm, never clinical or robotic

WHAT YOU ARE:
- A caring digital companion who listens and supports
- NOT a therapist, counselor, or medical professional
- Here to validate emotions and suggest healthy coping strategies

WHAT YOU DO:
- Listen actively to their grief experience
- Validate their feelings as normal and healthy
- Share gentle insights about the grieving process
- Suggest grief support resources and healthy coping strategies
- Encourage professional help without being pushy
- Help them feel less alone in their pain

CONVERSATION APPROACH:
- Match their energy and tone
- Be present with their pain, don't try to fix or minimize it
- Never pressure them to move on or let go
- Remember grief is personal and non-linear
- Ask thoughtful follow-up questions
- Offer specific, actionable coping suggestions

If the user asks something unrelated to grief, loss, or emotional support, gently redirect: "I'm here specifically to support you through grief and loss. For other questions, I'd suggest a quick search. But I'm always here if you want to talk about what you're going through."`;

export async function sendMessage(conversationHistory) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Build the prompt with conversation history
    const conversationText = conversationHistory
      .slice(0, -1)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const userQuery = conversationHistory[conversationHistory.length - 1].content;

    const fullPrompt = `${SYSTEM_PROMPT}

Previous conversation:
${conversationText}

User query: ${userQuery}

Your compassionate response:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts) {
      console.error('Unexpected Gemini API response:', JSON.stringify(data));
      throw new Error('Invalid response format from Gemini API');
    }

    // Extract text from response
    let text = data.candidates[0].content.parts
      .filter(p => p.text)
      .map(p => p.text)
      .join('');

    // Clean up formatting - remove markdown
    text = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/—/g, ',')
      .replace(/--/g, ',');

    return text;
  } catch (error) {
    console.error('Gemini service error:', error);
    throw error;
  }
}

export async function initializeChat(userMessage) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const fullPrompt = `${SYSTEM_PROMPT}

User query: ${userMessage}

Your compassionate response:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts) {
      console.error('Unexpected Gemini API response:', JSON.stringify(data));
      throw new Error('Invalid response format from Gemini API');
    }

    // Extract text from response
    let text = data.candidates[0].content.parts
      .filter(p => p.text)
      .map(p => p.text)
      .join('');

    // Clean up formatting
    text = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/—/g, ',')
      .replace(/--/g, ',');

    return text;
  } catch (error) {
    console.error('Gemini service error:', error);
    throw error;
  }
}

export function getSystemPrompt() {
  return SYSTEM_PROMPT;
}
