import fs from 'fs';

const API_KEY = 'AIzaSyAXVU8wEHHymCh-oZdgv4UJtLb8w2Q67us';
const MODEL = 'gemini-3-pro-image-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const BRAND = `Brand: "mydscvr.ai" — AI-powered school and nursery finder for Dubai families. Primary color: vibrant orange (#FF6B35). Secondary: deep navy (#0A1628). The name means "my discover."`;

const LOGOS = [
  // Compass variations
  {
    name: 'logo-1a-compass-minimal',
    prompt: `${BRAND}

Design a MINIMAL version of a discovery compass logo icon. A very simplified, geometric compass rose — just the essential pointed star shape with clean lines. The north pointer is slightly thicker or has a tiny tassel detail hinting at a graduation cap. Use ONLY brand orange (#FF6B35) — single color, no navy. Ultra-clean, flat, no gradients, no shading. Thick confident strokes. Should look perfect as a 32px favicon. Solid white background. No text. Square 1:1 composition.`,
  },
  {
    name: 'logo-1b-compass-shield',
    prompt: `${BRAND}

Design a compass + education logo icon inside a rounded square/shield shape. A stylized 4-point compass star centered inside a soft rounded square container. The top compass point subtly incorporates a graduation cap silhouette. Navy (#0A1628) for the rounded square container, orange (#FF6B35) for the compass star inside. Flat vector style, no gradients. Bold, app-icon ready. Solid white background. No text, just the icon. Square 1:1 composition.`,
  },
  {
    name: 'logo-1c-compass-ring',
    prompt: `${BRAND}

Design a refined compass logo icon. A thin circular ring in navy (#0A1628) with a bold, asymmetric compass needle inside — the needle is orange (#FF6B35), pointing northeast, with a small 4-point sparkle/star at its tip (representing AI discovery). The needle is modern and angular, not traditional. Minimal negative space design. Flat, geometric, vector-style. No gradients. Solid white background. No text. Square 1:1 composition.`,
  },
  // Lettermark variations
  {
    name: 'logo-2a-m-lens-navy',
    prompt: `${BRAND}

Design a two-tone version of the "m" lettermark with magnifying glass. A bold lowercase "m" where one arch forms a magnifying glass lens circle with a short handle. The letter body is navy (#0A1628) and the magnifying glass circle/handle is orange (#FF6B35). Clean, geometric, flat vector style. Thick confident letter strokes. No gradients, no 3D. Solid white background. No additional text. Square 1:1 composition.`,
  },
  {
    name: 'logo-2b-m-rounded',
    prompt: `${BRAND}

Design a softer, friendlier version of the "m" lettermark logo. A rounded, bubbly lowercase "m" where the middle hump seamlessly becomes a circular magnifying glass shape. Fully rounded terminals (no sharp corners anywhere). Single color: brand orange (#FF6B35). The style should feel warm and approachable — perfect for a family-focused brand. Flat design, no gradients. Solid white background. No text beyond the single letter. Square 1:1 composition.`,
  },
  {
    name: 'logo-2c-md-monogram',
    prompt: `${BRAND}

Design a "md" monogram lettermark logo for "mydscvr". The lowercase letters "m" and "d" are cleverly interlocked/overlapping, where the "d" also reads as a magnifying glass (the bowl of the "d" is the lens). Orange (#FF6B35) for the "m", navy (#0A1628) for the "d". The two letters share a common vertical stroke where they connect. Geometric, modern, flat vector style. No gradients. Solid white background. No additional text. Square 1:1 composition.`,
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
    console.error(`  Failed: ${res.status}`);
    return null;
  }

  const data = await res.json();
  for (const candidate of data.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        const ext = part.inlineData.mimeType?.includes('png') ? 'png' : 'webp';
        const outPath = `public/logos/${logo.name}.${ext}`;
        fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, 'base64'));
        console.log(`  Saved: ${outPath}`);
        return outPath;
      }
    }
  }
  console.error(`  No image in response`);
  return null;
}

async function main() {
  console.log('Generating 6 logo variations (3 compass + 3 lettermark)...\n');
  for (const logo of LOGOS) {
    await generateLogo(logo);
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log('\nDone!');
}

main().catch(console.error);
