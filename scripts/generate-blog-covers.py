#!/usr/bin/env python3
"""Generate blog post cover images for mydscvr.ai using NanoBanana Pro (Gemini 3 Pro Image)."""

import os
import asyncio
from google import genai

# API key
GOOGLE_API_KEY = "AIzaSyCdPv3z5Ydr6eukvAyiXdgKIN9sHGCa2_s"
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
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
    client = genai.Client()

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
