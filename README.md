# Wi-Fi Messenger
## Deploy pelo Android usando GitHub + Render

### Arquivos
Suba `server.js`, `index.html` e `guest.html` para a raiz de um repositório GitHub.

### Render
Crie um Web Service no Render conectado ao repositório:
- Runtime/Language: Node
- Build Command: `echo "No build needed"`
- Start Command: `node server.js`
- Instance type: Free

O servidor usa a variável PORT fornecida pela plataforma.

### Usar
A URL principal é o painel de administrador. Para usuários, compartilhe a mesma URL terminada em `/guest.html`.

### Limitações e segurança
Protótipo para teste. O painel não tem senha; qualquer pessoa que conheça a URL pode publicar avisos. Não publique a URL do painel abertamente. Adicione autenticação antes de usar com terceiros. Em serviços gratuitos, o servidor pode dormir e a mensagem guardada apenas em memória pode ser apagada ao reiniciar. A página não força pop-ups nem identifica automaticamente todos os aparelhos conectados. Para abrir automaticamente ao conectar ao Wi-Fi, configure um portal cativo no roteador compatível.
