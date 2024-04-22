/**
|--------------------------------------------------
| FUNCTION UTILS
| @vunv

|--------------------------------------------------
*/
import { get_token_storage, set_authenticated_storage, remove_token_storage, is_authenticated, get_recovery_token_storage, get_role_storage, is_admin } from "./auth"
import { isset_filed_local, get_local_storage, set_local_storage, isset_filed_session, get_session_storage, set_session_storage } from "./storage"
import http_request from "./http_request"
import { trim } from "./string"
import { is_url, is_email, is_phone, is_lower_case, is_upper_case, is_alphabets, is_null_or_undefined, is_string, is_number, is_boolean, is_array, is_empty } from "./validate"
import { listBank } from "./bank"
export {
	get_token_storage, set_authenticated_storage, remove_token_storage, is_authenticated, get_recovery_token_storage, get_role_storage, is_admin,
	isset_filed_local, get_local_storage, set_local_storage, isset_filed_session, get_session_storage, set_session_storage,
	http_request,
	trim,
	is_url, is_email, is_phone, is_lower_case, is_upper_case, is_alphabets, is_null_or_undefined, is_string, is_number, is_boolean, is_array, is_empty,
	listBank
}
