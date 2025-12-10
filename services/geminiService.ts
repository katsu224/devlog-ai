import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, UserProfile, RoadmapData, ExamData, ExamResult, RoadmapNode } from '../types';
import { 
  generateRoadmapPrompt, 
  generateTopicTutorPrompt, 
  generateExamPrompt, 
  gradeExamPrompt, 
  generateModuleSummaryPrompt,
  assembleProjectWebPrompt
} from '../lib/aiPrompts';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export class GeminiService {
  private chat: Chat | null = null;
  private model = 'gemini-2.5-flash';

  constructor() {
    if (!apiKey) {
      console.warn("API Key is missing.");
    }
  }

  async generateRoadmap(profile: UserProfile): Promise<RoadmapData> {
    const prompt = generateRoadmapPrompt(profile);
    
    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || '{}';
    try {
      const cleanJson = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
      return JSON.parse(cleanJson) as RoadmapData;
    } catch (e) {
      console.error("Failed to parse roadmap JSON", e);
      throw new Error("Could not generate roadmap");
    }
  }

  async startChat(history: Message[], profile: UserProfile) {
    const geminiHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const systemPrompt = `Actúa como un Mentor Senior de Programación (Habla en ESPAÑOL).
    
    PERFIL USUARIO:
    Nombre: ${profile.name}
    Rol: ${profile.role}
    Nivel: ${profile.level}
    Meta: ${profile.goal}
    
    INSTRUCCIONES:
    Responde a las preguntas del usuario para ayudarle a alcanzar su meta. Sé socrático, fomenta el pensamiento crítico y proporciona ejemplos de código claros cuando sea necesario.`;

    this.chat = ai.chats.create({
      model: this.model,
      history: geminiHistory,
      config: {
        systemInstruction: systemPrompt,
      },
    });
  }

  async startTopicChat(history: Message[], topic: string, profile: UserProfile) {
    const geminiHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const systemPrompt = generateTopicTutorPrompt(topic, profile);

    this.chat = ai.chats.create({
      model: this.model,
      history: geminiHistory,
      config: {
        systemInstruction: systemPrompt,
      },
    });
  }

  async sendMessageStream(text: string): Promise<AsyncIterable<string>> {
    if (!this.chat) {
       throw new Error("Chat not initialized.");
    }

    const result = await this.chat.sendMessageStream({ message: text });
    
    return {
      async *[Symbol.asyncIterator]() {
        for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          if (c.text) {
            yield c.text;
          }
        }
      }
    };
  }

  async generateSummaryHtml(messages: Message[], includeErrors: boolean): Promise<string> {
    // Legacy method, kept for compatibility if needed, but we use the new flow now.
    return ""; 
  }

  // --- NEW INCREMENTAL WEB GENERATION ---

  async generateModuleSummary(node: RoadmapNode): Promise<string> {
    const history = node.data.chatHistory || [];
    // Limit context to save tokens, focus on model explanations
    const conversationText = history
        .map(m => `${m.role.toUpperCase()}: ${m.text}`)
        .join('\n')
        .slice(0, 15000); // Reasonable char limit

    const prompt = generateModuleSummaryPrompt(node.data.label, conversationText);

    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    let html = response.text || '';
    // Strip markdown blocks if present
    html = html.replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '');
    return html;
  }

  async assembleProjectWeb(nodes: RoadmapNode[], profile: UserProfile): Promise<string> {
    const completedNodes = nodes.filter(n => n.data.status === 'completed' && n.data.summaryHtml);
    
    if (completedNodes.length === 0) {
        throw new Error("No hay módulos completados con resumen generado.");
    }

    // Concatenate all HTML summaries
    const modulesHtml = completedNodes.map(n => `<!-- MODULE: ${n.data.label} -->\n${n.data.summaryHtml}`).join('\n\n');

    const prompt = assembleProjectWebPrompt(profile, modulesHtml);

    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    let html = response.text || '';
    html = html.replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '');
    return html;
  }

  // --- EXAM METHODS ---

  async generateExam(topic: string, profile: UserProfile): Promise<ExamData> {
    const prompt = generateExamPrompt(topic, profile);
    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text || '{}';
    try {
      const cleanJson = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
      return JSON.parse(cleanJson) as ExamData;
    } catch (e) {
      console.error("JSON Parse Error", e);
      throw new Error("Failed to generate exam");
    }
  }

  async gradeExam(topic: string, question: string, userAnswer: string): Promise<ExamResult> {
    const prompt = gradeExamPrompt(topic, question, userAnswer);
    const response = await ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text || '{}';
    try {
      const cleanJson = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
      return JSON.parse(cleanJson) as ExamResult;
    } catch (e) {
      console.error("JSON Parse Error", e);
      throw new Error("Failed to grade exam");
    }
  }
}

export const geminiService = new GeminiService();