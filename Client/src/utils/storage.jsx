/**
|--------------------------------------------------
| @vunv

|--------------------------------------------------
*/
const isset_filed_local = (filed_name) => {
	try {
		const filed_value = localStorage.getItem(filed_name)
		if (
			filed_value !== null
			&& filed_value !== 'null'
			&& filed_value !== undefined
			&& filed_value !== 'undefined'
			&& filed_value !== ''
		) {
			return true
		} else {
			return false
		}
	} catch (error) {
		return false
	}
}

const get_local_storage = (name_field = "user_id", default_res = null) => {
	

	try {
		return (isset_filed_local(name_field)) ? JSON.parse(localStorage.getItem(name_field)) : default_res
	} catch (error) {
		return default_res
	}
}

const set_local_storage = (name_field = "storage", default_res = "") => {
	localStorage.setItem(name_field, JSON.stringify(default_res))
}

const isset_filed_session = (filed_name) => {
	try {
		const filed_value = sessionStorage.getItem(filed_name)
		if (filed_value !== null
			&& filed_value !== 'null'
			&& filed_value !== undefined
			&& filed_value !== 'undefined'
			&& filed_value !== '') {
			return true
		} else {
			return false
		}
	} catch (error) {
		return false
	}
}

const get_session_storage = (name_field = "user_id", default_res = null) => {
	try {
		return (isset_filed_session(name_field)) ? JSON.parse(sessionStorage.getItem(name_field)) : default_res
	} catch (error) {
		return default_res
	}
}

const set_session_storage = (name_field = "storage", default_res = "") => {
	sessionStorage.setItem(name_field, JSON.stringify(default_res))
}

export { isset_filed_local, get_local_storage, set_local_storage, isset_filed_session, get_session_storage, set_session_storage }