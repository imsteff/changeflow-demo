import { Separator } from '@/components/ui/separator';
import FilePicker from '@/components/common/FilePicker';
import FormField from '@/components/common/FormField';
import RichTextField from '@/components/common/RichTextField';

export default function RequirementsStep({ form, options }) {
  const { files, errors, setFiles } = form;
  return (
    <div className="space-y-8">
      <RichTextField
        form={form}
        name="detailedRequirements"
        label="Detailed Requirements"
        required
        rows={6}
        tip="What needs to change, in as much detail as you can."
      />

      <Separator />

      <div className="space-y-6">
        <RichTextField
          form={form}
          name="proposedProcess"
          label="Proposed Process"
          tip="The step-by-step process or user journey after the change."
        />
        <RichTextField
          form={form}
          name="processFlow"
          label="Proposed Process Flow"
          rows={5}
        />
        <FormField id="processFlowFiles" label="Process Flow Attachments" error={errors.processFlowFiles}>
          <FilePicker
            id="processFlowFiles"
            files={files.processFlowFiles}
            onChange={(list) => setFiles('processFlowFiles', list)}
            uploads={options.uploads}
            invalid={!!errors.processFlowFiles}
          />
        </FormField>
      </div>

      <Separator />

      <RichTextField
        form={form}
        name="expectedBehavior"
        label="Expected Behavior"
        required
        tip="How the system should behave once the change is live."
      />
    </div>
  );
}
