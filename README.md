# Colégio Castelo

Site institucional do Colégio Castelo, em Macaé, com identidade azul/ciano, fotografia institucional, cenas interativas e motion integrado ao percurso de leitura.

## Desenvolvimento

Use Node.js 22.12 ou superior. As versões de Vite e TypeScript estão fixadas no projeto.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

A Vercel utiliza o preset Vite, executa `npm run build` e serve `dist`. Este site não depende de variáveis de ambiente, backend ou credenciais no código. O pacote inclui somente as mídias utilizadas e as fontes Outfit e Inter. Evidências privadas, configurações de agentes e relatórios internos ficam fora deste repositório e do deploy.

## Referência de qualidade aprovada

Philipe aprovou esta versão no navegador em 2 de outubro de 2026 com “GOSTEI MUITO” e acrescentou: “É esse tipo de site que eu quero que crie no antigravity”. O resultado passa a ser referência de qualidade para futuras produções no Antigravity.

A referência reúne identidade específica para a instituição; composição e motion pensados juntos; scroll suave; cenas que respondem ao percurso e permitem exploração; pausas para leitura; navegação acessível; validação visual em vários instantes e dimensões, acompanhada de testes funcionais. O hero une título, apoio e CTA preservando a leitura da fachada. As áreas de formação, etapas, campus, vivências, técnico e visita usam comportamentos diferentes conforme seu conteúdo.

Esses critérios orientam a qualidade. Cada próxima marca exige pesquisa, conceito, composição e interações próprias. Esta página não deve virar um template repetível de layout, paleta, fotografias, textos ou animações.

Esta fase foi implementada e verificada pelo **Codex**. A referência para o Antigravity não significa que seus agentes nativos executaram esta produção e não modifica configurações globais de agentes.

## Validação e mídia

A base aprovada passou por gate integral de 12 checks e 238 casos funcionais. O pacote de publicação preserva conteúdo, imagens, vídeo e lógica de interação dessa base; adequações de empacotamento removem declarações de fontes não utilizadas e acrescentam configuração reproduzível de build.

Motion respeita `prefers-reduced-motion`; teclado e toque usam navegação nativa. O panorama é uma fotografia de ponto fixo com controle de enquadramento, sem trajetória física 3D documentada. O vídeo inicial contém cenário artístico identificado na interface. Fotografias e fontes conservam os arquivos originais utilizados no resultado aprovado.
