import { mock } from './api';
import * as store from '@/mockData/store';
import { getDemoUser } from '@/mockData/demoAuth';

export const getMe = () => mock(() => getDemoUser());
export const getOptions = () => mock(() => store.getOptions());

// for the upload bar: fake progress before the store saves
const withProgress = (onProgress, fn) => {
  if (onProgress) [30, 70, 100].forEach((v, i) => setTimeout(() => onProgress(v), i * 90));
  return mock(fn);
};

export const submitCr = (formData, onProgress) => withProgress(onProgress, () => store.submitCr(formData));

export const listMine = (params) => mock(() => store.listMine(params));
export const listQueue = (params) => mock(() => store.listQueue(params));
export const listTracked = (params) => mock(() => store.listTracked(params));
export const listReqs = (params) => mock(() => store.listReqs(params));
export const getSummary = () => mock(() => store.getSummary());
export const getCr = (crNo) => mock(() => store.getCr(crNo));

export const actOnCr = (crNo, action, remarks) => mock(() => store.actOnCr(crNo, action, remarks));
export const enterReq = (crNo, input) => mock(() => store.enterReq(crNo, input));
export const correctReq = (crNo, input) => mock(() => store.correctReq(crNo, input));
export const resubmitCr = (crNo, formData, onProgress) => withProgress(onProgress, () => store.resubmitCr(crNo, formData));

// for the demo: downloads a local placeholder file
export const downloadAttachment = async (id, fileName) => {
  const text = await mock(() => store.attachmentFile(id));
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
