import axios from 'axios';

export const setAuthHeader = (key) => {
    axios.defaults.headers.common['Authorization'] = key;
};

export default axios;