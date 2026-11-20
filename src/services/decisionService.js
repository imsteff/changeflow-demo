import { mock } from './api';
import * as store from '@/mockData/store';

export const getDecision = (token) => mock(() => store.getDecision(token));

export const submitDecision = (token, action, remarks) => mock(() => store.submitDecision(token, action, remarks));
