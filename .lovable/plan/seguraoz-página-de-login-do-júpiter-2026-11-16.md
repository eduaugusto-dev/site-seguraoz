# SeguraOz — Página de login do Júpiter

Reproduzir fielmente a página de login enviada (HTML/CSS/JS + Login.svg), somente frontend, sem backend.

## O que será feito
- Substituir a página inicial pela tela de login do Júpiter.
- Palco de referência 1920x1200 com posições, tamanhos, cores (#f7f7f7, #dfff86), Poppins e arredondamentos copiados do CSS original.
- Elementos: logo, título com "seguro" destacado, subtítulo, campo de matrícula/e-mail, campo de senha com botão de olho (mostrar/ocultar com a piscadela original), "Lembrar de mim", botão "Entrar" com hover, seta, ilustração e rodapé "Protegido por SeguraOz©2026".
- Ilustração: usar Login_1.svg enviado; seta e ícones de olho reaproveitam as imagens já referenciadas no HTML.
- "Entrar" apenas demonstrativo (sem autenticação). "Lembrar de mim" guarda a matrícula no navegador, como no script original.
- Responsivo: em telas grandes o palco é escalado proporcionalmente; em telas estreitas (celular/tablet retrato) layout empilhado sem rolagem horizontal, ilustração abaixo do formulário.
- Título do site: "Entrar — SeguraOz Júpiter"; nome do projeto "site SeguraOz".

## Técnico
- Reescrever `src/routes/index.tsx` como componente React; CSS original adaptado em `src/styles/login.css` (ou classes no styles.css), Poppins via link no `__root.tsx`.
- Login_1.svg enviado via lovable-assets.
- Lógica de escala `fit()` em useEffect; breakpoint mobile via media query.
- Sem Lovable Cloud.
