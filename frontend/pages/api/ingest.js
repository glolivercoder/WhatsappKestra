import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const { text, metadata } = req.body;
  try {
    await axios.post(process.env.AGENT_URL || 'http://agent:8000/ingest', { text, metadata });
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar para o agente' });
  }
}
