/**
 * Implementação do jogo Batalha Naval (Tabuleiro 10 x 10).
 *
 * Frota obrigatória:
 * - 1 Porta-aviões (ocupa 5 casas)
 * - 1 Encouraçado (ocupa 4 casas)
 * - 1 Submarino (ocupa 3 casas)
 * - 1 Destroier ou Hidroavião (ocupa 2 casas)
 */

const TAMANHO_TABULEIRO = 10;

const FROTA_PADRAO = {
  'Porta-aviões': { chave: 'PORTA_AVIOES', nome: 'Porta-aviões', tamanho: 5 },
  'Encouraçado': { chave: 'ENCOURACADO', nome: 'Encouraçado', tamanho: 4 },
  'Submarino': { chave: 'SUBMARINO', nome: 'Submarino', tamanho: 3 },
  'Destroier': { chave: 'DESTROIER_HIDROAVIAO', nome: 'Destroier', tamanho: 2 },
  'Hidroavião': { chave: 'DESTROIER_HIDROAVIAO', nome: 'Hidroavião', tamanho: 2 }
};

class BatalhaNaval {
  constructor(tamanho = TAMANHO_TABULEIRO) {
    if (tamanho !== 10) {
      throw new Error('O tabuleiro de Batalha Naval deve ser exatamente 10 x 10');
    }

    this.tamanho = tamanho;
    this.naviosPosicionados = {}; // chave -> { chave, nome, tamanho, coordenadas, acertos, afundado }
    this.tabuleiro = Array.from({ length: tamanho }, () =>
      Array.from({ length: tamanho }, () => ({
        navioChave: null,
        atingida: false
      }))
    );
  }

  _validarCoordenada(linha, coluna) {
    if (
      !Number.isInteger(linha) ||
      !Number.isInteger(coluna) ||
      linha < 0 ||
      linha >= this.tamanho ||
      coluna < 0 ||
      coluna >= this.tamanho
    ) {
      throw new Error(`Coordenada fora dos limites do tabuleiro 10x10: (${linha}, ${coluna})`);
    }
  }

  /**
   * Posiciona uma embarcação no tabuleiro 10x10 na orientação 'H' (Horizontal) ou 'V' (Vertical).
   */
  posicionarNavio(nomeNavio, linhaInicial, colunaInicial, orientacao = 'H') {
    const config = FROTA_PADRAO[nomeNavio];
    if (!config) {
      throw new Error(`Embarcação inválida: ${nomeNavio}`);
    }
    if (orientacao !== 'H' && orientacao !== 'V') {
      throw new Error(`Orientação inválida: ${orientacao}. Use 'H' (horizontal) ou 'V' (vertical)`);
    }
    if (this.naviosPosicionados[config.chave]) {
      throw new Error(`A embarcação do tipo ${config.nome} já foi posicionada no tabuleiro`);
    }

    this._validarCoordenada(linhaInicial, colunaInicial);

    const coordenadas = [];
    for (let i = 0; i < config.tamanho; i++) {
      const l = orientacao === 'V' ? linhaInicial + i : linhaInicial;
      const c = orientacao === 'H' ? colunaInicial + i : colunaInicial;

      if (l >= this.tamanho || c >= this.tamanho) {
        throw new Error(`A embarcação ${nomeNavio} (${config.tamanho} casas) ultrapassa os limites do tabuleiro 10x10`);
      }

      if (this.tabuleiro[l][c].navioChave !== null) {
        throw new Error(`Sobreposição detectada na posição (${l}, ${c}) ao posicionar ${nomeNavio}`);
      }

      coordenadas.push({ linha: l, coluna: c });
    }

    for (const { linha, coluna } of coordenadas) {
      this.tabuleiro[linha][coluna].navioChave = config.chave;
    }

    this.naviosPosicionados[config.chave] = {
      chave: config.chave,
      nome: nomeNavio,
      tamanho: config.tamanho,
      coordenadas,
      acertos: 0,
      afundado: false
    };

    return this.naviosPosicionados[config.chave];
  }

  frotaCompleta() {
    const chavesObrigatorias = [
      'PORTA_AVIOES',
      'ENCOURACADO',
      'SUBMARINO',
      'DESTROIER_HIDROAVIAO'
    ];
    return chavesObrigatorias.every((chave) => Boolean(this.naviosPosicionados[chave]));
  }

  /**
   * Realiza um disparo em (linha, coluna).
   * Retorna um objeto com { resultado: 'AGUA' | 'IMPACTO' | 'AFUNDOU' | 'VITORIA', navio: string | null }
   */
  atacar(linha, coluna) {
    if (!this.frotaCompleta()) {
      throw new Error('Toda a frota de 4 embarcações deve estar posicionada antes de iniciar os ataques');
    }

    this._validarCoordenada(linha, coluna);

    const celula = this.tabuleiro[linha][coluna];
    if (celula.atingida) {
      throw new Error(`A coordenada (${linha}, ${coluna}) já foi atacada anteriormente`);
    }

    celula.atingida = true;

    if (!celula.navioChave) {
      return { resultado: 'AGUA', navio: null };
    }

    const navio = this.naviosPosicionados[celula.navioChave];
    navio.acertos++;

    if (navio.acertos === navio.tamanho) {
      navio.afundado = true;
      if (this.todosNaviosAfundados()) {
        return { resultado: 'VITORIA', navio: navio.nome };
      }
      return { resultado: 'AFUNDOU', navio: navio.nome };
    }

    return { resultado: 'IMPACTO', navio: navio.nome };
  }

  todosNaviosAfundados() {
    if (!this.frotaCompleta()) return false;
    return Object.values(this.naviosPosicionados).every((navio) => navio.afundado);
  }
}

module.exports = {
  TAMANHO_TABULEIRO,
  FROTA_PADRAO,
  BatalhaNaval
};
