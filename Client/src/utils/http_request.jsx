import axios from 'axios'
import { get_token_storage, is_authenticated, remove_token_storage, get_recovery_token_storage } from './auth'
import { get_local_storage, set_local_storage } from "./storage"
import { CONFIG } from '@configs'
import { redirect_page } from "./redirect_page"
import { useLocation } from 'react-router-dom'

const sleep = duration => new Promise(resolve => setTimeout(resolve, duration))

// create an axios instance
const http_request = axios.create({
	// baseURL: CONFIG.SERVER_API, // base_url of api
	timeout: CONFIG.TIMEOUT // Request timeout
})

// request interceptor
http_request.interceptors.request.use(
	config => {
		config.baseURL = `${CONFIG.SERVER_API}`
		try {
			if (is_authenticated()) {
				const authorrization = `Bearer ${get_token_storage()}`
				if (config.up_file) {
					config.headers['content-type'] = 'multipart/form-data'
					config.headers['Authorization'] = authorrization
				} else {
					config.headers['Content-Type'] = 'application/json'
					config.headers['Authorization'] = authorrization
					config.data = {
						...config.data,
					}
					if(config.method === "get"){
						config.params = {
							...config.params,
						}
					}
					
				}
			} else if (config.recovery) {
				const authorrization = `Bearer ${get_recovery_token_storage()}`
				config.headers['Content-Type'] = 'application/json'
				config.headers['Authorization'] = authorrization
			}
		} catch (error) {
			console.log('config interceptors err')
		}
		return config
	},
	error => {
		Promise.reject(error)
	}
)

// response Interceptor
http_request.interceptors.response.use(

	async (response) => {

		const original_request = response.config
		const { code } = response.data
		if (code === 3) {
			const { new_token } = response.data
			set_local_storage("token", new_token)

			if (!original_request._retry) {
				original_request._retry = true
				const data_with_new_token = {
					...JSON.parse(original_request.data),
					token: new_token
				}
				original_request.data = data_with_new_token
				await sleep(1000)
				return await http_request(original_request)
			}
		}

		// session end -> logout & clear all data user
		if (code === 100) {
			remove_token_storage()
		}
		if (code === 401) {
			remove_token_storage()
		}
		return response.data
	},
	error => {
		const { code } = error?.response.data
		// if (code === 401) {
		// 	remove_token_storage()
		// 	redirect_page('/login')
		// }
		if (code === 403) {

			//check không có quyền
		}
		return error.response.data
	}
)

export default http_request