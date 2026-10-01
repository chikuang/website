const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'themes/avicenna/static/js/main.js'), 'utf8');
const head = fs.readFileSync(path.join(root, 'layouts/partials/header.html'), 'utf8')
  .match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const colors = { light: '#ffffff', dark: '#16181d', 'milk-tea': '#fbf5eb' };

function load({ stored = null, prefersDark = false, denied = false } = {}) {
  const attrs = {}, meta = {}, buttons = Object.keys(colors).map(theme => ({
    attrs: { 'data-color-theme': theme },
    getAttribute(key) { return this.attrs[key]; },
    setAttribute(key, value) { this.attrs[key] = value; },
    addEventListener(event, callback) { this[event] = callback; }
  }));
  const context = {
    document: {
      readyState: 'complete',
      documentElement: {
        setAttribute(key, value) { attrs[key] = value; },
        getAttribute(key) { return attrs[key]; }
      },
      querySelector(selector) {
        return selector === 'meta[name="theme-color"]'
          ? { setAttribute(key, value) { meta[key] = value; } } : null;
      },
      querySelectorAll() { return buttons; }
    },
    window: { matchMedia: () => ({ matches: prefersDark }) },
    localStorage: {
      getItem() { if (denied) throw Error('Storage blocked'); return stored; },
      setItem(key, value) { if (denied) throw Error('Storage blocked'); stored = value; }
    }
  };
  vm.runInNewContext(head, context);
  const firstPaint = attrs['data-theme'];
  vm.runInNewContext(script, context);
  return { attrs, meta, buttons, firstPaint, saved: () => stored };
}

for (const theme of Object.keys(colors)) {
  const page = load({ stored: theme });
  assert.equal(page.firstPaint, theme, 'Saved choice applies before styles load');
  assert.equal(page.attrs['data-theme'], theme);
  assert.equal(page.meta.content, colors[theme]);
  assert.equal(page.buttons.filter(b => b.attrs['aria-pressed'] === 'true').length, 1);
}

const page = load();
for (const button of page.buttons) {
  button.click();
  const theme = button.attrs['data-color-theme'];
  assert.equal(page.attrs['data-theme'], theme);
  assert.equal(page.saved(), theme);
  assert.equal(page.meta.content, colors[theme]);
  assert.equal(button.attrs['aria-pressed'], 'true');
  assert.equal(page.buttons.filter(b => b.attrs['aria-pressed'] === 'true').length, 1);
  assert.equal(load({ stored: page.saved() }).firstPaint, theme, 'Reload/new page retains choice');
}

for (const stored of [null, 'unknown', 'toString']) {
  for (const prefersDark of [false, true]) {
    const fresh = load({ stored, prefersDark });
    assert.equal(fresh.firstPaint, 'milk-tea', 'Default is milk tea regardless of system appearance');
    assert.equal(fresh.attrs['data-theme'], 'milk-tea');
    assert.equal(fresh.meta.content, colors['milk-tea']);
  }
}
const blocked = load({ denied: true });
assert.equal(blocked.firstPaint, 'milk-tea', 'Blocked storage uses the default at first paint');
assert.equal(blocked.attrs['data-theme'], 'milk-tea');
blocked.buttons[1].click();
assert.equal(blocked.attrs['data-theme'], 'dark', 'Selection works even without storage');
assert.equal(blocked.buttons[1].attrs['aria-pressed'], 'true');
console.log('Theme selection, persistence, first paint and blocked-storage checks passed.');
