/**
|--------------------------------------------------
| FALLBACK SPINNER
| @vunv

|--------------------------------------------------
*/
import React from 'react'
import { Spinner } from 'reactstrap'
import "./FallbackSpinner.scss"

const FallbackSpinner = () => (<div className="fallback-spinner"><Spinner color="primary" /></div>)

export default React.memo(FallbackSpinner)