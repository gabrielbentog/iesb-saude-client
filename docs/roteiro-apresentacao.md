# Roteiro de Apresentação - Sistema de Saúde IESB

## 1. Fluxo de Autenticação
1. **Tela de Login** (`/auth/login`)
   - Apresentação da tela inicial com logo do IESB
   - Campos de email e senha
   - Opções de "Esqueci a senha" e "Cadastro"

2. **Tela de Cadastro** (`/auth/cadastro`)
   - Formulário para novos usuários
   - Campos de dados pessoais

3. **Tela de Recuperação de Senha** (`/auth/esqueci-a-senha`)
   - Processo de recuperação de senha
   - Campo para inserção de email

## 2. Fluxo do Gestor
1. **Dashboard do Gestor** (`/gestor/dashboard`)
   - Visão geral administrativa
   - KPIs importantes
   - Resumo das próximas consultas
   - Pequena lista de estagiários

2. **Calendário do Gestor** (`/gestor/calendario`)
  - Visão geral de todos os agendamentos (mensal, semanal, diário)
  - Gerenciamento de horários (apagar)

3. **Definir horários do Gestor** (`/gestor/calendario/agendamento`)
  - Criar agendamentos para o campus em que o gestor tem acesso na área dele
  - Definir se o horário disponibilizado vai se repetir ou se vai ser só em algum dia especifico
  - Selecionar os dias e horários os quais quer disponibilizar.

5. **Consultas - Visão Gestor** (`/gestor/consultas`)
   - Visualização de todas as consultas
   - Filtros e busca
   - Detalhes específicos (`/gestor/consultas/[id]`)

6. **Consultas - Detalhes** (`/gestor/consultas/[id]`)
   - Visualização da consulta
   - Possibilidade de Aprovar, Rejeitar, Cancelar e Concluir a consulta.
   - Visualizar histórico da consulta
  
4. **Gestão de Estagiários** (`/gestor/gestao-de-estagiarios`)
   - KPIs importantes
   - Lista de estagiários ativos
   - Cadastro de novos estagiários (`/gestor/gestao-de-estagiarios/cadastro`)



## 3. Fluxo do Paciente
1. **Dashboard do Paciente** (`/paciente/dashboard`)
   - Visão geral das próximas consultas
   - Cards de acesso rápido
   - Estatísticas relevantes

2. **Agendamento de Consulta** (`/paciente/agendamento`)
   - Formulário de agendamento
   - Seleção de data e horário
   - Seleção de especialidade/profissional

3. **Calendário do Paciente** (`/paciente/calendario`)
   - Visualização do calendário pessoal
   - Consultas agendadas
   - Diferentes visualizações (dia/semana/mês)

4. **Consultas do Paciente** (`/paciente/consultas`)
   - Lista de todas as consultas
   - Histórico de atendimentos
   - Detalhes da consulta específica (`/paciente/consultas/[id]`)

## 4. Fluxo do Estagiário
1. **Dashboard do Estagiário** (`/estagiario/dashboard`)
   - Visão dos atendimentos do dia
   - Próximas consultas
   - Notificações importantes

## 5. Áreas Comuns
1. **Perfil do Usuário** (`/perfil`)
   - Edição de dados pessoais
   - Preferências do usuário
   - Configurações da conta

2. **Configurações** (`/configuracoes`)
   - Configurações gerais do sistema
   - Personalização da interface
   - Preferências de notificação

## 6. Fluxos de Processos

### 6.1. Fluxo de Cadastro de Estagiário


2. **Aprovação do Gestor**
   - Revisão dos dados do estagiário
   - Verificação da documentação
   - Aprovação/Rejeição do cadastro
   - Definição de permissões iniciais

### 6.2. Fluxo de Agendamento
1. **Solicitação de Consulta**
   - Paciente seleciona data/horário disponível
   - Preenchimento de informações adicionais
   - Submissão do agendamento

2. **Processamento do Agendamento**
   - Verificação automática de disponibilidade
   - Confirmação do horário
   - Notificação para estagiário designado

3. **Gestão do Agendamento**
   - Possibilidade de reagendamento
   - Cancelamento (com justificativa)
   - Notificações automáticas

### 6.3. Fluxo de Atendimento
1. **Pré-Consulta**
   - Confirmação de presença
   - Verificação de documentação
   - Preenchimento de formulário inicial

2. **Consulta**
   - Registro do atendimento pelo estagiário
   - Preenchimento de prontuário
   - Anexação de documentos/exames

3. **Pós-Consulta**
   - Feedback do paciente
   - Agendamento de retorno (se necessário)
   - Geração de documentação

### 6.4. Fluxo de Supervisão
1. **Monitoramento de Estagiários**
   - Acompanhamento de atendimentos
   - Avaliação de desempenho
   - Feedback e orientações

2. **Gestão de Qualidade**
   - Análise de indicadores
   - Avaliação de satisfação
   - Ajustes de processos

## 7. Componentes Especiais
1. **Calendário Aprimorado**
   - Visualização diária
   - Visualização semanal
   - Visualização mensal
   - Diálogos de agendamento
   - Detalhes de eventos

2. **Interface de Usuário**
   - Header com navegação
   - Sidebar responsiva
   - Cards estatísticos
   - Tabelas de dados
   - Diálogos de confirmação
