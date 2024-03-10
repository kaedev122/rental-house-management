import React from "react";
import { FiSearch } from "react-icons/fi";
import { Input, InputGroup, InputGroupText } from "reactstrap";
import PropTypes from "prop-types";
import "./searchdata.scss";

function SearchData(props) {
  const { onChangeText, placeholder, id, name, valueText } = props;

  return (
    <div className="input-search-group">
      <input
        id={id}
        name={name}
        placeholder={placeholder}
        autoComplete="off"
        className="input-search"
        value={valueText}
        onChange={(e) => onChangeText(e.target.value.replace(/[^\w\dÀ-ỹà-ỹ ]/g,""))}
      />

      <FiSearch />
    </div>
  );
}

SearchData.propTypes = {
  placeholder: PropTypes.any,
  id: PropTypes.any,
  name: PropTypes.string,
  valueText: PropTypes.string,
  onChange: PropTypes.func,
};
SearchData.defaultProps = {
  placeholder: "Tìm kiếm",
};

export default React.memo(SearchData);
