import React, { useEffect, useState } from 'react';
import { Button, Col, Modal, ModalBody, Row } from 'reactstrap';
import './style.scss';

function ShowImage(props) {
  const { _modalImage, _image, _toggleModalImage } = props;
  const [selectedImage, setSelectedImage] = useState(_image);

  return (
    <Modal className='modal-image' centered fade={false} isOpen={_modalImage} toggle={_toggleModalImage}>
      <img src={selectedImage.data_url} style={{ objectFit:'cover'}} className="main-image"/>
    </Modal>
  );
}

export default ShowImage;
