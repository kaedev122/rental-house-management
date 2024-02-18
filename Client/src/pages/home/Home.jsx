import React, { Fragment, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardFooter } from 'reactstrap'
import { http_request } from '@utils'
import videoSource from '../../../public/video.mp4'
import { TextField, Button, } from '@mui/material';

const Home = () => {
    useEffect(() => {
        getData()
    }, [])

	const logout = async () => {
		// await auth_logout()
		localStorage.clear()
		sessionStorage.clear()
		return window.location.assign("/login")
	}

    const getData = async () => {
        const res = await http_request({method: "GET", url:"cms/ping"})
        return res
    }

    return (
    <Card className='d-flex justify-content-center align-item-center flex-column'>
        <div className='d-flex  justify-content-center align-item-center h-100 w-100'>
            <video width="640" height="360" autoPlay>
                <source src={videoSource} type="video/mp4" />
                    Your browser does not support the video tag.
            </video>
        </div>
        <CardFooter className='d-flex justify-content-center align-item-center'>
            <Button variant="contained" color="primary" onClick={() => logout()}>Logout</Button>
        </CardFooter>
    </Card>)
}

export default Home