export async function generateRecipe(recipeText, { description, comments }) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const API_URL = "https://api.openai.com/v1/chat/completions";

  // Modello consigliato per costo/performance
  const MODEL = "gpt-4o-mini"; // Miglior rapporto qualità/prezzo

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY non trovata nelle variabili d'ambiente");
  }

  const systemPrompt = `Sei un assistente specializzato nella scrittura di ricette di cucina. Scrivi sempre in **italiano**. Il tuo compito è trasformare una trascrizione in una **ricetta completa e ben formattata** in **Markdown**.

## Regole da seguire:
- Scrivi solo in **italiano**
- Correggi errori evidenti nel testo (es. "aqua" → "acqua", "olivetta giasche" → "olive taggiasche")
- Se un ingrediente o quantità è incompleto, **stima con buon senso**
- Non aggiungere nulla che non sia nella trascrizione o descrizione
- Scrivi in modo chiaro, semplice e preciso (anche per chi cucina poco)
- Usa sempre **"minuti"**, **"grammi"**, **"ml"**, **"°C"** (niente abbreviazioni)
- Segui sempre e solo lo **schema Markdown** qui sotto
- **Non usare altri formati**

## Schema obbligatorio:
\`\`\`markdown
# [NOME RICETTA]

## 📝 Descrizione
[Breve descrizione del piatto - 2-3 frasi]

## 👥 Porzioni
[Numero di porzioni]

## ⏱️ Tempi
- **Preparazione:** [X minuti]
- **Cottura:** [X minuti]  
- **Totale:** [X minuti]

## 🥘 Ingredienti
- [quantità precisa] [ingrediente]
- [quantità precisa] [ingrediente]

## 🔧 Strumenti necessari
- [strumento 1]
- [strumento 2]

## 📋 Procedimento
### Fase 1: Preparazione
1. **[Azione specifica]** - [dettagli]

### Fase 2: Cottura
1. **[Azione specifica]** - [Temperatura: X°C, Tempo: X minuti]

### Fase 3: Finalizzazione
1. **[Azione specifica]** - [come servire o completare]

## 💡 Consigli
- [Consiglio utile]
- [Variante o sostituzione]

## 🏷️ Tag
\`[categoria]\` \`[difficoltà]\` \`[tipo-cottura]\` \`[tempo-preparazione]\`
\`\`\``;

  const userPrompt = `Trasforma questa trascrizione in una ricetta completa seguendo lo schema markdown specificato:

TRASCRIZIONE DEL REEL:
${recipeText}

${description ? `DESCRIZIONE DEL REEL INSTAGRAM: ${description}` : ""}
${comments ? `COMMENTI DEL REEL INSTAGRAM: ${comments}` : ""}

**IMPORTANTE - ANALISI DELLE QUANTITÀ**: 
Prima di scrivere la ricetta, leggi ATTENTAMENTE tutta la trascrizione e descrizione per identificare TUTTE le quantità specifiche menzionate. Se trovi dosi precise (es. "30 grammi di olio", "200ml di latte", "2 cucchiai di zucchero") devi usare ESATTAMENTE quelle quantità nella ricetta finale.

**PROCESSO OBBLIGATORIO**:
1. **Scansiona** tutta la trascrizione e descrizione per quantità specifiche
2. **Annota** tutte le dosi trovate prima di procedere
3. **Usa sempre** le quantità originali, mai inventarne di nuove
4. **Solo se mancano completamente** le dosi, stimale e aggiungi "(quantità stimata)"

**IMPORTANTE**: Analizza attentamente i commenti del reel per estrarre informazioni utili:
- Sostituzioni di ingredienti suggerite dagli utenti
- Consigli pratici di chi ha provato la ricetta
- Varianti e modifiche testate
- Errori comuni da evitare
- Suggerimenti per migliorare il risultato

Includi queste informazioni nella sezione "💡 Consigli" specificando che provengono dai commenti degli utenti (es. "Un utente suggerisce di sostituire X con Y per un risultato più cremoso").

Ricorda di:
- Correggere errori evidenti nella trascrizione
- Stimare quantità mancanti con buon senso
- Usare solo unità di misura complete (minuti, grammi, ml, °C)
- Seguire esattamente lo schema markdown con emoji
- Organizzare il procedimento in 3 fasi (Preparazione, Cottura, Finalizzazione)
- Arricchire i consigli con le informazioni utili dai commenti
`;
  const requestBody = {
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2000,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API Error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Risposta OpenAI non valida");
    }

    const markdownRecipe = data.choices[0].message.content.trim();

    // Metadata utili per debugging/monitoring
    const metadata = {
      model: data.model,
      usage: data.usage,
      finishReason: data.choices[0].finish_reason,
    };

    return {
      recipe: markdownRecipe,
      metadata,
    };
  } catch (error) {
    console.error("Errore nella generazione della ricetta:", error);

    // Gestione errori specifici
    if (error.message.includes("rate limit")) {
      throw new Error(
        "Limite di rate OpenAI raggiunto. Riprova tra qualche minuto.",
      );
    }

    if (error.message.includes("quota")) {
      throw new Error("Quota OpenAI esaurita. Verifica il tuo account.");
    }

    if (error.message.includes("401")) {
      throw new Error("API Key OpenAI non valida.");
    }

    throw error;
  }
}
