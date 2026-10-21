from Bio.Align import PairwiseAligner
from .sequence_stats import clean_sequence


def pairwise_align(sequence_a: str, sequence_b: str, mode: str = "global",
                   match: float = 2, mismatch: float = -1, gap: float = -2) -> dict:
    a = clean_sequence(sequence_a)
    b = clean_sequence(sequence_b)
    if len(a) > 10000 or len(b) > 10000:
        raise ValueError("Sequences are limited to 10,000 characters each for this interactive alignment.")
    if mode not in ("global", "local"):
        raise ValueError("mode must be global or local.")
    try:
        match = float(match)
        mismatch = float(mismatch)
        gap = float(gap)
    except (TypeError, ValueError):
        raise ValueError("Alignment scores must be numeric.")
    aligner = PairwiseAligner()
    aligner.mode = mode
    aligner.match_score = match
    aligner.mismatch_score = mismatch
    aligner.open_gap_score = gap
    aligner.extend_gap_score = gap
    alignments = aligner.align(a, b)
    if len(alignments) == 0:
        raise ValueError("No alignment could be generated.")
    best = alignments[0]
    rendered = str(best)
    # Parse Biopython's FASTA-formatted alignment to avoid displaying coordinate labels.
    fasta_text = best.format("fasta")
    fasta_lines = [line.strip() for line in fasta_text.splitlines() if line.strip()]
    aligned_records = [line for line in fasta_lines if not line.startswith(">")]
    aligned_a = aligned_records[0] if len(aligned_records) > 0 else ""
    aligned_b = aligned_records[1] if len(aligned_records) > 1 else ""
    marker = "".join("|" if x == y else " " if x == "-" or y == "-" else "."
                      for x, y in zip(aligned_a, aligned_b))
    return {
        "mode": mode,
        "score": float(best.score),
        "aligned_sequence_a": aligned_a,
        "match_line": marker,
        "aligned_sequence_b": aligned_b,
        "alignment_count": len(alignments),
        "algorithm": str(aligner.algorithm),
        "match_score": match,
        "mismatch_score": mismatch,
        "gap_score": gap,
        "formatted": rendered,
    }
