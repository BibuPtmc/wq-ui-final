import axios from "axios";

export function useAxios(){
    var headers = sessionStorage.getItem('token')
        ? { 'Authorization' : `Bearer ${sessionStorage.getItem('token')}` }
        : {}
    const axiosInstance = axios.create({
        baseURL : process.env.REACT_APP_API,
        headers : headers
    })
    axiosInstance.interceptors.response.use(res => res.data)
    
    return axiosInstance
}