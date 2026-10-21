from Bio.SeqUtils.ProtParam import ProteinAnalysis
from .sequence_stats import validate_sequence


def analyze_protein(sequence: str) -> dict:
    seq, warnings = validate_sequence(sequence, "protein")
    clean = seq.replace("*", "").replace("-", "")
    if not clean:
        raise ValueError("Provide at least one amino-acid residue.")
    invalid_for_props = sorted(set(clean) - set("ACDEFGHIKLMNPQRSTVWY"))
    result = {
        "sequence": seq,
        "length": len(clean),
        "composition": [{"symbol": aa, "count": count} for aa, count in sorted(
            __import__("collections").Counter(clean).items()
        )],
        "warnings": warnings,
    }
    if invalid_for_props:
        result["properties_available"] = False
        result["properties_note"] = (
            "Some residues are ambiguous or non-standard; physicochemical properties "
            "are only calculated for the 20 standard amino acids."
        )
        return result
    analysis = ProteinAnalysis(clean)
    result["properties_available"] = True
    result["molecular_weight_da"] = round(analysis.molecular_weight(), 3)
    result["isoelectric_point"] = round(analysis.isoelectric_point(), 3)
    result["aromaticity"] = round(analysis.aromaticity(), 4)
    result["instability_index"] = round(analysis.instability_index(), 3)
    result["gravy"] = round(analysis.gravy(), 4)
    return result
