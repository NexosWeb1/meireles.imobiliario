# Meireles Mobiliário

Landing page one page da Meireles Mobiliário, consultoria comercial em mobiliário com acesso direto à fábrica Marco Brum.

Feita em HTML, CSS e JavaScript puros, sem etapa de build. Basta abrir o `index.html` ou publicar a pasta em qualquer hospedagem estática.

## Estrutura

```
index.html            página única
assets/css/style.css  estilos e responsividade
assets/js/config.js   contatos, WhatsApp e destino do formulário
assets/js/main.js     navegação, slider do hero, animações e formulário
assets/img/           imagens otimizadas em WebP
```

## Antes de publicar

1. Atualize os contatos reais em `assets/js/config.js` (WhatsApp, telefone, e-mail, Instagram e localização). Todos os links e textos de contato do site são preenchidos a partir desse arquivo.
2. Defina o canal de recebimento do formulário em `formEndpoint` (Formspree, Getform, FormSubmit ou API própria que aceite POST em JSON). Sem endpoint, a solicitação é encaminhada para o WhatsApp comercial já preenchida.
3. Substitua a logomarca provisória pelo arquivo oficial. Ela está desenhada como símbolo `#i-logo` no topo do `index.html` e em `assets/img/favicon.svg`.
4. Substitua o nome da Marco Brum pela logomarca oficial da fabricante, quando autorizada (blocos `.partner__logo`).
5. Troque as fotos provisórias (Unsplash) por imagens reais do portfólio Marco Brum, mantendo os mesmos nomes de arquivo em `assets/img/`.

## Bibliotecas

GSAP 3.12.5 com ScrollTrigger (animações) e Lenis 1.1.13 (rolagem suave), carregadas por CDN. O site continua funcional se elas não carregarem e respeita a preferência de movimento reduzido do sistema.
