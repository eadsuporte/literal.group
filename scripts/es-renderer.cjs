'use strict';

// Source files are the canonical Portuguese .html pages. Generated Spanish pages
// are static HTML so crawlers can index them without running JavaScript.
const core = ['index.html', 'grupo.html', 'ecossistema.html', 'atuacao.html',
  'parcerias.html', 'impacto.html', 'contato.html', 'privacidade.html'];
const businesses = ['eadsuporte', 'mylearn-space', 'drastic', 'vero-school',
  'citta-education', 'corp-education', 'eu-aprendiz', 'glokau', 'uni-clubes',
  'pergunta-online', 'infraestrutura-ti'].map(slug => 'ecossistema/' + slug + '.html');
const pages = [...core, ...businesses];
const metaDescriptions = {
  'index.html': 'Tecnología, educación y desarrollo de negocios en un ecosistema con cinco áreas. Descubre Literal Group.',
  'grupo.html': 'Descubre cómo Literal Group conecta tecnología, educación, ingeniería y desarrollo de negocios.',
  'ecossistema.html': 'Explora las iniciativas y negocios de Literal Group en educación, tecnología e innovación.',
  'atuacao.html': 'Conoce cómo Literal Group desarrolla soluciones de tecnología, educación y negocios para mercados reales.',
  'parcerias.html': 'Alianzas estratégicas que conectan experiencia, tecnología y nuevas oportunidades de negocio.',
  'impacto.html': 'Educación, tecnología e innovación para ampliar oportunidades laborales y fortalecer comunidades.',
  'contato.html': 'Contacta con Literal Group para hablar sobre alianzas, proyectos, soluciones educativas y negocios.',
  'privacidade.html': 'Consulta la política de privacidad de Literal Group y cómo se utiliza la información proporcionada en este sitio.'
};
const url = (path, es = false) =>
  'https://literal.group/' + (es ? 'es/' : '') + (path === 'index.html' ? '' : path);
function readTranslations(tsvs) {
  const pairs = tsvs.join('\n').split('\n').filter(line => line.includes('|')).map(line => {
    const first = line.indexOf('|');
    // Titles contain a pipe on both sides (Page | Brand), in addition to the separator.
    const pipes = (line.match(/\|/g) || []).length;
    const pos = pipes === 3 ? line.indexOf('|', first + 1) : first;
    return [line.slice(0, pos), line.slice(pos + 1)];
  });
  // Longest phrases first, so a short label does not preempt a full paragraph.
  return pairs.sort((a, b) => b[0].length - a[0].length);
}
function translatePage(html, pairs) {
  for (const [pt, es] of pairs) {
    const escaped = pt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    html = html.replace(new RegExp(escaped, 'g'), () => es);
  }
  return html;
}
function setSeo(html, path, spanish) {
  const pt = url(path), es = url(path, true), current = spanish ? es : pt;
  const tags = [
    '<link rel="canonical" href="' + current + '">',
    '<link rel="alternate" hreflang="pt-BR" href="' + pt + '">',
    '<link rel="alternate" hreflang="es" href="' + es + '">',
    '<link rel="alternate" hreflang="x-default" href="' + pt + '">',
    '<meta property="og:url" content="' + current + '">'
  ].join('\n    ');
  html = html.replace(/<link rel="canonical" href="[^"]+">/, tags);
  if (spanish) {
    html = html.replace('<html lang="pt-BR">', '<html lang="es">')
      .replace('content="pt_BR"', 'content="es_ES"');
  }
  return html;
}
function addSwitcher(html, path, spanish) {
  const pt = url(path), es = url(path, true);
  const n = '<nav class="language-switch" aria-label="Idioma">'
    + '<a href="' + pt + '" hreflang="pt-BR"' + (!spanish ? ' aria-current="page"' : '') + '>PT</a>'
    + '<span aria-hidden="true">/</span>'
    + '<a href="' + es + '" hreflang="es"' + (spanish ? ' aria-current="page"' : '') + '>ES</a>'
    + '</nav>';
  if (!html.includes('class="language-switch"'))
    html = html.replace('<button class="menu-toggle"', n + '<button class="menu-toggle"');
  const mobile = '        <div class="mobile-language">'
    + '<a href="' + pt + '" hreflang="pt-BR"' + (!spanish ? ' aria-current="page"' : '') + '>Português</a>'
    + '<a href="' + es + '" hreflang="es"' + (spanish ? ' aria-current="page"' : '') + '>Español</a>'
    + '</div>\n      ';
  if (!html.includes('class="mobile-language"'))
    html = html.replace(/(<nav id="mobile-nav"[\s\S]*?)(<\/nav>)/, (_, a, b) => a + mobile + b);
  return html;
}
function renderPt(source, path) {
  return addSwitcher(setSeo(source, path, false), path, false);
}
function renderEs(source, path, pairs) {
  let html = translatePage(source, pairs);
  if (metaDescriptions[path]) {
    const desc = metaDescriptions[path];
    html = html.replace(/(<meta name="description" content=")[^"]*(")/, (_, a, b) => a + desc + b)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, (_, a, b) => a + desc + b);
  }
  // Spanish files mirror the Portuguese directory layout one level deeper.
  const prefix = path.startsWith('ecossistema/') ? '../' : '';
  html = html.replace(/((?:href|src|content)=")(\.\.\/assets\/|assets\/)/g,
    (_, start) => start + prefix + '../assets/');
  return addSwitcher(setSeo(html, path, true), path, true);
}
function renderAlias(html) {
  // A /section/index.html copy is one directory deeper than /section.html.
  return html.replace(/((?:href|src|content)=")([^"]+)"/g, (all, start, value) => {
    if (value.startsWith('assets/') || value.startsWith('../assets/'))
      return start + '../' + value + '"';
    if (!/^(https?:|mailto:|tel:|data:|\/|#)/i.test(value)
        && /^(href|src)="$/.test(start)) return start + '../' + value + '"';
    return all;
  });
}
function sitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  for (const path of pages) {
    for (const spanish of [false, true]) {
      xml += '  <url>\n    <loc>' + url(path, spanish) + '</loc>\n'
        + '    <xhtml:link rel="alternate" hreflang="pt-BR" href="' + url(path) + '"/>\n'
        + '    <xhtml:link rel="alternate" hreflang="es" href="' + url(path, true) + '"/>\n'
        + '    <xhtml:link rel="alternate" hreflang="x-default" href="' + url(path) + '"/>\n  </url>\n';
    }
  }
  return xml + '</urlset>\n';
}
module.exports = {core, businesses, pages, url, readTranslations, renderPt, renderEs, renderAlias, sitemap};
