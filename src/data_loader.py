"""
data_loader.py
Funções para baixar dados do Space-Track.
Documentação da API: https://www.space-track.org/documentation
"""

import os
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv
from spacetrack import SpaceTrackClient

# Carrega as variáveis do arquivo .env
load_dotenv()

# Caminho da pasta de dados brutos
RAW_DIR = Path("data/raw")
RAW_DIR.mkdir(parents=True, exist_ok=True)


def get_client() -> SpaceTrackClient:
    """
    Cria e retorna um cliente autenticado do Space-Track.
    Lê as credenciais do arquivo .env
    """
    user = os.getenv("SPACETRACK_USER")
    password = os.getenv("SPACETRACK_PASS")

    if not user or not password:
        raise EnvironmentError(
            "\n[ERRO] Credenciais não encontradas!\n"
            "Abra o arquivo .env e preencha:\n"
            "  SPACETRACK_USER=seu_email\n"
            "  SPACETRACK_PASS=sua_senha\n"
        )

    return SpaceTrackClient(identity=user, password=password)


# ─────────────────────────────────────────────────────────────────
# SATCAT — Catálogo histórico de todos os objetos já lançados
# Contém: nome, data de lançamento, tipo (payload/debris/rocket),
#         país, status (em órbita ou decaído), altitude de perigeu/apogeu
# ─────────────────────────────────────────────────────────────────

def fetch_satcat(force_download: bool = False) -> pd.DataFrame:
    """
    Baixa o catálogo completo de objetos espaciais (satcat).
    
    É a nossa fonte principal para:
      - Analisar crescimento de objetos ao longo dos anos
      - Separar por tipo (payload, debris, rocket body)
      - Ver evolução histórica desde 1957

    Parâmetros:
        force_download: se True, baixa de novo mesmo que o arquivo já exista
    """
    output_path = RAW_DIR / "satcat.csv"

    if output_path.exists() and not force_download:
        print(f"[satcat] Arquivo já existe em: {output_path}")
        print("[satcat] Carregando do disco. Use force_download=True para atualizar.")
        df = pd.read_csv(output_path, low_memory=False)
        print(f"[satcat] {len(df):,} objetos carregados.")
        return df

    print("[satcat] Conectando ao Space-Track...")
    print("[satcat] Baixando catálogo completo — pode demorar 1-2 minutos...")

    client = get_client()

    with client:
        data = client.satcat(orderby="LAUNCH asc", format="csv")

    output_path.write_text(data, encoding="utf-8")
    print(f"[satcat] Salvo em: {output_path}")

    df = pd.read_csv(output_path, low_memory=False)
    print(f"[satcat] {len(df):,} objetos no catálogo.")
    return df


# ─────────────────────────────────────────────────────────────────
# GP — Elementos orbitais atuais de objetos em LEO
# Contém: altitude, inclinação, excentricidade, período, etc.
# Fonte para: distribuição por altitude, métrica de densidade/risco
# ─────────────────────────────────────────────────────────────────

def fetch_gp_leo(force_download: bool = False) -> pd.DataFrame:
    """
    Baixa os elementos orbitais atuais de objetos em LEO.
    
    Filtra automaticamente por LEO:
      - mean_motion > 11.25 rev/dia → período < ~128 min → altitude < ~2000 km
      - decay_date nulo → objeto ainda em órbita (não decaiu)

    É a nossa fonte para:
      - Distribuição de objetos por faixa de altitude
      - Cálculo de densidade orbital
      - Métrica de risco de colisão
    """
    output_path = RAW_DIR / "gp_leo.csv"

    if output_path.exists() and not force_download:
        print(f"[gp_leo] Arquivo já existe em: {output_path}")
        print("[gp_leo] Carregando do disco. Use force_download=True para atualizar.")
        df = pd.read_csv(output_path, low_memory=False)
        print(f"[gp_leo] {len(df):,} objetos carregados.")
        return df

    print("[gp_leo] Conectando ao Space-Track...")
    print("[gp_leo] Baixando elementos orbitais de LEO...")

    client = get_client()

    with client:
        data = client.gp(
            mean_motion=">11.25",   # LEO: mais de 11.25 revoluções por dia
            decay_date="null-val",  # ainda em órbita
            orderby="NORAD_CAT_ID asc",
            format="csv"
        )

    output_path.write_text(data, encoding="utf-8")
    print(f"[gp_leo] Salvo em: {output_path}")

    df = pd.read_csv(output_path, low_memory=False)
    print(f"[gp_leo] {len(df):,} objetos em LEO carregados.")
    return df


# ─────────────────────────────────────────────────────────────────
# TESTE — rode com: python src/data_loader.py
# ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":

    print("=" * 55)
    print("  TESTE 1: Catálogo histórico (satcat)")
    print("=" * 55)
    df_satcat = fetch_satcat()
    print("\nPrimeiras linhas:")
    print(df_satcat.head(3).to_string())
    print(f"\nColunas disponíveis ({len(df_satcat.columns)}):")
    print(df_satcat.columns.tolist())

    print("\n" + "=" * 55)
    print("  TESTE 2: Elementos orbitais LEO (gp_leo)")
    print("=" * 55)
    df_gp = fetch_gp_leo()
    print("\nPrimeiras linhas:")
    print(df_gp.head(3).to_string())
    print(f"\nColunas disponíveis ({len(df_gp.columns)}):")
    print(df_gp.columns.tolist())

    print("\n" + "=" * 55)
    print("  TUDO OK! Dados salvos em data/raw/")
    print("=" * 55)