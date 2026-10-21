import { FileUp, Dna, RotateCcw } from 'lucide-react'

export default function SequenceInput({
  sequence, setSequence, sequenceType, setSequenceType, onAnalyze, loading,
}) {
  function loadSample() {
    setSequenceType('dna')
    setSequence('ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG')
  }

  async function onFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      setSequence(text)
    } catch {
      alert('Could not read this file.')
    }
    event.target.value = ''
  }

  return (
    <section className="panel input-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">WORKSPACE / 01</span>
          <h2>Sequence input</h2>
        </div>
        <span className="icon-chip"><Dna size={19} /></span>
      </div>
      <div className="input-toolbar">
        <label className="field-label" htmlFor="sequence-type">Sequence type</label>
        <select id="sequence-type" value={sequenceType} onChange={e => setSequenceType(e.target.value)}>
          <option value="dna">DNA</option>
          <option value="rna">RNA</option>
          <option value="protein">Protein</option>
        </select>
      </div>
      <textarea
        value={sequence}
        onChange={e => setSequence(e.target.value)}
        spellCheck="false"
        aria-label="Sequence input"
        placeholder={'>example_sequence\nATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG'}
      />
      <div className="input-footer">
        <span>{sequence.replace(/^>.*$/gm, '').replace(/\s/g, '').length.toLocaleString()} residues</span>
        <div className="button-row">
          <label className="button button-secondary upload-button">
            <FileUp size={16} /> Upload FASTA
            <input type="file" accept=".fa,.fasta,.fna,.faa,.txt,.fsa" onChange={onFile} hidden />
          </label>
          <button className="button button-secondary" onClick={loadSample} type="button"><RotateCcw size={15} /> Sample</button>
          <button className="button button-primary" onClick={onAnalyze} disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze sequence'}
          </button>
        </div>
      </div>
      <p className="field-help">FASTA headers and whitespace are handled automatically. Please select the matching sequence type.</p>
    </section>
  )
}
