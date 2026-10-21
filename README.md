# BioSequence Insight Lab

A beginner-friendly bioinformatics web application built with **React + Vite**, **Python + Flask**, and **Biopython**. It provides interactive DNA, RNA, and protein sequence analysis, motif search, ORF detection, translation, protein properties, and global/local pairwise alignment.

> **Scope:** This is an educational and research-support tool, not a medical diagnostic system. Results depend on the selected genetic code, sequence quality, and algorithm settings.

## Features

- Paste a sequence or upload a FASTA (`.fa`, `.fasta`, `.fna`, `.faa`, `.txt`) file.
- Validate DNA, RNA, and protein sequence alphabets.
- Sequence statistics: length, nucleotide/amino-acid counts, GC percentage, and composition.
- DNA reverse complement and transcription to RNA.
- Translate coding DNA into a protein sequence.
- Detect open reading frames (ORFs) across all six reading frames.
- Search for a literal motif and show zero-based and one-based positions.
- Protein composition, molecular weight, aromaticity, instability index, and isoelectric point (when supported by Biopython).
- Global alignment (Needleman–Wunsch) and local alignment (Smith–Waterman) using configurable match, mismatch, and gap scores.
- Alignment visualization, score summary, and CSV/JSON report downloads.
- Sample data, API tests, and a responsive interface.

## Project structure

```text
biosequence-insight-lab/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app.py
│   ├── bioinformatics/
│   │   ├── __init__.py
│   │   ├── sequence_stats.py
│   │   ├── translation.py
│   │   ├── alignment.py
│   │   ├── motif_search.py
│   │   └── orf_detection.py
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py
│   └── requirements.txt
├── sample-data/
│   ├── sample_dna.fasta
│   ├── sample_rna.fasta
│   └── sample_protein.fasta
├── .gitignore
└── README.md
```

## Requirements

- Python 3.10+ (Python 3.11 or 3.12 recommended)
- Node.js 20+ and npm
- Internet access for initial package installation

## Run in VS Code on Windows

Open the extracted `biosequence-insight-lab` folder in VS Code.

### 1. Start the Flask backend

Open a PowerShell terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

The backend runs at `http://localhost:5000`.

Using `.\.venv\Scripts\python.exe` avoids PowerShell execution-policy issues with activation scripts. If you prefer activation, you can run `.\.venv\Scripts\Activate.ps1` after your system permits it.

### 2. Start the React frontend

Open a **second** terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

The Vite development server proxies `/api` requests to Flask on port 5000. Keep both terminals running.

## Run backend tests

From the project root:

```powershell
cd backend
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

Tests cover core API workflows and error handling. The test suite requires the backend dependencies to be installed.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/analyze` | Sequence validation and statistics |
| POST | `/api/transform` | Reverse complement or transcription |
| POST | `/api/translate` | Translate DNA to protein |
| POST | `/api/orfs` | Find ORFs in six frames |
| POST | `/api/motifs` | Find literal motif occurrences |
| POST | `/api/protein` | Protein composition and properties |
| POST | `/api/align` | Global or local pairwise alignment |

JSON request examples:

```json
{
  "sequence": "ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG",
  "sequence_type": "dna"
}
```

Alignment example:

```json
{
  "sequence_a": "GATTACA",
  "sequence_b": "GCATGCU",
  "mode": "global",
  "match": 2,
  "mismatch": -1,
  "gap": -2
}
```

## Upload to GitHub

1. Create a new empty repository named `biosequence-insight-lab`.
2. Open the extracted project folder in VS Code.
3. In the terminal at the project root:

```powershell
git init
git add .
git commit -m "Build BioSequence Insight Lab"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/biosequence-insight-lab.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. Do not commit `.venv`, `node_modules`, secrets, or private datasets; they are ignored by `.gitignore`.

## Deployment notes

- **Frontend:** deploy the `frontend` directory to a static hosting provider such as Vercel or Netlify.
- **Backend:** deploy `backend` to a Python-capable service. Set its start command to `gunicorn app:app` if using a provider that supports Gunicorn, and install `requirements.txt`.
- Set the frontend's API base URL to your deployed backend URL for production. The starter project uses Vite proxying for local development; the included `VITE_API_BASE_URL` setting supports a deployed API.
- Configure CORS for your deployed frontend origin before public deployment. Do not expose secrets or private clinical/genomic data.

## Scientific notes and limitations

- DNA and RNA are validated against IUPAC nucleotide ambiguity codes. Reverse complement and translation require a DNA sequence; ambiguous bases may translate to `X`.
- ORF detection uses start codon `ATG` and stop codons `TAA`, `TAG`, and `TGA`, in all six frames. This is a simple educational ORF finder, not a gene annotation pipeline.
- Motif search is a literal, case-insensitive search; overlapping matches are included.
- Pairwise alignment uses Biopython's `PairwiseAligner`. Scores and tie-breaking can vary with algorithm implementation/version.
- Protein properties require a protein sequence supported by Biopython's `ProteinAnalysis`; ambiguous/non-standard residues may be rejected or affect results.
- This app does not retrieve sequences from public databases and does not infer disease risk.

## License

MIT. See `LICENSE`.
