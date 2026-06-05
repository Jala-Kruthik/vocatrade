// Re-export the shared axios instance from AuthContext so legacy imports
// (e.g. import api from './client') continue to work.
export { api as default } from './AuthContext';
