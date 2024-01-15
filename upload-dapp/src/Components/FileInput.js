// FileInput component
const FileInput = ({ onFileSelect, type}) => {
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    onFileSelect(selectedFile); // Send the selected file to the parent
  };

  return (
    <label className="ui button">{type}
      <input type="file" onChange={handleFileChange} style={{display:'none'}}/>
      </label>

  );
};

export default FileInput