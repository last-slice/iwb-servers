import React, {useState} from "react";
// import ReservationDetails from "./components/ReservationDetae ils";
// import UploadDropzone from "./components/UploadDropzone";
import { LoginPage } from "./components/LoginPage";
import 'bootstrap/dist/css/bootstrap.min.css';
import { DashboardPage } from "./components/Dashboard";

const App: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string | null>(null);

  return (
    <div className="Page-story-container">
      <DashboardPage />
      </div>
  );
};

export default App;
