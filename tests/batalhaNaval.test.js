const { BatalhaNaval } = require('../src/batalhaNaval');

describe('Batalha Naval (Tabuleiro 10 x 10) - Suíte de Casos de Teste', () => {
  describe('1. Criação do Tabuleiro 10 x 10 e Validação da Frota', () => {
    test('CT01 - Deve criar um tabuleiro 10 x 10 (100 casas) vazio e rejeitar dimensões diferentes', () => {
      const jogo = new BatalhaNaval();
      expect(jogo.tamanho).toBe(10);
      expect(jogo.tabuleiro).toHaveLength(10);
      expect(jogo.tabuleiro[0]).toHaveLength(10);

      expect(() => new BatalhaNaval(8)).toThrow(
        'O tabuleiro de Batalha Naval deve ser exatamente 10 x 10'
      );
    });

    test('CT02 - Deve posicionar corretamente as 4 embarcações obrigatórias (Porta-aviões[5], Encouraçado[4], Submarino[3], Destroier/Hidroavião[2]) totalizando 14 casas', () => {
      const jogo = new BatalhaNaval();

      const portaAvioes = jogo.posicionarNavio('Porta-aviões', 0, 0, 'H'); // (0,0)..(0,4) -> 5 casas
      const encouracado = jogo.posicionarNavio('Encouraçado', 2, 0, 'H');  // (2,0)..(2,3) -> 4 casas
      const submarino = jogo.posicionarNavio('Submarino', 4, 0, 'V');      // (4,0)..(6,0) -> 3 casas
      const destroier = jogo.posicionarNavio('Destroier', 8, 5, 'H');      // (8,5)..(8,6) -> 2 casas

      expect(portaAvioes.coordenadas).toHaveLength(5);
      expect(encouracado.coordenadas).toHaveLength(4);
      expect(submarino.coordenadas).toHaveLength(3);
      expect(destroier.coordenadas).toHaveLength(2);
      expect(jogo.frotaCompleta()).toBe(true);
    });

    test('CT03 - Deve aceitar tanto a nomenclatura Destroier quanto Hidroavião para a embarcação de 2 casas, impedindo duplicidade', () => {
      const jogo = new BatalhaNaval();
      const hidroaviao = jogo.posicionarNavio('Hidroavião', 0, 0, 'H');
      expect(hidroaviao.tamanho).toBe(2);

      // Tentar adicionar um Destroier quando o Hidroavião (2 casas) já foi posicionado deve falhar
      expect(() => jogo.posicionarNavio('Destroier', 2, 0, 'H')).toThrow(
        'já foi posicionada no tabuleiro'
      );
    });
  });

  describe('2. Restrições de Posicionamento (Bordas, Sobreposição e Duplicidade)', () => {
    test('CT04 - Deve impedir que uma embarcação ultrapasse as bordas do tabuleiro 10 x 10 (horizontal e vertical)', () => {
      const jogo = new BatalhaNaval();

      // Porta-aviões (5 casas) iniciando na coluna 7 ocuparia colunas 7, 8, 9, 10, 11 (inválido)
      expect(() => jogo.posicionarNavio('Porta-aviões', 0, 7, 'H')).toThrow(
        'ultrapassa os limites do tabuleiro 10x10'
      );

      // Encouraçado (4 casas) iniciando na linha 8 ocuparia linhas 8, 9, 10, 11 (inválido)
      expect(() => jogo.posicionarNavio('Encouraçado', 8, 0, 'V')).toThrow(
        'ultrapassa os limites do tabuleiro 10x10'
      );
    });

    test('CT05 - Deve impedir a sobreposição (colisão) de duas embarcações na mesma coordenada', () => {
      const jogo = new BatalhaNaval();
      jogo.posicionarNavio('Porta-aviões', 2, 2, 'H'); // ocupa (2,2), (2,3), (2,4), (2,5), (2,6)

      // Submarino vertical cruzando (2,4) deve lançar erro de sobreposição
      expect(() => jogo.posicionarNavio('Submarino', 1, 4, 'V')).toThrow(
        'Sobreposição detectada na posição (2, 4)'
      );
    });

    test('CT06 - Deve impedir posicionar mais de 1 unidade da mesma embarcação ou com orientação inválida', () => {
      const jogo = new BatalhaNaval();
      jogo.posicionarNavio('Submarino', 0, 0, 'H');

      expect(() => jogo.posicionarNavio('Submarino', 5, 0, 'H')).toThrow(
        'A embarcação do tipo Submarino já foi posicionada no tabuleiro'
      );
      expect(() => jogo.posicionarNavio('Encouraçado', 3, 0, 'DIAGONAL')).toThrow(
        "Orientação inválida: DIAGONAL. Use 'H' (horizontal) ou 'V' (vertical)"
      );
    });
  });

  describe('3. Mecânica de Disparos (Água, Impacto, Afundamento e Vitória)', () => {
    function criarJogoComFrotaPadrao() {
      const jogo = new BatalhaNaval();
      jogo.posicionarNavio('Porta-aviões', 0, 0, 'H'); // (0,0)..(0,4)
      jogo.posicionarNavio('Encouraçado', 2, 0, 'H');  // (2,0)..(2,3)
      jogo.posicionarNavio('Submarino', 4, 0, 'H');    // (4,0)..(4,2)
      jogo.posicionarNavio('Destroier', 6, 0, 'H');    // (6,0)..(6,1)
      return jogo;
    }

    test('CT07 - Deve impedir ataques antes de posicionar todas as 4 embarcações', () => {
      const jogo = new BatalhaNaval();
      jogo.posicionarNavio('Porta-aviões', 0, 0, 'H');

      expect(() => jogo.atacar(0, 0)).toThrow(
        'Toda a frota de 4 embarcações deve estar posicionada antes de iniciar os ataques'
      );
    });

    test('CT08 - Deve registrar tiro na AGUA, IMPACTO parcial e AFUNDOU ao atingir todas as casas de um navio', () => {
      const jogo = criarJogoComFrotaPadrao();

      // Tiro na água
      expect(jogo.atacar(9, 9)).toEqual({ resultado: 'AGUA', navio: null });

      // Atinge primeira casa do Destroier (2 casas) -> IMPACTO
      expect(jogo.atacar(6, 0)).toEqual({ resultado: 'IMPACTO', navio: 'Destroier' });

      // Atinge segunda casa do Destroier -> AFUNDOU
      expect(jogo.atacar(6, 1)).toEqual({ resultado: 'AFUNDOU', navio: 'Destroier' });
      // Só o Destroier afundou, ainda restam 3 navios na água
      expect(jogo.todosNaviosAfundados()).toBe(false);
    });

    test('CT09 - Deve impedir atacar a mesma coordenada duas vezes ou atacar fora do tabuleiro 10x10', () => {
      const jogo = criarJogoComFrotaPadrao();
      jogo.atacar(5, 5);

      expect(() => jogo.atacar(5, 5)).toThrow('A coordenada (5, 5) já foi atacada anteriormente');
      expect(() => jogo.atacar(10, 0)).toThrow('Coordenada fora dos limites do tabuleiro 10x10');
      expect(() => jogo.atacar(0, -1)).toThrow('Coordenada fora dos limites do tabuleiro 10x10');
    });

    test('CT10 - Deve declarar VITORIA ao afundar todas as 4 embarcações (14 acertos)', () => {
      const jogo = criarJogoComFrotaPadrao();

      // Afunda Porta-aviões (5 casas)
      for (let c = 0; c < 5; c++) jogo.atacar(0, c);
      // Afunda Encouraçado (4 casas)
      for (let c = 0; c < 4; c++) jogo.atacar(2, c);
      // Afunda Submarino (3 casas)
      for (let c = 0; c < 3; c++) jogo.atacar(4, c);
      // Afunda Destroier (2 casas): primeiro tiro = IMPACTO, último tiro = VITORIA
      expect(jogo.atacar(6, 0).resultado).toBe('IMPACTO');
      const ultimoDisparo = jogo.atacar(6, 1);

      expect(ultimoDisparo).toEqual({ resultado: 'VITORIA', navio: 'Destroier' });
      expect(jogo.todosNaviosAfundados()).toBe(true);
    });
  });
});
