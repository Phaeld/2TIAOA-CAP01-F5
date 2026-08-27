# FIAP - Faculdade de Informática e Administração Paulista

<p align="center">
<a href="https://www.fiap.com.br/"><img src="../assets/logo-fiap.png" alt="FIAP - Faculdade de Informática e Administração Paulista" border="0" width="40%" height="40%"></a>
</p>

## 📜 Descrição

O objetivo desta etapa foi expandir as capacidades do Assistente Cardiológico, implementando um fluxo de IA Generativa capaz de ler e interpretar conteúdos clínicos simulados em formato de texto livre (não estruturados). A meta final é extrair dados médicos críticos e organizá-los em um formato estruturado (JSON), permitindo que sistemas automatizados e bancos de dados possam consumir essas informações rapidamente.


## 1. Arquitetura e Fluxo do Processo

O fluxo foi construído utilizando a linguagem Python, integrando o SDK atualizado do Google Gemini (google.genai). O processo segue três etapas principais:

- Entrada de Dados (Input): Recepção de um texto simulado que imita a anotação discursiva de um profissional de saúde durante uma triagem de emergência cardiológica.
- Processamento (LLM): Envio do texto bruto para a API do modelo generativo (Gemini 2.5 Flash), acompanhado de instruções rigorosas de formatação e extração.
- Estruturação de Saída (Output): Recepção dos dados empacotados nativamente em um arquivo JSON válido, com chaves predefinidas, pronto para integração com a aplicação backend desenvolvida na Parte 1 do projeto.

## 2. Técnicas de Prompting e Engenharia Utilizadas

Para garantir que o modelo devolvesse um código utilizável por uma máquina de forma determinística, as seguintes abordagens técnicas foram aplicadas no código:

- System Prompting (Persona): O modelo foi instruído a atuar como um "assistente de IA especializado em cardiologia e estruturação de dados". Isso calibra os pesos semânticos do modelo e otimiza o reconhecimento de entidades e termos médicos.
- Zero-Shot Prompting com Formatação Estrita: O prompt detalhou exatamente as chaves do dicionário esperado (como "pressao_arterial", "frequencia_cardiaca", "nivel_urgencia"), forçando a estrutura de saída sem a necessidade de múltiplos exemplos prévios.
- Controle de Temperatura (Temperature = 0.1): Como a tarefa exige extração analítica e precisão (não criatividade), a temperatura foi reduzida quase a zero. Isso garante respostas consistentes, lógicas e minimiza drasticamente o risco de alucinações da IA.
- Structured Output (MIME Type): Foi utilizado o parâmetro response_mime_type="application/json" na configuração da API. Essa diretiva força o LLM a retornar exclusivamente um objeto JSON limpo na camada da API, dispensando o uso de processamentos secundários (como Regex) para limpar textos markdown indesejados.

## 3. Resultados Obtidos

O modelo foi capaz de ler o texto discursivo sobre um paciente com dor no peito e deduzir variáveis clínicas com precisão. Destaca-se a capacidade da IA de classificar automaticamente o nivel_urgencia como "Alto", inferindo a gravidade a partir do contexto clínico relatado (dor irradiada e solicitação de ECG), demonstrando a eficácia da aplicação de Modelos de Linguagem Grande (LLMs) no apoio à triagem médica.


## 📁 Estrutura de pastas

Dentre os arquivos e pastas presentes na raiz do projeto, definem-se:

- <b>document</b>: aqui estão todos os documentos do projeto que as atividades poderão pedir. Na subpasta "other", adicione documentos complementares e menos importantes.

- <b>scripts</b>: Posicione aqui scripts auxiliares para tarefas específicas do seu projeto. Exemplo: deploy, migrações de banco de dados, backups.

## 🔧 Como executar o código

O código pode ser executado a partir do arquivo "extracao_clinica_ia.ipynb" disponibilizado. Subiremos a chave da API no FIAP ON no momento da entrega por questões de segurança. Para executar, utilizando o Google Colab, basta configurar a chave de API no secrets do Colab ou substituir a referência para chave diretamente. A linha estará indicada por comentário no código.


## 🗃 Histórico de lançamentos

* 0.1.0 - 27/08/2024


## 📋 Licença

<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/agodoi/template">MODELO GIT FIAP</a> por <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://fiap.com.br">Fiap</a> está licenciado sobre <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution 4.0 International</a>.</p>


