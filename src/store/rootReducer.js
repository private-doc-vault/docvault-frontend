import { combineReducers } from '@reduxjs/toolkit';
// Import slices as they are created
import authReducer from '../features/auth/authSlice';
import documentsReducer from '../features/documents/documentsSlice';
import searchReducer from '../features/search/searchSlice';
import usersReducer from '../features/users/usersSlice';
import rolesReducer from '../features/roles/rolesSlice';
import sharingReducer from '../features/sharing/sharingSlice';
import auditReducer from '../features/audit/auditSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import ocrReducer from '../features/ocr/ocrSlice';
import uiReducer from '../features/ui/uiSlice';

const rootReducer = combineReducers({
  // Add reducers here as they are created
  auth: authReducer,
  documents: documentsReducer,
  search: searchReducer,
  users: usersReducer,
  roles: rolesReducer,
  sharing: sharingReducer,
  audit: auditReducer,
  dashboard: dashboardReducer,
  ocr: ocrReducer,
  ui: uiReducer,
});

export default rootReducer;
