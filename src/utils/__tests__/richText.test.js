import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasRichText, isRichHtml, richTextToPlain, safeLinkUrl, toRichHtml } from '../richText.js';
import { fromCr, initialFiles, initialValues, validateStep } from '../crForm.js';

test('toRichHtml wraps legacy plain text lines and escapes it', () => {
  assert.equal(toRichHtml('a & b\n<c>'), '<p>a &amp; b</p><p>&lt;c&gt;</p>');
  assert.equal(toRichHtml('<p>kept</p>'), '<p>kept</p>');
  assert.equal(toRichHtml(null), '');
  assert.equal(toRichHtml('  '), '  ');
});

test('isRichHtml only matches editor blocks', () => {
  assert.equal(isRichHtml('<ul><li>x</li></ul>'), true);
  assert.equal(isRichHtml('use <b> tags'), false);
});

test('richTextToPlain keeps line breaks and decodes entities', () => {
  assert.equal(richTextToPlain('<p>a &amp; b</p><ul><li><p>one</p></li></ul>'), 'a & b\none');
});

test('an empty editor has no text', () => {
  assert.equal(hasRichText('<p></p>'), false);
  assert.equal(hasRichText('<p>&nbsp;</p><p> </p>'), false);
  assert.equal(hasRichText('<p><strong>x</strong></p>'), true);
});

test('required editor fields reject an empty editor', () => {
  const errors = validateStep('business', { ...initialValues(), businessObjective: '<p></p>', businessJustification: '<p>x</p>', benefits: '<p>y</p>' }, initialFiles());
  assert.deepEqual(errors, { businessObjective: 'Business Objective is required' });
});

test('editor fields flag html over the limit', () => {
  const errors = validateStep('business', { ...initialValues(), businessObjective: `<p>${'x'.repeat(10000)}</p>`, businessJustification: '<p>x</p>', benefits: '<p>y</p>' }, initialFiles());
  assert.equal(errors.businessObjective, 'Business Objective is too long');
});

test('fromCr converts legacy plain text for the editor', () => {
  const values = fromCr({ benefits: 'line 1\nline 2', businessObjective: '<p>new</p>', proposedProcess: null });
  assert.equal(values.benefits, '<p>line 1</p><p>line 2</p>');
  assert.equal(values.businessObjective, '<p>new</p>');
  assert.equal(values.proposedProcess, '');
});

test('safeLinkUrl adds https and refuses other schemes', () => {
  assert.equal(safeLinkUrl('acme.example/docs'), 'https://acme.example/docs');
  assert.equal(safeLinkUrl('http://acme.example'), 'http://acme.example/');
  assert.equal(safeLinkUrl('javascript:alert(1)'), null);
  assert.equal(safeLinkUrl('   '), null);
});
