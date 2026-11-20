import { Separator } from '@/components/ui/separator';
import RichTextField from '@/components/common/RichTextField';

export default function BusinessCaseStep({ form }) {
  return (
    <div className="space-y-8">
      <RichTextField
        form={form}
        name="businessObjective"
        label="Business Objective"
        required
        tip="What this change should achieve."
      />

      <Separator />

      <div className="space-y-6">
        <RichTextField
          form={form}
          name="businessJustification"
          label="Business Justification"
          required
          tip="Why this change is needed and what it delivers."
        />
        <RichTextField
          form={form}
          name="benefits"
          label="Benefits"
          required
          tip="Who benefits and how, e.g. time saved or errors avoided."
        />
      </div>
    </div>
  );
}
