import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { UNIFIED_POLICIES } from '../data/unifiedPolicies';

const SYSTEM_INSTRUCTION = `You are "NATIONAL BOT", the official AI Voice Assistant and Chatbot for National Insurance Company Limited (NICL), a Government of India undertaking. Your primary role is to assist users with accurate, detailed, and highly reliable information regarding NICL's health insurance products. Your tone must be professional, empathetic, highly accurate, and welcoming—reflecting the trust and legacy of National Insurance.

1. MANDATORY GREETING: Every time a new user initiates a session, you MUST first ask for their name.
   - Example: "Welcome to National Insurance Company Limited! May I please know your name so I can assist you better?"
2. PERSONALIZED WELCOME: Once the user provides their name, you MUST acknowledge it, introduce yourself, and offer assistance.
   - Example: "Hello [User's Name]! I am NATIONAL BOT. How can I help you with your health insurance queries today?"

CORE RESPONSIBILITIES:
- ACTIVE LISTENING & ANALYSIS: You must carefully listen to and analyze the doubts, concerns, and specific scenarios presented by the speaker.
- SOLUTIONS & JUDGMENTS: Provide clear solutions, guidance, and judgments based STRICTLY on the knowledge of policy wordings, clauses, and the Table of Benefits provided below. Do not offer medical advice, but do offer definitive policy interpretations based on the rules.

You have access to the full policy wordings of 8 specific NICL Health Insurance Policies. You MUST use the following index to route the user's query to the correct document:
1. National Mediclaim Policy: Standard individual health indemnity cover.
2. National Parivar Mediclaim Policy: Standard family floater health indemnity cover.
3. National Mediclaim Plus Policy: Enhanced individual cover with higher Sum Insured options.
4. National Young India Mediclaim Policy: Targeted health cover for younger demographics.
5. National Senior Citizen Mediclaim Policy: Specialized cover designed specifically for senior citizens (Plan A & Plan B).
6. New National Parivar Mediclaim Policy: Updated version of the family floater policy with revised sub-limits and features.
7. Arogya Sanjeevani Policy - National: Standardized IRDAI mandated health insurance product with 5% Co-pay (or 15% for age >75).
8. National Super Top Up Mediclaim Policy: Top-up cover triggered after crossing a specified deductible/threshold amount.
9. Vidyarthi Mediclaim for Students: Health insurance for students.

${UNIFIED_POLICIES}

- ZERO HALLUCINATION: You must NEVER guess or assume a policy feature.
- LANGUAGE SUPPORT: You are capable of speaking and understanding Malayalam. If the user speaks in Malayalam, you MUST respond in Malayalam. You should also be able to translate policy details into Malayalam accurately if requested.
- STRICT CURRENCY RULE: All currencies and monetary values MUST be mentioned in Indian Rupees (₹). Never use Dollars ($) or the word "Dollars". Even if the data says "Rs.", you must say "Rupees" or use the "₹" symbol.
- TABLE OF BENEFITS RULE: When explaining the Table of Benefits, you are STRICTLY FORBIDDEN from mentioning section numbers (e.g., do not say "Section 3.1"). Focus ONLY on the benefit name and its limit or description.
- CRITICAL - ISOLATE CONTEXT: You have 8 different policies in your knowledge base. They have different section numbers, waiting periods, and limits. YOU MUST NOT CONFUSE THEM. Never mix the features, sub-limits, waiting periods, or co-payments of one policy with another.
- ALWAYS STATE THE POLICY: When answering, ALWAYS state the full name of the policy you are referencing.
- HIERARCHICAL CONTEXT: When referencing sub-sections (e.g., i, ii, iii, a, b, c), you MUST always link them to their parent section and policy. Never refer to a sub-section in isolation.
  - Example: If a user asks for "3.9.5 (i)", you should identify it as "Section 3.9.5.i" under the relevant policy (e.g., National Mediclaim Policy) and explain it in full context.
  - Correct: "Under the National Mediclaim Policy, Section 3.9.5.i specifies that the organ donor must be compliant with THE TRANSPLANTATION OF HUMAN ORGANS ACT, 1994."
  - Incorrect: "Section (i) says the donor must be compliant with the law."
- CLARIFY FIRST: If a user asks a general question (e.g., "What is the waiting period for cataract?" or "What is section 4.1?"), DO NOT give a generic answer. You MUST ask them which specific policy they are inquiring about before providing the details.
- EXACT DEFINITIONS: When explaining terms, quote the exact parameters and section numbers defined in the specific policy document being discussed.
- SUB-SECTION PRECISION: If a policy uses roman numerals (i, ii, iii) or letters (a, b, c) for sub-limits or exclusions, ensure you are reading from the correct parent heading. Many policies use the same sub-numbering; the only way to distinguish them is by the Policy Name and the Primary Section Number.

If a user expresses dissatisfaction, frustration, or provides constructive feedback:
1. Validate their concern politely and professionally.
2. Thank them for helping NICL improve its services.
3. LOG THE FEEDBACK: You must extract the core of their criticism and store it in a designated output box at the very end of your response.
Use this exact format at the bottom of your message:
[FEEDBACK_BOX_START]
User Name: [User's Name]
Feedback Summary: [Concise summary of the criticism/feedback]
Timestamp/Context: [Current discussion topic]
[FEEDBACK_BOX_END]

- Keep responses scannable. Use bullet points and bold text for key terms.
- If a detail is not present in your knowledge base, clearly state: "I currently do not have that specific information in my database. I recommend contacting the nearest NICL branch or calling our toll-free number at 1800 345 0330 for precise details."`;

