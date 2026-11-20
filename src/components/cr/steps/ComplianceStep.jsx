import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import DatePicker from '@/components/common/DatePicker';
import FilePicker from '@/components/common/FilePicker';
import FormField, { invalidProps } from '@/components/common/FormField';
import { maxTargetStr, todayStr } from '@/utils/crForm';

const REGULATORY_CHOICES = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export default function ComplianceStep({ form, options }) {
  const { values, files, errors, setValue, setFiles } = form;
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <FormField
          id="regulatoryApprovalNeeded"
          label="Does this change need regulatory approval?"
          required
          tip="Attach the supporting documents if the change needs regulatory approval."
          error={errors.regulatoryApprovalNeeded}
        >
          <RadioGroup
            id="regulatoryApprovalNeeded"
            aria-labelledby="regulatoryApprovalNeeded-label"
            value={values.regulatoryApprovalNeeded}
            onValueChange={(v) => setValue('regulatoryApprovalNeeded', v)}
            className="flex gap-6"
            {...invalidProps('regulatoryApprovalNeeded', errors.regulatoryApprovalNeeded)}
          >
            {REGULATORY_CHOICES.map((choice) => (
              <div key={choice.value} className="flex items-center gap-2">
                <RadioGroupItem value={choice.value} id={`regulatory-${choice.value}`} />
                <Label htmlFor={`regulatory-${choice.value}`} className="font-normal">{choice.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </FormField>

        {values.regulatoryApprovalNeeded === 'yes' && (
          <FormField id="regulatoryFiles" label="Regulatory Approval Documents" required error={errors.regulatoryFiles}>
            <FilePicker
              id="regulatoryFiles"
              files={files.regulatoryFiles}
              onChange={(list) => setFiles('regulatoryFiles', list)}
              uploads={options.uploads}
              invalid={!!errors.regulatoryFiles}
            />
          </FormField>
        )}
      </div>

      <Separator />

      <FormField
        id="targetDate"
        label="Target Implementation Date"
        required
        tip="When you need this change to be live."
        error={errors.targetDate}
      >
        <DatePicker
          id="targetDate"
          value={values.targetDate}
          onChange={(v) => setValue('targetDate', v)}
          min={todayStr()}
          max={maxTargetStr()}
          invalid={!!errors.targetDate}
        />
      </FormField>
    </div>
  );
}
