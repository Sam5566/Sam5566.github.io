"""Write plain-language summaries for new papers on Sam's INSPIRE profile.

Runs daily from .github/workflows/summaries.yml. For every paper on INSPIRE that has
neither a hand-written summary in index.html nor an entry in assets/summaries.json,
it asks Claude for a short summary of the abstract, and saves it to assets/summaries.json, which the site reads on load.

    python .github/scripts/summarize_papers.py            # needs ANTHROPIC_API_KEY
    python .github/scripts/summarize_papers.py --dry-run  # list what would be summarized
"""

import html
import json
import re
import sys
import urllib.request
from pathlib import Path

INSPIRE_ID = "1735317"
ROOT = Path(__file__).resolve().parents[2]
SUMMARIES = ROOT / "assets" / "summaries.json"
INDEX = ROOT / "index.html"
MODEL = "claude-opus-5-5"

SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
    },
    "required": ["summary"],
    "additionalProperties": False,
}


def inspire_papers():
    fields = "titles,abstracts,arxiv_eprints,control_number"
    url = (f"https://inspirehep.net/api/literature?q=authors.recid:{INSPIRE_ID}"
           f"&sort=mostrecent&size=100&fields={fields}")
    with urllib.request.urlopen(url, timeout=60) as r:
        hits = json.load(r)["hits"]["hits"]
    for h in hits:
        m = h["metadata"]
        abstracts = m.get("abstracts") or []
        abstract = next((a["value"] for a in abstracts if a.get("source") == "arXiv"),
                        abstracts[0]["value"] if abstracts else "")
        ax = (m.get("arxiv_eprints") or [{}])[0].get("value")
        yield {"key": ax or f"inspire:{h['id']}", "title": m["titles"][0]["title"], "abstract": abstract}


def hand_written(index_html):
    """arXiv IDs that already have a summary in index.html, and those summaries as style examples."""
    keys, examples = set(), []
    for m in re.finditer(r'<li class="ax" data-arxiv="([^"]+)">(.*?)</li>', index_html, re.S):
        p = re.search(r'<div class="abs"><div><p>(.*?)</p>', m.group(2), re.S)
        if p:
            keys.add(m.group(1))
            examples.append(html.unescape(re.sub(r"<[^>]+>", "", p.group(1))).strip())
    return keys, examples


def summarize(client, paper, examples):
    style = "\n\n".join(f"Example {i + 1}: {e}" for i, e in enumerate(examples))
    prompt = f"""Write the summary for a new paper on a physicist's personal website, \
for visitors who know some physics but not this subfield.

Match the length, tone and plainness of the existing summaries on the site:

{style}

Rules: three to five sentences, based only on the abstract below. Say what was done and what \
was found; keep every claim at the strength the abstract states it, and don't add context, \
motivation or significance that the abstract doesn't give. No hype words. Plain text, no \
LaTeX: write symbols as Unicode (for example [Fe/H] < −2). The site is written in the first \
person, so never refer to the site's owner in the third person; if the summary needs to mention their \
own role, use "I".

Title: {paper["title"]}

Abstract: {paper["abstract"]}"""

    response = client.beta.messages.create(
        model=MODEL,
        max_tokens=16000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        output_config={"effort": "medium", "format": {"type": "json_schema", "schema": SCHEMA}},
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason != "end_turn":
        print(f"  skipped ({response.stop_reason}); the site keeps showing the abstract")
        return None
    text = next(b.text for b in response.content if b.type == "text")
    return json.loads(text)


def main():
    dry_run = "--dry-run" in sys.argv
    summaries = json.loads(SUMMARIES.read_text()) if SUMMARIES.exists() else {}
    manual, examples = hand_written(INDEX.read_text())

    todo = [p for p in inspire_papers()
            if p["key"] not in summaries and p["key"] not in manual and p["abstract"]]
    if not todo:
        print("Every paper already has a summary.")
        return
    if dry_run:
        for p in todo:
            print(f"would summarize {p['key']}: {p['title']}")
        return

    import anthropic
    client = anthropic.Anthropic()
    for p in todo:
        print(f"summarizing {p['key']}: {p['title']}")
        result = summarize(client, p, examples)
        if result:
            summaries[p["key"]] = {"summary": result["summary"].strip()}
    SUMMARIES.write_text(json.dumps(summaries, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
