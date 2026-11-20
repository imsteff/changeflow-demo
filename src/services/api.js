import { delay } from '@/mockData/store';

// for the demo: every call is served by the in-memory store
export const mock = (fn) => {
  try {
    return delay(fn());
  } catch (err) {
    return delay(err);
  }
};

export const errorMessage = (err, fallback = 'Something went wrong, please try again') => {
  if (err?.response?.data?.message) return err.response.data.message;
  return fallback;
};

export const fieldErrors = (err) => err?.response?.data?.details || {};
