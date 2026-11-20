import FormField, { describedByOf } from './FormField';
import RichTextEditor from './RichTextEditor';

export default function RichTextField({ form, name, label, required, tip, rows = 4 }) {
  const { values, errors, setValue } = form;
  return (
    <FormField id={name} label={label} required={required} tip={tip} error={errors[name]}>
      <RichTextEditor
        id={name}
        label={label}
        rows={rows}
        required={required}
        value={values[name]}
        onChange={(html) => setValue(name, html)}
        invalid={!!errors[name]}
        describedBy={describedByOf(name, { error: errors[name] })}
      />
    </FormField>
  );
}
