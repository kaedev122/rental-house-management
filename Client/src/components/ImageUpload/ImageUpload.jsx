import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_upload_preset'); // Replace 'your_upload_preset' with your Cloudinary upload preset

    setLoading(true);

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', // Replace 'your_cloud_name' with your Cloudinary cloud name
        formData
      );
      setImage(response.data.url);
    } catch (error) {
      console.error('Error uploading image: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={uploadImage} />
      {loading && <div>Loading...</div>}
      {image && (
        <div>
          <h2>Uploaded Image</h2>
          <img src={image} alt="Uploaded" />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;