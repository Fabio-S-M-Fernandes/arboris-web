import './index.css';
import HologramBackground from './HologramBackground';
import HeaderHome from './components/HeaderHome';
import FooterHome from './components/FooterHome';
import Hologram from './Hologram';
import Reveal from './components/Reveal';
import Concept from './components/Concept';
import TeamGrid from './components/TeamGrid';
import Roadmap from './components/Roadmap';
import PreloadExplosion from './components/PreloadExplosion';
import { isConstrainedDevice } from './performance';
import { useState } from 'react';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Admin from './components/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, Navigate } from 'react-router-dom';

function Home() {
  const [preloadDone, setPreloadDone] = useState(() => isConstrainedDevice());
  const teamMembers = [
    { name: 'Baymax', role: 'Líder Técnico & Frontend', email: 'fabiosoaresmoreirafernandesbjj@gmail.com' },
    { name: 'Amanda Costa Silva', role: 'Organização & Gestão', email: 'Contato via grupo' },
    { name: 'Salomão', role: 'Desenvolvedor / Pesquisador', email: 'victorhugosalomao2009@gmail.com' },
    { name: 'Guimarães', role: 'Desenvolvedor / Pesquisador', email: 'guimaraesvazvictor@gmail.com' },
    { name: 'Bruna', role: 'Especialista de Dados', email: 'brunaesterdesousaferreira34@gmail.com' },
    { name: 'Thaís', role: 'Analista de Requisitos', email: 'thaisvitoria.stt@gmail.com' },
    { name: 'Izzy', role: 'QA & Testes', email: 'izzysbittencourt06@gmail.com' },
  ];

  return (
    <>
      {!preloadDone && <PreloadExplosion onFinish={() => setPreloadDone(true)} />}
      <div className="app-container" style={{ filter: !preloadDone ? 'blur(0px)' : 'none', transition: 'filter 420ms ease-out' }}>

        <HeaderHome />
        <main>
          <Reveal>
            <section>
              <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.5rem', marginBottom: '2rem' }}>
                Painel de Controle Holográfico
              </h2>
              <Hologram />
            </section>
          </Reveal>

          <Reveal>
            <Concept />
          </Reveal>

          <Reveal>
            <TeamGrid members={teamMembers} />
          </Reveal>

          <Reveal>
            <Roadmap />
          </Reveal>
        </main>
        <FooterHome />
      </div>
    </>
  );
}

function App() {
  return (
    <>
      <HologramBackground />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
    </>
  );
}

export default App;
