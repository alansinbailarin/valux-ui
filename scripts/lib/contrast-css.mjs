/**
 * Minimal, dependency-free CSS block/declaration parsing shared by
 * scripts/audit-contrast.mjs. No CSS-in-JS lib, no browser — just enough
 * string scanning to pull `--custom-prop: value;` and `prop: value;` pairs
 * out of the kit's real stylesheets.
 */

export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

// Depth-aware "{...}" extraction so nested @media blocks don't confuse a
// naive first-"}" match.
export function extractBlock(css, openBraceIndex) {
  let depth = 0;
  for (let i = openBraceIndex; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(openBraceIndex + 1, i);
    }
  }
  throw new Error("Unbalanced braces while scanning CSS");
}

export function parseRules(css) {
  const rules = [];
  let i = 0;
  while (i < css.length) {
    const braceIndex = css.indexOf("{", i);
    if (braceIndex === -1) break;
    const selector = css.slice(i, braceIndex).trim();
    const body = extractBlock(css, braceIndex);
    rules.push({ selector, body });
    i = braceIndex + body.length + 2;
  }
  return rules;
}

// Splits a rule body into `{ "--prop": "value", "color": "value" }`,
// respecting parens so commas/semicolons inside color-mix()/var() don't
// break declaration boundaries.
export function parseDeclarations(body) {
  const decls = new Map();
  let depth = 0;
  let start = 0;
  const flush = (end) => {
    const raw = body.slice(start, end).trim();
    const colon = raw.indexOf(":");
    if (colon === -1) return;
    decls.set(raw.slice(0, colon).trim(), raw.slice(colon + 1).trim());
  };
  for (let i = 0; i < body.length; i += 1) {
    if (body[i] === "(") depth += 1;
    else if (body[i] === ")") depth -= 1;
    else if (body[i] === ";" && depth === 0) {
      flush(i);
      start = i + 1;
    }
  }
  flush(body.length);
  return decls;
}

export function findRuleBody(css, selectorLiteral) {
  const index = css.indexOf(selectorLiteral);
  if (index === -1) return null;
  const braceIndex = css.indexOf("{", index);
  return extractBlock(css, braceIndex);
}

export function getDeclaration(css, selectorLiteral, property) {
  const body = findRuleBody(css, selectorLiteral);
  if (body === null) return null;
  return parseDeclarations(body).get(property) ?? null;
}

// "1px solid <color>" -> "<color>" (border shorthand -> just the color).
export function stripBorderShorthand(value) {
  const match = /^\S+\s+\S+\s+([\s\S]+)$/.exec(value.trim());
  return match ? match[1].trim() : value.trim();
}

export function splitTopLevelArgs(argsText) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < argsText.length; i += 1) {
    if (argsText[i] === "(") depth += 1;
    else if (argsText[i] === ")") depth -= 1;
    else if (argsText[i] === "," && depth === 0) {
      parts.push(argsText.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(argsText.slice(start));
  return parts.map((part) => part.trim());
}
