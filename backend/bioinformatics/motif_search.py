from .sequence_stats import clean_sequence


def find_motif(sequence: str, motif: str) -> dict:
    seq = clean_sequence(sequence)
    pattern = clean_sequence(motif)
    positions = []
    start = 0
    while True:
        idx = seq.find(pattern, start)
        if idx == -1:
            break
        positions.append({"start": idx + 1, "end": idx + len(pattern), "index_zero_based": idx})
        start = idx + 1  # include overlapping matches
    return {"sequence_length": len(seq), "motif": pattern, "count": len(positions), "positions": positions}
