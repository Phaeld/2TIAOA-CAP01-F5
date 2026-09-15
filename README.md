# FIAP - Faculdade de Informática e Administração Paulista

<p align="center">
<a href="https://www.fiap.com.br/">
<img src="assets/logo-fiap.png" alt="FIAP - Faculdade de Informática e Administração Paulista" border="0" width="40%" height="40%">
</a>
</p>

<br>

# CardioIA — Cardiology Conversational Assistant

## Grupo São Paulo e Interior

## Integrantes

- <a href="https://www.linkedin.com/in/jonastadeufernandes">Jonas Tadeu V. Fernandes - RM563027</a>
- <a href="https://www.linkedin.com/">Levi Passos Silveira Marques - RM56557</a>
- <a href="https://www.linkedin.com/in/raphaelsilva-phael">Raphael da Silva - RM561452</a>
- <a href="https://www.linkedin.com/in/raphael-dinelli-8a01b278">Raphael Dinelli Neto - RM562892</a>
- <a href="https://www.linkedin.com/in/yan-cotta">Yan Pimental Cotta - RM562836</a>

## Professores

### Tutor

- <a href="https://www.linkedin.com/in/caique-nonato/">Caique Nonato da Silva Bezerra</a>

### Coordenador

- <a href="https://www.linkedin.com/in/andregodoichiovato">André Godoi</a>

---

# Descrição

O **CardioIA** é um assistente conversacional desenvolvido para realizar uma interação inicial no contexto de sintomas cardiovasculares.

Nesta fase, o projeto utiliza **IBM watsonx Assistant** para processamento de linguagem natural e gerenciamento do fluxo conversacional, integrado a um backend desenvolvido em **Python com Flask**.

O sistema permite que o usuário informe sintomas por meio de uma interface web. As mensagens são enviadas ao backend, processadas pelo IBM watsonx Assistant e retornadas à interface de forma contextualizada.

O assistente foi estruturado utilizando:

- Intents;
- Entities;
- Dialog Nodes;
- Slots;
- Contexto conversacional;
- Regras condicionais;
- Sessões de usuário;
- API do IBM watsonx Assistant.

> **Aviso:** o CardioIA foi desenvolvido exclusivamente para fins acadêmicos e educacionais. O sistema não realiza diagnóstico médico, não prescreve medicamentos e não substitui avaliação realizada por profissionais da saúde.


Link vídeo explicativo: https://youtu.be/L3r-NvcKq2c

---

# Arquitetura

O fluxo principal da aplicação é:

```text
User
  ↓
HTML / CSS / JavaScript
  ↓
Flask Backend
  ↓
Watson Service
  ↓
IBM watsonx Assistant
  ↓
Intents / Entities / Dialog
  ↓
Flask Backend
  ↓
Web Interface
```

A aplicação foi organizada separando a interface, o backend e a comunicação com o IBM watsonx Assistant.

---

# Parte 1 — Assistente Conversacional com NLP

## Objetivo

A Parte 1 tem como objetivo desenvolver um assistente conversacional utilizando conceitos de **Natural Language Processing (NLP)** por meio do IBM watsonx Assistant.

O assistente foi modelado para identificar sintomas cardiovasculares e conduzir um fluxo inicial de perguntas com base nas informações fornecidas pelo usuário.

---

## Intents

Foram desenvolvidas oito intenções principais relacionadas aos sintomas tratados pelo sistema:

| Intent | Description |
| --- | --- |
| `#chest_pain` | Chest pain |
| `#shortness_of_breath` | Shortness of breath |
| `#palpitations` | Palpitations |
| `#dizziness` | Dizziness |
| `#fainting` | Fainting |
| `#cold_sweat` | Cold sweat |
| `#nausea` | Nausea |
| `#swelling` | Swelling |

Cada intent possui diferentes exemplos de treinamento para permitir que o Watson reconheça diferentes formas de expressão de um mesmo sintoma.

Exemplo:

```text
I have chest pain.
My chest hurts.
I am feeling pain in my chest.
I have pressure in my chest.
```

---

## Entities

As principais entidades utilizadas pelo assistente são:

| Entity | Purpose |
| --- | --- |
| `@symptom` | Identifies symptoms |
| `@severity` | Identifies symptom severity |
| `@duration` | Identifies symptom duration |
| `@pain_type` | Identifies pain characteristics |
| `@yes_no` | Identifies affirmative or negative answers |
| `@sys-number` | Identifies numerical values |

As entities permitem extrair informações específicas das respostas fornecidas durante a conversa.

---

## Fluxo Conversacional

