/**
|--------------------------------------------------
| PAGINATION TEMPLATE 
| @quy.tx

|--------------------------------------------------
*/
import React, { useRef } from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import {
  FormGroup,
  Input,
  Form,
  Label,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import "./pagination.scss";
import { Fragment } from "react";
const Paginations = (props) => {
    const ref = useRef();
    let timer_click = null;
    const { total_record, limit = 10, total_page } = props.configs;
    const {  } = props;
    let config = {
        current_page: 1, // Trang hiện tại
        total_record: total_record, // Tổng số record
        total_page: total_page, // Tổng số trang
        limit: limit || 10, // limit
        start: 0, // start
        link_full: "", // Link full có dạng như sau: domain.com/index.php?view=list-view&page={page}
        link_first: "", // Link trang đầu tiên
        range: 9, // Số button trang bạn muốn hiển thị
        min: 0, // Tham số min
        max: 10, // tham số max, min và max là 2 tham số private
    };
    const _build_page = (conf = {}) => {
        config = { ...config, ...conf };
        if (limit < 0) {
        config.limit = 0;
        }
        config.total_page = Math.ceil(total_record / config.limit);

        if (config.current_page < 1) {
        config.current_page = 1;
        }
        if (config.current_page > config.total_page) {
        config.current_page = config.total_page;
        }
        config.start = (config.current_page) * limit;
        let middle = Math.ceil(config.range / 2);
        if (config.total_page < config.range) {
        config.min = 1;
        config.max = config.total_page;
        } else {
        config.min = config.current_page - middle + 1;
        config.max = config.current_page + middle - 1;
        if (config.min < 1) {
            config.min = 1;
            config.max = config.range;
        } else if (config.max > config.total_page) {
            config.max = config.total_page;
            config.min = config.total_page - config.range + 1;
        }
        }
    };

    _build_page(props.configs);

    const _click_page = (e, new_page) => {
        e.preventDefault();
        clearTimeout(timer_click);
        if (new_page >= 1) {
        timer_click = setTimeout(() => {
            // props.on_change_current(page);
            props.search_data({
                ...props.dataSearch,
                page: new_page,
            })
        }, 200);
        }
    };

    const range_arr = (min = 1, max = 1) => {
        const arr = [];
        for (let index = min; index < max; index++) {
        arr.push(index);
        }
        // return Array.from({ length: max }, (_, index) => index > 0 ? index * min : null)
        return arr;
    };

    const _html_title = () => {
        if (total_record <= config.limit) {
        return (
            <span>
            Hiển thị 1-{total_record} tổng {`${total_record || 0}`}{" "}
            </span>
        );
        } else {
        if (config.current_page < config.total_page) {

            return (
            <span>
                Hiển thị {config.limit * (config.current_page -1 ) + 1}-
                {config.limit * config.current_page} tổng {`${total_record || 0}`} (
                {config.total_page} trang){" "}
            </span>
            );
        } else {

            return (
            <span>
                Hiển thị {config.limit * (config.current_page -1 ) + 1}-
                {total_record} tổng {`${total_record || 0}`} ({config.total_page} trang){" "}
            </span>
            );
        }
        }
    };


    const _html_pagi = () => {
        if (config.total_record > config.limit) {
        const list_page = range_arr(config.min, config.max + 1);
        return (
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Pagination aria-label="Page navigation">
                {config.current_page > 1 && (
                <Fragment>
                    <PaginationItem>
                        <PaginationLink
                            first
                            href={`#first_page=${1}`}
                            onClick={(e) => _click_page(e, 1)}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink
                            previous
                            href={`#previous_page=${config.current_page - 1}`}
                            onClick={(e) => _click_page(e, config.current_page - 1)}
                        />
                    </PaginationItem>
                </Fragment>
                )}

                {list_page.map((el) => {
                if (!el) {
                    return null;
                }
                if (config.current_page === el) {
                    return (
                    <PaginationItem active key={el}>
                        <PaginationLink
                        href={`#page=${el}`}
                        onClick={(e) => e.preventDefault()}
                        >
                        {el}
                        </PaginationLink>
                    </PaginationItem>
                    );
                }
                return (
                    <PaginationItem key={el}>
                    <PaginationLink
                        href={`#page=${el}`}
                        onClick={(e) => _click_page(e, el)}
                    >
                        {el}
                    </PaginationLink>
                    </PaginationItem>
                );
                })}

                {config.current_page < config.total_page && (
                <Fragment>
                    <PaginationItem>
                    <PaginationLink
                        next
                        href={`#next_page=${config.current_page + 1}`}
                        onClick={(e) => _click_page(e, config.current_page + 1)}
                    />
                    </PaginationItem>
                    <PaginationItem>
                    <PaginationLink
                        last
                        href={`#last_page=${config.total_page}`}
                        onClick={(e) => _click_page(e, config.total_page)}
                    />
                    </PaginationItem>
                </Fragment>
                )}
            </Pagination>
            </FormGroup>
        );
        }

        return null;
    };

    const intl = useIntl();

    return (
        <Fragment>
        {total_record === 0 ? (
            <hr />
        ) : (
            <div className="page-navigation clearfix d-flex justify-content-end">
            <div className="mt-2">{_html_title()}</div>
            <div className="ms-2">
                <Input type="select"
                onChange={(e) => {
                    const size = parseInt(e.target.value, 10)
                    // if (size <= (config.total_page * config.limit)) {
                    // props.on_change_size(size)
                    props.search_data({
                        ...props.dataSearch,
                        limit: size,
                        page: 1,
                    })
                    // }
                }}
                defaultValue={limit}
                >
                <option value="10" disabled={config.limit === 10}>
                    10
                </option>
                <option value="25" disabled={config.limit === 25}>
                    25
                </option>
                <option value="50" disabled={config.limit === 50}>
                    50
                </option>
                </Input>
            </div>
            <div className="ms-2">{_html_pagi()}</div>

           
            </div>
        )}
        </Fragment>
    );
};

Paginations.propTypes = {
    configs: PropTypes.object,
    dataSearch: PropTypes.object,
    show_pagi: PropTypes.bool,
    search_data: PropTypes.func,
    on_change_current: PropTypes.func,
    on_change_size: PropTypes.func,
    on_change_page_input: PropTypes.func,
    };

Paginations.defaultProps = {
    configs: {
        current_page: 1,
        total_record: 1,
        limit: 10,
    },
    dataSearch: {},
    show_pagi: false,
    search_data: () => console.log("search_datasss"),
    on_change_page_input: () => console.log("on_change_page_input"),
    on_change_current: () => console.log("on_change_current"),
    on_change_size: () => console.log("on_change_size"),
    };

export default React.memo(Paginations);
