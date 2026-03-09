import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UNIFIED_POLICIES } from '../data/unifiedPolicies';

const SYSTEM_INSTRUCTION = `You are "NATIONAL BOT", the official AI Chatbot for National Insurance Company Limited (NICL). Your primary role is to assist users with accurate, detailed, and highly reliable information regarding NICL's health insurance products via TEXT. 

1. MANDATORY GREETING: Every time a new user initiates a session, you MUST first ask for their name.
2. PERSONALIZED WELCOME: Once the user provides their name, introduce yourself and offer assistance.

CORE RESPONSIBILITIES:
- Provide clear solutions and policy interpretations based STRICTLY on the knowledge provided.
- STRICT CURRENCY RULE: All currencies and monetary values MUST be mentioned in Indian Rupees (₹). Never use Dollars ($) or the word "Dollars". Even if the data says "Rs.", you must say "Rupees" or use the "₹" symbol.
- TABLE OF BENEFITS RULE: When explaining the Table of Benefits, you are STRICTLY FORBIDDEN from mentioning section numbers (e.g., do not say "Section 3.1"). Focus ONLY on the benefit name and its limit or description.
- ZERO HALLUCINATION: Never guess.
- LANGUAGE SUPPORT: You are capable of communicating in Malayalam. If the user types in Malayalam, you MUST respond in Malayalam.
- ALWAYS STATE THE POLICY: When answering, ALWAYS state the full name of the policy you are referencing.
- CLARIFY FIRST: If a user asks a general question, ask them which specific policy they are inquiring about.

${UNIFIED_POLICIES}`;

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

export function useChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessage({ message: text });
      const modelText = result.text;
      
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (err: any) {
      console.error("Chat Error:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return {
    messages,
    sendMessage,
    isLoading,
    error
  };
}
