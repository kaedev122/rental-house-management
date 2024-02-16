import React, { Fragment, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Button } from 'reactstrap'
import { http_request } from '@utils'

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

    return <div className='d-flex justify-content-center align-self-center'>
        <Button color="primary" onClick={() => logout()}>Logout</Button>
    </div>
}

export default Home