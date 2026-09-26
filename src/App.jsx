import { useEffect, useRef, useState } from 'react'
import './App.css'

import foto1 from './assets/media/1.jpg'
import foto2 from './assets/media/2.jpeg'
import foto3 from './assets/media/3.jpg'
import foto4 from './assets/media/4.jpg'
import foto5 from './assets/media/5.jpg'

import video1 from './assets/media/1.mp4'
import video2 from './assets/media/2.mp4'
import video3 from './assets/media/3.mp4'
import video4 from './assets/media/4.mp4'
import video5 from './assets/media/5.mp4'
import video6 from './assets/media/6.mp4'
import video7 from './assets/media/7.mp4'
import audioOpus from './assets/media/audio.opus'
import libretoMp3 from './assets/media/libreto.mp3'
import ThinkingDots from './ThinkingDots.jsx'

const TITULO = 'La docencia como vocación para despertar la conciencia social en los estudiantes'

const SUBTITULOS = `Actualmente vivimos en un país con falta de conciencia social en las personas.
Esto es un problema que se evidencia desde la educación que recibimos en la casa.
Es importante complementar esta educación en casa desde las aulas de clase.
Nosotros como docentes ejercemos un papel fundamental en el desarrollo de la sociedad.
Y si la sociedad se encuentra oprimida, sin dignidad social, sin una identidad propia,
es nuestro deber forjar desde los primeros años de clase el papel fundamental
de la conciencia social en las personas, en las sociedades,
en países sometidos por la corrupción y a la violación de su soberanía.
Mire a su alrededor. No es una película, es el diario vivir.
El vendedor que trabaja doce horas sin contrato.
El anciano que después de toda una vida de trabajo cuenta monedas para el bus.
La vía rota que nunca arreglan aunque cada año prometen lo mismo.
Empleos precarios, ancianos sumidos en la pobreza, vías dañadas por la corrupción.
Esto no es mala suerte. Es desigualdad social construida.
Nos dividen con discursos de odio.
Nos dicen que el pobre es pobre porque quiere, que el profesor adoctrina, que el joven es vago.
Mientras nos pelean entre nosotros, se vulneran derechos fundamentales:
salud, educación, trabajo digno, pensión.
Y en medio del ruido se entrega lo más sagrado: la soberanía.
Nuestra agua, nuestras semillas, nuestra biodiversidad y nuestra energía se negocian afuera,
y la corrupción sistemática en las instituciones tapa las vías, tapa los hospitales, tapa la verdad.
Por eso el poder que oprime no siempre necesita gritar.
Le basta con que usted no mire, con que crea que todo es normal.
La represión no siempre es un golpe.
A veces es cansarlo de hacer fila, de esperar cita,
de ver a sus padres envejecer en la pobreza.
Y aquí está la propuesta. Profesores y alumnos: despertemos la conciencia social.
Profesor, convierta su aula en escenario de verdad.
Pregunte a sus estudiantes qué contexto político, económico, social y cultural
van a enfrentar cuando salgan del colegio o la universidad.
Que entrevisten al anciano, que mapeen la vía dañada,
que entiendan de dónde viene su comida.
Porque solo una sociedad consciente podrá en el futuro
contrarrestar y oponerse a cualquier opresión.
La docencia como vocación. La conciencia como camino.`

// Esquema: intro 10s + media 215s (7×25 + 5×8) + créditos 20s en 2 fases de 10s = 245s (4:05)
// Video 2 y Video 1 intercambiados. Créditos con voz en off y sin fondo.
const timeline = [
  { tipo: 'titulo', secs: 10 },
  { tipo: 'video', src: video2, secs: 25, speed: 0.5 },
  { tipo: 'video', src: video1, secs: 25, speed: 0.5, vertical: true },
  { tipo: 'foto', src: foto1, secs: 8 },
  { tipo: 'video', src: video3, secs: 25, speed: 0.5, vertical: true },
  { tipo: 'foto', src: foto2, secs: 8 },
  { tipo: 'video', src: video4, secs: 25, speed: 0.5 },
  { tipo: 'foto', src: foto3, secs: 8 },
  { tipo: 'video', src: video5, secs: 25, speed: 0.5 },
  { tipo: 'foto', src: foto4, secs: 8 },
  { tipo: 'video', src: video6, secs: 25, speed: 0.5 },
  { tipo: 'foto', src: foto5, secs: 8 },
  { tipo: 'video', src: video7, secs: 25, speed: 0.5 },
  { tipo: 'creditos', secs: 20 },
]

