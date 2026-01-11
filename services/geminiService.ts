
import { GoogleGenAI, Type } from "@google/genai";
import { AIResult } from "../types";

export const analyzeVehicleImage = async (base64Image: string): Promise<AIResult | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    
    // Using gemini-3-flash-preview for speed and JSON output reliability
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image.split(',')[1] || base64Image,
              },
            },
            {
              text: `Atue como um perito veicular. Analise a imagem e extraia rigorosamente os dados solicitados em formato JSON. 
              Extraia a placa (padrão Mercosul ou antigo), a marca do veículo, o modelo e qualquer número de IMEI visível em etiquetas de rastreadores.
              Se algum campo não for identificado, retorne como string vazia ou array vazio para IMEI.
              NÃO inclua nenhuma explicação adicional fora do JSON.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            placa: { type: Type.STRING, description: 'License plate of the vehicle' },
            marca: { type: Type.STRING, description: 'Car brand/make' },
            modelo: { type: Type.STRING, description: 'Car model' },
            imei: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'List of detected IMEIs'
            },
          },
          required: ["placa", "marca", "modelo", "imei"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) return null;

    try {
      return JSON.parse(resultText) as AIResult;
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON", resultText);
      return null;
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
