import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { errorMessage, fieldErrors } from '@/services/api';
import {
  STEPS, isChanged, stepOfField, validateAll, validateStep,
} from '@/utils/crForm';

// for the CR wizard
export default function useCrForm(options, getStart) {
  const [start] = useState(getStart);
  const [values, setValues] = useState(start.values);
  const [files, setFilesState] = useState(start.files);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const topRef = useRef(null);
  const bodyRef = useRef(null);

  const clearError = (name) => setErrors((prev) => {
    if (!prev[name]) return prev;
    const next = { ...prev };
    delete next[name];
    return next;
  });

  const setValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    clearError(name);
    if (name === 'systemType') {
      clearError('appName');
      clearError('systemOther');
    }
    if (name === 'regulatoryApprovalNeeded') clearError('regulatoryFiles');
  };

  const setFiles = (name, list) => {
    setFilesState((prev) => ({ ...prev, [name]: list }));
    clearError(name);
  };

  const goTo = (index) => {
    setStep(index);
    setFurthestStep((prev) => Math.max(prev, index));
    setSubmitError('');
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    bodyRef.current?.scrollTo({ top: 0 });
  };

  const next = () => {
    const found = validateStep(STEPS[step].key, values, files, options);
    setErrors(found);
    if (Object.keys(found).length) {
      const el = document.getElementById(Object.keys(found)[0]);
      // for radio groups: the group div itself cannot take focus
      (el?.getAttribute('role') === 'radiogroup' ? el.querySelector('[role="radio"]') : el)?.focus();
      return;
    }
    goTo(step + 1);
  };

  const showErrors = (found) => {
    setErrors(found);
    goTo(stepOfField(Object.keys(found)[0]));
  };

  const validate = () => {
    const found = validateAll(values, files, options);
    if (Object.keys(found).length) {
      showErrors(found);
      return false;
    }
    return true;
  };

  // for submit: resolves to data or null
  const submit = async (send, failMessage) => {
    if (submitting || !validate()) return null;
    setSubmitting(true);
    setSubmitError('');
    setUploadPercent(0);
    try {
      return await send(setUploadPercent);
    } catch (err) {
      const serverFields = fieldErrors(err);
      if (Object.keys(serverFields).length) showErrors(serverFields);
      const message = errorMessage(err, failMessage);
      setSubmitError(message);
      toast.error(message);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setValues(start.values);
    setFilesState(start.files);
    setErrors({});
    setSubmitError('');
    setStep(0);
    setFurthestStep(0);
  };

  return {
    values,
    files,
    errors,
    step,
    furthestStep,
    submitting,
    uploadPercent,
    submitError,
    topRef,
    bodyRef,
    dirty: isChanged(values, files, start),
    setValue,
    setFiles,
    goTo,
    next,
    validate,
    submit,
    reset,
  };
}
