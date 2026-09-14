/**
 * CardioIA — Parte 2: lógica da interface de chat.
 *
 * Contrato com o backend (Parte 1 — Flask + IBM Watson Assistant):
 *   POST {API_BASE}/api/chat
 *     corpo:    { "message": string, "session_id": string | null }
 *     resposta: { "reply": string, "session_id": string,
 *                 "intent": string|null, "confidence": number|null,
 *                 "source": "watson" | "mock",
 *                 "structured": objeto|null }   // JSON clínico do "Ir Além 1", quando houver
 *   GET {API_BASE}/api/health  -> { "status": "ok", "source": "watson" | "mock" }
 *
 * Por padrão a API é servida na mesma origem da página (o servidor Flask serve
 * este frontend). Para apontar para outro endereço, abra a página com
 * ?api=http://localhost:5000 na URL.
 */

const API_BASE = new URLSearchParams(location.search).get("api") || "";

const chatEl = document.getElementById("chat");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const badgeEl = document.getElementById("status-badge");
const quickEl = document.getElementById("quick-replies");

// Sessão do Watson: mantida enquanto a aba estiver aberta.
let sessionId = sessionStorage.getItem("cardioia_session") || null;

const SUGESTOES = [
  "Quais são os sintomas de infarto?",
  "Estou com dor no peito",
  "Como aferir minha pressão?",
  "Quero agendar uma consulta",
];

/* ---------- Renderização ---------- */

function horaAgora() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function addMensagem(texto, tipo, meta) {
  const div = document.createElement("div");
  div.className = `msg msg-${tipo}`;
  div.textContent = texto;

  const span = document.createElement("span");
  span.className = "msg-meta";
  span.textContent = meta ? `${horaAgora()} · ${meta}` : horaAgora();
  div.appendChild(span);

  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}

/** Renderiza o JSON estruturado do "Ir Além 1" como um cartão de triagem legível. */
function addCartaoTriagem(msgEl, dados) {
  const campos = {
    sintomas_principais: "Sintomas",
    pressao_arterial: "Pressão arterial",
    frequencia_cardiaca: "Freq. cardíaca",
    historico_doencas: "Histórico",
    medicamentos_em_uso: "Medicamentos",
    procedimentos_solicitados: "Procedimentos",
    nivel_urgencia: "Urgência",
  };

  const card = document.createElement("div");
  card.className = "cartao-triagem";
  card.innerHTML = "<h4>Resumo estruturado da triagem</h4>";
  const dl = document.createElement("dl");

  for (const [chave, rotulo] of Object.entries(campos)) {
    if (dados[chave] == null || dados[chave].length === 0) continue;
    const dt = document.createElement("dt");
    dt.textContent = rotulo;
    const dd = document.createElement("dd");
    const valor = Array.isArray(dados[chave]) ? dados[chave].join(", ") : String(dados[chave]);
    dd.textContent = valor;
    if (chave === "nivel_urgencia") dd.classList.add(`urgencia-${valor}`);
    dl.appendChild(dt);
    dl.appendChild(dd);
  }

  card.appendChild(dl);
  msgEl.insertBefore(card, msgEl.querySelector(".msg-meta"));
}

function addDigitando() {
  const div = document.createElement("div");
  div.className = "msg msg-bot";
  div.innerHTML = '<span class="digitando"><span></span><span></span><span></span></span>';
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}

function setBadge(estado, texto) {
  badgeEl.className = `badge badge-${estado}`;
  badgeEl.textContent = texto;
}

/* ---------- Comunicação com o backend ---------- */

async function enviarMensagem(texto) {
  addMensagem(texto, "usuario");
  inputEl.value = "";
  sendBtn.disabled = true;
  const digitando = addDigitando();

  try {
    const resp = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: texto, session_id: sessionId }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const dados = await resp.json();

    sessionId = dados.session_id || sessionId;
    if (sessionId) sessionStorage.setItem("cardioia_session", sessionId);

    digitando.remove();
    const meta =
      (dados.source === "mock" ? "modo demonstração (mock)" : "Watson Assistant") +
      (dados.intent ? ` · intenção: ${dados.intent}` : "");
    const msgEl = addMensagem(dados.reply, "bot", meta);
    if (dados.structured) addCartaoTriagem(msgEl, dados.structured);
  } catch (erro) {
    digitando.remove();
    addMensagem(
      "Não consegui falar com o servidor. Verifique se o backend está rodando e tente de novo.",
      "erro"
    );
    console.error("Falha ao chamar /api/chat:", erro);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

async function verificarBackend() {
  try {
    const resp = await fetch(`${API_BASE}/api/health`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const dados = await resp.json();
    if (dados.source === "mock") setBadge("mock", "backend mock (demonstração)");
    else setBadge("online", "conectado ao Watson");
  } catch {
    setBadge("offline", "backend indisponível");
  }
}

/* ---------- Eventos ---------- */

formEl.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const texto = inputEl.value.trim();
  if (texto) enviarMensagem(texto);
});

for (const sugestao of SUGESTOES) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = sugestao;
  btn.addEventListener("click", () => enviarMensagem(sugestao));
  quickEl.appendChild(btn);
}

/* ---------- Inicialização ---------- */

addMensagem(
  "Olá! Sou o assistente virtual do CardioIA. 🩺\n" +
    "Posso orientar sobre sintomas cardíacos, aferição de pressão e agendamento de consultas.\n" +
    "Como posso ajudar? (Lembre-se: em emergências, ligue 192.)",
  "bot",
  "mensagem inicial"
);
verificarBackend();
inputEl.focus();