Após identificar uma intent, o Watson inicia o fluxo correspondente e coleta informações adicionais utilizando Dialog Nodes e Slots.

Um fluxo simplificado pode ser representado por:

```text
User reports a symptom
        ↓
Intent identification
        ↓
Additional questions
        ↓
Entity extraction
        ↓
Context storage
        ↓
Conditional rules
        ↓
Assistant response
```

Por exemplo:

```text
User:
I have chest pain.

Assistant:
On a scale from 0 to 10, how severe is the pain?

User:
8

Assistant:
How long have you been feeling this pain?
```

O contexto da conversa é mantido durante as diferentes mensagens, permitindo que respostas curtas sejam relacionadas às perguntas anteriores.

---

## Classificação Inicial

Para fins acadêmicos, o fluxo conversacional utiliza regras simplificadas que podem direcionar a interação para diferentes níveis de orientação:

- General guidance;
- Medical evaluation recommendation;
- Emergency recommendation.

Essas classificações são utilizadas apenas para demonstrar o funcionamento de regras condicionais dentro de um assistente conversacional.

Elas **não representam um protocolo clínico validado**.

Em situações classificadas pelo fluxo como potencialmente emergenciais, o sistema orienta o usuário a procurar atendimento profissional.

---

# Backend Flask

O backend da aplicação foi desenvolvido utilizando **Python e Flask**.

Sua principal função é receber as mensagens da interface, manter a sessão da conversa e realizar a comunicação com o IBM watsonx Assistant.

O principal endpoint é:

```text
POST /chat
```

Exemplo de requisição:

```json
{
    "message": "I have chest pain"
}
```

Exemplo de resposta:

```json
{
    "message": "I have chest pain",
    "response": "On a scale from 0 to 10, how severe is the pain?"
}
```

---

## Sessão do Watson

O Flask mantém o identificador da sessão do Watson para preservar o contexto da conversa.

```python
if "user_id" not in session:
    session["user_id"] = str(uuid.uuid4())

if "watson_session_id" not in session:
    session["watson_session_id"] = create_session()
```

Dessa forma, respostas como:

```text
8
```

podem ser interpretadas de acordo com a pergunta realizada anteriormente pelo assistente.

---

## Watson Service

A comunicação com o IBM watsonx Assistant foi isolada no arquivo:

```text
services/watson_service.py
```

Essa camada é responsável por:

- autenticar no serviço IBM;
- criar uma sessão;
- enviar mensagens;
- receber respostas;
- retornar o conteúdo para o Flask.

As credenciais são carregadas por variáveis de ambiente.

```text
WATSON_API_KEY
WATSON_URL
WATSON_ASSISTANT_ID
WATSON_ENVIRONMENT_ID
```

As credenciais reais não devem ser adicionadas ao repositório público.

---

## Health Check

Também foi implementado um endpoint para verificar a disponibilidade do backend:

```text
GET /health
```

Resposta esperada:

```json
{
    "status": "ok",
    "source": "watson"
}
```

A interface utiliza essa informação para indicar se o backend está disponível.

---

# Parte 2 — Interface de Interação com o Usuário

## Objetivo

A Parte 2 disponibiliza uma interface web para interação com o assistente desenvolvido na Parte 1.

A interface foi desenvolvida utilizando:

- HTML5;
- CSS3;
- JavaScript;
- Fetch API.

Ela permite que o usuário envie mensagens e visualize as respostas fornecidas pelo IBM watsonx Assistant.

---

## Funcionalidades

A interface possui:

- Área de conversa;
- Campo para entrada de mensagens;
- Botão de envio;
- Indicador de conexão com o backend;
- Indicador visual de processamento;
- Exibição das mensagens do usuário;
- Exibição das respostas do Watson;
- Mensagens de erro;
- Aviso sobre finalidade educacional;
- Layout responsivo.

---

## Comunicação com o Backend

O JavaScript utiliza a Fetch API para enviar mensagens ao Flask.

```javascript
const response = await fetch(
    `${API_BASE}/chat`,
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            message: text
        }),

        credentials: "include"
    }
);
```

O uso de `credentials: "include"` permite preservar a sessão utilizada pelo Flask durante a conversa.

---

## CORS

Durante o desenvolvimento, a interface e o backend podem ser executados em portas diferentes:

```text
Frontend:
http://127.0.0.1:5500

Backend:
http://127.0.0.1:5000
```

Por esse motivo, foi utilizado **Flask-CORS** para permitir a comunicação entre as aplicações durante a execução local.

---

# Estrutura do Projeto

A estrutura principal do projeto está organizada da seguinte forma:

