import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [metadata, setMetadata] = useState('');
  const [message, setMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [functionConfig, setFunctionConfig] = useState({
    greetings: true,
    delayAgent: 25,
  });

  const greetingsExamples = ['bom dia', 'boa tarde', 'boa noite', 'olá', 'obrigado'];

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadStatus('Enviando...');
    try {
      let content = text;
      if (file) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          content = ev.target.result;
          await axios.post('/api/ingest', { text: content, metadata: JSON.parse(metadata || '{}') });
          setUploadStatus('Arquivo enviado!');
        };
        reader.readAsText(file);
      } else {
        await axios.post('/api/ingest', { text: content, metadata: JSON.parse(metadata || '{}') });
        setUploadStatus('Texto enviado!');
      }
    } catch (err) {
      setUploadStatus('Erro ao enviar');
    }
  };

  const handleFunctionConfig = (e) => {
    const { name, value, type, checked } = e.target;
    setFunctionConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Administração do Agente RAG</h1>
      <form onSubmit={handleUpload} style={{ marginBottom: 32 }}>
        <h2>Upload de Arquivo/Textos</h2>
        <input type="file" accept=".txt,.md,.csv,.json" onChange={e => setFile(e.target.files[0])} />
        <div>Ou cole texto:</div>
        <textarea rows={6} style={{ width: '100%' }} value={text} onChange={e => setText(e.target.value)} />
        <div>Metadata (JSON):</div>
        <input type="text" style={{ width: '100%' }} value={metadata} onChange={e => setMetadata(e.target.value)} placeholder='{"fonte": "manual"}' />
        <button type="submit">Enviar</button>
        <div>{uploadStatus}</div>
      </form>
      <hr />
      <h2>Configuração de Funções do Bot</h2>
      <label>
        <input type="checkbox" name="greetings" checked={functionConfig.greetings} onChange={handleFunctionConfig} />
        Ativar respostas automáticas de saudação
      </label>
      <div style={{ margin: '8px 0' }}>
        Palavras-chave: {greetingsExamples.join(', ')}
      </div>
      <label>
        Delay (segundos) para acionar agente após saudação:
        <input type="number" name="delayAgent" min={0} max={60} value={functionConfig.delayAgent} onChange={handleFunctionConfig} style={{ marginLeft: 8, width: 60 }} />
      </label>
      <div style={{ marginTop: 16 }}>
        <b>Observação:</b> O bot responde automaticamente a saudações simples no primeiro contato. O agente só é acionado após {functionConfig.delayAgent} segundos, permitindo que o cliente escreva uma mensagem completa.
      </div>
    </div>
  );
}
