#!/usr/bin/env python3
"""Generate blog post cover images for mydscvr.ai using NanoBanana Pro (Gemini 3 Pro Image)."""

import os
import asyncio
from google import genai

# API key from environment
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")
MODEL = "gemini-3-pro-image-preview"

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "blog")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BRAND_CONTEXT = (
    "Clean, modern, professional design. Brand color is warm orange (#FF6B35). "
    "No text, no logos, no watermarks, no words, no UI elements, no overlays. "
    "Just one seamless photograph. Photorealistic style. High quality, sharp, well-lit. "
    "Wide landscape 16:9 aspect ratio composition suitable for a blog header."
)

COVERS = [
    {
        "name": "how-to-choose-the-right-school-in-dubai",
        "prompt": (
            f"A warm, inviting wide landscape photo of a modern international school in Dubai. "
            f"The school has contemporary glass-and-white architecture with palm trees lining the entrance. "
            f"A diverse group of happy families — parents of different ethnicities with school-age children "
            f"in neat uniforms — walking toward the school entrance on a bright sunny Dubai morning. "
            f"Golden morning light casting warm shadows. Blue sky with a few wispy clouds. "
            f"The scene feels aspirational, welcoming, and full of possibility — the start of a new "
            f"chapter for families choosing education in Dubai. Shallow depth of field on the families "
            f"with the school building beautifully rendered in the background. {BRAND_CONTEXT}"
        ),
    },
    {
        "name": "british-vs-ib-curriculum-dubai",
        "prompt": (
            f"A wide landscape photograph of a bright, modern school classroom or library in Dubai "
            f"with two distinct zones blending together. On one side, students in classic British-style "
            f"uniforms (white shirts, ties) working with textbooks at desks. On the other side, students "
            f"in a more collaborative IB-style setting — a round table with laptops, a globe, science "
            f"equipment, and art materials. The room is flooded with natural light from large windows "
            f"showing Dubai's skyline in the background. The atmosphere is academic yet warm — diverse "
            f"teenagers engaged in learning. Modern, inspiring educational environment. {BRAND_CONTEXT}"
        ),
    },
    {
        "name": "school-fees-uae-complete-guide",
        "prompt": (
            f"A wide landscape photograph of a modern, premium school campus in Dubai with "
            f"impressive architecture — glass facades, manicured gardens, and a swimming pool visible "
            f"in the background. In the foreground, a diverse family (mother in elegant abaya, father "
            f"in business attire, and two school-age children in crisp uniforms) walking through the "
            f"school's grand entrance. The scene is bathed in warm golden morning light. A subtle visual "
            f"sense of investment and quality — the campus looks world-class. Palm trees frame the scene, "
            f"blue Dubai sky above. The mood is aspirational yet approachable — a family evaluating the "
            f"value of education. Shallow depth of field on the family with the campus in soft focus. {BRAND_CONTEXT}"
        ),
    },
    {
        "name": "curriculum-changes-12-year-school-path-uae",
        "prompt": (
            f"A wide landscape photograph showing the journey of education — a long, modern school "
            f"corridor with natural light streaming through floor-to-ceiling windows on one side. Along "
            f"the corridor, we see students at different stages: a small child (5-6 years old) in a "
            f"bright kindergarten area with colorful learning materials near the foreground, middle school "
            f"students (11-12 years old) working on a science project in the midground, and older "
            f"teenagers (17-18 years old) in graduation-style academic settings in the background — "
            f"creating a visual progression of the educational journey. The corridor has a modern Dubai "
            f"school aesthetic — clean lines, warm wood accents, greenery. Bright, optimistic lighting "
            f"suggesting growth and progression. Diverse students at each stage. {BRAND_CONTEXT}"
        ),
    },
]


async def generate_image(client, prompt: str, output_path: str, label: str):
    """Generate a single image."""
    print(f"  Generating: {label}...")
    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=MODEL,
            contents=[prompt],
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                image = part.as_image()
                image.save(output_path)
                print(f"  ✓ Saved: {output_path}")
                return True
        print(f"  ✗ No image in response for: {label}")
        return False
    except Exception as e:
        print(f"  ✗ Error generating {label}: {e}")
        return False


async def main():
    if not GOOGLE_API_KEY:
        print("Error: GOOGLE_API_KEY environment variable not set")
        return
    client = genai.Client(api_key=GOOGLE_API_KEY)

    print("=" * 60)
    print("mydscvr.ai Blog Cover Image Generator")
    print(f"Model: {MODEL} (NanoBanana Pro)")
    print(f"Covers: {len(COVERS)}")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 60)

    results = []
    for cover in COVERS:
        name = cover["name"]
        path = os.path.join(OUTPUT_DIR, f"{name}.jpg")
        success = await generate_image(client, cover["prompt"], path, name)
        results.append((name, success))
        await asyncio.sleep(2)

    print("\n" + "=" * 60)
    print("Results:")
    for name, success in results:
        status = "✓" if success else "✗"
        print(f"  [{status}] {name}.jpg")
    print(f"\nImages saved to: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
