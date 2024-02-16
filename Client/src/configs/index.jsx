import {
	SERVER_API
} from "./server_info"
export const CONFIG = {
	SERVER_API,

	// ------  constans ------ 
	SENDER_ID: 842550913355,
	// eslint-disable-next-line
	EMAIL_FORMAT: /^[a-z]+[a-z0-9._]+@[a-z\-]+\.[a-z.]{2,8}$/,
	// eslint-disable-next-line
	EMAIL_OR_PHONE_FORMAT: /^([a-z]+[a-z0-9._]+@[a-z\-]+\.[a-z.]{2,8})|((0[126389]|09)[0-9]{8})$/,
	// eslint-disable-next-line
	PHONE_FORMAT: /^(0[123689]|09)[0-9]{8}$/,
	// eslint-disable-next-line
	OTP_CODE_FORMAT: /^[0-9]{6}$/,
	// VALIDATE_NAME: /^[a-z]+[a-z0-9._]+[:space:]+[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ_]*$/,
}
