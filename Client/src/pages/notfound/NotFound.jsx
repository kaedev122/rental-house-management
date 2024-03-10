import React, { Fragment, useEffect, useState } from 'react'

import "./notfound.scss";

const NotFound = (props) => {
    return (
    <div className='not-found-container'>
        <p className='big-number'>404</p>
        <p className=''>Page Not Found</p>
    </div>)
}

export default NotFound