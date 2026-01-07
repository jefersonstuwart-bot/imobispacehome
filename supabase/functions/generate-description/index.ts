import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, location, description, images } = await req.json();

    const prompt = `Você é um especialista em marketing imobiliário. Crie uma descrição persuasiva e profissional para o seguinte empreendimento imobiliário:

Nome: ${name}
Localização: ${location}
${description ? `Descrição base: ${description}` : ''}
${images?.length ? `Número de imagens disponíveis: ${images.length}` : ''}

A descrição deve:
- Ser envolvente e emocional, focada em conversão
- Destacar os benefícios de morar no local
- Usar linguagem profissional e persuasiva
- Ter entre 150-250 palavras
- Incluir chamadas à ação sutis
- Destacar qualidade de vida e investimento

Responda APENAS com a descrição, sem títulos ou formatação adicional.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error('Erro ao gerar descrição com IA');
    }

    const data = await response.json();
    const generatedDescription = data.choices[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ description: generatedDescription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
