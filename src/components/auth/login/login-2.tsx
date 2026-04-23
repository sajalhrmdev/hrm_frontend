// "use client";

// import { useState } from "react";
// import ImageWithBasePath from "../../../core/common/imageWithBasePath";
// import { all_routes } from "@/routes/all_routes";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// type PasswordField = "password";

// const Login2Component = () => {
//   const routes = all_routes;
//   const navigation = useRouter();

//   const navigationPath = (event: React.FormEvent) => {
//     event.preventDefault(); // Prevent page reload
//     navigation.push(routes.adminDashboard);
//   };
//   const [passwordVisibility, setPasswordVisibility] = useState({
//     password: false,
//   });

//   const togglePasswordVisibility = (field: PasswordField) => {
//     setPasswordVisibility((prevState) => ({
//       ...prevState,
//       [field]: !prevState[field],
//     }));
//   };

//   return (
//     <div className="container-fuild">
//       <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
//         <div className="row">
//           <div className="col-lg-5">
//             <div className="d-lg-flex align-items-center justify-content-center d-none flex-wrap vh-100 bg-primary-transparent">
//               <div>
//                 <ImageWithBasePath src="assets/img/bg/authentication-bg-03.svg" alt="Authentication background" />
//               </div>
//             </div>
//           </div>
//           <div className="col-lg-7 col-md-12 col-sm-12">
//             <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
//               <div className="col-md-7 mx-auto vh-100">
//                 <form className="vh-100" onSubmit={navigationPath}>
//                   <div className="vh-100 d-flex flex-column justify-content-between p-4 pb-0">
//                     <div className="mx-auto mb-5 text-center">
//                       <ImageWithBasePath
//                         src="assets/img/logo.svg"
//                         className="img-fluid"
//                         alt="Smarthr logo"
//                       />
//                     </div>
//                     <div className="">
//                       <div className="text-center mb-3">
//                         <h2 className="mb-2">Sign In</h2>
//                         <p className="mb-0">Please enter your details to sign in</p>
//                       </div>
//                       <div className="mb-3">
//                         <label className="form-label">Email Address</label>
//                         <div className="input-group">
//                           <input
//                             type="email"
//                             defaultValue=""
//                             className="form-control border-end-0"
//                             required
//                             autoComplete="email"
//                           />
//                           <span className="input-group-text border-start-0">
//                             <i className="ti ti-mail" />
//                           </span>
//                         </div>
//                       </div>
//                       <div className="mb-3">
//                         <label className="form-label">Password</label>
//                         <div className="pass-group">
//                           <input
//                             type={
//                               passwordVisibility.password
//                                 ? "text"
//                                 : "password"
//                             }
//                             className="pass-input form-control"
//                             required
//                             autoComplete="current-password"
//                           />
//                           <span
//                             className={`ti toggle-passwords ${passwordVisibility.password
//                               ? "ti-eye"
//                               : "ti-eye-off"
//                               }`}
//                             onClick={() =>
//                               togglePasswordVisibility("password")
//                             }
//                             role="button"
//                             tabIndex={0}
//                             aria-label="Toggle password visibility"
//                           ></span>
//                         </div>
//                       </div>
//                       <div className="d-flex align-items-center justify-content-between mb-3">
//                         <div className="d-flex align-items-center">
//                           <div className="form-check form-check-md mb-0">
//                             <input
//                               className="form-check-input"
//                               id="remember_me"
//                               type="checkbox"
//                             />
//                             <label
//                               htmlFor="remember_me"
//                               className="form-check-label mt-0"
//                             >
//                               Remember Me
//                             </label>
//                           </div>
//                         </div>
//                         <div className="text-end">
//                           <Link href={all_routes.forgotPassword2} className="link-danger">
//                             Forgot Password?
//                           </Link>
//                         </div>
//                       </div>
//                       <div className="mb-3">
//                         <button
//                           type="submit"
//                           className="btn btn-primary w-100"
//                         >
//                           Sign In
//                         </button>
//                       </div>
//                       <div className="text-center">
//                         <h6 className="fw-normal text-dark mb-0">
//                           Don’t have an account?
//                           <Link href={all_routes.register2} className="hover-a">
//                             {" "}
//                             Create Account
//                           </Link>
//                         </h6>
//                       </div>
//                       <div className="login-or">
//                         <span className="span-or">Or</span>
//                       </div>
//                       <div className="mt-2">
//                         <div className="d-flex align-items-center justify-content-center flex-wrap">
//                           <div className="text-center me-2 flex-fill">
//                             <Link
//                               href="#"
//                               className="br-10 p-2 btn btn-info d-flex align-items-center justify-content-center"
//                             >
//                               <ImageWithBasePath
//                                 className="img-fluid m-1"
//                                 src="assets/img/icons/facebook-logo.svg"
//                                 alt="Facebook"
//                               />
//                             </Link>
//                           </div>
//                           <div className="text-center me-2 flex-fill">
//                             <Link
//                               href="#"
//                               className="br-10 p-2 btn btn-outline-light border d-flex align-items-center justify-content-center"
//                             >
//                               <ImageWithBasePath
//                                 className="img-fluid m-1"
//                                 src="assets/img/icons/google-logo.svg"
//                                 alt="Google"
//                               />
//                             </Link>
//                           </div>
//                           <div className="text-center flex-fill">
//                             <Link
//                               href="#"
//                               className="bg-dark br-10 p-2 btn btn-dark d-flex align-items-center justify-content-center"
//                             >
//                               <ImageWithBasePath
//                                 className="img-fluid m-1"
//                                 src="assets/img/icons/apple-logo.svg"
//                                 alt="Apple"
//                               />
//                             </Link>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="mt-5 pb-4 text-center">
//                       <p className="mb-0 text-gray-9">Copyright © 2026 - Smarthr</p>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login2Component;



