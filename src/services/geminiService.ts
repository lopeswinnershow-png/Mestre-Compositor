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

### REGRAS PARA STYLE PROMPT ESTÚDIO (MANDATÓRIO)
Você deve gerar uma segunda versão do prompt de estilo chamada "stylePromptStudio".
Esta versão é estritamente para qualidade de estúdio (nível produtor/Grammy) e NUNCA deve conter elementos ao vivo.
- **Fórmula Definitiva:** Gênero + Produção + Mix + Vocais + Atmosfera + BPM
- **Termos Obrigatórios (use alguns ou todos dependendo do gênero):** Premium Studio Production, Ultra Clean Mix, Radio-Ready Mastering, Polished Lead Vocals, Wide Stereo Imaging, Warm Analog Saturation, Smooth Compression, Streaming Quality, Spotify-Ready Sound.
- **Bloqueio Semântico Final (SEMPRE ADICIONAR NO FINAL):** No Crowd, No Live Elements, No Ambient Noise, Controlled Reverb (short and clean), Studio-only recording, no live performance characteristics, no audience simulation.
- **Exemplo de Estrutura:** [Gênero], Ultra Clean Studio Production, Radio-Ready Commercial Mix, High-End Mastering, Crystal Clear Audio, Tight Bass (sidechained), Punchy Kick and Snare, Professional Studio Vocals (dry, upfront), Smooth Vocal Compression, Precise Stereo Imaging, Balanced EQ, Crisp High Frequencies, Deep Controlled Sub Bass, No Crowd, No Live Elements, No Ambient Noise, Controlled Reverb (short and clean), Studio-only recording, no live performance characteristics, no audience simulation, [BPM] BPM.

### FORMATO DE RESPOSTA (JSON)
Retorne um objeto JSON. **IMPORTANTE: Os campos "persona", "vocal" e "instrumental" DEVEM ser escritos em Português (PT-BR).**
{
  "musicName": "Nome da Música",
  "lyrics": "Letra completa com anotações inline [Vocal: ...][Inst: ...]",
  "stylePrompt": "Prompt técnico original para o Suno (Gênero, Humor, Instrumentos, BPM)",
  "stylePromptStudio": "Prompt técnico focado 100% em qualidade de Estúdio/Spotify-ready usando a fórmula definitiva",
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
  // Usa a chave vinda da variável 'mestrecomp' configurada na Vercel
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error('Chave "mestrecomp" não encontrada. Verifique se o nome está correto na Vercel e faça um novo Redeploy.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
            stylePromptStudio: { type: Type.STRING },
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
          required: ["musicName", "lyrics", "stylePrompt", "stylePromptStudio", "excludeStyles", "weirdness", "styleInfluence", "persona", "productionSummary"],
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
    
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('API_KEY_INVALID')) {
      throw new Error('A chave da API fornecida é inválida. Verifique se copiou corretamente.');
    }
    
    if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('UNAVAILABLE')) {
      throw new Error('O servidor da inteligência artificial está com muita demanda no momento. Por favor, aguarde alguns segundos e clique em gerar novamente.');
    }
    
    if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('O limite de uso gratuito da API foi atingido. Por favor, tente novamente mais tarde ou verifique os limites da sua conta no Google AI Studio.');
    }
    
    throw new Error('Ocorreu um erro de conexão com a inteligência artificial. Tente novamente.');
  }
}
