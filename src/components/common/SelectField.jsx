import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField, { invalidProps } from './FormField';

export default function SelectField({ form, name, label, required, tip, placeholder, items }) {
  const { values, errors, setValue } = form;
  return (
    <FormField id={name} label={label} required={required} tip={tip} error={errors[name]}>
      <Select value={values[name]} onValueChange={(v) => setValue(name, v)}>
        <SelectTrigger id={name} {...invalidProps(name, errors[name])}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </FormField>
  );
}
