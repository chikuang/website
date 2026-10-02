# Institution logos

Local assets live in `static/images/institutions/`. All six marks are
transparent SVGs displayed proportionally, with no background panels.

| Institution | Original artwork |
| --- | --- |
| University of Victoria | [Legacy horizontal shield and full name](https://www.freelogovectors.net/svg17/university_of-victoria-logo-freelogovectors.net.svg), with the blue gradient from the [archived vector crest](https://www.freelogovectors.net/svg17/university-of-victoria-logo-freelogovectors.net.svg) |
| University of Waterloo | [Official horizontal vector](https://uwaterloo.ca/profiles/uw_base_profile/modules/custom/uw_wcms_ohana/dist/images/uwaterloo-logo.svg) |
| McGill University | [Official red logo](https://www.mcgill.ca/visual-identity/sites/all/themes/moriarty/images/logo-red.svg) and [reverse logo](https://www.mcgill.ca/sites/all/themes/coltrane19/dist/mcgill-logo-red-reverse.db74b099.svg) |
| Mila | [Official vector](https://mila.quebec/sites/default/themes/mila_v1/logo.svg) |
| CANSSI | [Official green symbol](https://canssi.ca/wp-content/uploads/Primary-Logo.svg), also used inline in the introduction |
| Georgia State University | [Stacked vector sourced from a GSU brochure](https://commons.wikimedia.org/wiki/File:Georgia_State_University_Logo.svg); [official color and reverse-logo guidance](https://commkit.gsu.edu/university-logos/) |

Retrieved September 19, 2026. The current website uses compact symbols without
university names: the UVic, Waterloo and McGill shields, Mila's network symbol,
CANSSI's green symbol and the GSU flame. Vector paths and proportions are
preserved. UVic retains its traditional blue, red and gold gradient shield.
Mila and GSU have light/dark variants; the other symbols retain their colors
across all three site themes.

Unused full-name and stacked variants were removed from both repositories.
The original artwork remains linked above, and previous local copies are
recoverable from Git history.

The marks belong to their respective institutions and identify the author’s
education and affiliations.

## Inline marks

Home introduction links use compact marks next to the institution name. The
Waterloo and McGill shields and GSU flame reuse the vector paths above, with
tight view boxes for legibility at text size. Mila uses the network symbol from
the original light/dark logo artwork. CANSSI uses its transparent green [official symbol](https://canssi.ca/wp-content/uploads/Primary-Logo.svg),
retrieved from the institution's homepage on September 19, 2026.

GSU's Brains & Behavior program, Neuroscience Institute, and Center for Cosmic
Ray Studies use their parent university's flame; Waterloo's Health Data Science
Lab uses the Waterloo shield. These indicate the parent institution rather
than claiming to be separate program logos. Original destination links remain.
The adjacent text supplies the accessible name, so inline images are decorative.
Mappings are in `data/inline_institutions.json`; paragraph rendering is handled
by `layouts/partials/institution-text.html` without client-side JavaScript.

Thesis entries use the Waterloo shield and a compact `uvic-mark.svg` extracted
from the legacy UVic artwork linked above. The UVic shield retains its original
vector paths and blue, red, and gold colors; the wordmark is omitted at inline size.
