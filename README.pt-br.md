# Orbital Risk Analysis

Sistema de análise de risco de colisão orbital em LEO (*Low Earth Orbit*). Combina dados públicos de satélites e detritos espaciais com um pipeline de *machine learning* para estimar, ranquear e visualizar o risco relativo de colisão em diferentes altitudes e tipos de objetos orbitais.

> **Aviso:** O modelo produz uma estimativa de risco *relativo*, baseada em um *proxy* físico de taxa de colisão. Não é um sistema de análise de conjunção operacional e não substitui ferramentas como CARA (Conjunction Assessment Risk Analysis) da NASA.

---

## Sumário

1. [Motivação Científica e Técnica](#motivação-científica-e-técnica)
2. [Fundamentos Astronômicos e Físicos](#fundamentos-astronômicos-e-físicos)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Pipeline de Dados](#pipeline-de-dados)
5. [Modelo de Machine Learning](#modelo-de-machine-learning)
6. [API Backend](#api-backend)
7. [Frontend](#frontend)
8. [Notebooks](#notebooks)
9. [Estrutura do Projeto](#estrutura-do-projeto)
10. [Como Executar](#como-executar)
11. [Deploy](#deploy)
12. [Limitações do Modelo e do Domínio](#limitações-do-modelo-e-do-domínio)
13. [Próximos Passos](#próximos-passos)
14. [Referências](#referências)

---

## Motivação Científica e Técnica

O espaço próximo à Terra nunca esteve tão congestionado. Em 2024, o catálogo público do Space-Track registra mais de 27.000 objetos ativos em órbita baixa — entre satélites operacionais, foguetes descartados e fragmentos de colisões passadas. Constelações como Starlink adicionam centenas de objetos por ano, enquanto eventos históricos como o teste ASAT chinês de 2007 (Fengyun-1C) e a colisão Iridium 33 × Cosmos 2251 em 2009 ainda contribuem com milhares de fragmentos rastreáveis.

O problema central é que cada novo objeto em LEO aumenta a probabilidade de colisões futuras que, por sua vez, geram mais detritos — um ciclo potencialmente autossustentável descrito pela síndrome de Kessler. Mesmo fragmentos milimétricos viajando a 7–8 km/s carregam energia cinética suficiente para desabilitar satélites.

Este projeto aborda duas perguntas práticas:

1. **Qual o risco relativo de colisão de um objeto com base em sua órbita e no ambiente orbital local?**
2. **Quais faixas de altitude em LEO são as mais críticas hoje e como esse risco evolui até 2035?**

A abordagem é computacional: construção de *features* fisicamente motivadas por objeto orbital, treinamento de um modelo de regressão com validação cruzada por altitude, e exposição dos resultados via API REST e dashboard interativo.

---

## Fundamentos Astronômicos e Físicos

### O que é LEO

*Low Earth Orbit* (LEO) é a região de 200 a 2.000 km de altitude acima da superfície terrestre. É a órbita mais populosa: nela operam a Estação Espacial Internacional (ISS, ~400 km), constelações de internet (Starlink, ~550 km), satélites de observação da Terra e a maior concentração de detritos espaciais do catálogo público.

### Por que essa região é crítica

- **Velocidade orbital elevada:** objetos em LEO orbitam a 7,5–7,9 km/s. A energia cinética de um fragmento de 1 kg é equivalente a uma explosão de centenas de quilos de TNT.
- **Alta densidade de objetos:** a maioria das missões espaciais historicamente operou nessa faixa, acumulando detritos por décadas.
- **Arrasto atmosférico residual:** abaixo de ~600 km, o arrasto da atmosfera superior causa decaimento orbital natural em décadas ou anos. Acima de 900 km, objetos permanecem em órbita por séculos.
- **Efeito Kessler:** se a densidade de objetos ultrapassar um limiar crítico, colisões geram fragmentos que causam mais colisões — uma reação em cadeia que pode tornar certas altitudes inutilizáveis.

### Mecânica orbital relevante

| Grandeza | Definição | Impacto no risco |
|---|---|---|
| **Altitude** | Distância à superfície (km). Usamos a média entre apogeu e perigeu. | Determina o ambiente orbital local (densidade de vizinhos). |
| **Inclinação** | Ângulo entre o plano orbital e o equador (0°–180°). | Dois objetos com inclinações diferentes se cruzam em ângulos elevados, aumentando a velocidade relativa. |
| **Excentricidade** | Elipticidade da órbita (0 = circular, 1 = parabólica). | Órbitas circulares são mais previsíveis; órbitas excêntricas variam altitude ao longo de cada volta. |
| **Período orbital** | Tempo de uma volta completa (~88–130 min em LEO). | Derivado da altitude; não adiciona informação independente, mas é útil como *feature* numérica. |
| **BSTAR** | Coeficiente de arrasto do TLE (relação área/massa × coeficiente de drag). | Objetos com BSTAR alto decaem mais rápido; indica estrutura frágil ou grande área transversal. |
| **Velocidade orbital** | v ≈ √(μ/r), μ = 398.600 km³/s². | Decresce com a altitude; combinada com dispersão de inclinações, define a velocidade relativa de encontros. |

### O que influencia o risco de colisão

A taxa de colisão de um objeto com detritos vizinhos é aproximada pela expressão de Kessler (1978):

```
Taxa ∝ n_debris × σ × v_rel
```

Onde `n_debris` é a densidade de detritos na vizinhança, `σ` é a seção transversal combinada, e `v_rel` é a velocidade relativa entre os objetos. Este projeto estima `n_debris` contando objetos em uma casca esférica de ±50 km ao redor de cada altitude, e aproxima `v_rel` via a dispersão de inclinações dos vizinhos.

### Zonas de congestionamento em LEO

Com base nos dados do catálogo atual:

- **400–500 km:** alta densidade de satélites ativos (Starlink, ISS). Alto volume total, mas com fração de detritos menor.
- **700–900 km:** zona crítica de detritos. Concentra fragmentos de Fengyun-1C, Cosmos 2251 e Iridium 33. Cerca de 85–90% dos objetos nessa faixa são detritos ou foguetes não controlados. O IRR (*Índice de Risco Relativo*) dessa faixa atinge 6,3–6,8 em uma escala de 0 a 10.
- **Acima de 1.000 km:** objetos permanecem por séculos. A constelação Starlink evita ativamente altitudes acima de 600 km para garantir decaimento em 5 anos.

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         Fonte de Dados                       │
│  Space-Track API (TLE / SATCAT)  ·  CelesTrak (ativos)      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Pipeline Offline (Notebooks)              │
│  01_eda.ipynb → 02_features.ipynb → 03_model.ipynb          │
│                                                              │
│  data/raw/*.csv → data/processed/*.parquet + models/*.joblib │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI / Python)                 │
│  Carrega model.joblib + processed_features.parquet           │
│  Serve REST API: /objects · /analytics/* · /predict          │
│  Deploy: Railway (Dockerfile)                                │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP / JSON
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js / React)                 │
│  Dashboard · Analytics · Objects · Predição · Glossário      │
│  Deploy: Vercel                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Pipeline de Dados

### 1. Coleta (`src/data_loader.py`)

Os dados são baixados da [Space-Track API](https://www.space-track.org) usando a biblioteca `spacetrack`. São necessárias credenciais gratuitas (ver `.env.example`).

Dois conjuntos são coletados:
- **`satcat.csv`** — catálogo histórico desde 1957 (68.467 objetos).
- **`gp_leo.csv`** — elementos orbitais atuais de objetos em LEO, filtrados por `mean_motion > 11.25` rev/dia (equivalente a altitude < ~2.000 km) e `decay_date = null` (ainda em órbita).

### 2. Análise Exploratória (`notebooks/01_eda.ipynb`)

- Filtra para 27.994 objetos em LEO com elementos orbitais válidos.
- Composição: 12.541 detritos, 17.899 *payloads*, 2.394 corpos de foguete, 645 desconhecidos.
- Analisa distribuição temporal (crescimento acelerado pós-2019 com constelações) e distribuição por altitude.
- Identifica eventos críticos: teste ASAT Fengyun-1C (2007) e colisão Iridium/Cosmos (2009).

### 3. Feature Engineering (`notebooks/02_features.ipynb`)

Para cada um dos 27.994 objetos, são calculadas 13 *features* fisicamente motivadas:

**Features orbitais base** (derivadas dos TLEs):

| Feature | Descrição |
|---|---|
| `altitude_km` | Altitude média: (apogeu + perigeu) / 2 |
| `inclination_deg` | Inclinação orbital (graus) |
| `eccentricity` | Excentricidade |
| `velocity_km_s` | Velocidade orbital circular: √(μ/r) |
| `period_min` | Período orbital em minutos |
| `bstar_abs` | Valor absoluto do coeficiente BSTAR |

**Features de ambiente orbital local** (vizinhança ±50 km):

| Feature | Descrição |
|---|---|
| `local_density_km3` | Densidade total de objetos (obj/km³) |
| `debris_fraction_local` | Proporção de detritos entre os vizinhos |
| `incl_dispersion_local` | Desvio padrão das inclinações dos vizinhos (proxy de velocidade relativa) |
| `alt_density_gradient` | Gradiente de densidade entre faixas adjacentes |

**Features categóricas**:

| Feature | Descrição |
|---|---|
| `object_type_code` | 0=PAYLOAD, 1=ROCKET BODY, 2=DEBRIS, 3=UNKNOWN |
| `is_debris` | Flag binária para detritos |
| `is_uncontrolled` | Flag binária para objetos não manobráveis |

### 4. Construção do Target (`CPS_log`)

O *Conjunction Proxy Score* (CPS) é uma aproximação da taxa de colisão baseada em Kessler (1978):

```
CPS = debris_density_km3 × vrel_proxy

vrel_proxy = velocity_km_s × √(2 − 2 × cos(incl_dispersion_rad))
```

O CPS bruto tem valores da ordem de 10⁻⁸. Para gerar um target com variância estatisticamente útil:

```
CPS_scaled = CPS / mediana_positiva(CPS)   # mediana = 1.0
CPS_log    = log1p(CPS_scaled)             # distribuição: média=0.83, std=0.53
```

**Thresholds de risco:**
- `LOW`: CPS_log < 0,40
- `MEDIUM`: 0,40 ≤ CPS_log ≤ 1,00
- `HIGH`: CPS_log > 1,00

---

## Modelo de Machine Learning

### Estratégia de validação

Para evitar vazamento de informação espacial (objetos próximos em altitude compartilham ambiente), o split é feito por faixas de altitude usando `GroupKFold(5)`:

- **Treino:** 80% das faixas de altitude (29 bandas).
- **Teste:** 20% das faixas nunca vistas pelo modelo (7 bandas).

### Modelos comparados

| Modelo | CV RMSE | Test RMSE | Test MAE | R² (band-level) |
|---|---|---|---|---|
| Dummy (média) | 0,707 | — | — | — |
| Ridge | 0,518 | — | — | — |
| **Random Forest** | **0,331** | **0,100** | **0,069** | **0,984** |
| HistGradientBoosting | 0,350 | — | — | — |

**Modelo escolhido:** `RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42)`

### Interpretação das métricas

O R² negativo no CV intragrupo não indica falha do modelo: dentro de cada faixa de altitude, o desvio padrão do CPS_log é ~0,033 (variância ≈ 0,001). Qualquer predição com RMSE > 0,033 produz R² < 0. A métrica relevante é o **R² em nível de faixa** (band-level), que mede se o modelo ranqueia corretamente as zonas de risco entre diferentes altitudes — e aqui o resultado é 0,984.

O modelo generaliza bem: a faixa 850–900 km (a de maior risco) é prevista com erro médio de apenas 0,037 unidades de CPS_log.

### Importância de features

As cinco features mais influentes (por importância de Gini):

| Feature | Importância relativa | Correlação com CPS_log |
|---|---|---|
| `debris_fraction_local` | 0,315 | +0,806 |
| `local_density_km3` | 0,284 | −0,301 |
| `is_debris` | 0,165 | +0,564 |
| `is_uncontrolled` | 0,112 | +0,549 |
| `incl_dispersion_local` | 0,048 | −0,604 |

A proporção de detritos na vizinhança responde sozinha por ~32% da importância total do modelo.

### Carregamento do modelo

O modelo treinado é persistido em `models/best_model.joblib` (~56 MB). No startup do backend, é carregado como singleton via `joblib.load`. As 13 features de entrada são validadas contra uma lista interna antes da predição para prevenir falhas silenciosas.

---

## API Backend

**Tecnologias:** FastAPI · Uvicorn · Pydantic v2 · Pandas · scikit-learn · PyArrow

**Inicialização:** no startup via `lifespan`, o backend carrega o modelo (`best_model.joblib`) e o dataset processado (`processed_features.parquet`), pré-computando correlações de Pearson, histogramas e amostras para scatter plots.

### Endpoints

#### `GET /health`
Verifica se o servidor está operacional.
```json
{ "status": "ok" }
```

---

#### `GET /objects`
Retorna a lista paginada de objetos orbitais com suas predições.

**Query params:** `page`, `limit`, `risk` (LOW | MEDIUM | HIGH), `search` (NORAD ID ou tipo), `sort`, `order`

```json
{
  "items": [
    { "norad_cat_id": 25544, "object_type": "PAYLOAD", "altitude_km": 418.5,
      "predicted_CPS_log": 0.312, "risk_category": "LOW", "..." : "..." }
  ],
  "total": 27994,
  "page": 1,
  "pages": 560,
  "limit": 50
}
```

---

#### `GET /objects/{norad_id}`
Retorna o detalhe completo de um único objeto, incluindo todas as 13 features e a predição.

---

#### `GET /analytics/summary`
Estatísticas gerais do catálogo: total de objetos, média/desvio/mín/máx do CPS_log, contagem por categoria de risco e histograma de 60 bins.

---

#### `GET /analytics/by-altitude`
Agregação por faixa de 50 km: contagem de objetos, CPS_log médio e percentual de alto risco por faixa.

---

#### `GET /analytics/scatter`
Amostra estratificada de 2.000 pontos para scatter plot de altitude vs. CPS_log, com categoria de risco e tipo de objeto.

---

#### `GET /analytics/by-type`
Breakdown por tipo de objeto (PAYLOAD, ROCKET BODY, DEBRIS, UNKNOWN): contagem, CPS_log médio e percentual HIGH.

---

#### `GET /analytics/feature-importance`
Importâncias de Gini do Random Forest para cada uma das 13 features.

---

#### `GET /analytics/correlations`
Correlações de Pearson entre cada feature e o CPS_log, calculadas sobre o dataset completo.

---

#### `POST /predict`
Predição em tempo real para um objeto hipotético. Útil para cenários exploratórios ("o que acontece se eu colocar um satélite a 800 km com inclinação 87°?").

**Request body:**
```json
{
  "altitude_km": 750.0,
  "inclination_deg": 53.0,
  "eccentricity": 0.001,
  "velocity_km_s": 7.5,
  "period_min": 99.0,
  "bstar_abs": 0.0001,
  "local_density_km3": 6e-8,
  "debris_fraction_local": 0.36,
  "incl_dispersion_local": 17.7,
  "alt_density_gradient": 0.0,
  "object_type_code": 0,
  "is_debris": 0,
  "is_uncontrolled": 0
}
```

**Response:**
```json
{
  "predicted_CPS_log": 0.693,
  "risk_category": "MEDIUM",
  "input_features": { "...": "..." }
}
```

---

## Frontend

**Tecnologias:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Recharts · SWR · Framer Motion

O frontend consome a API via hooks SWR com timeout de 35 segundos (o backend em Railway pode ter cold start). Suporta dois idiomas (português e inglês) via contexto React sem dependências externas de i18n.

### Páginas

| Rota | Descrição |
|---|---|
| `/` | Dashboard principal com KPIs, histograma, pizza de risco e scatter |
| `/analytics` | Análise por tipo de objeto, correlações e importância de features |
| `/objects` | Tabela paginada e filtrável de todos os 27.994 objetos |
| `/objects/[norad_id]` | Página de detalhe de um objeto individual |
| `/predicao` | Ferramenta interativa de predição para cenários hipotéticos |
| `/glossario` | Definições dos termos técnicos usados no sistema |

### Componentes principais

**Dashboard:**
- `KpiCards` — 4 indicadores: total de objetos, CPS_log médio, % alto risco, % baixo risco.
- `RiskHistogram` — histograma de 60 bins do CPS_log para toda a população.
- `RiskPieChart` — distribuição proporcional entre LOW, MEDIUM e HIGH.
- `AltitudeBarChart` — barras empilhadas por faixa de 50 km.
- `RiskScatter` — scatter interativo de altitude vs. CPS_log, com 2.000 pontos estratificados.

**Objects:**
- `ObjectsTable` — busca por NORAD ID, filtro por risco, ordenação em todas as colunas, paginação.
- `RiskBadge` — badge colorida (verde/âmbar/vermelho) com ícone de risco.

**Prediction:**
- `PredictForm` — três painéis: parâmetros orbitais, ambiente local + tipo de objeto, resultado.
  - Dropdowns para tipo de objeto ajustam automaticamente `is_debris` e `is_uncontrolled`.
  - Resultado exibe CPS_log, categoria de risco e descrição textual dos thresholds.

---

## Notebooks

| Notebook | Objetivo |
|---|---|
| `01_eda.ipynb` | Exploração dos dados brutos: composição, distribuição temporal, análise por altitude, eventos históricos. |
| `02_features.ipynb` | Feature engineering: calcula densidade local, dispersão de inclinações, CPS_log e IRR por faixa de altitude. |
| `03_model.ipynb` | Treinamento e avaliação dos modelos de ML; salva `best_model.joblib`. |
| `03_modelo_ml.ipynb` | Variante com projeções temporais de risco até 2035 usando crescimento polinomial da população orbital. |

---

## Estrutura do Projeto

```
orbital-risk-analysis/
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app, lifespan, CORS, inclusão de routers
│       ├── model.py            # Singleton para carregamento do joblib
│       ├── data_loader.py      # Carrega Parquet, pré-computa histogramas e scatter
│       ├── schemas.py          # Pydantic schemas de request/response
│       ├── routes/
│       │   ├── objects.py      # GET /objects, GET /objects/{id}
│       │   ├── analytics.py    # GET /analytics/*
│       │   └── predict.py      # POST /predict
│       └── services/
│           └── prediction.py   # predict_single, predict_batch, risk_category
│
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard
│   │   ├── analytics/
│   │   ├── objects/
│   │   ├── predicao/
│   │   └── glossario/
│   ├── components/             # Componentes React
│   ├── hooks/                  # SWR hooks (useAnalytics, useObjects)
│   └── lib/                    # api.ts, types.ts, i18n.ts, utils.ts
│
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_features.ipynb
│   ├── 03_model.ipynb
│   └── 03_modelo_ml.ipynb
│
├── data/
│   ├── raw/
│   │   ├── satcat.csv          # Catálogo histórico (68.467 objetos)
│   │   ├── gp_leo.csv          # Elementos orbitais LEO (28.038 objetos)
│   │   └── celestrak_active_sats.csv
│   └── processed/
│       ├── processed_features.parquet   # Dataset ML (27.994 × 19 colunas)
│       ├── features_risco_leo.csv       # IRR por faixa de 100 km (18 faixas)
│       ├── features_por_faixa_50km.csv  # Agregado por faixa de 50 km
│       ├── irr_projetado_2024_2035.csv  # Projeções de risco até 2035
│       └── model_metrics.csv            # Métricas CV/test dos 4 modelos
│
├── models/
│   └── best_model.joblib       # Random Forest treinado (~56 MB)
│
├── src/
│   └── data_loader.py          # Script de coleta via Space-Track API
│
├── README.md                   # Este arquivo (inglês)
├── README.pt-br.md             # Versão em português
├── Dockerfile                  # Backend (Python 3.12-slim)
├── railway.toml                # Config Railway (builder: dockerfile)
├── pyproject.toml              # Dependências Python (uv/pip)
└── .env.example                # SPACETRACK_USER, SPACETRACK_PASS
```

---

## Como Executar

### Pré-requisitos

- Python 3.12+
- Node.js 20+
- Conta gratuita no [Space-Track](https://www.space-track.org) (para coletar dados novos)
- Os arquivos `data/processed/processed_features.parquet` e `models/best_model.joblib` precisam existir para o backend funcionar. Se ainda não existirem, execute os notebooks na ordem descrita abaixo.

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais Space-Track
```

### 2. (Opcional) Reprocessar dados e treinar o modelo

Execute os notebooks na seguinte ordem:

```
notebooks/01_eda.ipynb
notebooks/02_features.ipynb
notebooks/03_model.ipynb
```

Instale as dependências de desenvolvimento:

```bash
pip install -e .
# ou, se usar uv:
uv sync
```

### 3. Backend (desenvolvimento)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em `http://localhost:8000`. Documentação interativa (Swagger): `http://localhost:8000/docs`.

### 4. Frontend (desenvolvimento)

```bash
cd frontend
npm install
cp .env.example .env.local
# .env.local deve conter: NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

O dashboard estará disponível em `http://localhost:3000`.

### 5. Via Docker (backend)

```bash
docker build -t orbital-risk .
docker run -e PORT=8000 -p 8000:8000 orbital-risk
```

O Dockerfile copia `models/` e `data/processed/` para dentro do container automaticamente.

---

## Deploy

| Camada | Plataforma | Configuração |
|---|---|---|
| Backend | [Railway](https://railway.app) | `railway.toml` com builder Dockerfile. Variável de ambiente: `PORT`. |
| Frontend | [Vercel](https://vercel.com) | Next.js nativo. Variável: `NEXT_PUBLIC_API_URL=https://<seu-backend>.railway.app`. |

O frontend possui um timeout de 35 segundos nas requisições para acomodar o cold start do plano gratuito do Railway.

---

## Limitações do Modelo e do Domínio

### Limitações físicas

- **Vizinhança unidimensional:** a densidade local é calculada apenas por altitude (±50 km), ignorando RAAN (*Right Ascension of Ascending Node*) e argumento de perigeu. Dois objetos com a mesma altitude mas planos orbitais perpendiculares podem nunca se encontrar — ou se encontrar com frequência máxima. O modelo não distingue os dois casos.
- **Sem propagação orbital:** os elementos TLE são estáticos. O modelo não simula a evolução das órbitas ao longo do tempo (decaimento por arrasto, perturbações lunissolares, efeito Yarkovsky).
- **Seção transversal uniforme:** todos os objetos são tratados como tendo a mesma área de colisão. Na realidade, um parafuso e um satélite de 500 kg apresentam riscos muito diferentes.
- **Sem manobras:** o modelo não diferencia um satélite que pode desviar de um fragmento de um objeto passivo. Embora `is_uncontrolled` seja uma feature, o efeito das manobras preventivas não está modelado.

### Limitações do target (CPS_log)

- O *Conjunction Proxy Score* é uma heurística fisicamente motivada, não uma probabilidade de colisão calculada por análise de conjunção real (com TCA, distância mínima de aproximação, elipsoides de erro, etc.).
- O escalonamento pela mediana introduz dependência no conjunto de treinamento: se a população orbital mudar significativamente, os limiares de risco (LOW/MEDIUM/HIGH) precisariam ser recalibrados.

### Limitações dos dados

- O catálogo Space-Track cobre objetos rastreáveis por radar (~10 cm em LEO). Objetos menores — que representam a maior parte da população real de detritos — são invisíveis ao modelo.
- Objetos classificados como UNKNOWN (~1,4% do dataset) têm suas features de tipo configuradas de forma conservadora, o que pode subestimar ou superestimar o risco real.
- O dataset é um *snapshot* estático. A população LEO muda continuamente com novos lançamentos e decaimentos.

---

## Próximos Passos

### Melhorias de modelagem

- **Propagação TLE com SGP4:** usar `sgp4` ou `poliastro` para propagar órbitas e calcular encontros reais (distância mínima de aproximação, TCA).
- **Vizinhança 3D:** substituir a densidade 1D (±50 km em altitude) por uma densidade volumétrica considerando inclinação e RAAN, para melhor aproximar o ambiente real de encontros.
- **Monte Carlo de colisão:** estimar probabilidades de colisão absolutas via simulação, considerando elipsoides de erro dos TLEs.
- **Modelos de crescimento:** incorporar projeções de constelações aprovadas (Starlink Gen2, OneWeb, Amazon Kuiper) nas estimativas de risco futuro.

### Melhorias de dados

- **Atualização automática:** pipeline de coleta periódica (diária ou semanal) via Space-Track API.
- **Integração com LeoLabs ou ExoAnalytic:** dados de tracking de maior precisão para objetos pequenos.
- **Histórico de conjunções reais:** usar dados do CARA (NASA) ou eventos CDM públicos para validar o CPS_log contra probabilidades de colisão reais.

### Melhorias de produto

- **Alertas por NORAD ID:** notificações quando o risco de um objeto específico muda de categoria.
- **Comparação temporal:** visualizar a evolução do risco de uma faixa de altitude ao longo de meses.
- **Modo de simulação:** inserir um objeto hipotético no dataset e ver como ele afeta a densidade local dos vizinhos.

---

## Referências

- Kessler, D. J., & Cour-Palais, B. G. (1978). *Collision frequency of artificial satellites: The creation of a debris belt*. Journal of Geophysical Research, 83(A6), 2637–2646.
- Liou, J.-C., & Johnson, N. L. (2006). *Risks in space from orbiting debris*. Science, 311(5759), 340–341.
- Space-Track.org — catálogo público de objetos orbitais mantido pelo 18th Space Control Squadron (EUA): https://www.space-track.org
- CelesTrak — repositório público de TLEs e análises de tráfego espacial: https://celestrak.org
- NASA Orbital Debris Program Office: https://orbitaldebris.jsc.nasa.gov
- European Space Agency, Space Debris Office — *ESA's Annual Space Environment Report*: https://www.esa.int/Space_Safety/Space_Debris
- Klinkrad, H. (2006). *Space Debris: Models and Risk Analysis*. Springer Praxis Books.

---

*Licença MIT. Copyright 2026 Lucas Müller.*
