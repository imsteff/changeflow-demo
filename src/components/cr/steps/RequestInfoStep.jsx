import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import FormField, { invalidProps } from '@/components/common/FormField';
import SelectField from '@/components/common/SelectField';
import RequestorSummary from '@/components/cr/RequestorSummary';
import { TITLE_MAX } from '@/utils/crForm';

export default function RequestInfoStep({ form, options, user }) {
  const { values, errors, setValue } = form;
  const internalApps = options.internalApps.map((name) => ({ value: name, label: name }));

  return (
    <div className="space-y-8">
      <RequestorSummary user={user} />

      <Separator />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          form={form}
          name="systemType"
          label="System"
          required
          tip="The application this change applies to."
          placeholder="Select a system"
          items={options.systemTypes}
        />

        {values.systemType === 'internal_app' && (
          <SelectField form={form} name="appName" label="Internal Application" required placeholder="Select an application" items={internalApps} />
        )}

        {values.systemType === 'others' && (
          <FormField id="systemOther" label="Please specify the system" required error={errors.systemOther}>
            <Input
              id="systemOther"
              maxLength={255}
              value={values.systemOther}
              onChange={(e) => setValue('systemOther', e.target.value)}
              {...invalidProps('systemOther', errors.systemOther)}
            />
          </FormField>
        )}
      </div>

      <Separator />

      <div className="space-y-6">
        <FormField
          id="title"
          label="CR Title"
          required
          error={errors.title}
          hint="A short summary, e.g. Add bulk export to the monthly sales report"
          counter={`${values.title.length}/${TITLE_MAX}`}
        >
          <Input
            id="title"
            maxLength={TITLE_MAX}
            value={values.title}
            onChange={(e) => setValue('title', e.target.value)}
            {...invalidProps('title', errors.title, { hint: true, counter: true })}
          />
        </FormField>

        <div className="grid gap-6 sm:grid-cols-2">
          <SelectField form={form} name="requestType" label="Request Type" required placeholder="Select a request type" items={options.requestTypes} />
        </div>
      </div>
    </div>
  );
}
