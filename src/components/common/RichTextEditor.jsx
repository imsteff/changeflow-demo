import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold, Italic, Link2, List, ListOrdered, Redo2, Underline, Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { safeLinkUrl, toRichHtml } from '@/utils/richText';

// for the toolbar: matches server/utils/richText.js
const EXTENSIONS = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    link: { openOnClick: false, autolink: true, defaultProtocol: 'https', isAllowedUri: (url) => !!safeLinkUrl(url) },
  }),
];

const ACTIVE_TOOL = 'bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand';

const ToolButton = ({ label, active, className, ...props }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-pressed={active}
        onMouseDown={(e) => e.preventDefault()}
        className={cn('h-8 w-8 text-subtle', active && ACTIVE_TOOL, className)}
        {...props}
      />
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

function LinkButton({ editor, active }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const onOpenChange = (next) => {
    setOpen(next);
    if (next) {
      setUrl(editor.getAttributes('link').href || '');
      setError('');
    }
  };

  const save = (e) => {
    e.preventDefault();
    const href = safeLinkUrl(url);
    if (!href) {
      setError('Enter a valid http or https link');
      return;
    }
    if (editor.state.selection.empty && !active) {
      editor.chain().focus().insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setOpen(false);
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Link"
              aria-pressed={active}
              className={cn('h-8 w-8 text-subtle', active && ACTIVE_TOOL)}
            >
              <Link2 />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Link</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-80 p-3">
        <form onSubmit={save} className="space-y-2">
          <Input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            aria-label="Link address"
            aria-invalid={!!error}
            className="h-9"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            {active && <Button type="button" variant="outline" size="sm" onClick={remove}>Remove</Button>}
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function Toolbar({ editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      link: e.isActive('link'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const run = (command) => () => command(editor.chain().focus()).run();

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1">
      <ToolButton label="Bold" active={state.bold} onClick={run((c) => c.toggleBold())}><Bold /></ToolButton>
      <ToolButton label="Italic" active={state.italic} onClick={run((c) => c.toggleItalic())}><Italic /></ToolButton>
      <ToolButton label="Underline" active={state.underline} onClick={run((c) => c.toggleUnderline())}><Underline /></ToolButton>
      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      <ToolButton label="Bulleted list" active={state.bulletList} onClick={run((c) => c.toggleBulletList())}><List /></ToolButton>
      <ToolButton label="Numbered list" active={state.orderedList} onClick={run((c) => c.toggleOrderedList())}><ListOrdered /></ToolButton>
      <LinkButton editor={editor} active={state.link} />
      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      <ToolButton label="Undo" disabled={!state.canUndo} onClick={run((c) => c.undo())}><Undo2 /></ToolButton>
      <ToolButton label="Redo" disabled={!state.canRedo} onClick={run((c) => c.redo())}><Redo2 /></ToolButton>
    </div>
  );
}

// for long text fields: emits '' when empty
export default function RichTextEditor({ id, label, value, onChange, rows = 4, required, invalid, describedBy }) {
  const emitted = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const attributes = {
    id,
    role: 'textbox',
    'aria-multiline': 'true',
    'aria-label': label,
    ...(required && { 'aria-required': 'true' }),
    ...(invalid && { 'aria-invalid': 'true' }),
    ...(describedBy && { 'aria-describedby': describedBy }),
    class: 'rich-text px-3 py-2 text-sm focus:outline-none',
    style: `min-height: calc(${rows} * 1.25rem + 1rem)`,
  };

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: toRichHtml(value),
    editorProps: { attributes },
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? '' : e.getHTML();
      emitted.current = html;
      onChangeRef.current(html);
    },
  });

  useEffect(() => {
    if (!editor || value === emitted.current) return;
    emitted.current = value;
    editor.commands.setContent(toRichHtml(value), { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setOptions({ editorProps: { attributes } });
  }, [editor, id, label, required, invalid, describedBy, rows]);

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        invalid && 'border-destructive',
      )}
    >
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
