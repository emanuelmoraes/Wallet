# Estilos Compartilhados - Documentação

## Visão Geral

Este documento descreve a refatoração dos estilos das abas da aplicação Wallet para uso de estilos compartilhados, seguindo boas práticas de desenvolvimento e manutenibilidade.

## Arquitetura dos Estilos

### 📁 Localização
- **Arquivo Principal**: `styles/sharedStyles.ts`
- **Importação nas Abas**: Todas as abas importam os estilos compartilhados

### 📋 Estrutura Organizada

#### 1. **sharedStyles** - Estilos Comuns
Contém todos os estilos que são utilizados igualmente em todas as abas:

- **Container & Loading**: `container`, `loadingContainer`, `loadingText`
- **Stats Header**: `statsContainer`, `statItem`, `statValue`, `statLabel`
- **Headers**: `header`, `headerWithPadding`, `subtitle`
- **Search & Filters**: `searchbar`, `filterContainer`, `filterLabel`, `segmentedButtons`
- **Scroll & Layout**: `scrollView`
- **Cards**: `card`, `cardHeader`, `cardTitleRow`, `avatar`, `titleContainer`, `actions`, `divider`, `cardBody`
- **Info Display**: `infoRow`, `chip`, `valuesContainer`, `valueItem`, `label`
- **Totals**: `totalContainer`, `totalValue`
- **Observações**: `observacoesContainer`
- **Empty States**: `emptyState`, `emptyTitle`, `emptySubtitle`
- **FAB**: `fab`
- **Modals**: `modal`, `modalContent`
- **Forms**: `input`, `currencyInput`, `formRow`, `halfInput`, `formGroup`, `pickerLabel`, `modalActions`, `modalButton`

#### 2. **buttonStyles** - Estilos de Botões
Estilos específicos para diferentes tipos de botões de seleção:

- **Containers**: `buttonsContainer`, `button`
- **Tipo (Proventos)**: `typeButtons`, `typeButton`
- **Segmento (Movimentações)**: `segmentoButtons`, `segmentoButton`
- **Operação (Movimentações)**: `operacaoButtons`, `operacaoButton`

#### 3. **screenSpecificStyles** - Estilos Específicos
Estilos que são específicos para determinadas telas:

- **Ativos**: `ativoSelector`, `ativoButton`
- **Pickers**: `pickerContainer`, `pickerButton`
- **Totals**: `totalContainerCentered`

## Implementação nas Abas

### 🔧 Como Usar

```typescript
import { sharedStyles, buttonStyles, screenSpecificStyles } from '@/styles/sharedStyles';

const styles = StyleSheet.create({
  ...sharedStyles,
  ...buttonStyles,
  ...screenSpecificStyles,
  // Adicionar overrides específicos se necessário
});
```

### 📱 Abas Atualizadas

1. **ativos.tsx**: Utiliza `headerWithPadding` por ter layout ligeiramente diferente
2. **proventos.tsx**: Utiliza todos os estilos compartilhados
3. **movimentacoes.tsx**: Utiliza todos os estilos compartilhados

## Benefícios da Refatoração

### ✅ Vantagens

1. **Manutenibilidade**: Alterações de estilo em um local se refletem em todas as abas
2. **Consistência**: Garantia de design uniforme entre todas as telas
3. **Redução de Código**: Eliminação de duplicação de estilos
4. **Facilidade de Customização**: Fácil override de estilos específicos quando necessário
5. **Organização**: Separação lógica entre estilos comuns, de botões e específicos

### 🎯 Flexibilidade Mantida

- **Overrides Locais**: Possibilidade de sobrescrever estilos específicos
- **Extensibilidade**: Fácil adição de novos estilos compartilhados
- **Modularidade**: Separação em categorias lógicas permite importação seletiva

## Padrões de Uso

### 🔄 Override de Estilos
```typescript
const styles = StyleSheet.create({
  ...sharedStyles,
  // Override específico
  modal: {
    ...sharedStyles.modal,
    backgroundColor: 'white', // Custom para esta tela
  },
});
```

### ➕ Adição de Estilos Específicos
```typescript
const styles = StyleSheet.create({
  ...sharedStyles,
  ...buttonStyles,
  ...screenSpecificStyles,
  // Estilos únicos desta tela
  customStyle: {
    // propriedades específicas
  },
});
```

## Manutenção Futura

### 📈 Expandindo os Estilos Compartilhados

1. **Novos Estilos Comuns**: Adicionar ao `sharedStyles`
2. **Novos Tipos de Botão**: Adicionar ao `buttonStyles`
3. **Estilos Específicos**: Adicionar ao `screenSpecificStyles`

### 🔍 Identificando Candidatos para Compartilhamento

- Estilos duplicados em 2+ abas
- Padrões de design consistentes
- Elementos de UI recorrentes

### ⚠️ Cuidados

- Sempre testar mudanças em todas as abas afetadas
- Documentar overrides específicos quando necessário
- Manter a organização lógica dos estilos

## Conclusão

A implementação de estilos compartilhados trouxe maior organização, manutenibilidade e consistência para o projeto. A estrutura modular permite flexibilidade sem perder os benefícios da centralização, criando uma base sólida para o desenvolvimento futuro.
