import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import BookingPage from '../pages/BookingPage';
export default function AppRoutes() { return <Routes><Route element={<Layout/>}><Route path="/" element={<HomePage/>}/><Route path="/booking" element={<BookingPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes>; }