"use client";

import { useState } from "react";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance"; // 🔥 import axios
import axios from "axios";

type PasswordField = "password";

const Login2Component = () => {
  const routes = all_routes;
  const navigation = useRouter();

  // 🔥 FORM STATE
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // 🚀 LOGIN HANDLER
  const navigationPath = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);

      // const res = await axiosInstance.post("/auth/login", formData);
  const res = await axios.post("/api/login", formData);
      // 🔥 membership theke companyId set
      const memberships = res.data.user.memberships;

      if (memberships && memberships.length > 0) {
        localStorage.setItem(
          "companyId",
          memberships[0].companyId
        );
      }

      // 🔥 redirect
      navigation.push(routes.adminDashboard);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fuild">
      <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
        <div className="row">
          <div className="col-lg-5">
            <div className="d-lg-flex align-items-center justify-content-center d-none flex-wrap vh-100 bg-primary-transparent">
              <div>
                <ImageWithBasePath src="assets/img/bg/authentication-bg-03.svg" alt="Authentication background" />
              </div>
            </div>
          </div>

          <div className="col-lg-7 col-md-12 col-sm-12">
            <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
              <div className="col-md-7 mx-auto vh-100">

                <form className="vh-100" onSubmit={navigationPath}>
                  <div className="vh-100 d-flex flex-column justify-content-between p-4 pb-0">

                    <div className="mx-auto mb-5 text-center">
                      <ImageWithBasePath
                        src="assets/img/logo.svg"
                        className="img-fluid"
                        alt="logo"
                      />
                    </div>

                    <div>
                      <div className="text-center mb-3">
                        <h2 className="mb-2">Sign In</h2>
                        <p>Please enter your details</p>
                      </div>

                      {/* 🔥 EMAIL */}
                      <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <div className="input-group">
                          <input
                            type="email"
                            className="form-control border-end-0"
                            required
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                          />
                          <span className="input-group-text border-start-0">
                            <i className="ti ti-mail" />
                          </span>
                        </div>
                      </div>

                      {/* 🔥 PASSWORD */}
                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <div className="pass-group">
                          <input
                            type={
                              passwordVisibility.password
                                ? "text"
                                : "password"
                            }
                            className="pass-input form-control"
                            required
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                          />
                          <span
                            className={`ti toggle-passwords ${
                              passwordVisibility.password
                                ? "ti-eye"
                                : "ti-eye-off"
                            }`}
                            onClick={() =>
                              togglePasswordVisibility("password")
                            }
                          ></span>
                        </div>
                      </div>

                      {/* 🔥 BUTTON */}
                      <div className="mb-3">
                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                          disabled={loading}
                        >
                          {loading ? "Logging in..." : "Sign In"}
                        </button>
                      </div>

                      <div className="text-center">
                        <h6>
                          Don’t have an account?
                          <Link href={all_routes.register2}>
                            Create Account
                          </Link>
                        </h6>
                      </div>
                    </div>

                    <div className="mt-5 pb-4 text-center">
                      <p>Copyright © 2026</p>
                    </div>

                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login2Component;