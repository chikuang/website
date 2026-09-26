# RAG illustrations

## Practical-plan and research-direction illustrations

Added with the built-in `image_gen` tool on 2026-09-26. New selected assets:

- `static/resources/rag-illustrations/starting-plan-cute.jpg` (1122 × 1402): six planning steps, two columns and three rows.
- `static/resources/rag-illustrations/research-directions-cute.jpg` (1536 × 1024): five research questions.

Both use JPEG quality 85 and link to their full-size image from the article. Detailed text remains in native, initially collapsed disclosure sections. The first generated versions were polished with imagegen to replace dark/transparent background regions with an opaque cream background; no content editing was performed during JPEG conversion.

### starting-plan generation prompt

```text
Use case: scientific-educational. Create a cute infographic illustration for an English academic RAG tutorial. Kawaii hand-drawn watercolor storybook style matching the article: rounded friendly miniature robots, notebooks, source documents and magnifying glasses with simple dot eyes and gentle blush; pastel sky blue, periwinkle, peach and coral on warm cream paper; clean dark navy rounded lettering. Welcoming and polished. Each label must be large, crisp and correctly spelled, no long paragraphs. No brand logos, watermark, percentages, equations, numerical results or fake measured graphs. Generous blank margins. The image should explain concepts, not promise a reliable system.
Asset: portrait-to-square infographic, approximately 4:5. Exactly SIX distinct generously spaced illustrated cards arranged in TWO COLUMNS and THREE ROWS, numbered in reading order left-to-right then top-to-bottom: row 1 steps 1 and 2; row 2 steps 3 and 4; row 3 steps 5 and 6. No connecting arrows needed. Exact headings, one per card: "1. Set the scope"; "2. Track sources"; "3. Build a baseline"; "4. Label the evidence"; "5. Compare trade-offs"; "6. Re-test changes". Scene 1 a small research question card inside a clearly bounded circle with a friendly notebook. Scene 2 document cards with attached ID tags organized in a little file shelf, a tiny key represents permissions. Scene 3 a magnifying glass searching just a few documents beside a simple small robot, a minimal starting system. Scene 4 two friendly pencils labeling source passages together, one unsure question-mark bubble conveying annotation disagreement. Scene 5 a small balance weighs answer/evidence cards against a little clock and budget tokens, no numeric scores. Scene 6 a small robot uses a magnifying glass to check a newly revised document with a gentle circular update arrow. The only text is the SIX EXACT HEADINGS, plus a small top title "A practical RAG starting plan". This is a visual checklist of research steps, not a mandatory linear runtime pipeline. No steps omitted or duplicated.
```

### research-directions generation prompt

```text
Use case: scientific-educational. Create a cute infographic illustration for an English academic RAG tutorial. Kawaii hand-drawn watercolor storybook style matching the article: rounded friendly miniature robots, notebooks, source documents and magnifying glasses with simple dot eyes and gentle blush; pastel sky blue, periwinkle, peach and coral on warm cream paper; clean dark navy rounded lettering. Welcoming and polished. Each label must be large, crisp and correctly spelled, no long paragraphs. No brand logos, watermark, percentages, equations, numerical results or fake measured graphs. Generous blank margins. The image should explain concepts, not promise a reliable system.
Asset: landscape conceptual map, approximately 3:2. At the center place a friendly small blue research robot holding a notebook headed exactly "RAG research". Around it arrange FIVE spacious illustrated thought-cloud islands with legible headings; no directional arrows or implied step order. Exact island headings: "Human disagreement"; "Missing evidence"; "Distribution shift"; "Competing objectives"; "When to stop". Human disagreement: two cute pencils with different small label symbols on one document and a question mark. Missing evidence: a magnifying glass looking at an empty gap among document cards, do not imply that the answer exists. Distribution shift: an old blue document collection changing to a different peach document collection, no numbers. Competing objectives: an answer-source pair, clock and cost tokens resting on a small balance. When to stop: a small robot choosing among a magnifying glass, a speech bubble to ask a human, and a pause symbol. Keep meanings distinct, no green guaranteed-correct marks. ONLY the center heading and five exact island headings are text. Clear spacing, harmonious composition, no decorative landscape that makes the educational scenes small.
```

### Final background edit (applied to both images)

```text
Edit target: this cute scientific infographic. Make a single targeted correction: replace ALL dark, gray, black, noisy, transparent or vignetted background regions, including the outer edges and gaps between panels, with a completely opaque, clean, warm ivory cream background (#FFFBF3). Remove gray/black gradient shadows and rough noisy halos. Keep the gentle watercolor pastel clouds/panels and clean outlines, but no dark gradients anywhere. Preserve exactly all existing labels, text spelling, numbering, characters, educational objects, composition, aspect ratio and layout. Do not add, remove or rearrange educational elements. This image will sit on a white academic webpage. The result must be fully opaque with tidy soft pastel edges and generous clean cream margins, not a transparency cutout. Only correct the background; keep the cute artwork intact.
```

Final generated PNG originals:

- Starting plan: `/Users/chikuang/.codex/generated_images/01a0b7e7-dd44-7312-b076-f948b906f2f0/exec-847f2f66-85e5-4b17-ba78-bb6fe10e7d99.png`
- Research directions: `/Users/chikuang/.codex/generated_images/01a0b7e7-dd44-7312-b076-f948b906f2f0/exec-28a23fcf-81f3-411b-95b6-8c7d7ecfa412.png`

## Original workflow illustration

Created with the built-in `image_gen` tool on 2026-09-26, following the user's preference for cute illustrations.

Saved website asset: `static/resources/rag-illustrations/workflow-cute.jpg`.
Original generated PNG: `/Users/chikuang/.codex/generated_images/01a0b7e7-dd44-7312-b076-f948b906f2f0/exec-891071d4-2a45-4292-bae0-b42036177ac4.png`.

The website copy retains the original 1942 × 809 dimensions and uses JPEG quality 85. It is a conceptual illustration, not a measured system result. The two numerical article figures are generated from toy/simulated examples by R.

## Final generation prompt

```text
Use case: scientific-educational. Create an original cute landscape workflow illustration, about 2.4:1, for an English academic tutorial on retrieval-augmented generation (RAG). Kawaii hand-drawn watercolor storybook art, soft rounded shapes, gentle dot-eye smiles and blush on a few objects, pastel sky blue, periwinkle, peach and coral, warm cream background, clean dark blue large readable lettering. Keep uncluttered and scholarly enough for a statistics website. Five spacious stages in a single left-to-right row with unambiguous right-pointing arrows: 1 a smiling question speech bubble above a notebook, heading exactly "1. Ask"; 2 a friendly magnifying glass searching an indexed bookshelf of papers, heading "2. Retrieve"; 3 several document cards ordered with the most relevant on top, heading "3. Rerank"; 4 a small friendly round robot writing an answer with two little source-document icons attached, heading "4. Cite"; 5 a magnifying glass examining the answer side by side with its source document, heading "5. Verify". Beneath the last stage put ONLY the small caption "Answer or abstain". No green guaranteed-correct badge: verification is a check and may lead to abstention. No numbers other than the five step numbers. These five headings and final caption are the ONLY text. No equations, fake numerical results, brand marks or watermark. Give generous margins, avoid cropping, preserve readability at article width. This is a conceptual illustration of a RAG workflow, not a measured result.
```
