import {configureStore} from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './rootReducer.js';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth']
  };
  
  const persistedReducer = persistReducer(persistConfig, rootReducer);

  export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Only ignore redux-persist's own internal actions (the pattern
        // redux-persist's own docs recommend), instead of disabling the
        // whole safety net project-wide. immutableCheck had no
        // redux-persist-related reason to be off at all - re-enabled.
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
        immutableCheck: true,
      }),
  });
  
  export const persistor = persistStore(store);