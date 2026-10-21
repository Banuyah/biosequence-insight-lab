from Bio.Seq import Seq
from .sequence_stats import validate_sequence


def translate_dna(sequence: str, frame: int = 0, to_stop: bool = False) -> dict:
    seq, warnings = validate_sequence(sequence, "dna")
    if frame not in (0, 1, 2):
        raise ValueError("Frame must be 0, 1, or 2.")
    coding = seq[frame:]
    remainder = len(coding) % 3
    if remainder:
        coding = coding[:-remainder]
        warnings.append(f"Trimmed {remainder} trailing base(s) so the sequence length is divisible by 3.")
    protein = str(Seq(coding).translate(to_stop=to_stop)) if coding else ""
    return {
        "frame": frame,
        "coding_sequence": coding,
        "protein_sequence": protein,
        "amino_acid_count": len(protein),
        "to_stop": to_stop,
        "warnings": warnings,
    }


def find_orfs(sequence: str, min_aa: int = 10) -> dict:
    """Find simple ATG-to-stop ORFs across all six frames, 1-based inclusive coordinates."""
    seq, warnings = validate_sequence(sequence, "dna")
    if min_aa < 1 or min_aa > 100000:
        raise ValueError("min_aa must be between 1 and 100000.")
    stop_codons = {"TAA", "TAG", "TGA"}
    orfs = []

    def scan(oriented: str, strand: str):
        for frame in range(3):
            starts = []
            for i in range(frame, len(oriented) - 2, 3):
                codon = oriented[i:i+3]
                if codon == "ATG":
                    starts.append(i)
                elif codon in stop_codons and starts:
                    for start in starts:
                        coding = oriented[start:i+3]
                        aa_len = len(coding) // 3
                        if aa_len >= min_aa:
                            if strand == "+":
                                start_pos, end_pos = start + 1, i + 3
                            else:
                                start_pos, end_pos = len(seq) - (i + 3) + 1, len(seq) - start
                            orfs.append({
                                "strand": strand,
                                "frame": frame,
                                "start": start_pos,
                                "end": end_pos,
                                "length_nt": len(coding),
                                "length_aa_including_stop": aa_len,
                                "protein_sequence": str(Seq(coding).translate()),
                            })
                    starts = []

    scan(seq, "+")
    scan(str(Seq(seq).reverse_complement()), "-")
    orfs.sort(key=lambda item: (item["start"], item["strand"], item["frame"]))
    return {"orfs": orfs, "count": len(orfs), "min_amino_acids": min_aa, "warnings": warnings}
