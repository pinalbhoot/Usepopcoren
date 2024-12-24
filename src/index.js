import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import App from './App';
import reportWebVitals from './reportWebVitals';
//import StarRating from './StarRating';
import App from './App-V1';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App/>
  {/*<StarRating maxRating={5}  message={["Tarrible","bad","okey","good","Amazing"]}/>
    <StarRating size={25 } color='Blue' className="test" Defultrating={3}/>
<Test/>*/}

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
