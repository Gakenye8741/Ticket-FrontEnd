import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "../features/APIS/UserApi";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "../features/Auth/AuthSlice"
import { eventApi } from "../features/APIS/EventsApi";
import { venueApi } from "../features/APIS/VenueApi";
import { bookingApi } from "../features/APIS/BookingsApi";
import { ticketApi } from "../features/APIS/ticketsType.Api";
import { mediaApi } from "../features/APIS/mediaApi";
import { supportTicketApi } from "../features/APIS/supportTicketsApi";
import { adminResponseApi } from "../features/APIS/AdminReponse";
import { paymentApi } from "../features/APIS/PaymentApi";

// Create Persist Configuration for auth Slice

 const authPersistConfiguration ={
    key: 'auth',
    storage,
    whitelist: ['user','token','isAuthenticated','role']
 }
//  Create A persistent Reducer for the AUTH
const persistedAuthReducer =persistReducer(authPersistConfiguration,authReducer)


export const store = configureStore({
    reducer: {
        [userApi.reducerPath]:userApi.reducer,
        [eventApi.reducerPath]: eventApi.reducer,
        [venueApi.reducerPath]: venueApi.reducer,
        [bookingApi.reducerPath]: bookingApi.reducer,
        [ticketApi.reducerPath]: ticketApi.reducer,
        [mediaApi.reducerPath]: mediaApi.reducer,
        [supportTicketApi.reducerPath]:supportTicketApi.reducer,
        [adminResponseApi.reducerPath]:adminResponseApi.reducer,
        [paymentApi.reducerPath] : paymentApi.reducer,
        auth: persistedAuthReducer,
    },
    middleware: (getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(userApi.middleware,eventApi.middleware,venueApi.middleware,bookingApi.middleware,ticketApi.middleware,mediaApi.middleware,supportTicketApi.middleware,adminResponseApi.middleware,paymentApi.middleware)
})

export const persister = persistStore(store);
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch