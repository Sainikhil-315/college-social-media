import axios from 'axios';
import { API_URL, DEFAULT_HEADERS } from './config';

export const createAxiosInstance = () => {
    const instance = axios.create({
        baseURL: API_URL,
        withCredentials: true,
        timeout: 10000,
    });

    instance.interceptors.request.use(config => {
        const token = localStorage.getItem('token');
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
    return instance;
}