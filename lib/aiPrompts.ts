import { UserProfile } from '../types';

export const generateRoadmapPrompt = (profile: UserProfile): string => {
  return `Actúa como un Arquitecto de Software Senior y Mentor Educativo (Habla en Español).
  
  OBJETIVO:
  Crea un mapa de aprendizaje (Roadmap) técnico y detallado para un usuario con el siguiente perfil:
  - Rol: ${profile.role}
  - Nivel Actual: ${profile.level}
  - Meta Principal: ${profile.goal}
  
  FORMATO DE SALIDA (JSON ESTRICTO):
  Debes devolver un JSON con la estructura exacta para una librería de grafos.
  
  REGLAS DE NODOS:
  1. Genera entre 5 y 8 nodos clave para lograr la meta.
  2. Los nodos deben tener una secuencia lógica (dependencias).
  3. "status": El primer nodo debe ser "unlocked", el resto "locked".
  4. "position": Calcula coordenadas {x, y} aproximadas para un diseño de árbol vertical o horizontal fluido (espaciado de ~250px).
  5. Los textos deben estar en ESPAÑOL.
  
  ESTRUCTURA JSON:
  {
    "nodes": [
      { "id": "1", "type": "custom", "data": { "label": "Concepto", "status": "unlocked", "description": "Breve descripción" }, "position": { "x": 250, "y": 0 } }
    ],
    "edges": [
      { "id": "e1-2", "source": "1", "target": "2", "animated": true }
    ]
  }

  IMPORTANTE: Solo devuelve el JSON raw, sin bloques de código Markdown.`;
};

export const generateTopicTutorPrompt = (topic: string, profile: UserProfile): string => {
  return `Actúa como un Mentor Senior de Programación experto en Pedagogía (Habla en ESPAÑOL).
  
  TEMA A ENSEÑAR: "${topic}".
  PERFIL ALUMNO: ${profile.level} ${profile.role}.
  
  ### TU NUEVA METODOLOGÍA (ESTRICTA):
  1. **NO DES CONFERENCIAS:** No expliques todo el tema de golpe. Tu objetivo es la retención, no la velocidad.
  2. **EVALUACIÓN INICIAL:** Tu primera interacción (o cuando el usuario saluda) debe ser SIEMPRE preguntar qué sabe ya sobre "${topic}" para calibrar tu explicación.
  3. **ENSEÑANZA INCREMENTAL:**
     - Divide el tema en 3-4 micro-conceptos clave.
     - Explica SOLO UN concepto a la vez.
     - Sé breve y conciso. Evita respuestas de más de 150 palabras si es posible.
  4. **VERIFICACIÓN SOCRÁTICA:**
     - Después de cada pequeña explicación, haz una pregunta simple o pide un ejemplo al usuario para asegurar que entendió.
     - No avances al siguiente concepto hasta que el usuario haya respondido correctamente.
  
  ### FORMATO VISUAL:
  - Usa Markdown estructurado (Títulos H3, Listas).
  - Usa Emojis para dar calidez.
  - Si hay código, usa bloques con sintaxis coloreada.
  
  Tu meta es que el usuario DOMINE el tema paso a paso, sintiéndose acompañado, no abrumado.`;
};

export const generateExamPrompt = (topic: string, profile: UserProfile): string => {
  return `Genera un EXAMEN PRÁCTICO FINAL corto para validar que el usuario domina el tema: "${topic}".
  Idioma: ESPAÑOL.
  
  PERFIL USUARIO: ${profile.level} ${profile.role}.

  REQUISITOS:
  - Genera UN solo ejercicio o pregunta conceptual desafiante.
  - Si es programación, pide escribir un snippet de código.
  - Si es concepto, pide una explicación del "por qué" o "cómo funciona".
  
  SALIDA JSON:
  {
    "question": "El texto del ejercicio...",
    "type": "code" | "concept"
  }
  
  Devuelve SOLO el JSON.`;
};

export const gradeExamPrompt = (topic: string, question: string, userAnswer: string): string => {
  return `Actúa como un Profesor de Ingeniería. Evalúa esta respuesta.
  Idioma: ESPAÑOL.
  
  TEMA: ${topic}
  PREGUNTA: ${question}
  RESPUESTA DEL ESTUDIANTE: ${userAnswer}
  
  CRITERIO:
  - Si la respuesta demuestra entendimiento sólido, aprueba.
  - Si la respuesta es vaga, incorrecta o alucinada, reprueba.
  
  SALIDA JSON:
  {
    "passed": true | false,
    "feedback": "Texto breve explicando por qué aprobó o falló y cómo mejorar."
  }
  
  Devuelve SOLO el JSON.`;
};

export const generateModuleSummaryPrompt = (topic: string, chatHistory: string): string => {
  return `Actúa como un Diseñador Web UI/UX Experto.
  
  TAREA:
  Analiza el siguiente historial de chat educativo sobre el tema "${topic}" y crea un COMPONENTE HTML (Tarjeta/Sección) que resuma lo aprendido.
  
  INPUT CHAT:
  ${chatHistory}
  
  REQUISITOS DE DISEÑO:
  - Usa Tailwind CSS.
  - Diseño: "Dark Modern / Glassmorphism". Fondo oscuro (slate-800/50), bordes sutiles, sombras suaves.
  - Contenido:
    1. Un Título atractivo con un icono SVG (usa un svg string real inline) relacionado al tema.
    2. "Lo que aprendí": Puntos clave (bullet points) extraídos del chat.
    3. "Snippet Clave": Un bloque de código con lo más importante discutido (con colores simulados via clases de tailwind si es posible, o colores de texto simples).
  - El componente debe ser responsive (grid-col-1 en móvil).
  - IDIOMA: ESPAÑOL.
  
  OUTPUT:
  Devuelve SOLAMENTE el código HTML de este componente (sin <html>, <head> o <body>, solo el <div> contenedor).`;
};

export const assembleProjectWebPrompt = (profile: UserProfile, modulesHtml: string): string => {
  return `Actúa como un Desarrollador Frontend Senior.
  
  OBJETIVO:
  Ensambla una página web de portafolio completa ("Learning Log") combinando los módulos HTML que te daré a continuación.
  
  PERFIL: ${profile.name} - ${profile.role} (${profile.level}).
  META: ${profile.goal}.
  
  MÓDULOS HTML (Ya generados):
  ${modulesHtml}
  
  INSTRUCCIONES DE DISEÑO:
  1. Crea la estructura completa HTML5 (<!DOCTYPE html>, <html>, <head>, <body>).
  2. HEAD:
     - Incluye Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
     - Configura Tailwind para usar una fuente moderna (Inter o JetBrains Mono).
     - Agrega estilos custom para scrollbars y selección de texto.
  3. BODY:
     - Fondo: bg-slate-950 text-slate-200.
     - HERO SECTION: Un encabezado impresionante con el nombre del usuario, su meta, y una barra de progreso visual (calcula % basado en módulos completados). Usa gradientes (emerald-500 to cyan-500).
     - GRID SECTION: Un contenedor grid (grid-cols-1 md:grid-cols-2 gap-6) donde insertarás LITERALMENTE los bloques HTML de los módulos provistos.
     - FOOTER: "Generado con DevLog AI".
  4. INTERACTIVIDAD:
     - Agrega un script simple para animar la aparición de los elementos (fade-in) al hacer scroll.
  5. IDIOMA: Todo el texto de interfaz en ESPAÑOL.
  
  OUTPUT:
  Devuelve SOLAMENTE el código HTML completo.`;
};