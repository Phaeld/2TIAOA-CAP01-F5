# CardioIA — Parte 2: Interface de Interação com o Usuário

Interface web de chat (HTML + CSS + JavaScript puro, sem build step) para o
Assistente Cardiológico Conversacional da Fase 5.

## Como executar

```bash
cd src/frontend/mock_backend
pip install -r requirements.txt
python server.py
# abra http://localhost:5000
```

O servidor acima é um **mock rotulado** (todas as respostas carregam
`"source": "mock"` e a interface exibe o selo *"modo demonstração (mock)"*).
Ele existe apenas para desenvolver e demonstrar a interface enquanto o
backend real da Parte 1 (Flask + IBM Watson Assistant) não está integrado.

### Usando com o backend real (Parte 1)

Duas opções:

1. **Mesma origem (recomendado):** o backend Flask da Parte 1 serve esta
   pasta como estático (como o `server.py` mock faz) e implementa
   `POST /api/chat` + `GET /api/health` — nenhuma mudança no frontend.
2. **Origens separadas:** abra a página com `?api=http://localhost:5000`
   (ou a URL do backend) — o frontend passa a chamar essa base. Nesse caso o
   backend precisa habilitar CORS.

## Contrato de API esperado

```
POST /api/chat
  corpo:    { "message": str, "session_id": str | null }
  resposta: { "reply": str, "session_id": str,
              "intent": str | null, "confidence": float | null,
              "source": "watson" | "mock",
              "structured": dict | null }

GET /api/health -> { "status": "ok", "source": "watson" | "mock" }
```

- `session_id`: na 1ª mensagem vai `null`; o backend cria a sessão no Watson
  e devolve o id, que o frontend reenvia nas mensagens seguintes (persistido
  em `sessionStorage`, ou seja, dura enquanto a aba estiver aberta).
- `structured`: quando presente, é o JSON clínico produzido pelo fluxo do
  **Ir Além 1** (chaves `sintomas_principais`, `pressao_arterial`,
  `frequencia_cardiaca`, `historico_doencas`, `medicamentos_em_uso`,
  `procedimentos_solicitados`, `nivel_urgencia`) e é renderizado como um
  cartão de triagem dentro da resposta do bot.

## Estrutura

```
frontend/
├── index.html            # página única do chat
├── css/style.css         # estilos (responsivo, sem dependências)
├── js/app.js             # lógica: fetch, sessão, digitando…, cartão de triagem
├── mock_backend/
│   ├── server.py         # Flask MOCK rotulado + serve o frontend
│   └── requirements.txt
└── README.md
```

## Funcionalidades da interface

- Envio de mensagens e exibição das respostas do assistente (bolhas + hora);
- Indicador "digitando…" enquanto aguarda o backend;
- Selo de estado da conexão no cabeçalho (Watson / mock / indisponível);
- Sugestões rápidas (chips) alinhadas às intenções do assistente;
- Cartão de triagem estruturada quando a resposta traz o JSON do Ir Além 1;
- Tratamento de erro amigável quando o backend está fora do ar;
- Aviso ético fixo: protótipo educacional, emergência = 192 (SAMU).
