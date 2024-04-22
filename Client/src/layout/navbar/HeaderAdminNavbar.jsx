import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import React, { useState, useEffect, useRef } from "react";
import { Navbar, NavLink, NavItem, Input, NavbarToggler, NavbarBrand, Button, Collapse, Nav,  } from "reactstrap";
import { get_local_storage, is_empty, http_request, set_local_storage } from "@utils"
import "./HeaderNavbar.scss";
import { MdDashboard } from "react-icons/md";
import { RiBillFill } from "react-icons/ri";
import { FaFileContract } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { IoStatsChartSharp, IoLogOut, IoHomeSharp  } from "react-icons/io5";
import { set_apartment_list, set_apartment_current } from '@redux/apartmentSlice'
import { FaPerson } from "react-icons/fa6";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { ModalDialog } from '@components'
import { IoReceiptSharp } from "react-icons/io5";
import { FaUser } from "react-icons/fa";

const HeaderAdminNavbar = (props) => {
	const apartmentCurrent = useSelector((state) => state.apartment?.current) || get_local_storage("apartment", "")
  const [apartment, setApartment] = useState(apartmentCurrent);
  const [listApartment, setListApartment] = useState([]);
  const [openDialog, setOpenDialog] = useState(false)
  const [collapsed, setCollapsed] = useState(true);
  const toggleNavbar = () => setCollapsed(!collapsed);
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', updateWindowWidth);
    return () => window.removeEventListener('resize', updateWindowWidth);
  }, []); // Only run once on component mount
  
	const dispatch = useDispatch()
	const location = useLocation();

  const confirm_logout = () => {
    setOpenDialog(false)
    return logout()
}

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
      console.log(data.items)
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
    console.log(apartment_id)
		setApartment(apartment_id)
		set_local_storage("apartment", apartment_id)
		dispatch(set_apartment_current(apartment_id))
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
          <NavbarBrand href="/admin/home">RoomMaster Admin</NavbarBrand>
          <NavItem key="home"            
            className={format_path() === 'home' ? `highlight` : ''}
          >
            <NavLink 
              className="d-flex flex-row align-items-center"
              href="/admin/home"
            >
              <i className="d-flex">
                <FaUser />
              </i>
              <p>DANH SÁCH NGƯỜI DÙNG</p>
            </NavLink>
          </NavItem>
        </div>

        <div className="d-flex navbar-menu navbar-custom">
          <NavItem key="logout">
            <Button 
              variant="contained"
              color="primary"
              className="d-flex flex-row align-items-center btn-logout" 
              onClick={() => setOpenDialog(true)}>
              <i className="d-flex flex-row">
                <IoLogOut />
              </i>
              <p>ĐĂNG XUẤT</p>
            </Button>
          </NavItem>
        </div>
      </Navbar>

      {openDialog && <ModalDialog
          title='Đăng xuất'
          message='Bạn có muốn đăng xuất?'
          open={openDialog}
          confirm={() => {
              confirm_logout()
          }}
          cancel={() => setOpenDialog(false)}
      />}
    </React.Fragment>
  );
};

export default HeaderAdminNavbar;
