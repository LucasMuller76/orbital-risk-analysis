"use client";
import { useLanguage } from "@/lib/language-context";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Satellite, Activity, BarChart3, BrainCircuit, AlertTriangle, ShieldCheck, Info } from "lucide-react";

/* ─── Content data ──────────────────────────────────────────────────────────── */

const CONTENT = {
  en: {
    navLabel: "Navigate by section",
    sections: [
      { id: "projeto",  label: "The Project" },
      { id: "cps",      label: "CPS & CPS_log" },
      { id: "risco",    label: "Risk Categories" },
      { id: "orbital",  label: "Orbital Parameters" },
      { id: "local",    label: "Local Environment" },
      { id: "tipos",    label: "Object Types" },
      { id: "gerais",   label: "General Terms" },
      { id: "previsao", label: "Prediction Tool" },
    ],
    project: {
      icon: BookOpen,
      title: "The Project",
      body: "Orbital Risk Analysis is a collision risk prediction system for objects in Low Earth Orbit (LEO). Using Two-Line Element (TLE) data from Space-Track.org, we compute orbital and environmental features for 27,994 tracked objects. A Random Forest model is trained to predict the CPS_log of each object — a logarithmic conjunction proxy score. The model achieves R² ≈ 0.98 at the altitude-band level.",
      stats: [
        { value: "27,994", label: "tracked objects" },
        { value: "0.98",   label: "Band-level R²" },
        { value: "13",     label: "model features" },
      ],
    },
    cps: {
      icon: Activity,
      title: "CPS & CPS_log",
      intro: "The CPS (Conjunction Proxy Score) is the core metric of this project. It approximates the frequency of dangerous close approaches (conjunctions) an object may experience, inspired by the Kessler Cascade model.",
      formula: "CPS = debris_density_local × v_rel_proxy",
      formulaNote: "Where debris_density_local is the density of debris objects within ±50 km altitude (objects/km³), and v_rel_proxy is an estimate of relative velocity between objects with different inclinations.",
      terms: [
        { term: "CPS (Conjunction Proxy Score)", desc: "Raw conjunction risk score. Proportional to collision probability according to orbital physics: higher debris density + higher relative velocity = higher risk." },
        { term: "CPS_log", desc: "Logarithmic version of CPS: log₁₊(CPS × scale). Used directly by the ML model. More interpretable than raw CPS. Typical values between 0 and 1.8 in LEO." },
        { term: "Risk classification by CPS_log", desc: "The model classifies each object into one of three categories based on CPS_log thresholds. Objects with high CPS_log inhabit regions of high debris density with large orbital inclination diversity." },
      ],
    },
    risk: {
      icon: AlertTriangle,
      title: "Risk Categories",
      cards: [
        { level: "LOW RISK",    color: "text-emerald-400", threshold: "CPS_log < 0.40",            bg: "bg-emerald-950/20", border: "border-emerald-800/40", icon: ShieldCheck, desc: "The object is in a low-debris-density region. The probability of a dangerous conjunction is low. Typical of payloads in well-monitored orbits." },
        { level: "MEDIUM RISK", color: "text-amber-400",   threshold: "0.40 ≤ CPS_log ≤ 1.00",    bg: "bg-amber-950/20",   border: "border-amber-800/40",   icon: Activity,    desc: "Moderate risk. The object orbits in a region with relevant debris density or high inclination dispersion. Caution recommended for active satellites." },
        { level: "HIGH RISK",   color: "text-red-400",     threshold: "CPS_log > 1.00",             bg: "bg-red-950/20",     border: "border-red-800/40",     icon: AlertTriangle, desc: "Elevated collision risk. The object is in a dense debris zone, such as the critical 700–900 km band, where a Kessler Cascade is most probable." },
      ],
    },
    orbital: {
      icon: Satellite,
      title: "Orbital Parameters",
      terms: [
        { term: "Altitude (km)", desc: "Mean distance above Earth's surface. LEO spans 150–2,000 km. Higher altitudes have less atmospheric drag and longer lifetimes, but also concentrate more historical debris." },
        { term: "Inclination (°)", desc: "Angle between the orbital plane and the equatorial plane. 0° = equatorial orbit, 90° = polar orbit. Objects with very different inclinations have higher relative velocities in conjunctions, increasing damage risk." },
        { term: "Eccentricity", desc: "Measure of orbit shape. 0 = perfect circle, values approaching 1 = highly elongated ellipse. LEO objects typically have very low eccentricities (near 0)." },
        { term: "Velocity (km/s)", desc: "Orbital velocity of the object. In LEO, approximately 6–8 km/s. Objects at lower altitudes orbit faster. Relative velocity between two objects in crossing orbits can exceed 10 km/s, making any collision catastrophic." },
        { term: "Period (min)", desc: "Time to complete one full orbit around Earth. In LEO, ranges from ~88 min (400 km) to ~127 min (2000 km)." },
        { term: "B* (Drag Coefficient)", desc: "Ballistic coefficient describing how atmospheric drag decelerates the object. Objects with high B* decay faster from orbit. Derived from TLE data. Important for predicting orbital lifetime." },
      ],
    },
    local: {
      icon: BarChart3,
      title: "Local Environment",
      intro: "Local environment features are computed from each object's neighbourhood — all objects within ±50 km altitude band. These features captured the most predictive risk information in the model (Pearson r up to +0.95 with CPS_log).",
      terms: [
        { term: "Local density (obj/km³)", desc: "Total tracked objects per km³ in the ±50 km neighbourhood. Denser region = higher chance of close encounter. One of the most important model features." },
        { term: "Local debris fraction", desc: "Proportion of neighbourhood objects classified as DEBRIS. Debris is uncontrollable and cannot manoeuvre to avoid a conjunction. High debris fraction = much higher risk. Second most correlated feature with CPS_log (r ≈ +0.81)." },
        { term: "Inclination dispersion (°)", desc: "Standard deviation of orbital inclinations in the neighbourhood. High dispersion means nearby objects have very different orbits (crossing), resulting in higher relative velocities in conjunctions and greater risk." },
        { term: "Altitude density gradient", desc: "Rate of change of object density with altitude. Regions where density drops sharply tend to be boundaries of critical zones." },
      ],
    },
    types: {
      icon: Info,
      title: "Object Types",
      terms: [
        { term: "PAYLOAD", desc: "Operational satellites or scientific instruments intentionally launched. Can be actively controlled to manoeuvre away from conjunctions. Lower relative risk as a debris source." },
        { term: "ROCKET BODY", desc: "Spent propulsion stages discarded after launch. Uncontrollable but generally large and well-tracked. Can fragment in collisions, generating debris clouds." },
        { term: "DEBRIS", desc: "Fragments from satellites, previous collisions, or discarded components. Uncontrollable and often too small to track individually. Main contributors to risk in dense zones. The model assigns them the highest mean risk." },
        { term: "UNKNOWN", desc: "Objects of unidentified type or origin in the catalogue. High uncertainty. Treated as uncontrollable by the model." },
        { term: "Uncontrollable object (is_uncontrolled)", desc: "Flag indicating the object cannot execute avoidance manoeuvres. Includes all types except PAYLOAD. Uncontrollable objects increase the systemic risk of an orbit." },
      ],
    },
    general: {
      icon: BookOpen,
      title: "General Terms",
      terms: [
        { term: "LEO — Low Earth Orbit", desc: "Region of space between 150 and 2,000 km altitude. Concentrates the vast majority of tracked satellites and debris. Lower communication latency but higher collision risk due to high object density." },
        { term: "NORAD ID (Catalog number)", desc: "Unique 5-digit identifier assigned by NORAD to each tracked object in orbit. Allows unambiguous identification of a satellite or debris piece among tens of thousands of objects." },
        { term: "TLE — Two-Line Elements", desc: "Standard data format describing an object's orbit in two lines of text containing parameters such as inclination, eccentricity, period, and epoch. Regularly updated by Space-Track.org." },
        { term: "Conjunction", desc: "Close approach between two space objects at a distance small enough to be considered dangerous (typically less than 1 km along some axis). Operational satellites may execute manoeuvres to avoid predicted conjunctions." },
        { term: "Kessler Effect", desc: "Theoretical scenario proposed by Donald Kessler in 1978: if orbital object density reaches a critical level, collisions generate debris that causes more collisions in a cascade, rendering certain orbits unusable for decades or centuries. The CPS in this project is inspired by this model." },
        { term: "Space-Track.org", desc: "Portal operated by the 18th Space Defense Squadron providing TLE data and conjunction information to the global space community. Primary data source for this project." },
        { term: "Random Forest", desc: "Machine learning algorithm based on multiple decision trees. Used in this project to predict CPS_log from 13 orbital and environmental features. Achieved R² ≈ 0.98 at the 50 km altitude band level." },
      ],
    },
    predict: {
      icon: BrainCircuit,
      title: "Prediction Tool",
      body: "The Prediction Tool lets you manually enter the orbital parameters of a hypothetical (or real) object and get a CPS_log prediction and risk category directly from the trained Random Forest model.",
      howTitle: "How to use",
      steps: [
        "Go to the Prediction page in the sidebar.",
        "Enter the orbital parameters (altitude, inclination, etc.).",
        "Enter the local environment parameters (density, debris fraction, etc.) if known. Otherwise the defaults represent a typical 750 km orbit.",
        "Select the object type — debris and control flags are updated automatically.",
        "Click Calculate Risk to get the CPS_log and risk category.",
      ],
      note: "Local environment parameters (local density, debris fraction, inclination dispersion) are the most influential in the result. For an accurate prediction of a real object, these values should be computed from the full catalogue of objects in the same altitude band.",
    },
  },

  pt: {
    navLabel: "Navegar por seção",
    sections: [
      { id: "projeto",  label: "O Projeto" },
      { id: "cps",      label: "CPS & CPS_log" },
      { id: "risco",    label: "Categorias de Risco" },
      { id: "orbital",  label: "Parâmetros Orbitais" },
      { id: "local",    label: "Ambiente Local" },
      { id: "tipos",    label: "Tipos de Objeto" },
      { id: "gerais",   label: "Termos Gerais" },
      { id: "previsao", label: "Ferramenta de Previsão" },
    ],
    project: {
      icon: BookOpen,
      title: "O Projeto",
      body: "O Orbital Risk Analysis é um sistema de previsão de risco de colisão para objetos em Órbita Baixa Terrestre (LEO). Utilizando dados TLE da Space-Track.org, calculamos features orbitais e ambientais para 27.994 objetos rastreados. Um modelo Random Forest foi treinado para prever o CPS_log de cada objeto — um score logarítmico de risco de conjunção. O modelo alcança R² ≈ 0.98 ao nível de faixas de altitude.",
      stats: [
        { value: "27.994", label: "objetos rastreados" },
        { value: "0.98",   label: "R² banda-nível" },
        { value: "13",     label: "features do modelo" },
      ],
    },
    cps: {
      icon: Activity,
      title: "CPS & CPS_log",
      intro: "O CPS (Conjunction Proxy Score) é a métrica central deste projeto. Ele representa uma aproximação da frequência de conjunções perigosas que um objeto pode sofrer, inspirado no modelo de Cascata de Kessler.",
      formula: "CPS = debris_density_local × v_rel_proxy",
      formulaNote: "Onde debris_density_local é a densidade de detritos na vizinhança ±50 km de altitude (objetos/km³), e v_rel_proxy é uma estimativa da velocidade relativa entre objetos com inclinações distintas.",
      terms: [
        { term: "CPS (Conjunction Proxy Score)", desc: "Score bruto de risco de conjunção. Proporcional à probabilidade de colisão: maior densidade de detritos + maior velocidade relativa = maior risco." },
        { term: "CPS_log", desc: "Versão logarítmica do CPS: log₁₊(CPS × escala). Usado diretamente pelo modelo de ML. Mais interpretável que o CPS bruto. Valores típicos entre 0 e 1,8 em LEO." },
        { term: "Classificação por CPS_log", desc: "O modelo classifica cada objeto em uma de três categorias com base nos thresholds do CPS_log. Objetos com CPS_log alto habitam regiões de alta densidade de detritos com grande diversidade de inclinações orbitais." },
      ],
    },
    risk: {
      icon: AlertTriangle,
      title: "Categorias de Risco",
      cards: [
        { level: "BAIXO RISCO", color: "text-emerald-400", threshold: "CPS_log < 0,40",          bg: "bg-emerald-950/20", border: "border-emerald-800/40", icon: ShieldCheck,   desc: "O objeto está em uma região de baixa densidade de detritos. A probabilidade de conjunção perigosa é reduzida. Típico de payloads em órbitas bem monitoradas." },
        { level: "RISCO MÉDIO", color: "text-amber-400",   threshold: "0,40 ≤ CPS_log ≤ 1,00", bg: "bg-amber-950/20",   border: "border-amber-800/40",   icon: Activity,      desc: "Risco moderado. O objeto orbita em uma região com densidade relevante de detritos ou alta dispersão de inclinações. Atenção recomendada para satélites operacionais." },
        { level: "ALTO RISCO",  color: "text-red-400",     threshold: "CPS_log > 1,00",           bg: "bg-red-950/20",     border: "border-red-800/40",     icon: AlertTriangle, desc: "Alto risco de colisão. O objeto está em uma zona densa de detritos, como a faixa crítica de 700–900 km, onde o Efeito Kessler é mais provável." },
      ],
    },
    orbital: {
      icon: Satellite,
      title: "Parâmetros Orbitais",
      terms: [
        { term: "Altitude (km)", desc: "Distância média acima da superfície terrestre. A LEO abrange de 150 a 2.000 km. Altitudes mais altas têm menor arrasto e maior vida útil, mas concentram mais detritos históricos." },
        { term: "Inclinação (°)", desc: "Ângulo entre o plano orbital e o equatorial. 0° = equatorial, 90° = polar. Objetos com inclinações muito diferentes têm maior velocidade relativa em conjunções, aumentando o risco de dano." },
        { term: "Excentricidade", desc: "Formato da órbita. 0 = circular perfeita, próximo de 1 = elipse muito alongada. Objetos em LEO geralmente têm excentricidades baixas (próximas de 0)." },
        { term: "Velocidade (km/s)", desc: "Velocidade orbital do objeto. Em LEO, em torno de 6–8 km/s. Objetos mais baixos orbitam mais rápido. A velocidade relativa em órbitas cruzadas pode superar 10 km/s, tornando qualquer colisão catastrófica." },
        { term: "Período (min)", desc: "Tempo para completar uma órbita completa. Em LEO, varia de ~88 min (400 km) a ~127 min (2000 km)." },
        { term: "B* (Coeficiente de Arrasto)", desc: "Coeficiente balístico que descreve o arrasto atmosférico. Objetos com B* alto decaem mais rápido. Derivado do TLE. Importante para prever o tempo de vida orbital." },
      ],
    },
    local: {
      icon: BarChart3,
      title: "Ambiente Local",
      intro: "As features de ambiente local são calculadas a partir da vizinhança de cada objeto — todos os objetos dentro de uma faixa de ±50 km de altitude. Essas features capturaram as informações mais preditivas de risco no modelo (Pearson r até +0,95 com CPS_log).",
      terms: [
        { term: "Densidade local (obj/km³)", desc: "Número total de objetos por km³ na vizinhança de ±50 km. Região mais densa = maior chance de encontro próximo. Uma das features mais importantes do modelo." },
        { term: "Fração de detritos (local)", desc: "Proporção de objetos na vizinhança que são DEBRIS. Detritos são incontroláveis e não podem desviar de uma conjunção. Alta fração = risco muito maior. Segunda feature mais correlacionada (r ≈ +0,81)." },
        { term: "Dispersão de inclinação (°)", desc: "Desvio padrão das inclinações orbitais dos vizinhos. Alta dispersão = órbitas cruzadas, maiores velocidades relativas, maior risco." },
        { term: "Gradiente de densidade altitudinal", desc: "Taxa de variação da densidade de objetos com a altitude. Regiões com queda abrupta tendem a ser limites de zonas críticas." },
      ],
    },
    types: {
      icon: Info,
      title: "Tipos de Objeto",
      terms: [
        { term: "PAYLOAD (Carga útil)", desc: "Satélites operacionais ou instrumentos científicos. Podem ser controlados ativamente para desviar de conjunções. Menor risco relativo como fonte de detritos." },
        { term: "ROCKET BODY (Corpo de foguete)", desc: "Estágios de propulsão descartados após o lançamento. Incontroláveis, mas geralmente grandes e bem rastreados. Podem fragmentar-se em colisões." },
        { term: "DEBRIS (Detrito)", desc: "Fragmentos de satélites, colisões ou componentes descartados. Incontroláveis e frequentemente pequenos demais para rastrear individualmente. Principais contribuintes ao risco em zonas densas." },
        { term: "UNKNOWN (Desconhecido)", desc: "Objetos de origem ou tipo não identificado. Alta incerteza. Tratados como incontroláveis pelo modelo." },
        { term: "Objeto incontrolável (is_uncontrolled)", desc: "Flag que indica se o objeto não pode executar manobras de evasão. Inclui todos os tipos exceto PAYLOAD. Objetos incontroláveis aumentam o risco sistêmico da órbita." },
      ],
    },
    general: {
      icon: BookOpen,
      title: "Termos Gerais",
      terms: [
        { term: "LEO — Órbita Baixa Terrestre", desc: "Low Earth Orbit. Região entre 150 e 2.000 km de altitude. Concentra a grande maioria dos satélites e detritos rastreados. Menor latência de comunicação, porém maior risco de colisão devido à alta densidade." },
        { term: "NORAD ID (Número de catálogo)", desc: "Identificador único de 5 dígitos atribuído pelo NORAD a cada objeto rastreado. Permite identificar inequivocamente um satélite ou detrito entre dezenas de milhares." },
        { term: "TLE — Elementos de Dois Linhas", desc: "Two-Line Elements. Formato padrão que descreve a órbita de um objeto em dois linhas de texto com inclinação, excentricidade, período e época. Atualizados regularmente pela Space-Track.org." },
        { term: "Conjunção", desc: "Aproximação entre dois objetos espaciais a uma distância considerada arriscada (tipicamente menos de 1 km em algum eixo). Satélites operacionais podem executar manobras para evitar conjunções previstas." },
        { term: "Efeito Kessler", desc: "Cenário proposto por Donald Kessler em 1978: se a densidade de objetos atingir um nível crítico, colisões geram detritos que causam mais colisões em cascata, tornando certas órbitas inutilizáveis por décadas. O CPS deste projeto é inspirado neste modelo." },
        { term: "Space-Track.org", desc: "Portal operado pelo 18º Esquadrão de Defesa Espacial dos EUA que fornece dados TLE e informações de conjunção. Principal fonte de dados deste projeto." },
        { term: "Random Forest", desc: "Algoritmo de ML baseado em múltiplas árvores de decisão. Usado para prever o CPS_log a partir das 13 features. Atingiu R² ≈ 0,98 ao nível de faixas de altitude de 50 km." },
      ],
    },
    predict: {
      icon: BrainCircuit,
      title: "Ferramenta de Previsão",
      body: "A Ferramenta de Previsão permite inserir manualmente os parâmetros orbitais de um objeto hipotético (ou real) e obter a previsão do CPS_log e da categoria de risco diretamente do modelo Random Forest treinado.",
      howTitle: "Como usar",
      steps: [
        "Acesse a página Previsão no menu lateral.",
        "Insira os parâmetros orbitais (altitude, inclinação, etc.).",
        "Insira os parâmetros de ambiente local (densidade, fração de detritos, etc.) se conhecidos. Caso contrário, os valores padrão representam uma órbita típica de 750 km.",
        "Selecione o tipo de objeto — os flags de detrito e controle são ajustados automaticamente.",
        "Clique em Calcular Risco para obter o CPS_log e a categoria de risco.",
      ],
      note: "Os parâmetros de ambiente local (densidade local, fração de detritos, dispersão de inclinação) são os mais influentes no resultado. Para uma previsão mais precisa de um objeto real, esses valores devem ser calculados a partir do catálogo completo de objetos na mesma faixa de altitude.",
    },
  },
} as const;

