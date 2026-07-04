import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import BrowsePuppies from "./pages/BrowsePuppies.jsx";
import PuppyDetail from "./pages/PuppyDetail.jsx";
import SuccessStories from "./pages/SuccessStories.jsx";
import NotFound from "./pages/NotFound.jsx";

import ShelterSetup from "./pages/dashboard/ShelterSetup.jsx";
import AdopterDashboard from "./pages/dashboard/AdopterDashboard.jsx";
import ShelterDashboard from "./pages/dashboard/ShelterDashboard.jsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.jsx";

import ChatPage from "./pages/chat/ChatPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowsePuppies />} />
        <Route path="/puppies/:id" element={<PuppyDetail />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/shelter/setup"
          element={
            <ProtectedRoute roles={["shelter"]}>
              <ShelterSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["adopter"]}>
              <AdopterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/shelter"
          element={
            <ProtectedRoute roles={["shelter"]}>
              <ShelterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

// import { Routes, Route } from "react-router-dom";
// import Layout from "./components/layout/Layout.jsx";
// import ProtectedRoute from "./routes/ProtectedRoute.jsx";

// import Home from "./pages/Home.jsx";
// import Login from "./pages/Login.jsx";
// import Register from "./pages/Register.jsx";
// import BrowsePuppies from "./pages/BrowsePuppies.jsx";
// import PuppyDetail from "./pages/PuppyDetail.jsx";
// import NotFound from "./pages/NotFound.jsx";

// import ShelterSetup from "./pages/dashboard/ShelterSetup.jsx";
// import AdopterDashboard from "./pages/dashboard/AdopterDashboard.jsx";
// import ShelterDashboard from "./pages/dashboard/ShelterDashboard.jsx";
// import AdminDashboard from "./pages/dashboard/AdminDashboard.jsx";

// import ChatPage from "./pages/chat/ChatPage.jsx";

// function App() {
//   return (
//     <Routes>
//       <Route element={<Layout />}>
//         <Route path="/" element={<Home />} />
//         <Route path="/browse" element={<BrowsePuppies />} />
//         <Route path="/puppies/:id" element={<PuppyDetail />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         {/* Shelter must set up their org profile before accessing the dashboard */}
//         <Route
//           path="/shelter/setup"
//           element={
//             <ProtectedRoute roles={["shelter"]}>
//               <ShelterSetup />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute roles={["adopter"]}>
//               <AdopterDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/dashboard/shelter"
//           element={
//             <ProtectedRoute roles={["shelter"]}>
//               <ShelterDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/dashboard/admin"
//           element={
//             <ProtectedRoute roles={["admin"]}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/chat/:conversationId"
//           element={
//             <ProtectedRoute>
//               <ChatPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route path="*" element={<NotFound />} />
//       </Route>
//     </Routes>
//   );
// }

// export default App;

// // import { Routes, Route } from 'react-router-dom';
// // import Layout from './components/layout/Layout.jsx';
// // import ProtectedRoute from './routes/ProtectedRoute.jsx';

// // import Home from './pages/Home.jsx';
// // import Login from './pages/Login.jsx';
// // import Register from './pages/Register.jsx';
// // import BrowsePuppies from './pages/BrowsePuppies.jsx';
// // import PuppyDetail from './pages/PuppyDetail.jsx';
// // import NotFound from './pages/NotFound.jsx';

// // import AdopterDashboard from './pages/dashboard/AdopterDashboard.jsx';
// // import ShelterDashboard from './pages/dashboard/ShelterDashboard.jsx';
// // import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';

// // import ChatPage from './pages/chat/ChatPage.jsx';

// // function App() {
// //   return (
// //     <Routes>
// //       <Route element={<Layout />}>
// //         <Route path="/" element={<Home />} />
// //         <Route path="/browse" element={<BrowsePuppies />} />
// //         <Route path="/puppies/:id" element={<PuppyDetail />} />
// //         <Route path="/login" element={<Login />} />
// //         <Route path="/register" element={<Register />} />

// //         <Route
// //           path="/dashboard"
// //           element={
// //             <ProtectedRoute roles={['adopter']}>
// //               <AdopterDashboard />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/dashboard/shelter"
// //           element={
// //             <ProtectedRoute roles={['shelter']}>
// //               <ShelterDashboard />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/dashboard/admin"
// //           element={
// //             <ProtectedRoute roles={['admin']}>
// //               <AdminDashboard />
// //             </ProtectedRoute>
// //           }
// //         />
// //         <Route
// //           path="/chat/:conversationId"
// //           element={
// //             <ProtectedRoute>
// //               <ChatPage />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route path="*" element={<NotFound />} />
// //       </Route>
// //     </Routes>
// //   );
// // }

// // export default App;
