import { useSnackbar } from 'notistack';
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';
import React, {Fragment, useEffect, useState} from "react";

const NotificationAction = (msg, variant) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const action = key => (
        <Fragment>
            <IconButton className='text-white' onClick={() => { closeSnackbar(key) }}>
                <CloseIcon/>
            </IconButton>
        </Fragment>
    );

    return (<div>
    {enqueueSnackbar(msg, {
        variant: variant,
        autoHideDuration: 5000,
        action
    })}</div>)
};

export default NotificationAction;