```text
2TIAOA-CAP01-F5/
│
├── assets/
├── config/
├── document/
├── scripts/
│
├── src/
│   │
│   ├── frontend/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   └── app.js
│   │   └── index.html
│   │
│   └── part1-watson/
│       ├── dataset/
│       ├── services/
│       │   └── watson_service.py
│       ├── static/
│       ├── templates/
│       ├── tests/
│       ├── watson/
│       └── app.py
│
├── .env
├── .gitattributes
├── .gitignore
├── LICENSE
├── README.md
└── requirements.txt
```

> O arquivo `.env` contém configurações locais e credenciais e não deve ser enviado ao repositório público.

---

# Pré-requisitos

Para executar o projeto, recomenda-se possuir:

- Python 3;
- pip;
- navegador web atualizado;
- conta e serviço configurado no IBM watsonx Assistant;
- credenciais válidas da API;
- VS Code com Live Server ou servidor web equivalente.

---

# Instalação

## 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
```

Entre na pasta do projeto:

```bash
cd 2TIAOA-CAP01-F5
```

---

## 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

Entre na pasta do backend:

```bash
cd src/part1-watson
```

---

## 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na localização utilizada pelo projeto contendo:

```env
WATSON_API_KEY=your_api_key
WATSON_URL=your_service_url
WATSON_ASSISTANT_ID=your_assistant_id
WATSON_ENVIRONMENT_ID=your_environment_id
```

Não publique credenciais reais no GitHub.

---

# Como Executar

## Backend

Dentro da pasta:

```text
src/part1-watson/
```

execute:

```bash
python app.py
```

O Flask será iniciado, por padrão, em:

```text
http://127.0.0.1:5000
```

Para verificar o backend:

```text
http://127.0.0.1:5000/health
```

---

## Interface

Abra:

```text
src/frontend/index.html
```

utilizando o **Live Server**.

Por padrão, a interface pode ser executada em:

```text
http://127.0.0.1:5500
```

O indicador da aplicação deverá apresentar:

```text
Connected to Watson
```

---

# Exemplo de Uso

Com o backend e a interface em execução, envie uma mensagem em inglês:

```text
I have chest pain
```

O Watson identifica a intenção e inicia o fluxo correspondente.

Exemplo:

```text
User:
I have chest pain

Assistant:
On a scale from 0 to 10, how severe is the pain?

User:
8

Assistant:
How long have you been feeling this pain?
```

A conversa continuará de acordo com os Dialog Nodes configurados no IBM watsonx Assistant.

---

# Tecnologias Utilizadas

| Technology | Application |
| --- | --- |
| IBM watsonx Assistant | Conversational AI and NLP |
| Python | Backend |
| Flask | REST API |
| IBM Watson SDK | Watson integration |
| Flask-CORS | Cross-origin communication |
| python-dotenv | Environment configuration |
| HTML5 | Interface structure |
| CSS3 | Interface styling |
| JavaScript | Interface logic |
| Fetch API | Frontend/backend communication |
| Git/GitHub | Version control |

---

# Segurança e Limitações

O CardioIA foi desenvolvido como um **protótipo acadêmico**.

O sistema:

- não realiza diagnóstico médico;
- não prescreve medicamentos;
- não substitui profissionais da saúde;
- não utiliza protocolo clínico validado;
- não deve ser utilizado para decisões médicas reais.

As regras utilizadas no fluxo servem exclusivamente para demonstrar conceitos de NLP, lógica condicional e desenvolvimento de assistentes conversacionais.

Em uma aplicação real na área da saúde seriam necessários requisitos adicionais relacionados à segurança, privacidade, LGPD, validação clínica, infraestrutura e responsabilidade profissional.

---

# Entregáveis

O projeto contempla:

- Código-fonte do backend em Python;
- Integração com IBM watsonx Assistant;
- Intents, Entities e Dialog Nodes;
- Exportação/configuração do assistente em JSON;
- Interface web funcional;
- Relatório técnico;
- Repositório GitHub organizado;
- Vídeo demonstrativo da aplicação.

---

# Vídeo Demonstrativo

Vídeo de demonstração do funcionamento do CardioIA:

```text
INSERIR LINK DO VÍDEO AQUI
```

---

# Documentação

O relatório técnico do projeto está disponível na pasta:

```text
document/
```

---

# Licença

<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1">

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/">
<a property="dct:title" rel="cc:attributionURL" href="https://github.com/agodoi/template">MODELO GIT FIAP</a> por
<a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://fiap.com.br">FIAP</a>
está licenciado sobre
<a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution 4.0 International</a>.
</p>