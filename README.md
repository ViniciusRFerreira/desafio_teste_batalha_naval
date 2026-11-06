# 🚢 Desafio de Teste: Batalha Naval (`desafio_teste_batalha_naval`)

Repositório contendo a implementação em JavaScript e a suíte de **casos de teste automatizados (Jest)** para o jogo **Batalha Naval** em tabuleiro **10 x 10**.

---

## 👥 Colaborador(es)

- Vinicius Ramon Ferreira (@ViniciusRFerreira)

---

## 📋 Regras da Batalha Naval (10 x 10)

1. **Tabuleiro 10 x 10**: Matriz de 10 linhas por 10 colunas (100 posições).
2. **Composição Obrigatória da Frota (total de 14 casas)**:
   - **1 Porta-aviões**: ocupa **5 casas**
   - **1 Encouraçado**: ocupa **4 casas**
   - **1 Submarino**: ocupa **3 casas**
   - **1 Destroier ou Hidroavião**: ocupa **2 casas**
3. **Posicionamento**: As embarcações podem ser posicionadas na horizontal (`'H'`) ou vertical (`'V'`), sem extrapolar os limites do tabuleiro e sem sobreposição entre si.
4. **Mecânica de Ataque**:
   - Disparos só iniciam após as 4 embarcações estarem posicionadas.
   - Não é permitido atirar duas vezes na mesma coordenada.
   - Estados do disparo: `'AGUA'`, `'IMPACTO'`, `'AFUNDOU'` e `'VITORIA'` (quando os 4 navios são afundados).

---

## 🧪 Funcionamento dos Casos de Teste (`tests/batalhaNaval.test.js`)

A suíte possui **10 casos de teste** divididos em 3 seções:

| ID | Caso de Teste | O que valida / Como funciona |
| :--- | :--- | :--- |
| **CT01** | Criação do tabuleiro 10x10 | Verifica se o tabuleiro tem exatamente 10 linhas e 10 colunas e rejeita tamanhos diferentes (ex.: `8x8`). |
| **CT02** | Posicionamento das 4 embarcações obrigatórias | Posiciona Porta-aviões (5), Encouraçado (4), Submarino (3) e Destroier (2), verificando o tamanho de cada um e `frotaCompleta() === true`. |
| **CT03** | Suporte a `Destroier` ou `Hidroavião` (2 casas) | Verifica que ambos os nomes são aceitos para o navio de 2 casas e que posicionar um impede adicionar o outro em duplicidade. |
| **CT04** | Bloqueio de extrapolação de bordas | Tenta posicionar o Porta-aviões (5 casas) a partir da coluna 7 e o Encouraçado (4 casas) na linha 8 vertical, garantindo erro de limite. |
| **CT05** | Prevenção de sobreposição (colisão) | Posiciona um navio horizontal e tenta cruzar a mesma coordenada `(2, 4)` com outro navio vertical, validando o erro de sobreposição. |
| **CT06** | Impedimento de navios repetidos e orientação inválida | Garante que apenas 1 unidade de cada embarcação pode ser colocada e rejeita orientações diferentes de `'H'` e `'V'`. |
| **CT07** | Bloqueio de ataque com frota incompleta | Tenta executar `atacar(0, 0)` com apenas 1 navio posicionado e valida o lançamento de erro exigindo os 4 navios. |
| **CT08** | Registro de `AGUA`, `IMPACTO` e `AFUNDOU` | Realiza um tiro na água, um tiro parcial no Destroier (`IMPACTO`) e o tiro final no Destroier (`AFUNDOU`), e confirma que ainda restam navios (`todosNaviosAfundados()` é `false`). |
| **CT09** | Proibição de tiro repetido ou fora do mapa | Dispara duas vezes em `(5, 5)` e testa coordenadas fora de `0..9`, validando o bloqueio. |
| **CT10** | Vitória ao afundar toda a frota (14 casas) | Ataca todas as coordenadas dos 4 navios e verifica que o 14º acerto retorna `{ resultado: 'VITORIA' }` e `todosNaviosAfundados() === true`. |

---

## Interface esperada pelos testes

O arquivo `src/batalhaNaval.js` usa `module.exports` para exportar `{ BatalhaNaval }`, importado nos testes com `require('../src/batalhaNaval')`.

- `new BatalhaNaval(tamanho = 10)`: lança erro se o tamanho não for 10. Tem as propriedades `tamanho` e `tabuleiro` (matriz 10x10).
- `posicionarNavio(nome, linha, coluna, orientacao)`: os nomes são `'Porta-aviões'`, `'Encouraçado'`, `'Submarino'`, `'Destroier'` e `'Hidroavião'` (os dois últimos são o mesmo navio de 2 casas, só pode haver um). Orientação `'H'` ou `'V'`. Retorna um objeto com `coordenadas` (array) e `tamanho`.
- `frotaCompleta()`: retorna `true` quando os 4 navios foram posicionados.
- `atacar(linha, coluna)`: retorna `{ resultado, navio }`, com `resultado` sendo `'AGUA'`, `'IMPACTO'`, `'AFUNDOU'` ou `'VITORIA'` e `navio` com o nome do navio atingido (ou `null` na água). As coordenadas válidas vão de 0 a 9.
- `todosNaviosAfundados()`: retorna `true` ou `false`.

As mensagens de erro também são conferidas pelos testes; o texto exato esperado em cada caso está em `tests/batalhaNaval.test.js`.

---

## 🚀 Como Executar os Testes

```bash
# 1. Instalar as dependências (Jest)
npm install

# 2. Executar a suíte de testes
npm test
```
