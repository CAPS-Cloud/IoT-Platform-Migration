import axios from 'axios';

axios.defaults.baseURL = 'http://' + window.location.hostname + ':3000/api';
//axios.defaults.baseURL = 'http://127.0.0.1:3000/api';

export default axios;
