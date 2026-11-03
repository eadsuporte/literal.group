# Como editar o site Literal Group

Este repositório contém um site estático. Para modificar textos, links, estilos ou comportamentos, trabalhe nos arquivos da pasta `novo-site/`.

## Arquivos principais

- `novo-site/index.html`: página inicial.
- `novo-site/*.html` e `novo-site/**/index.html`: páginas internas.
- `novo-site/assets/style.css`: estilos e responsividade.
- `novo-site/assets/app.js`: navegação, filtros e formulário.
- `novo-site/assets/`: imagens, ícones e fontes.

Para editar diretamente no GitHub, selecione a branch `live-site`, abra o arquivo desejado, clique no ícone de lápis (Edit this file) e confirme a alteração.

A indentação padrão é de **2 espaços**, com tags HTML estruturais em linhas próprias, declarações CSS separadas e blocos JavaScript organizados. O projeto inclui `.editorconfig` e `.prettierrc.json`. Quem utiliza Node.js pode formatar novamente executando:

```bash
npx prettier --write "novo-site/**/*.{html,css,js}"
```

Depois de editar, confira o menu móvel, os filtros de portfólio, o formulário, os links e a responsividade no navegador.

**Importante:** existem páginas duplicadas para URLs alternativas, inclusive arquivos exportados cujo nome contém `?negocio=` ou `?vertical=`. Elas foram preservadas. Quando modificar uma página, verifique se sua versão equivalente também precisa ser atualizada; não renomeie arquivos sem revisar rotas e links.
