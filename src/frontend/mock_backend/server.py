"""
CardioIA — Fase 5 · Parte 2
Servidor Flask de DEMONSTRAÇÃO (MOCK) para desenvolvimento da interface.

⚠️ ESTE ARQUIVO NÃO É A PARTE 1 DO PROJETO.
Ele existe para que a interface (Parte 2) possa ser desenvolvida, testada e
demonstrada ANTES de o backend real (Flask + IBM Watson Assistant, Parte 1)
estar pronto. Todas as respostas aqui são simuladas por regras simples de
palavras-chave e carregam "source": "mock" — a interface exibe esse rótulo
ao usuário para nunca apresentar uma resposta simulada como se fosse real.

Contrato de API (o mesmo que o backend real da Parte 1 deve implementar):

  POST /api/chat
    corpo:    { "message": str, "session_id": str | null }
    resposta: { "reply": str, "session_id": str,
                "intent": str | null, "confidence": float | null,
                "source": "watson" | "mock",
                "structured": dict | null }   # JSON clínico do "Ir Além 1"

  GET /api/health
    resposta: { "status": "ok", "source": "watson" | "mock" }

Como executar:
  pip install -r requirements.txt
  python server.py
  # abra http://localhost:5000  (o próprio servidor serve a interface)
"""

import re
import uuid
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

FRONTEND_DIR = Path(__file__).resolve().parent.parent  # src/frontend/

app = Flask(__name__, static_folder=None)

# ---------------------------------------------------------------------------
# "Intenções" simuladas — espelham o esboço do dialog skill do Watson (Parte 1).
# Cada entrada: (nome_da_intencao, padrões regex, resposta).
# ---------------------------------------------------------------------------
INTENCOES = [
    (
        "saudacao",
        r"\b(oi|ol[aá]|bom dia|boa tarde|boa noite)\b",
        "Olá! Sou o assistente do CardioIA. Posso orientar sobre sintomas "
        "cardíacos, aferição de pressão arterial e agendamento de consultas. "
        "Como posso ajudar?",
    ),
    (
        "emergencia",
        r"\b(dor no peito|infarto agora|desmaio|falta de ar forte|socorro)\b",
        "⚠️ Dor no peito pode ser sinal de emergência. Se a dor é intensa, "
        "aperta ou irradia para braço/mandíbula, ligue 192 (SAMU) AGORA ou vá "
        "ao pronto-socorro mais próximo. Não dirija você mesmo(a).",
    ),
    (
        "sintomas_infarto",
        r"\b(sintomas?|sinais?)\b.*\b(infarto|ataque card[ií]aco)\b"
        r"|\b(infarto|ataque card[ií]aco)\b.*\b(sintomas?|sinais?)\b",
        "Os sinais mais comuns de infarto são: dor ou aperto no peito que pode "
        "irradiar para o braço esquerdo, costas ou mandíbula; suor frio; "
        "náusea; falta de ar. Nas mulheres, os sintomas podem ser mais sutis "
        "(cansaço extremo, enjoo). Na presença desses sinais, ligue 192.",
    ),
    (
        "pressao_arterial",
        r"\b(press[aã]o|hipertens[aã]o|aferir|medir a press[aã]o)\b",
        "Para aferir bem a pressão: sente-se e descanse 5 minutos, apoie o "
        "braço na altura do coração, não fale durante a medida e evite café ou "
        "cigarro 30 min antes. Valores repetidos acima de 140/90 mmHg merecem "
        "avaliação médica.",
    ),
    (
        "agendamento",
        r"\b(agendar|marcar|consulta|hor[aá]rio|atendimento)\b",
        "Posso ajudar com o agendamento! Nosso ambulatório de cardiologia "
        "atende de segunda a sexta, das 8h às 18h. Informe o dia e o período "
        "de sua preferência que eu registro a solicitação.",
    ),
    (
        "medicacao",
        r"\b(rem[eé]dio|medicamento|losartana|aas|estatina|tomar)\b",
        "Não posso prescrever nem ajustar medicamentos. Se esqueceu uma dose, "
        "não tome dose dobrada — siga a orientação da bula ou fale com seu "
        "médico. Mantenha sempre a lista de medicamentos atualizada nas "
        "consultas.",
    ),
    (
        "despedida",
        r"\b(tchau|obrigad[oa]|at[eé] mais|valeu|encerrar)\b",
        "Eu que agradeço! Cuide do seu coração ❤️ e, em caso de emergência, "
        "ligue 192. Até a próxima!",
    ),
]

RESPOSTA_FALLBACK = (
    "Desculpe, ainda não sei responder sobre isso. Posso ajudar com sintomas "
    "cardíacos, aferição de pressão arterial e agendamento de consultas. "
    "Pode reformular a pergunta?"
)

# Exemplo de saída estruturada do "Ir Além 1" (extração clínica com IA
# generativa). No sistema integrado, esse JSON virá do fluxo do Ir Além 1;
# aqui usamos um exemplo FIXO apenas para demonstrar a renderização no chat.
TRIAGEM_EXEMPLO = {
    "sintomas_principais": ["dor no peito", "irradiação para o braço esquerdo"],
    "pressao_arterial": "150/95 mmHg",
    "frequencia_cardiaca": "110 bpm",
    "historico_doencas": ["hipertensão"],
    "medicamentos_em_uso": ["Losartana 50mg"],
    "procedimentos_solicitados": ["ECG de urgência", "enzimas cardíacas"],
    "nivel_urgencia": "Alto",
}


def classificar(mensagem: str):
    """Retorna (intencao, resposta) pela primeira regra que casar."""
    texto = mensagem.lower()
    for intencao, padrao, resposta in INTENCOES:
        if re.search(padrao, texto):
            return intencao, resposta
    return None, RESPOSTA_FALLBACK


# ------------------------------- API ---------------------------------------

@app.post("/api/chat")
def chat():
    corpo = request.get_json(silent=True) or {}
    mensagem = (corpo.get("message") or "").strip()
    if not mensagem:
        return jsonify({"error": "campo 'message' é obrigatório"}), 400

    session_id = corpo.get("session_id") or str(uuid.uuid4())
    intencao, resposta = classificar(mensagem)

    # Na intenção de emergência, anexamos o exemplo de triagem estruturada
    # para demonstrar a integração visual com o "Ir Além 1".
    estruturado = TRIAGEM_EXEMPLO if intencao == "emergencia" else None

    return jsonify(
        {
            "reply": resposta,
            "session_id": session_id,
            "intent": intencao,
            "confidence": 0.9 if intencao else 0.0,  # MOCK: valor ilustrativo
            "source": "mock",
            "structured": estruturado,
        }
    )


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "source": "mock"})


# --------------------- Servir o frontend estático ---------------------------

@app.get("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/<path:caminho>")
def estaticos(caminho):
    return send_from_directory(FRONTEND_DIR, caminho)


if __name__ == "__main__":
    print("CardioIA · servidor MOCK da Parte 2 — http://localhost:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
