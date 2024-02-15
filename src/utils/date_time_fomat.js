import moment from 'moment';

export const fomatDateTime = (date, fomat) => {
    return moment(date).format(fomat);
}

export const parseStringToDate = (str, fomat) => {
    return moment(str, fomat).toDate();
}
