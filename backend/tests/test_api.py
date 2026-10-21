import json
import unittest
from app import app


class BioSequenceApiTests(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def post(self, endpoint, data):
        return self.client.post(endpoint, data=json.dumps(data),
                                content_type="application/json")

    def test_health(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "ok")

    def test_dna_analysis_gc(self):
        response = self.post("/api/analyze", {"sequence": "ATGC", "sequence_type": "dna"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["length"], 4)
        self.assertEqual(response.get_json()["gc_percent"], 50.0)

    def test_invalid_dna_rejected(self):
        response = self.post("/api/analyze", {"sequence": "ATGX", "sequence_type": "dna"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid", response.get_json()["error"])

    def test_reverse_complement(self):
        response = self.post("/api/transform", {
            "sequence": "ATGC", "operation": "reverse_complement"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["result"], "GCAT")

    def test_transcription(self):
        response = self.post("/api/transform", {
            "sequence": "ATGC", "operation": "transcribe"
        })
        self.assertEqual(response.get_json()["result"], "AUGC")

    def test_translation(self):
        response = self.post("/api/translate", {"sequence": "ATGGCC", "frame": 0})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["protein_sequence"], "MA")

    def test_motif_overlapping(self):
        response = self.post("/api/motifs", {"sequence": "AAAA", "motif": "AA"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["count"], 3)

    def test_alignment(self):
        response = self.post("/api/align", {
            "sequence_a": "GATTACA", "sequence_b": "GATTACA", "mode": "global"
        })
        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.get_json()["score"], 0)

    def test_missing_sequence(self):
        response = self.post("/api/analyze", {"sequence_type": "dna"})
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
