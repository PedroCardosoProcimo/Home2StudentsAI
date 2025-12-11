# Documentação Home2Students

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com Node.js)

## 🚀 Como Correr o Projeto

### 1. Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

O projeto utiliza Firebase. Configure as variáveis de ambiente:

1. Copie o ficheiro de exemplo:
   ```bash
   cp .env.example .env.local
   ```

2. Edite o ficheiro `.env.local` e preencha com as suas credenciais do Firebase:
   ```
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   ```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000) (a porta pode variar).

### 4. Build para Produção (Opcional)

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Para pré-visualizar o build:

```bash
npm run preview
```

## 🧪 Como Testar o Booking Flow

O fluxo de reserva permite aos utilizadores submeter pedidos de reserva para residências estudantis.

### Acesso ao Formulário de Reserva

**Opção 1: Através da Homepage**
1. Aceda à página inicial: [http://localhost:3000](http://localhost:3000)
2. Navegue pela lista de residências
3. Clique em "Book Now" ou "Ver Detalhes" numa residência
4. Será redirecionado para o formulário de reserva

**Opção 2: Acesso Direto**
- Aceda diretamente a: [http://localhost:3000/book](http://localhost:3000/book)
- Ou com residência pré-selecionada: [http://localhost:3000/book?residence=ID_DA_RESIDENCIA](http://localhost:3000/book?residence=ID_DA_RESIDENCIA)

### Passo a Passo do Formulário

#### 1️⃣ Selecionar Estadia
- **Residência**: Escolha a residência desejada (obrigatório)
- **Tipo de Quarto**: Selecione o tipo de quarto disponível - aparece após escolher residência (obrigatório)
- **Data de Check-in**: Selecione a data de entrada - mínimo hoje (obrigatório)
- **Data de Check-out**: Selecione a data de saída - respeita estadia mínima configurada (obrigatório)

> **Nota**: O sistema aplica automaticamente a estadia mínima (normalmente 1 mês). A data de check-out é ajustada automaticamente ao selecionar o check-in.

#### 2️⃣ Informações Pessoais
Preencha os seus dados de contacto:
- **Nome Completo**: Nome do hóspede (obrigatório)
- **Email**: Endereço de email válido (obrigatório)
- **Número de Telefone**: Contacto telefónico (obrigatório)
- **Mensagem/Notas**: Pedidos especiais ou questões (opcional)

#### 3️⃣ Termos e Condições
- Leia e aceite os **Termos & Condições** e **Política de Privacidade** (obrigatório)

#### 4️⃣ Submeter Pedido
- Clique no botão **"Submit Booking Request"**
- Aguarde o processamento (botão mostra "Submitting...")

### Resultado da Submissão

**Sucesso:**
- Será exibida uma página de confirmação com:
  - Ícone de sucesso (✓)
  - Mensagem de agradecimento
  - **Referência da Reserva** (primeiros 8 caracteres do ID em maiúsculas)
  - Informação sobre o prazo de resposta (24 horas)
  - Botão para voltar à homepage

**Erro:**
- Será exibida uma notificação de erro
- O formulário mantém-se preenchido para nova tentativa

### Validações Implementadas

O sistema valida automaticamente:
- ✅ Todos os campos obrigatórios preenchidos
- ✅ Formato de email válido
- ✅ Datas de check-in/check-out selecionadas
- ✅ Respeito pela estadia mínima
- ✅ Check-in não pode ser no passado
- ✅ Aceitação dos termos e condições

### Estado da Reserva

Após submissão, a reserva é guardada no Firebase Firestore com status **"pending"** e pode ser gerida através do painel administrativo em:
- [http://localhost:3000/admin/bookings](http://localhost:3000/admin/bookings)

## 🛠️ Tecnologias Utilizadas

- **Vite**: Build tool
- **TypeScript**: Linguagem
- **React**: Framework UI
- **React Router**: Navegação
- **shadcn/ui**: Componentes UI
- **Tailwind CSS**: Estilização
- **Firebase**: Backend (Firestore, Auth, Storage)
- **React Hook Form**: Gestão de formulários
- **Zod**: Validação de dados
- **date-fns**: Manipulação de datas

## 📝 Notas Adicionais

- O projeto está configurado com ESLint para manter a qualidade do código
- Utilize `npm run lint` para verificar problemas de código
- O tema suporta modo claro/escuro (se configurado)
- Todas as datas são manipuladas com a biblioteca `date-fns`

## 🆘 Problemas Comuns

**Erro ao iniciar o projeto:**
- Verifique se o Node.js está instalado: `node --version`
- Limpe a cache do npm: `npm cache clean --force`
- Reinstale as dependências: `rm -rf node_modules package-lock.json && npm install`

**Erro no formulário de reserva:**
- Verifique se o Firebase está configurado corretamente no `.env.local`
- Confirme que as coleções do Firestore existem (residences, roomTypes, bookings)
- Verifique a consola do browser para erros específicos

---

**Desenvolvido por Home2Students** 🏠