const FADE = 1500
const TOTAL = timeline.reduce((s, t) => s + (t.secs || 8), 0)
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

function Creditos({ playing }) {
  const [fase, setFase] = useState(0)
  useEffect(() => {
    if (!playing) return
    setFase(0)
    const t2 = setTimeout(() => setFase(1), 10000)
    return () => { clearTimeout(t2) }
  }, [playing])
  return (
    <div key="cred" className="title-screen credits">
      {fase === 0 ? (
        <div className="cred-fase piece-in">
        <p className="act">Actividad Corto Metraje Innovador</p>
        <p className="act">CINE Y REVOLUCION - Victor Andres Verano Ramirez</p>
        </div>
      ) : (
        <div className="cred-fase piece-in">
          <p>Estudiantes: Freddy Vladimir Morillo Benavides, Guillermo Javier Vallejo Portilla y Carlos Alberto Rivera Canacuan</p>
          <p>Institución Educativa Técnica Agropecuaria Indígena de Panán Cumbal Nariño</p>
        </div>
      )}
    </div>
  )
}

function Montaje() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [fadeBlack, setFadeBlack] = useState(false)
  const [mutedAll, setMutedAll] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [isFull, setIsFull] = useState(false)
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const narracionRef = useRef(null)
  const stageRef = useRef(null)
  const seekVideoOffset = useRef(0)
  const current = timeline[index]
  const isCreditos = current.tipo === 'creditos'
  const baseElapsed = timeline.slice(0, index).reduce((s, t) => s + (t.secs || 8), 0)

  useEffect(() => {
    if (!playing) return
    const dur = (current.secs || 8) * 1000
    const t1 = setTimeout(() => setFadeBlack(true), Math.max(0, dur - FADE))
    const t2 = setTimeout(() => {
      if (index + 1 >= timeline.length) { setPlaying(false); return }
      setIndex(index + 1)
    }, dur)
    return () => { clearTimeout(t1); clearTimeout(t2) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing])

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setFadeBlack(false), 80)
    return () => clearTimeout(t)
  }, [index, playing])

  useEffect(() => {
    const v = videoRef.current
    if (v && current.tipo === 'video') {
      v.muted = true
      v.playbackRate = current.speed || 0.5
      v.currentTime = seekVideoOffset.current || 0
      seekVideoOffset.current = 0
      if (playing) v.play().catch(() => {})
      else v.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing])

  // Barra de posición: avanza con el tiempo
  useEffect(() => {
    if (!playing) return
    const t0 = Date.now()
    const startBase = baseElapsed
    const id = setInterval(() => {
      setElapsed(Math.min(TOTAL, startBase + (Date.now() - t0) / 1000))
    }, 250)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing])

  const seek = (value) => {
    const v = Math.max(0, Math.min(TOTAL, value))
    let acc = 0
    for (let i = 0; i < timeline.length; i++) {
      const d = timeline[i].secs || 8
      if (v < acc + d || i === timeline.length - 1) {
        const offset = Math.max(0, v - acc)
        setIndex(i)
        setElapsed(v)
        setFadeBlack(false)
        // Sincroniza audios (arrancan tras título de 10s)
        const audioT = Math.max(0, v - 10)
        if (audioRef.current) audioRef.current.currentTime = Math.min(audioT, 211)
        if (narracionRef.current) narracionRef.current.currentTime = Math.min(audioT, 214)
        // Video a 0.5x: tiempo interno = offset * 0.5
        seekVideoOffset.current = timeline[i].tipo === 'video' ? offset * (timeline[i].speed || 0.5) : 0
        break
      }
      acc += d
    }
  }

  // Fondo 16% solo en media. Narración 100% solo en media. Créditos en silencio.
  // Sin loop: una sola vez.
  useEffect(() => {
    const a = audioRef.current
    const n = narracionRef.current
    if (a) { a.volume = 0.16; a.muted = mutedAll; a.loop = false }
    if (n) { n.volume = 1.0; n.muted = mutedAll; n.loop = false }
    if (!playing) { a?.pause(); n?.pause(); return }
    if (index === 0 || isCreditos) {
      a?.pause()
      n?.pause()
      if (index === 0) { if (a) a.currentTime = 0; if (n) n.currentTime = 0 }
      return
    }
    // Solo una vez: no re-disparar si ya terminó
    if (a && (a.ended || (a.duration && a.currentTime >= a.duration - 0.3))) { /* no replay */ }
    else a?.play().catch(() => {})
    if (n && (n.ended || (n.duration && n.currentTime >= n.duration - 0.3))) { /* no replay */ }
    else n?.play().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing, mutedAll])

  const toggle = () => {
    if (index >= timeline.length - 1 && !playing) setIndex(0)
    setPlaying((p) => !p)
  }

  const toggleFull = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await stageRef.current?.requestFullscreen()
    } catch { /* navegador no lo permite */ }
  }

  useEffect(() => {
    const fn = () => setIsFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', fn)
    return () => document.removeEventListener('fullscreenchange', fn)
  }, [])

  return (
    <section className="montaje">
      <div className="stage" ref={stageRef}>
        {current.tipo === 'video' ? (
          current.vertical ? (
            <div key={index} className="vwrap piece-in">
              <video className="bg" src={current.src} muted loop autoPlay playsInline preload="metadata" />
              <video ref={videoRef} className="fg" src={current.src} muted playsInline preload="metadata" />
            </div>
          ) : (
            <video key={index} ref={videoRef} className="piece-in full" src={current.src} muted playsInline preload="metadata" />
          )
        ) : current.tipo === 'titulo' ? (
          <div key={`titulo-${playing ? 'play' : 'idle'}`} className={`title-screen long ${playing ? 'anim' : 'static'}`}>
            <h1><span>La docencia como vocación</span><br /><span>para despertar la conciencia social en los estudiantes</span></h1>
          </div>
        ) : current.tipo === 'creditos' ? (
          <Creditos playing={playing} />
        ) : (
          <img key={index} className="piece-in full" src={current.src} alt="" />
        )}
        <div className={`black slow ${fadeBlack ? 'on' : ''}`} />
      </div>
      <audio ref={audioRef} src={audioOpus} preload="metadata" />
      <audio ref={narracionRef} src={libretoMp3} preload="metadata" />
      <div className="controls">
        <button className="btn" onClick={toggle}>{playing ? 'Pausa' : 'Play'}</button>
        <input
          className="seek"
          type="range" min="0" max={TOTAL} step="0.5" value={elapsed}
          onChange={(e) => seek(parseFloat(e.target.value))}
          aria-label="Posición"
        />
        <span className="time">{fmt(elapsed)} / {fmt(TOTAL)}</span>
        <button className="btn ghost right" onClick={() => setMutedAll((m) => !m)}>
          {mutedAll ? 'Activar audio' : 'Silenciar'}
        </button>
        <button className="btn ghost" onClick={toggleFull}>
          {isFull ? 'Salir de pantalla' : 'Pantalla completa'}
        </button>
      </div>
    </section>
  )
}

function App() {
  return (
    <main className="doc">
      <ThinkingDots color="#38bdf8" accentColor="#7dd3fc" />
      <p className="kicker">Corto Documental - Cine y Revolucion</p>
      <Montaje />
      <section className="descripcion">
        <h2>Descripción</h2>
        <p className="act">Actividad Corto Metraje Innovador</p>
        <p className="act">CINE Y REVOLUCION - Victor Andres Verano Ramirez</p>
        <p>Estudiantes: Freddy Vladimir Morillo Benavides, Guillermo Javier Vallejo Portilla y Carlos Alberto Rivera Canacuan</p>
        <p>Institución Educativa Técnica Agropecuaria Indígena de Panán Cumbal Nariño</p>
        <p className="sub-pre">Subtítulos de la narración:</p>
        <pre>{SUBTITULOS}</pre>
      </section>
    </main>
  )
}

export default App
