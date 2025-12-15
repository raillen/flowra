# API de Automação

## Visão Geral
O módulo de automação permite criar regras `event-driven` para cards.

## Endpoints

### Criar Regra
**POST** `/api/boards/:boardId/automation/rules`

**Body**:
```json
{
  "name": "Auto Archive",
  "triggerType": "CARD_MOVE",
  "conditions": {
    "columnId": "uuid-da-coluna-destino"
  },
  "actions": [
    {
      "type": "ARCHIVE_CARD"
    }
  ]
}
```

### Listar Regras
**GET** `/api/boards/:boardId/automation/rules`

## Estrutura do Backend
*   **Controller**: `automation.controller.js`
*   **Service**: `automation.service.js`
*   **Repository**: `automation.repository.js`

As regras são armazenadas na tabela `AutomationRule`. O campo `conditions` e `actions` são armazenados como strings JSON.