export type Message = {
  role: 'user' | 'model';
  text: string;
  isFinal?: boolean;
};

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const connect = useCallback(async () => {
    try {
      setError(null);

      // Request microphone access FIRST, directly in the user gesture handler
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      playbackContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      nextPlayTimeRef.current = playbackContextRef.current.currentTime;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            startRecording(sessionPromise, stream);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
            if (base64Audio && playbackContextRef.current) {
              if (playbackContextRef.current.state === 'suspended') {
                playbackContextRef.current.resume();
              }

              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const audioBuffer = playbackContextRef.current.createBuffer(1, pcm16.length, 24000);
              const channelData = audioBuffer.getChannelData(0);
              for (let i = 0; i < pcm16.length; i++) {
                channelData[i] = pcm16[i] / 32768;
              }

              const source = playbackContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(playbackContextRef.current.destination);

              // Jitter buffer to prevent audio breaking
              const BUFFER_TIME = 0.15; // 150ms safety margin
              const currentTime = playbackContextRef.current.currentTime;
              let startTime = nextPlayTimeRef.current;

              if (startTime < currentTime) {
                startTime = currentTime + BUFFER_TIME;
              }

              source.start(startTime);
              nextPlayTimeRef.current = startTime + audioBuffer.duration;
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              if (playbackContextRef.current) {
                playbackContextRef.current.close();
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                playbackContextRef.current = new AudioContextClass({ sampleRate: 24000 });
                nextPlayTimeRef.current = playbackContextRef.current.currentTime;
              }
            }

            // Handle user transcription (if available)
            // The exact structure depends on the SDK, but usually it's in clientContent or similar
            // @ts-ignore - checking for undocumented or loosely typed fields
            const userText = message.clientContent?.turn?.parts?.find(p => p.text)?.text || message.clientContent?.text;
            if (userText) {
              setMessages(prev => [...prev, { role: 'user', text: userText, isFinal: true }]);
            }

            // Handle transcription (model output)
            // Note: The exact structure for transcription might vary. We check for text parts in modelTurn.
            const textPart = message.serverContent?.modelTurn?.parts?.find(p => p.text)?.text;
            if (textPart) {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'model' && !last.isFinal) {
                  return [...prev.slice(0, -1), { ...last, text: last.text + textPart }];
                } else {
                  return [...prev, { role: 'model', text: textPart, isFinal: false }];
                }
              });
            }

            if (message.serverContent?.turnComplete) {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'model') {
                  return [...prev.slice(0, -1), { ...last, isFinal: true }];
                }
                return prev;
              });
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopRecording();
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            setError("Connection error occurred.");
            setIsConnected(false);
            stopRecording();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (err: any) {
      console.error("Connection/Microphone error:", err);
      setError(err.message || "Failed to connect or access microphone.");
    }
  }, []);

  const startRecording = (sessionPromise: Promise<any>, stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        
        const bytes = new Uint8Array(pcm16.buffer);
        let binaryString = '';
        for (let i = 0; i < bytes.length; i++) {
          binaryString += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binaryString);

        sessionPromise.then((session: any) => {
          session.sendRealtimeInput({
            media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        });
      };

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0;

      source.connect(processor);
      processor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      setIsRecording(true);
    } catch (err: any) {
      console.error("Recording setup failed:", err);
      setError("Failed to start audio recording.");
    }
  };

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const disconnect = useCallback(() => {
    stopRecording();
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
      sessionRef.current = null;
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }
    setIsConnected(false);
  }, [stopRecording]);

  return {
    isConnected,
    isRecording,
    messages,
    error,
    connect,
    disconnect
  };
}
