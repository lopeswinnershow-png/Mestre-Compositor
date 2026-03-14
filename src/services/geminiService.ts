import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `Você é o "Mestre Compositor", um agente de IA de elite especializado em Suno AI.
Sua tarefa é seguir rigorosamente a estrutura de entrada fornecida e gerar uma composição musical profissional.

### LÓGICA DE PROCESSAMENTO (MANDATÓRIA)
1. **Idioma Alvo:** Identifique o idioma especificado em "TARGET LANGUAGE CONFIGURATION". Toda a letra deve ser escrita nesse idioma, independentemente do idioma da fonte de entrada.
2. **Análise da Fonte (INPUT SOURCE):**
   - Se for uma LETRA: Extraia estrutura, arco emocional e estilo. NUNCA copie o texto. Use apenas como guia performático.
   - Se for ESTILO: Siga as convenções, temas e fluxos rítmicos do gênero.
   - Se for ARTISTA: Emule o fraseado, vocabulário e padrões de fluxo característicos.
3. **Parâmetros Avançados:** Antes de gerar, determine internamente os parâmetros vocais, instrumentais e tonais baseados na análise.

### REQUISITOS DE SAÍDA (MANDATÓRIOS)
1. **Letra Original:** 100% nova, estruturada profissionalmente.
   - **ESPAÇAMENTO:** Use DUAS quebras de linha entre cada seção ([Intro], [Verse], [Chorus], etc.).
   - **ESTRUTURA:** Cada seção deve ser claramente identificada.
2. **Anotações Inline:** Cada seção DEVE incluir anotações técnicas ANTES dos versos daquela seção.
   - Formato: [Vocal: ...][Instrumental: ...][Dinâmica: ...]
   - As anotações devem estar em sua própria linha, logo abaixo do marcador de seção.
3. **Consistência Tonal:** Mantenha coerência com o estilo/artista.
4. **Resumo de Produção:** Após a letra, forneça um resumo detalhado de Vocal e Instrumental em Português (PT-BR).

### REGRAS DE FORMATAÇÃO (CRÍTICO)
- NUNCA gere blocos de texto maciços.
- Use quebras de linha frequentes para facilitar a leitura e o canto.
- Garanta que as tags de seção (ex: [Chorus]) estejam em linhas isoladas.
- As anotações técnicas devem ser ricas em detalhes mas concisas.

### REGRAS ABSOLUTAS
- **PRESERVAÇÃO DE ESTILO:** Não mude o gênero no meio da música. Não suavize o estilo.
- **LIMITE DE CARACTERES:** A letra gerada não deve exceder 4.700 caracteres.
- **NÃO GERE CIFRAS OU ACORDES.**

### REGRAS DE COMANDO ESPECIAL (AO VIVO)
- Se o usuário incluir a expressão "AO VIVO" (em qualquer parte do prompt), você DEVE obrigatoriamente adicionar os seguintes comandos técnicos ao campo "stylePrompt":
  Performance, Festival Crowd Energy, Live Crowd Chanting, DJ Set Performance, Processed Live Vocals, Sing-Along Anthem, Open-Air Festival, Mainstage TRAP Festival, Hands-Up Moment, Crowd Shouts, Hype Vocals, Call & Response Vocals, Ad-Libs Vocals, Chopped Vocals, Festival Vocal Atmosphere.

### FORMATO DE RESPOSTA (JSON)
Retorne um objeto JSON. **IMPORTANTE: Os campos "persona", "vocal" e "instrumental" DEVEM ser escritos em Português (PT-BR).**
{
  "musicName": "Nome da Música",
  "lyrics": "Letra completa com anotações inline [Vocal: ...][Inst: ...]",
  "stylePrompt": "Prompt técnico para o Suno (Gênero, Humor, Instrumentos, BPM)",
  "excludeStyles": "Estilos a evitar",
  "weirdness": 0-100,
  "styleInfluence": 0-100,
  "persona": "Descrição da persona (EM PORTUGUÊS PT-BR)",
  "productionSummary": {
    "vocal": "Resumo vocal detalhado (EM PORTUGUÊS PT-BR)",
    "instrumental": "Resumo instrumental detalhado (EM PORTUGUÊS PT-BR)"
  }
}`;

export async function generateComposition(input: string) {
  // Tenta pegar de várias formas para garantir compatibilidade com Vercel/Vite
  // Adicionado 'mestrecomp' como solicitado pelo usuário
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 (import.meta.env as any).VITE_mestrecomp ||
                 (process.env as any).mestrecomp;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error('Chave API não encontrada. Verifique se o nome da variável na Vercel está correto (ex: mestrecomp ou VITE_GEMINI_API_KEY) e faça um novo Redeploy.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ parts: [{ text: input }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            musicName: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            stylePrompt: { type: Type.STRING },
            excludeStyles: { type: Type.STRING },
            weirdness: { type: Type.INTEGER },
            styleInfluence: { type: Type.INTEGER },
            persona: { type: Type.STRING },
            productionSummary: {
              type: Type.OBJECT,
              properties: {
                vocal: { type: Type.STRING },
                instrumental: { type: Type.STRING }
              },
              required: ["vocal", "instrumental"]
            }
          },
          required: ["musicName", "lyrics", "stylePrompt", "excludeStyles", "weirdness", "styleInfluence", "persona", "productionSummary"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('O modelo não retornou nenhum conteúdo.');

    // Limpa possíveis blocos de código markdown se o modelo ignorar o mimeType
    const cleanJson = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error('Gemini Service Error:', error);
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('A chave da API fornecida é inválida. Verifique se copiou corretamente.');
    }
    throw error;
  }
}
