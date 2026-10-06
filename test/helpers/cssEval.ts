// Just enough CSS (specificity, var, calc, cos/sin) to evaluate the clip-path.

type Decls = Record<string, string>;
export type Point = [number, number];

interface Rule {
  selectors: string[];
  decls: Decls;
}

const parseRules = (css: string): Rule[] => {
  const flat = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\*\s*\{[^}]*\}/g, ''); // nested `* { ... }`
  const rules: Rule[] = [];
  const re = /([^{}]+)\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(flat))) {
    const decls: Decls = {};
    for (const d of m[2].split(/;(?![^(]*\))/)) {
      const i = d.indexOf(':');
      if (i > 0) {
        decls[d.slice(0, i).trim()] = d
          .slice(i + 1)
          .trim()
          .replace(/\s+/g, ' ');
      }
    }
    // [data-placement='top'] is matched like a .placement-top class.
    const selectors = m[1]
      .replace(/\[data-([\w-]+)='([^']+)'\]/g, '.$1-$2')
      .split(',')
      .map(s => s.trim());
    rules.push({ selectors, decls });
  }
  return rules;
};

// Split on `sep` at parenthesis depth 0.
const splitTop = (s: string, sep: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === sep && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  parts.push(cur.trim());
  return parts.filter(Boolean);
};

export class BubbleGeometry {
  private rules: Rule[];

  constructor(
    css: string,
    private box: { width: number; height: number },
    private inputs: Decls
  ) {
    this.rules = parseRules(css);
  }

  // Cascaded declarations for `.tooltip-bubble.<classes>`.
  cascade(classes: string[]): Decls {
    const values: Decls = { ...this.inputs };
    const spec: Record<string, number> = {};
    for (const rule of this.rules) {
      for (const sel of rule.selectors) {
        if (!sel.startsWith('.tooltip-bubble') || sel.includes(':')) continue;
        const cls = sel.split('.').filter(Boolean).slice(1);
        if (!cls.every(c => classes.includes(c))) continue;
        for (const [k, v] of Object.entries(rule.decls)) {
          if (spec[k] === undefined || cls.length >= spec[k]) {
            values[k] = v;
            spec[k] = cls.length;
          }
        }
      }
    }
    return values;
  }

  private substitute(value: string, values: Decls): string {
    let prev: string;
    let s = value;
    do {
      prev = s;
      s = s.replace(
        /var\((--[\w-]+)(?:,\s*([^()]+))?\)/g,
        (_, name: string, fallback?: string) => {
          const v = values[name] ?? fallback;
          if (v === undefined) throw new Error(`undefined ${name}`);
          return v;
        }
      );
    } while (s !== prev);
    return s;
  }

  private evalLength(expr: string, axis: 0 | 1): number {
    const pct = (axis === 0 ? this.box.width : this.box.height) / 100;
    const js = expr
      .replace(/calc\(/g, '(')
      .replace(/(-?[\d.]+)%/g, `($1*${pct})`)
      .replace(/([\d.]+)px/g, '$1')
      .replace(/([\d.]+)deg/g, '($1*Math.PI/180)')
      .replace(/\bcos\(/g, 'Math.cos(')
      .replace(/\bsin\(/g, 'Math.sin(');
    if (!/^[\d\s.+\-*/()a-zA-Z]*$/.test(js)) {
      throw new Error(`cannot evaluate: ${expr}`);
    }
    // Safe: `js` holds only numbers, operators and Math.* (checked above).
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return Number(new Function(`return ${js}`)());
  }

  // Evaluate a comma-separated point list, e.g. a `polygon()` body.
  points(list: string, classes: string[]): Point[] {
    const values = this.cascade(classes);
    return splitTop(this.substitute(list, values), ',').map(p => {
      const [x, y] = splitTop(p, ' ');
      return [this.evalLength(x, 0), this.evalLength(y, 1)];
    });
  }

  polygon(classes: string[]): Point[] {
    const clip = this.cascade(classes)['clip-path'];
    const body = clip.replace(/^polygon\(/, '').replace(/\)$/, '');
    return this.points(body, classes);
  }

  length(expr: string, classes: string[], axis: 0 | 1 = 0): number {
    return this.evalLength(this.substitute(expr, this.cascade(classes)), axis);
  }
}

// Shoelace area; positive when clockwise in screen (y-down) space.
export const signedArea = (ps: Point[]): number =>
  ps.reduce((sum, [x1, y1], i) => {
    const [x2, y2] = ps[(i + 1) % ps.length];
    return sum + x1 * y2 - x2 * y1;
  }, 0) / 2;
