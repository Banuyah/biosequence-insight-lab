import { useMemo, useState } from 'react'
import {
  Activity, AlignLeft, ArrowLeftRight, Atom, BarChart3, BookOpen, CheckCircle2,
  ChevronRight, CircleHelp, ClipboardList, Code2, Dna, Download, FlaskConical,
  GitCompareArrows, Microscope, Search, ShieldCheck, Sparkles, Terminal, Waves,
} from 'lucide-react'
import { apiPost } from './services/api'
import Metric from './components/Metric'
import SequenceInput from './components/SequenceInput'
import CompositionChart from './components/CompositionChart'

const sampleDNA = 'ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG'
const sampleProtein = 'MKWVTFISLLFLFSSAYS'

function saveFile(name, content, type = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

function downloadCSV(result) {
  const rows = [['Metric', 'Value']]
  Object.entries(result).forEach(([key, value]) => {
    if (Array.isArray(value) || (value && typeof value === 'object')) return
    rows.push([key, String(value ?? '')])
  })
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
  saveFile('biosequence-analysis.csv', csv, 'text/csv;charset=utf-8')
}

function App() {
  const [sequence, setSequence] = useState(sampleDNA)
  const [sequenceType, setSequenceType] = useState('dna')
  const [activeTab, setActiveTab] = useState('overview')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [transformResult, setTransformResult] = useState('')
  const [translation, setTranslation] = useState(null)
  const [orfResult, setOrfResult] = useState(null)
  const [motif, setMotif] = useState('ATG')
  const [motifResult, setMotifResult] = useState(null)
  const [proteinSequence, setProteinSequence] = useState(sampleProtein)
  const [proteinResult, setProteinResult] = useState(null)
  const [seqA, setSeqA] = useState('GATTACA')
  const [seqB, setSeqB] = useState('GCATGCU')
  const [alignMode, setAlignMode] = useState('global')
  const [match, setMatch] = useState(2)
  const [mismatch, setMismatch] = useState(-1)
  const [gap, setGap] = useState(-2)
  const [alignment, setAlignment] = useState(null)

  const residueCount = useMemo(() => sequence.replace(/^>.*$/gm, '').replace(/\s/g, '').length, [sequence])

  async function runAction(action, callback) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await action()
      callback(result)
      setNotice('Analysis completed successfully.')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function runAnalyze() {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const result = await apiPost('analyze', { sequence, sequence_type: sequenceType })
      setAnalysis(result)
      setNotice('Sequence analyzed successfully.')
      setActiveTab('overview')
    } catch (err) {
      setError(err.message || 'Could not analyze sequence.')
    } finally {
      setLoading(false)
    }
  }

  async function runTransform(operation) {
    await runAction(() => apiPost('transform', { sequence, operation }), result => {
      setTransformResult(result.result)
    })
  }

  async function runTranslate() {
    await runAction(() => apiPost('translate', { sequence, frame: 0, to_stop: false }), setTranslation)
  }

  async function runORFs() {
    await runAction(() => apiPost('orfs', { sequence, min_aa: 1 }), setOrfResult)
  }

  async function runMotif() {
    await runAction(() => apiPost('motifs', { sequence, motif }), setMotifResult)
  }

  async function runProtein() {
    await runAction(() => apiPost('protein', { sequence: proteinSequence }), setProteinResult)
  }

  async function runAlignment() {
    await runAction(() => apiPost('align', {
      sequence_a: seqA, sequence_b: seqB, mode: alignMode,
      match: Number(match), mismatch: Number(mismatch), gap: Number(gap),
    }), setAlignment)
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sequence', label: 'Sequence tools', icon: Dna },
    { id: 'alignment', label: 'Pairwise alignment', icon: GitCompareArrows },
    { id: 'protein', label: 'Protein explorer', icon: Atom },
    { id: 'guide', label: 'Method guide', icon: BookOpen },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Dna size={23} /></div>
          <div><strong>BioSequence</strong><span>INSIGHT LAB</span></div>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(item.id); setError(''); setNotice('') }}>
                <Icon size={17} /><span>{item.label}</span>{activeTab === item.id && <ChevronRight size={15} className="nav-chevron" />}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status"><span className="status-dot" /><span>Local research workspace</span></div>
          <div className="sidebar-note"><ShieldCheck size={17} /><span>Educational use<br />No clinical diagnosis</span></div>
          <span className="version-label">VERSION 1.0.0</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Bioinformatics</span><ChevronRight size={14} /><strong>{navItems.find(item => item.id === activeTab)?.label}</strong></div>
          <div className="topbar-right"><span className="status-pill"><span className="status-dot" /> Local mode</span><div className="avatar">BL</div></div>
        </header>

        <div className="page-content">
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow"><Sparkles size={13} /> BIOINFORMATICS WORKBENCH</span>
              <h1>Explore the language<br /><em>of life.</em></h1>
              <p>Analyze biological sequences, compare patterns, and turn raw residues into clear, interpretable insights.</p>
              <div className="hero-meta"><span><Activity size={15} /> Sequence analytics</span><span><Waves size={15} /> Pairwise alignment</span><span><Microscope size={15} /> Protein properties</span></div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orb orb-one" /><div className="orb orb-two" />
              <div className="helix helix-a"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
              <div className="helix helix-b"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
              <div className="art-label label-top">DNA / RNA</div><div className="art-label label-bottom">A T G C</div>
            </div>
          </section>

          {error && <div className="alert alert-error" role="alert"><CircleHelp size={18} /><span>{error}</span></div>}
          {notice && !error && <div className="alert alert-success" role="status"><CheckCircle2 size={18} /><span>{notice}</span></div>}

          {activeTab === 'overview' && (
            <>
              <div className="section-title-row"><div><span className="eyebrow">YOUR WORKSPACE</span><h2>Analysis overview</h2></div><span className="subtle-tag">01 / 05</span></div>
              <SequenceInput {...{ sequence, setSequence, sequenceType, setSequenceType }} onAnalyze={runAnalyze} loading={loading} />
              <div className="metrics-grid">
                <Metric label="Sequence length" value={analysis?.length?.toLocaleString() ?? '—'} hint="residues" />
                <Metric label="GC content" value={analysis?.gc_percent != null ? `${analysis.gc_percent}%` : '—'} hint="DNA / RNA" />
                <Metric label="Sequence type" value={analysis?.sequence_type?.toUpperCase() ?? '—'} hint="validated alphabet" />
                <Metric label="Distinct symbols" value={analysis?.composition?.length ?? '—'} hint="unique characters" />
              </div>
              <div className="two-column">
                <section className="panel">
                  <div className="panel-heading"><div><span className="eyebrow">COMPOSITION</span><h2>Residue distribution</h2></div><span className="icon-chip"><BarChart3 size={18} /></span></div>
                  <CompositionChart items={analysis?.composition} />
                  {analysis?.warnings?.map((warning, i) => <p className="warning-text" key={i}>Note: {warning}</p>)}
                </section>
                <section className="panel quick-actions">
                  <div className="panel-heading"><div><span className="eyebrow">QUICK ACTIONS</span><h2>Sequence utilities</h2></div><span className="icon-chip"><Terminal size={18} /></span></div>
                  <button className="action-row" onClick={() => runTransform('reverse_complement')} disabled={busy}><span className="action-icon"><ArrowLeftRight size={17} /></span><span><strong>Reverse complement</strong><small>Generate complementary DNA strand</small></span><ChevronRight size={16} /></button>
                  <button className="action-row" onClick={() => runTransform('transcribe')} disabled={busy}><span className="action-icon"><Activity size={17} /></span><span><strong>Transcribe to RNA</strong><small>Replace thymine with uracil</small></span><ChevronRight size={16} /></button>
                  <button className="action-row" onClick={runTranslate} disabled={busy}><span className="action-icon"><Code2 size={17} /></span><span><strong>Translate DNA</strong><small>Convert codons into amino acids</small></span><ChevronRight size={16} /></button>
                  {(transformResult || translation) && <div className="result-box"><div className="result-box-heading">Latest result <button onClick={() => { setTransformResult(''); setTranslation(null) }}>Clear</button></div><code>{transformResult || translation?.protein_sequence}</code></div>}
                </section>
              </div>
              <section className="panel feature-strip">
                <div className="feature-icon"><FlaskConical size={20} /></div><div><h3>Built for learning and exploration</h3><p>Each tool connects core bioinformatics concepts with transparent outputs you can inspect, compare, and export.</p></div><button className="text-button" onClick={() => setActiveTab('guide')}>Explore methods <ChevronRight size={16} /></button>
              </section>
            </>
          )}

          {activeTab === 'sequence' && (
            <>
              <div className="section-title-row"><div><span className="eyebrow">DNA / RNA TOOLKIT</span><h2>Sequence tools</h2><p>Run transformations, locate motifs, and inspect open reading frames.</p></div><span className="subtle-tag">02 / 05</span></div>
              <SequenceInput {...{ sequence, setSequence, sequenceType, setSequenceType }} onAnalyze={runAnalyze} loading={loading} />
              <div className="tool-grid">
                <section className="panel">
                  <div className="panel-heading"><div><span className="eyebrow">TRANSFORMATION</span><h2>DNA utilities</h2></div><span className="icon-chip"><ArrowLeftRight size={18} /></span></div>
                  <p className="muted">These operations require a valid DNA sequence.</p>
                  <div className="button-row wrap"><button className="button button-secondary" onClick={() => runTransform('reverse_complement')} disabled={busy}>Reverse complement</button><button className="button button-primary" onClick={() => runTransform('transcribe')} disabled={busy}>Transcribe to RNA</button></div>
                  {transformResult && <div className="result-box"><div className="result-box-heading">Result <button onClick={() => saveFile('sequence-result.txt', transformResult, 'text/plain')}>Download</button></div><code>{transformResult}</code></div>}
                </section>
                <section className="panel">
                  <div className="panel-heading"><div><span className="eyebrow">TRANSLATION</span><h2>DNA → protein</h2></div><span className="icon-chip"><Code2 size={18} /></span></div>
                  <p className="muted">Translate the selected DNA sequence in reading frame 1.</p>
                  <button className="button button-primary" onClick={runTranslate} disabled={busy}>Translate sequence</button>
                  {translation && <div className="result-box"><div className="result-box-heading">Protein sequence <button onClick={() => saveFile('translated-protein.fasta', `>translated_protein\n${translation.protein_sequence}\n`, 'text/plain')}>Download FASTA</button></div><code>{translation.protein_sequence || '(empty sequence)'}</code>{translation.warnings?.map((w, i) => <p className="warning-text" key={i}>{w}</p>)}</div>}
                </section>
                <section className="panel">
                  <div className="panel-heading"><div><span className="eyebrow">PATTERN SCAN</span><h2>Motif search</h2></div><span className="icon-chip"><Search size={18} /></span></div>
                  <label className="field-label" htmlFor="motif">Motif / pattern</label><input id="motif" value={motif} onChange={e => setMotif(e.target.value)} placeholder="e.g. ATG" />
                  <button className="button button-primary full-button" onClick={runMotif} disabled={busy}>Find motif</button>
                  {motifResult && <div className="result-box"><strong>{motifResult.count} match(es)</strong>{motifResult.positions.length ? <div className="position-list">{motifResult.positions.map((p, i) => <span key={i}>Position {p.start}–{p.end}</span>)}</div> : <p className="muted">No occurrences found.</p>}</div>}
                </section>
                <section className="panel">
                  <div className="panel-heading"><div><span className="eyebrow">CODING REGIONS</span><h2>ORF detection</h2></div><span className="icon-chip"><AlignLeft size={18} /></span></div>
                  <p className="muted">Find simple start-to-stop open reading frames across six frames.</p>
                  <button className="button button-primary" onClick={runORFs} disabled={busy}>Detect ORFs</button>
                  {orfResult && <div className="result-box"><strong>{orfResult.count} ORF(s) found</strong>{orfResult.orfs.length ? <div className="table-wrap"><table><thead><tr><th>Strand</th><th>Frame</th><th>Start</th><th>End</th><th>nt</th></tr></thead><tbody>{orfResult.orfs.slice(0, 20).map((o, i) => <tr key={i}><td>{o.strand}</td><td>{o.frame + 1}</td><td>{o.start}</td><td>{o.end}</td><td>{o.length_nt}</td></tr>)}</tbody></table>{orfResult.orfs.length > 20 && <p className="muted">Showing first 20 results.</p>}</div> : <p className="muted">No ORFs found at the current minimum length.</p>}</div>}
                </section>
              </div>
            </>
          )}

          {activeTab === 'alignment' && (
            <>
              <div className="section-title-row"><div><span className="eyebrow">PAIRWISE COMPARISON</span><h2>Sequence alignment</h2><p>Compare two sequences with global or local pairwise alignment.</p></div><span className="subtle-tag">03 / 05</span></div>
              <section className="panel">
                <div className="alignment-inputs">
                  <div><label className="field-label" htmlFor="seq-a">Sequence A</label><textarea id="seq-a" className="compact-textarea" value={seqA} onChange={e => setSeqA(e.target.value)} /></div>
                  <div><label className="field-label" htmlFor="seq-b">Sequence B</label><textarea id="seq-b" className="compact-textarea" value={seqB} onChange={e => setSeqB(e.target.value)} /></div>
                </div>
                <div className="settings-row">
                  <div><label className="field-label" htmlFor="align-mode">Alignment mode</label><select id="align-mode" value={alignMode} onChange={e => setAlignMode(e.target.value)}><option value="global">Global (Needleman–Wunsch style)</option><option value="local">Local (Smith–Waterman style)</option></select></div>
                  <div><label className="field-label" htmlFor="match-score">Match</label><input id="match-score" type="number" value={match} onChange={e => setMatch(e.target.value)} /></div>
                  <div><label className="field-label" htmlFor="mismatch-score">Mismatch</label><input id="mismatch-score" type="number" value={mismatch} onChange={e => setMismatch(e.target.value)} /></div>
                  <div><label className="field-label" htmlFor="gap-score">Gap</label><input id="gap-score" type="number" value={gap} onChange={e => setGap(e.target.value)} /></div>
                </div>
                <div className="button-row"><button className="button button-primary" onClick={runAlignment} disabled={busy}><GitCompareArrows size={16} /> Run alignment</button><button className="button button-secondary" onClick={() => { setSeqA('GATTACA'); setSeqB('GCATGCU'); setAlignMode('global') }}>Load example</button></div>
              </section>
              {alignment && <section className="panel alignment-result">
                <div className="panel-heading"><div><span className="eyebrow">BEST ALIGNMENT</span><h2>{alignment.mode === 'global' ? 'Global alignment' : 'Local alignment'}</h2></div><div className="score-badge"><span>ALIGNMENT SCORE</span><strong>{alignment.score}</strong></div></div>
                <div className="alignment-view"><div className="alignment-line"><span>A</span><code>{alignment.aligned_sequence_a}</code></div><div className="alignment-line match-line"><span></span><code>{alignment.match_line}</code></div><div className="alignment-line"><span>B</span><code>{alignment.aligned_sequence_b}</code></div></div>
                <div className="result-meta"><span>Algorithm: {alignment.algorithm}</span><span>Optimal alignments: {alignment.alignment_count}</span><button className="text-button" onClick={() => saveFile('alignment-result.txt', alignment.formatted, 'text/plain')}>Download alignment <Download size={14} /></button></div>
              </section>}
            </>
          )}

          {activeTab === 'protein' && (
            <>
              <div className="section-title-row"><div><span className="eyebrow">PROTEIN CHARACTERIZATION</span><h2>Protein explorer</h2><p>Inspect amino-acid composition and basic physicochemical properties.</p></div><span className="subtle-tag">04 / 05</span></div>
              <section className="panel">
                <div className="panel-heading"><div><span className="eyebrow">INPUT SEQUENCE</span><h2>Protein sequence</h2></div><span className="icon-chip"><Atom size={18} /></span></div>
                <textarea value={proteinSequence} onChange={e => setProteinSequence(e.target.value)} className="protein-textarea" spellCheck="false" placeholder="Enter one-letter amino-acid sequence" />
                <div className="input-footer"><span>{proteinSequence.replace(/\s/g, '').length} residues</span><button className="button button-primary" onClick={runProtein} disabled={busy}>Analyze protein</button></div>
              </section>
              {proteinResult && <>
                <div className="metrics-grid">
                  <Metric label="Length" value={proteinResult.length} hint="amino acids" />
                  <Metric label="Molecular weight" value={proteinResult.molecular_weight_da != null ? `${proteinResult.molecular_weight_da} Da` : 'N/A'} hint="estimated" />
                  <Metric label="Isoelectric point" value={proteinResult.isoelectric_point ?? 'N/A'} hint="theoretical pI" />
                  <Metric label="GRAVY" value={proteinResult.gravy ?? 'N/A'} hint="hydropathy score" />
                </div>
                <div className="two-column">
                  <section className="panel"><div className="panel-heading"><div><span className="eyebrow">COMPOSITION</span><h2>Amino-acid distribution</h2></div></div><CompositionChart items={proteinResult.composition} /></section>
                  <section className="panel"><div className="panel-heading"><div><span className="eyebrow">PROPERTIES</span><h2>Physicochemical profile</h2></div></div>
                    {proteinResult.properties_available ? <div className="property-list"><div><span>Aromaticity</span><strong>{proteinResult.aromaticity}</strong></div><div><span>Instability index</span><strong>{proteinResult.instability_index}</strong></div><div><span>Molecular weight</span><strong>{proteinResult.molecular_weight_da} Da</strong></div><div><span>Isoelectric point</span><strong>{proteinResult.isoelectric_point}</strong></div><div><span>GRAVY</span><strong>{proteinResult.gravy}</strong></div></div> : <p className="muted">{proteinResult.properties_note}</p>}
                    {proteinResult.warnings?.map((w, i) => <p className="warning-text" key={i}>{w}</p>)}
                    <button className="button button-secondary full-button" onClick={() => saveFile('protein-analysis.json', JSON.stringify(proteinResult, null, 2))}>Export protein report <Download size={15} /></button>
                  </section>
                </div>
              </>}
            </>
          )}

          {activeTab === 'guide' && (
            <>
              <div className="section-title-row"><div><span className="eyebrow">LEARN THE METHODS</span><h2>Method guide</h2><p>Short explanations of the algorithms used in this educational workspace.</p></div><span className="subtle-tag">05 / 05</span></div>
              <div className="guide-grid">
                <article className="panel guide-card"><div className="guide-number">01</div><h3>Sequence composition</h3><p>Counts each symbol and summarizes sequence length. GC percentage is the proportion of G and C nucleotides among sequence positions.</p><code>GC% = (G + C) / sequence length × 100</code></article>
                <article className="panel guide-card"><div className="guide-number">02</div><h3>Reverse complement</h3><p>Reverses the DNA sequence and replaces each nucleotide with its complementary base: A↔T and C↔G. IUPAC ambiguity symbols are also supported.</p></article>
                <article className="panel guide-card"><div className="guide-number">03</div><h3>Translation</h3><p>Reads the sequence in triplets called codons and maps each codon to an amino acid using the standard genetic code. Different organisms can use different genetic codes.</p></article>
                <article className="panel guide-card"><div className="guide-number">04</div><h3>Open reading frames</h3><p>The simple ORF scanner looks for ATG start codons and in-frame stop codons on both DNA strands. Real gene prediction is more complex.</p></article>
                <article className="panel guide-card"><div className="guide-number">05</div><h3>Global alignment</h3><p>Global alignment attempts to align sequences across their full lengths. It is useful when sequences are expected to be similar across their entire length.</p></article>
                <article className="panel guide-card"><div className="guide-number">06</div><h3>Local alignment</h3><p>Local alignment identifies the highest-scoring matching subsections of sequences, which can be useful when only a region is conserved.</p></article>
              </div>
              <section className="panel note-panel"><ShieldCheck size={20} /><div><h3>Interpret results carefully</h3><p>Sequence quality, ambiguous residues, scoring parameters and biological context affect interpretation. This tool does not make clinical predictions or replace expert analysis.</p></div></section>
            </>
          )}

          <footer className="footer"><span>© 2026 BioSequence Insight Lab</span><span><ClipboardList size={14} /> Built for bioinformatics learning</span><button onClick={() => { setAnalysis(null); setTransformResult(''); setTranslation(null); setOrfResult(null); setMotifResult(null); setProteinResult(null); setAlignment(null); setError(''); setNotice('') }}>Reset results</button></footer>
        </div>
      </main>
    </div>
  )
}

export default App
