from flask import Flask, jsonify, request
from flask_cors import CORS
from bioinformatics.sequence_stats import analyze_sequence, reverse_complement, transcribe_dna
from bioinformatics.translation import translate_dna, find_orfs
from bioinformatics.motif_search import find_motif
from bioinformatics.alignment import pairwise_align
from bioinformatics.protein import analyze_protein

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


def payload():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValueError("Request body must be a JSON object.")
    return data


def required_text(data, key):
    value = data.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"'{key}' is required and must be text.")
    return value


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "Request is too large. Please use a shorter sequence."}), 413


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "biosequence-insight-lab"})


@app.post("/api/analyze")
def analyze():
    try:
        data = payload()
        result = analyze_sequence(required_text(data, "sequence"), data.get("sequence_type", "dna"))
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@app.post("/api/transform")
def transform():
    try:
        data = payload()
        sequence = required_text(data, "sequence")
        operation = data.get("operation", "reverse_complement")
        if operation == "reverse_complement":
            result = reverse_complement(sequence)
        elif operation == "transcribe":
            result = transcribe_dna(sequence)
        else:
            raise ValueError("operation must be reverse_complement or transcribe.")
        return jsonify({"operation": operation, "result": result})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@app.post("/api/translate")
def translate():
    try:
        data = payload()
        result = translate_dna(required_text(data, "sequence"),
                               int(data.get("frame", 0)),
                               bool(data.get("to_stop", False)))
        return jsonify(result)
    except (ValueError, TypeError) as exc:
        return jsonify({"error": str(exc)}), 400


@app.post("/api/orfs")
def orfs():
    try:
        data = payload()
        result = find_orfs(required_text(data, "sequence"), int(data.get("min_aa", 10)))
        return jsonify(result)
    except (ValueError, TypeError) as exc:
        return jsonify({"error": str(exc)}), 400


@app.post("/api/motifs")
def motifs():
    try:
        data = payload()
        result = find_motif(required_text(data, "sequence"), required_text(data, "motif"))
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@app.post("/api/protein")
def protein():
    try:
        data = payload()
        result = analyze_protein(required_text(data, "sequence"))
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@app.post("/api/align")
def align():
    try:
        data = payload()
        result = pairwise_align(
            required_text(data, "sequence_a"),
            required_text(data, "sequence_b"),
            data.get("mode", "global"),
            data.get("match", 2),
            data.get("mismatch", -1),
            data.get("gap", -2),
        )
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


if __name__ == "__main__":
    app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024
    app.run(host="127.0.0.1", port=5000, debug=True)
