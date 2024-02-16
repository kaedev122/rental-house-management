import { get_local_storage, set_local_storage } from "./storage"

const get_token_storage = () => get_local_storage("token")
const get_recovery_token_storage = () => get_local_storage("recovery_token")

const set_authenticated_storage = ({ access_token, username, id, recovery_token }, remember_me = true) => {
	set_local_storage("token", access_token)
	set_local_storage("recovery_token", recovery_token)
	set_local_storage("username", username)
	set_local_storage("id", id)
}

const remove_token_storage = () => localStorage.clear()

const is_authenticated = () => {
	try {
		const token = get_token_storage()
		if (token) {
			return true
		}
		return false
	} catch (error) {
		return false
	}
}

export { get_token_storage, set_authenticated_storage, remove_token_storage, is_authenticated, get_recovery_token_storage }