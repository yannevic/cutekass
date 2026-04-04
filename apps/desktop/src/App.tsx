import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Trash from './pages/Trash';
import UpdateNotifier, { UpdateStatus } from './components/UpdateNotifier';
import ChangelogModal from './components/ChangelogModal';
import TermosModal from './components/TermosModal';

export default function App() {
  const [versao, setVersao] = useState('');
  const [mostrarChangelog, setMostrarChangelog] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [updateErro, setUpdateErro] = useState('');
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [mostrarTermos, setMostrarTermos] = useState(false);

  useEffect(() => {
    async function verificarChangelog() {
      const v = await window.electronAPI.getAppVersion();
      setVersao(v);
      const chave = `changelog-visto-${v}`;
      const jaViu = localStorage.getItem(chave);
      if (!jaViu) {
        setMostrarChangelog(true);
      }
      const jaAceitouTermos = localStorage.getItem('termos-aceitos');
      if (!jaAceitouTermos) {
        setMostrarTermos(true);
      }
    }
    verificarChangelog();
  }, []);

  function fecharChangelog() {
    const chave = `changelog-visto-${versao}`;
    localStorage.setItem(chave, 'true');
    setMostrarChangelog(false);
  }
  function aceitarTermos() {
    localStorage.setItem('termos-aceitos', 'true');
    setMostrarTermos(false);
  }

  return (
    <>
      <UpdateNotifier onStatus={setUpdateStatus} onErro={setUpdateErro} />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              updateStatus={updateStatus}
              updateErro={updateErro}
              onUpdateStatus={setUpdateStatus}
              onUpdateErro={setUpdateErro}
              sidebarAberta={sidebarAberta}
              onSidebarHover={setSidebarAberta}
            />
          }
        />
        <Route
          path="/trash"
          element={
            <Trash
              updateStatus={updateStatus}
              updateErro={updateErro}
              onUpdateStatus={setUpdateStatus}
              onUpdateErro={setUpdateErro}
              sidebarAberta={sidebarAberta}
              onSidebarHover={setSidebarAberta}
            />
          }
        />
      </Routes>
      {mostrarChangelog && versao ? (
        <ChangelogModal versao={versao} onFechar={fecharChangelog} />
      ) : null}
      {mostrarTermos ? <TermosModal onAceitar={aceitarTermos} /> : null}
    </>
  );
}