/* ─── Sub-components ────────────────────────────────────────────────────────── */

function Section({ id, icon: Icon, title, children }: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/25">
          <Icon className="h-4 w-4 text-cyan-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Term({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-800 py-4 last:border-0">
      <dt className="text-sm font-semibold text-slate-200 mb-1">{term}</dt>
      <dd className="text-sm text-slate-400 leading-relaxed">{children}</dd>
    </div>
  );
}

function RiskCard({ level, color, threshold, desc, bg, border, icon: Icon }: {
  level: string; color: string; threshold: string; desc: string;
  bg: string; border: string; icon: React.ElementType;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${bg} ${border}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className={`font-bold text-base ${color}`}>{level}</span>
      </div>
      <p className={`text-xs font-mono mb-2 ${color} opacity-80`}>{threshold}</p>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function GlossarioPage() {
  const { lang, t } = useLanguage();
  const c = CONTENT[lang];

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <TopBar title={t.glossary.title} subtitle={t.glossary.subtitle} />

      {/* Quick nav */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">{c.navLabel}</p>
          <div className="flex flex-wrap gap-2">
            {c.sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project */}
      <Section id="projeto" icon={c.project.icon} title={c.project.title}>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-300 leading-relaxed mb-4">{c.project.body}</p>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800">
              {c.project.stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* CPS */}
      <Section id="cps" icon={c.cps.icon} title={c.cps.title}>
        <Card>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">{c.cps.intro}</p>
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Formula</p>
              <p className="font-mono text-sm text-cyan-300">{c.cps.formula}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{c.cps.formulaNote}</p>
            </div>
            <dl>{c.cps.terms.map((item) => <Term key={item.term} term={item.term}>{item.desc}</Term>)}</dl>
          </CardContent>
        </Card>
      </Section>

      {/* Risk categories */}
      <Section id="risco" icon={c.risk.icon} title={c.risk.title}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {c.risk.cards.map((card) => <RiskCard key={card.level} {...card} />)}
        </div>
      </Section>

      {/* Orbital parameters */}
      <Section id="orbital" icon={c.orbital.icon} title={c.orbital.title}>
        <Card>
          <CardContent className="pt-5">
            <dl>{c.orbital.terms.map((item) => <Term key={item.term} term={item.term}>{item.desc}</Term>)}</dl>
          </CardContent>
        </Card>
      </Section>

      {/* Local environment */}
      <Section id="local" icon={c.local.icon} title={c.local.title}>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-400 leading-relaxed mb-4">{c.local.intro}</p>
            <dl>{c.local.terms.map((item) => <Term key={item.term} term={item.term}>{item.desc}</Term>)}</dl>
          </CardContent>
        </Card>
      </Section>

      {/* Object types */}
      <Section id="tipos" icon={c.types.icon} title={c.types.title}>
        <Card>
          <CardContent className="pt-5">
            <dl>{c.types.terms.map((item) => <Term key={item.term} term={item.term}>{item.desc}</Term>)}</dl>
          </CardContent>
        </Card>
      </Section>

      {/* General terms */}
      <Section id="gerais" icon={c.general.icon} title={c.general.title}>
        <Card>
          <CardContent className="pt-5">
            <dl>{c.general.terms.map((item) => <Term key={item.term} term={item.term}>{item.desc}</Term>)}</dl>
          </CardContent>
        </Card>
      </Section>

      {/* Prediction tool */}
      <Section id="previsao" icon={c.predict.icon} title={c.predict.title}>
        <Card>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">{c.predict.body}</p>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{c.predict.howTitle}</p>
              <ol className="text-sm text-slate-400 space-y-1.5 list-decimal list-inside">
                {c.predict.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
            <p className="text-xs text-slate-500">{c.predict.note}</p>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
