import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import React, { useState, useEffect } from "react";
import { Navbar, NavLink, NavItem, Input, NavbarToggler, NavbarBrand, Button } from "reactstrap";
import { get_local_storage, is_empty, http_request, set_local_storage } from "@utils"
import "./HeaderNavbar.scss";
import { MdDashboard } from "react-icons/md";
import { RiBillFill } from "react-icons/ri";
import { FaFileContract } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { IoStatsChartSharp, IoLogOut, IoHomeSharp  } from "react-icons/io5";
import { set_apartment_list, set_apartment_curent } from '@redux/apartmentSlice'
import { FaPerson } from "react-icons/fa6";

const HeaderNavbar = (props) => {
	const apartmentCurent = useSelector((state) => state.apartment?.curent) || get_local_storage("apartment", "")
  const [apartment, setApartment] = useState(apartmentCurent);
  const [listApartment, setListApartment] = useState([]);

	const dispatch = useDispatch()
	const location = useLocation();

	useEffect(()=> {
		get_data_store()
	},[])

	const get_data_store = async () => {
		const input = {
      status: 1
		}
		const res = await http_request({method: "GET", url:"cms/apartments", params: input})
		const { code, data } = res
		if(code === 200 ){
			setListApartment(data.items)
			dispatch(set_apartment_list(data.items))
		}
	}

  const logout = async () => {
		localStorage.clear()
		sessionStorage.clear()
		return window.location.assign("/login")
	}

	const change_apartment = async (apartment_id) => {
		setApartment(apartment_id)
		set_local_storage("apartment", apartment_id)
		dispatch(set_apartment_curent(apartment_id))
	}

	const format_path = () => {
		const new_path = location.pathname.split('/')[2]
		return new_path
	}

  return (
    <React.Fragment>
      <Navbar
        id="navbar"
        color="light"
        light
        expand="md"
        className={`top-narbar`}
      >
        <div className="d-flex navbar-menu">
          <NavbarBrand href="/cms/home">LodgingPro</NavbarBrand>
          <NavItem key="home"            
            className={format_path() === 'home' ? `highlight` : ''}
          >
            <NavLink 
              className="d-flex flex-row align-items-center"
              href="/cms/home"
            >
              <i className="d-flex">
                <MdDashboard/>
              </i>
              <p>BẢNG QUẢN TRỊ</p>
            </NavLink>
          </NavItem>

          <NavItem key="apartment"            
            className={format_path() === 'apartment' ? `highlight` : ''}
          >
            <NavLink 
              className="d-flex flex-row align-items-center"
              href="/cms/apartment"
            >
              <i className="d-flex">
                <IoHomeSharp />
              </i>
              <p>NHÀ TRỌ</p>
            </NavLink>
          </NavItem>

          <NavItem key="customer"
            className={format_path() === 'customer' ? `highlight` : ''}
          >
            <NavLink 
              className="d-flex flex-row align-items-center"
              href="/cms/customer"
            >
              <i className="d-flex">
                <FaPerson />
              </i>
              <p>KHÁCH THUÊ</p>
            </NavLink>
          </NavItem>

          {/* <NavItem key="report">
            <NavLink 
              className="d-flex flex-row align-items-center"
              href="/login"
            >
              <i className="d-flex">
                <IoStatsChartSharp />
              </i>
              <p>BÁO CÁO</p>
            </NavLink>
          </NavItem>

          <NavItem key="bill">
            <NavLink 
              className="d-flex flex-row align-items-center"
              href="/login"
            >
              <i className="d-flex">
                <RiBillFill />
              </i>
              <p>HÓA ĐƠN</p>
            </NavLink>
          </NavItem> */}

          <NavItem key="contract"
            className={format_path() === 'contract' ? `highlight` : ''}
          >
            <NavLink 
              className="d-flex flex-row align-items-center"
              href="/cms/contract"
            >
              <i className="d-flex">
                <FaFileContract />
              </i>
              <p>HỢP ĐỒNG</p>
            </NavLink>
          </NavItem>

          <NavItem key="setting"
            className={format_path() === 'setting' ? `highlight` : ''}
          >
            <NavLink 
              className="d-flex flex-row align-items-center"
              href="/cms/setting"
            >
              <i className="d-flex">
                <IoMdSettings />
              </i>
              <p>CÀI ĐẶT</p>
            </NavLink>
          </NavItem>
        </div>

        <div className="d-flex navbar-menu">
          <NavItem key="select-apartment" className='mt-1 me-2'>
            <Input
              id="exampleSelect"
              name="select"
              type="select"
					    disabled={format_path() === "apartment"}
              className='btn-select pointer-btn'
              value={apartment}
              onChange={(e)=>change_apartment(e.target.value)}
            >
              {listApartment && listApartment.map((item) =>{
                return (<option key={item._id} value={item._id} >{item.name}</option>)
              })}
            </Input>
          </NavItem>

          <NavItem key="logout">
            <Button 
              variant="contained"
              color="primary"
              className="d-flex flex-row align-items-center btn-logout" 
              onClick={() => logout()}>
              <i className="d-flex flex-row">
                <IoLogOut />
              </i>
              <p>ĐĂNG XUẤT</p>
            </Button>
          </NavItem>
        </div>
      </Navbar>
    </React.Fragment>
  );
};

export default HeaderNavbar;
