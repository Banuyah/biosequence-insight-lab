from collections import Counter
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction

DNA_IUPAC = set("ACGTRYSWKMBDHVN")
RNA_IUPAC = set("ACGURYSWKMBDHVN")
PROTEIN_ALPHABET = set("ACDEFGHIKLMNPQRSTVWYBXZJUO*-")


def clean_sequence(sequence: str) -> str:
    """Remove FASTA headers and whitespace, then normalize to uppercase."""
    if not isinstance(sequence, str):
        raise ValueError("Sequence must be provided as text.")
    lines = [line.strip() for line in sequence.splitlines() if line.strip()]
    if not lines:
        raise ValueError("Please provide a sequence.")
    if any(line.startswith(">") for line in lines):
        lines = [line for line in lines if not line.startswith(">")]
    result = "".join("".join(lines).split()).upper()
    if not result:
        raise ValueError("No sequence characters were found.")
    return result


def validate_sequence(sequence: str, sequence_type: str) -> tuple[str, list[str]]:
    seq = clean_sequence(sequence)
    kind = sequence_type.lower()
    alphabets = {"dna": DNA_IUPAC, "rna": RNA_IUPAC, "protein": PROTEIN_ALPHABET}
    if kind not in alphabets:
        raise ValueError("sequence_type must be dna, rna, or protein.")
    allowed = alphabets[kind]
    invalid = sorted(set(seq) - allowed)
    if invalid:
        raise ValueError(
            f"Invalid {kind.upper()} character(s): {', '.join(invalid)}. "
            f"Please check the sequence type."
        )
    warnings = []
    if kind == "protein" and "*" in seq.rstrip("*"):
        warnings.append("Internal stop symbols (*) were found in the protein sequence.")
    if kind in ("dna", "rna") and any(base not in "ACGTU" for base in seq):
        warnings.append("Ambiguous IUPAC nucleotide symbols are present; some calculations may be approximate.")
    return seq, warnings


def analyze_sequence(sequence: str, sequence_type: str) -> dict:
    seq, warnings = validate_sequence(sequence, sequence_type)
    kind = sequence_type.lower()
    counts = Counter(seq)
    composition = [{"symbol": key, "count": counts[key]} for key in sorted(counts)]
    result = {
        "sequence_type": kind,
        "length": len(seq),
        "sequence": seq,
        "composition": composition,
        "warnings": warnings,
    }
    if kind == "dna":
        result["gc_percent"] = round(gc_fraction(seq) * 100, 3)
        result["a_count"] = counts.get("A", 0)
        result["c_count"] = counts.get("C", 0)
        result["g_count"] = counts.get("G", 0)
        result["t_count"] = counts.get("T", 0)
        result["n_count"] = counts.get("N", 0)
    elif kind == "rna":
        gc = counts.get("G", 0) + counts.get("C", 0)
        result["gc_percent"] = round(gc / len(seq) * 100, 3)
        result["a_count"] = counts.get("A", 0)
        result["c_count"] = counts.get("C", 0)
        result["g_count"] = counts.get("G", 0)
        result["u_count"] = counts.get("U", 0)
    else:
        result["amino_acid_count"] = len(seq.replace("*", "").replace("-", ""))
    return result


def reverse_complement(sequence: str) -> str:
    seq, _ = validate_sequence(sequence, "dna")
    return str(Seq(seq).reverse_complement())


def transcribe_dna(sequence: str) -> str:
    seq, _ = validate_sequence(sequence, "dna")
    return str(Seq(seq).transcribe())
