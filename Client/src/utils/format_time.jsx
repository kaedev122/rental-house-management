/**
|--------------------------------------------------
| @vunv

|--------------------------------------------------
*/
import { format } from 'date-fns'
const form_date = (value) =>{
	return value < 10 ? ("0"+value) : value
}

const format_date_time_search = (date) => {
	if(date){
		return format(new Date(date), "yyyy/MM/dd")

	}else{
		return '---'
	}
	
}

const format_date_time = (date ="") => {
	if(date){
		return format(new Date(date), "dd/MM/yyyy")

	}else{
		return '---'
	}
	
}
const format_date_month = (date = "") => {
	if (date) {
		return format(new Date(date), "dd")

	} else {
		return '---'
	}

}

const format_hour = (date) => {
	if(date){
		return format(new Date(date), "HH:mm")

	}else{
		return '---'
	}
	
}

const format_full_time = (date) => {
	if(date){
		return format(new Date(date), "dd/MM/yyyy HH:mm")

	}else{
		return '---'
	}
	
}

const format_time_table = (date) => {
	if(date){
		return (<div>
			<div>{format(new Date(date), "dd/MM/yyyy")}</div>
			<div>{format(new Date(date), "HH:mm")}</div>
		</div>)
		

	}else{
		return '---'
	}
	
}

const format_full_time_display = (date) => {
	if(date){
		return format(new Date(date), "HH:mm dd/MM/yyyy")

	}else{
		return '---'
	}
	
}

const format_date_time_api = (date) => {
	if(date){
		return format(new Date(date), "MM/dd/yyyy")

	}else{
		return '---'
	}
	
}

const format_full_time_api = (date) => {
	if(date){
		return format(new Date(date), "MM/dd/yyyy HH:mm")

	}else{
		return undefined
	}
	
}
const get_day_curent = () => {

	const today = new Date()
	return `Ngày ${form_date(today.getDate())} tháng ${form_date(today.getMonth() + 1)} năm ${today.getFullYear()} `
	 
	
}

const count_hour = (date) => {
	const today = new Date()
	const firstDate = new Date(date);
	var diff = (firstDate - today)/(60*60*1000*24);
	console.log('============diff=================',diff)
	return diff.toFixed(0)
}


export { format_date_month, count_hour,  format_date_time, format_full_time, format_hour, format_date_time_api, format_full_time_display, format_time_table, format_full_time_api, format_date_time_search, get_day_curent }