import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import CrReview from '@/components/cr/CrReview';
import CrStepper from '@/components/cr/CrStepper';
import ScrollPane from '@/components/common/ScrollPane';
import RequestInfoStep from '@/components/cr/steps/RequestInfoStep';
import BusinessCaseStep from '@/components/cr/steps/BusinessCaseStep';
import RequirementsStep from '@/components/cr/steps/RequirementsStep';
import ComplianceStep from '@/components/cr/steps/ComplianceStep';
import { STEPS } from '@/utils/crForm';

const STEP_VIEWS = [RequestInfoStep, BusinessCaseStep, RequirementsStep, ComplianceStep];
const REVIEW_STEP = STEPS.length - 1;

export default function CrWizard({
  form, options, user, onSubmit, submitLabel = 'Submit CR', submittingLabel = 'Submitting', errorTitle = 'Not submitted',
}) {
  const {
    values, files, errors, step, furthestStep, submitting, uploadPercent, submitError, setValue, setFiles, goTo, next, bodyRef,
  } = form;
  const StepView = STEP_VIEWS[step];
  const isReview = step === REVIEW_STEP;
  const percent = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="grid gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[260px_1fr] lg:grid-rows-1">
      <aside className="lg:self-start">
        <CrStepper step={step} furthestStep={furthestStep} onSelect={goTo} disabled={submitting} />
      </aside>

      <Card className="overflow-hidden shadow-sm lg:flex lg:min-h-0 lg:flex-col">
        <CardHeader className="space-y-4 border-b">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{percent}% complete</span>
          </div>
          <Progress value={percent} className="h-1.5" />
          <div className="space-y-1 pt-2">
            <CardTitle className="text-xl">{STEPS[step].title}</CardTitle>
            <CardDescription>{STEPS[step].description}</CardDescription>
          </div>
        </CardHeader>
        <ScrollPane ref={bodyRef} className="lg:flex-1">
          <CardContent className="space-y-6 p-6 sm:p-8">
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{errorTitle}</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
            {isReview
              ? <CrReview values={values} files={files} options={options} user={user} onEdit={goTo} />
              : <StepView form={{ values, files, errors, setValue, setFiles }} options={options} user={user} />}
          </CardContent>
        </ScrollPane>
        <CardFooter className="flex flex-col-reverse gap-3 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:justify-between sm:px-8">
          {step > 0 && (
            <Button
              variant="ghost"
              className="group w-full sm:w-auto"
              onClick={() => goTo(step - 1)}
              disabled={submitting}
            >
              <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back
            </Button>
          )}
          {isReview ? (
            <Button className="group w-full sm:ml-auto sm:w-auto" onClick={onSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  {`${submittingLabel}${uploadPercent ? ` ${uploadPercent}%` : ''}`}
                  <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-0.5" />
                  {submitLabel}
                </>
              )}
            </Button>
          ) : (
            <Button className="group w-full sm:ml-auto sm:w-auto" onClick={next}>
              Next
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
