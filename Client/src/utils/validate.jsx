/**
|--------------------------------------------------
| @vunv

|--------------------------------------------------
*/
const is_url = (url = "") => {
	// eslint-disable-next-line
	const urlregex = /^(https?|http|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
	return urlregex.test(url)
}

const is_lower_case = (str = "") => {
	const reg = /^[a-z]+$/
	return reg.test(str)
}

const is_upper_case = (str = "") => {
	const reg = /^[A-Z]+$/
	return reg.test(str)
}

const is_alphabets = (str = "") => {
	const reg = /^[A-Za-z]+$/
	return reg.test(str)
}

const is_email = (email = "") => {
	// eslint-disable-next-line
	const reg = /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return reg.test(email)
}

const is_phone = (phone = "") => {
	return /^(0[2356789]|09)[0-9]{8}$/.test(phone);
}

const is_null_or_undefined = (prop) => {
	return prop === null || prop === undefined
}

const is_string = (object) => {
	return typeof object === "string"
}

const is_number = (object) => {
	return typeof object === "number"
}

const is_boolean = (object) => {
	return typeof object === "boolean"
}

const is_array = (object) => {
	return !is_null_or_undefined(object) && object.constructor === Array
}

const is_empty = (value) => {
	return (
		value === undefined ||
		value === null ||
		(typeof value === 'object' && Object.keys(value).length === 0) ||
		(typeof value === 'string' && value.trim().length === 0)
	)
}

	const is_character = (str = "") => {
		const reg = /^[a-zA-Z0-9\u00C0-\u024F\s]*$/;
		return !reg.test(str)
	}
	const is_error_text_with_digit = (str = "") => {
		const reg = /^[a-zA-Z0-9.]*$/;
		return !reg.test(str)
	}
	const is_error_only_text_with_space = (str = "") => {
		const reg = /^[a-zA-Z\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ_-]*$/;
		return !reg.test(str)
	}
	const is_error_address = (str = "") => {
		const reg = /^[a-zA-Z0-9\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ,._-]*$/;
		return !reg.test(str)
	}
	const is_error_password = (str ="") => {
		const reg = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
		return !reg.test(str)
	}
	// const is_error_only_digit = (str = "") => {
	// 	const reg = /^[a-zA-Z\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ]*$/;
	// 	return !reg.test(str)
	// }

	const regName = /^[a-zA-Z\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ]*$/;
	const regAddress = /^[a-zA-Z0-9\s_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ,._-]*$/;
	const regPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
	export {
	is_url, is_email, is_phone,
	is_lower_case, is_upper_case, is_alphabets,
	is_null_or_undefined,
	is_string, is_number, is_boolean, is_array,
	is_empty,
	regName, regAddress,regPassword,
	is_character, is_error_text_with_digit, is_error_only_text_with_space, is_error_address, is_error_password
}