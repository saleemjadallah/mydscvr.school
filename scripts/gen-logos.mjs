import fs from 'fs';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('Set GEMINI_API_KEY env var'); process.exit(1); }
const MODEL = 'gemini-3-pro-image-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const BRAND_CONTEXT = `Brand: "mydscvr.ai" — an AI-powered school and nursery finder for Dubai families. Primary color: vibrant orange (#FF6B35). Secondary: deep navy (#0A1628) and purple (#A855F7). The brand is premium, modern, tech-forward but warm and approachable for parents. The name "mydscvr" is short for "my discover".`;

const LOGOS = [
  {
    name: 'logo-1-compass',
    prompt: `${BRAND_CONTEXT}

Design a clean, modern logo icon for "mydscvr.ai". The concept is a DISCOVERY COMPASS fused with a GRADUATION CAP. A stylized compass rose where the north pointer is shaped like a subtle graduation cap tassel. Use the brand orange (#FF6B35) as the primary color with navy (#0A1628) accents. Flat design, no gradients, vector-style with clean geometric shapes. The logo should work at small sizes (favicon) and large sizes. Solid white background. No text, just the icon mark. Professional, minimal, memorable. Square 1:1 composition.`,
  },
  {
    name: 'logo-2-lettermark',
    prompt: `${BRAND_CONTEXT}

Design a clean, modern lettermark logo for "mydscvr.ai". Create a stylized lowercase letter "m" that cleverly incorporates a magnifying glass or search lens into the letter form. The arches of the "m" could form the lens shape. Use brand orange (#FF6B35) as the primary color. Flat, geometric, vector-style design. No gradients, no 3D effects. The mark should be bold and instantly recognizable at any size. Solid white background. No additional text, just the single lettermark. Professional, Silicon Valley startup aesthetic. Square 1:1 composition.`,
  },
  {
    name: 'logo-3-ai-education',
    prompt: `${BRAND_CONTEXT}

Design a clean, modern logo icon for "mydscvr.ai". The concept combines AI (represented by a subtle sparkle/neural dot pattern) with EDUCATION (represented by an open book or school building silhouette). The AI sparkle dots orbit or emerge from the education symbol. Use brand orange (#FF6B35) and navy (#0A1628). Flat design, vector-style, clean geometric shapes. Minimal line weight, modern tech aesthetic. Should work as an app icon. Solid white background. No text, just the icon. Square 1:1 composition.`,
  },
  {
    name: 'logo-4-pin-learn',
    prompt: `${BRAND_CONTEXT}

Design a clean, modern logo icon for "mydscvr.ai". The concept is a LOCATION PIN whose interior negative space forms a LIGHTBULB or STAR shape — symbolizing "discovering the right place for learning." The pin shape is the primary form in brand orange (#FF6B35), with the interior cutout creating the secondary symbol. Flat, bold, geometric vector style. No gradients. Simple enough to work as a favicon. Solid white background. No text, just the icon mark. Modern, playful but professional. Square 1:1 composition.`,
  },
  {
    name: 'logo-5-abstract-eye',
    prompt: `${BRAND_CONTEXT}

Design a clean, modern abstract logo icon for "mydscvr.ai". The concept is a stylized EYE or LENS shape representing "discovery" and "insight." An almond/eye shape with a circular pupil that contains a subtle plus/cross shape (representing the "AI" aspect). Flowing, organic curves but with geometric precision. Use brand orange (#FF6B35) for the iris/pupil and navy (#0A1628) for the outer eye shape. Flat vector style, no gradients. Minimal and iconic — should be instantly memorable. Solid white background. No text. Square 1:1 composition.`,
  },
];

async function generateLogo(logo) {
  console.log(`Generating: ${logo.name}...`);

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: logo.prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    }),
  });

  if (!res.ok) {
    console.error(`  Failed ${logo.name}: ${res.status}`);
    return null;
  }

  const data = await res.json();
  for (const candidate of data.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        const ext = part.inlineData.mimeType?.includes('png') ? 'png' : 'webp';
        const outPath = `public/logos/${logo.name}.${ext}`;
        fs.mkdirSync('public/logos', { recursive: true });
        fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
        console.log(`  Saved: ${outPath}`);
        return outPath;
      }
    }
  }
  console.error(`  No image in response for ${logo.name}`);
  return null;
}

async function main() {
  console.log('Generating 5 logo variations with Nano Banana Pro...\n');
  for (const logo of LOGOS) {
    await generateLogo(logo);
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log('\nDone!');
}

main().catch(console.error);
