import { RouterProvider } from "react-router";
import { router } from "@/routes/router";

/** 라우터를 켜는 것 외에는 아무것도 하지 않는다. 화면은 전부 routes/ 에 있다. */

export default function App() {
  return <RouterProvider router={router} />;
}
